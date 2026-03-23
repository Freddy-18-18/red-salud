-- ============================================
-- SIGNATURE SYSTEM - Core Tables
-- Stores digital signature requests, signers, fields, and audit trail
-- Created: 2025-02-14
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SIGNATURE REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Document information
  document_id TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_hash JSONB NOT NULL, -- { algorithm: 'SHA-256', hash: string }
  document_type TEXT, -- 'pdf', 'markdown', etc.

  -- Request metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),

  -- Metadata
  notes TEXT,
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
);

CREATE INDEX ix_signature_requests_created_by ON signature_requests(created_by);
CREATE INDEX ix_signature_requests_status ON signature_requests(status);
CREATE INDEX ix_signature_requests_expires_at ON signature_requests(expires_at);

-- ============================================
-- SIGNATURE SIGNERS
-- ============================================
CREATE TABLE IF NOT EXISTS signature_signers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Request reference
  request_id UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,

  -- Signer information
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'witness', 'admin', 'parent')),
  order INTEGER NOT NULL DEFAULT 0,

  -- Signing status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'signed', 'declined', 'cancelled')),

  -- Signature data
  signature_data JSONB,
  signed_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
);

CREATE INDEX ix_signature_signers_request_id ON signature_signers(request_id);
CREATE INDEX ix_signature_signers_user_id ON signature_signers(user_id);
CREATE INDEX ix_signature_signers_status ON signature_signers(status);
CREATE INDEX ix_signature_signers_order ON signature_signers(request_id, "order");

-- ============================================
-- SIGNATURE FIELDS
-- ============================================
CREATE TABLE IF NOT EXISTS signature_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Request reference
  request_id UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,

  -- Field definition
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('signature', 'initials', 'date', 'text', 'checkbox')),
  page_number INTEGER NOT NULL,
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  width NUMERIC,
  height NUMERIC,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  required BOOLEAN NOT NULL DEFAULT false,

  -- Field value and signature
  value TEXT,
  signature_data JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
);

CREATE INDEX ix_signature_fields_request_id ON signature_fields(request_id);
CREATE INDEX ix_signature_fields_assigned_to ON signature_fields(assigned_to);

-- ============================================
-- SIGNATURE AUDIT TRAIL
-- ============================================
CREATE TABLE IF NOT EXISTS signature_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Request reference
  request_id UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,

  -- Audit information
  action TEXT NOT NULL
    CHECK (action IN ('created', 'sent', 'viewed', 'signed', 'declined', 'expired', 'completed', 'cancelled')),

  -- Actor
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,

  -- Details
  details JSONB,

  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),
);

CREATE INDEX ix_signature_audit_request_id ON signature_audit(request_id);
CREATE INDEX ix_signature_audit_action ON signature_audit(action);
CREATE INDEX ix_signature_audit_timestamp ON signature_audit("timestamp" DESC);

-- ============================================
-- DIGITAL SIGNATURE POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_audit ENABLE ROW LEVEL SECURITY;

-- Doctors can see all requests they created
CREATE POLICY "doctors_can_view_own_requests" ON signature_requests
  FOR SELECT USING (
    created_by = auth.uid()
  );

-- Doctors can create requests
CREATE POLICY "doctors_can_create_requests" ON signature_requests
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
  );

-- Doctors can update their requests (if not completed)
CREATE POLICY "doctors_can_update_own_requests" ON signature_requests
  FOR UPDATE USING (
    created_by = auth.uid() AND status = 'pending'
  );

-- Users can sign their assigned fields
CREATE POLICY "users_can_sign_assigned_fields" ON signature_fields
  FOR UPDATE USING (
    assigned_to = auth.uid() AND
    EXISTS (
      SELECT 1 FROM signature_signers
      WHERE request_id = signature_fields.request_id
      AND user_id = auth.uid()
      AND status = 'pending'
    )
  );

-- Audit is append-only
CREATE POLICY "audit_append_only" ON signature_audit
  FOR INSERT WITH CHECK (true);

-- Everyone can view audit (for transparency)
CREATE POLICY "audit_read_all" ON signature_audit
  FOR SELECT USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get pending signature requests for a user
CREATE OR REPLACE FUNCTION get_pending_signature_requests(user_id UUID)
RETURNS TABLE (
  id UUID,
  document_title TEXT,
  document_url TEXT,
  expires_at TIMESTAMPTZ,
  signers JSONB
) AS $$
  SELECT
    sr.id,
    sr.document_title,
    sr.document_url,
    sr.expires_at,
    json_agg(json_build_object(
      'signer_id', ss.id,
      'name', ss.name,
      'email', ss.email,
      'role', ss.role,
      'status', ss.status
    ) ORDER BY ss."order") as signers
  FROM signature_requests sr
  JOIN signature_signers ss ON ss.request_id = sr.id
  WHERE sr.status = 'pending'
    AND ss.user_id = get_pending_signature_requests.user_id
    AND ss.status = 'pending'
  GROUP BY sr.id
  ORDER BY sr.expires_at ASC
$$;

-- Get signature requests for a document
CREATE OR REPLACE FUNCTION get_document_signature_requests(document_id TEXT)
RETURNS TABLE (
  id UUID,
  document_title TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  total_signers INTEGER,
  completed_signers INTEGER
) AS $$
  SELECT
    sr.id,
    sr.document_title,
    sr.status,
    sr.created_at,
    sr.expires_at,
    COUNT(ss.id) FILTER (WHERE ss.status = 'signed') as completed_signers,
    COUNT(*) as total_signers
  FROM signature_requests sr
  JOIN signature_signers ss ON ss.request_id = sr.id
  WHERE sr.document_id = get_document_signature_requests.document_id
  GROUP BY sr.id
  ORDER BY sr.created_at DESC
$$;

-- Check if all fields are signed
CREATE OR REPLACE FUNCTION check_all_fields_signed(request_id UUID)
RETURNS BOOLEAN AS $$
  SELECT
    COUNT(*) FILTER (WHERE signature_data IS NULL) = 0
  FROM signature_fields
  WHERE request_id = check_all_fields_signed.request_id
    AND required = true
$$;

-- Mark request as completed when all signers have signed
CREATE OR REPLACE FUNCTION update_request_completion_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE signature_requests
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT request_id
    FROM signature_signers ss
    JOIN signature_requests sr ON sr.id = ss.request_id
    WHERE sr.status = 'pending'
      AND ss.status = 'signed'
      AND NOT EXISTS (
        SELECT 1
        FROM signature_signers ss2
        WHERE ss2.request_id = sr.id
          AND ss2.status = 'pending'
      )
  );
END;
$$;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Pending requests for a user
CREATE OR REPLACE VIEW vw_pending_signature_requests AS
  SELECT
    sr.id,
    sr.document_title,
    sr.document_url,
    sr.expires_at,
    json_agg(
      json_build_object(
        'signer_id', ss.id,
        'name', ss.name,
        'email', ss.email,
        'role', ss.role
      ) ORDER BY ss."order"
    ) as signers
  FROM signature_requests sr
  JOIN signature_signers ss ON ss.request_id = sr.id
  WHERE sr.status = 'pending'
  GROUP BY sr.id
  ORDER BY sr.expires_at ASC;

-- Signature requests by document
CREATE OR REPLACE VIEW vw_document_signatures AS
  SELECT
    sr.id,
    sr.document_title,
    sr.status,
    sr.created_at,
    sr.completed_at,
    COUNT(ss.id) FILTER (WHERE ss.status = 'signed') as signed_count,
    COUNT(*) as total_signers
  FROM signature_requests sr
  JOIN signature_signers ss ON ss.request_id = sr.id
  GROUP BY sr.id
  ORDER BY sr.created_at DESC;

-- ============================================
-- GRANTS (Adjust based on your setup)
-- ============================================
GRANT ALL ON TABLE signature_requests TO authenticated;
GRANT ALL ON TABLE signature_signers TO authenticated;
GRANT ALL ON TABLE signature_fields TO authenticated;
GRANT ALL ON TABLE signature_audit TO authenticated;
GRANT USAGE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_pending_signature_requests TO authenticated;
GRANT EXECUTE ON FUNCTION get_document_signature_requests TO authenticated;
GRANT EXECUTE ON FUNCTION check_all_fields_signed TO authenticated;
GRANT EXECUTE ON FUNCTION update_request_completion_status TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE signature_requests IS 'Digital signature requests for documents';
COMMENT ON TABLE signature_signers IS 'Signers who need to sign documents';
COMMENT ON TABLE signature_fields IS 'Fields within a document that require signature';
COMMENT ON TABLE signature_audit IS 'Audit trail for all signature actions';
COMMENT ON COLUMN signature_requests.document_hash IS 'Cryptographic hash of the document for signature verification';
COMMENT ON COLUMN signature_requests.status IS 'pending, completed, expired, or cancelled';
COMMENT ON COLUMN signature_signers.status IS 'pending, signed, declined, or cancelled';
COMMENT ON COLUMN signature_fields.signature_data IS 'Cryptographic signature data including algorithm, timestamp, and signature value';
COMMENT ON COLUMN signature_audit.action IS 'Type of action: created, sent, viewed, signed, declined, expired, completed, cancelled';
COMMENT ON COLUMN signature_audit.timestamp IS 'ISO 8601 timestamp of the audit entry';
COMMENT ON COLUMN signature_signers.order IS 'Order in which this signer must sign (for sequential signing)';
COMMENT ON COLUMN signature_fields.type IS 'Type of field: signature, initials, date, text, checkbox';

-- ============================================
-- TRIGGERS
-- ============================================

-- Log audit entry when signer status changes
CREATE OR REPLACE FUNCTION log_signer_status_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO signature_audit (request_id, action, user_id, details)
  SELECT
    NEW.request_id,
    CASE
      WHEN OLD.status = 'pending' AND NEW.status = 'signed' THEN 'signed'
      WHEN OLD.status = 'pending' AND NEW.status = 'declined' THEN 'declined'
      WHEN OLD.status = 'signed' AND NEW.status = 'pending' THEN 'signature_revoked'
      ELSE 'status_changed'
    END,
    NEW.user_id,
    json_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'signer_id', NEW.id
    )
  WHERE NEW.status != OLD.status;
END;
$$;

CREATE TRIGGER log_signer_status_update ON signature_signers
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_signer_status_change();

-- Update request completion status when relevant
CREATE TRIGGER update_completion_on_signer_update
  AFTER UPDATE OF status ON signature_signers
  FOR EACH ROW
  EXECUTE FUNCTION update_request_completion_status();

COMMENT ON TRIGGER update_completion_on_signer_update IS 'Updates request completion status when all signers have signed';
