-- =============================================================================
-- Migration: All 15 dental features — comprehensive schema
-- =============================================================================

-- ─── 1. Periodontogram Exams ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dental_perio_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dental_perio_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_own_perio_exams" ON dental_perio_exams
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

-- ─── 2. SOAP Notes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subjective TEXT NOT NULL DEFAULT '',
  objective TEXT NOT NULL DEFAULT '',
  assessment TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT '',
  vital_signs JSONB DEFAULT '{}',
  icd_codes TEXT[] DEFAULT '{}',
  cpt_codes TEXT[] DEFAULT '{}',
  template_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'amended')),
  signed_at TIMESTAMPTZ,
  amended_at TIMESTAMPTZ,
  amendment_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_own_soap" ON soap_notes
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE TABLE IF NOT EXISTS soap_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'general',
  subjective TEXT DEFAULT '',
  objective TEXT DEFAULT '',
  assessment TEXT DEFAULT '',
  plan TEXT DEFAULT '',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE soap_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_own_templates" ON soap_templates
  FOR ALL USING (doctor_id = auth.uid() OR doctor_id IS NULL);

-- ─── 3. Smart Waitlist ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smart_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT DEFAULT '',
  procedure_type TEXT NOT NULL,
  estimated_duration INTEGER NOT NULL DEFAULT 30,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  preferred_days TEXT[] DEFAULT '{}',
  preferred_time_start TIME,
  preferred_time_end TIME,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'confirmed', 'expired', 'cancelled')),
  notified_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE smart_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_own_waitlist" ON smart_waitlist
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE INDEX idx_waitlist_status ON smart_waitlist(status, doctor_id);
CREATE INDEX idx_waitlist_priority ON smart_waitlist(priority, created_at);

-- ─── 4. Digital Intake Forms ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS intake_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE intake_form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intake_templates_read" ON intake_form_templates FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS intake_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES intake_form_templates(id),
  form_data JSONB NOT NULL DEFAULT '{}',
  signature_url TEXT,
  alerts JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE intake_form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patient_own_submissions" ON intake_form_submissions
  FOR ALL USING (patient_id = auth.uid() OR reviewed_by = auth.uid());

-- ─── 5. Treatment Plan Estimates ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treatment_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_estimated NUMERIC(10,2) NOT NULL DEFAULT 0,
  insurance_coverage NUMERIC(10,2) DEFAULT 0,
  patient_responsibility NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'presented', 'accepted', 'declined', 'partially_accepted')),
  presented_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE treatment_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_patient_estimates" ON treatment_estimates
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE TABLE IF NOT EXISTS treatment_estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES treatment_estimates(id) ON DELETE CASCADE,
  procedure_code TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  tooth_code INTEGER,
  surface_codes TEXT[] DEFAULT '{}',
  quantity INTEGER DEFAULT 1,
  unit_fee NUMERIC(10,2) NOT NULL,
  total_fee NUMERIC(10,2) NOT NULL,
  insurance_pays NUMERIC(10,2) DEFAULT 0,
  patient_pays NUMERIC(10,2) NOT NULL,
  accepted BOOLEAN DEFAULT false,
  scheduled_date DATE
);

ALTER TABLE treatment_estimate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estimate_items_via_parent" ON treatment_estimate_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM treatment_estimates e WHERE e.id = estimate_id
    AND (e.doctor_id = auth.uid() OR e.patient_id = auth.uid())
  ));

-- ─── 6. Lab Case Tracking ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dental_labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  specialties TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dental_labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "labs_read_all" ON dental_labs FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS lab_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id UUID NOT NULL REFERENCES dental_labs(id),
  lab_name TEXT NOT NULL,
  case_type TEXT NOT NULL CHECK (case_type IN ('crown', 'bridge', 'implant_abutment', 'denture', 'veneer', 'inlay_onlay', 'orthodontic', 'other')),
  tooth_codes INTEGER[] DEFAULT '{}',
  shade TEXT DEFAULT '',
  material TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'impression_sent' CHECK (status IN (
    'impression_sent', 'received_by_lab', 'cad_design', 'milling',
    'glazing_finishing', 'quality_check', 'shipped', 'received_by_clinic', 'seated', 'rework_needed'
  )),
  impression_type TEXT DEFAULT 'digital' CHECK (impression_type IN ('digital', 'physical')),
  notes TEXT DEFAULT '',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lab_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_own_lab_cases" ON lab_cases
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE TABLE IF NOT EXISTS lab_case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_case_id UUID NOT NULL REFERENCES lab_cases(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT DEFAULT '',
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lab_case_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_events_via_case" ON lab_case_events
  FOR ALL USING (EXISTS (
    SELECT 1 FROM lab_cases c WHERE c.id = lab_case_id
    AND (c.doctor_id = auth.uid() OR c.patient_id = auth.uid())
  ));

-- ─── 7. Insurance Plans & Claims ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payer_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'PPO' CHECK (plan_type IN ('PPO', 'HMO', 'indemnity', 'discount', 'government')),
  group_number TEXT,
  member_id TEXT,
  annual_maximum NUMERIC(10,2) DEFAULT 0,
  deductible NUMERIC(10,2) DEFAULT 0,
  deductible_met NUMERIC(10,2) DEFAULT 0,
  preventive_coverage INTEGER DEFAULT 100,
  basic_coverage INTEGER DEFAULT 80,
  major_coverage INTEGER DEFAULT 50,
  orthodontic_coverage INTEGER DEFAULT 0,
  waiting_periods JSONB DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  effective_date DATE,
  termination_date DATE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patient_own_plans" ON insurance_plans
  FOR ALL USING (patient_id = auth.uid());
CREATE POLICY "doctor_read_plans" ON insurance_plans
  FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  plan_id UUID REFERENCES insurance_plans(id),
  doctor_id UUID NOT NULL REFERENCES auth.users(id),
  claim_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pending', 'accepted', 'denied', 'appealed', 'paid', 'void')),
  procedures JSONB NOT NULL DEFAULT '[]',
  total_charged NUMERIC(10,2) DEFAULT 0,
  total_allowed NUMERIC(10,2) DEFAULT 0,
  total_paid NUMERIC(10,2) DEFAULT 0,
  patient_responsibility NUMERIC(10,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  denial_reason TEXT,
  denial_code TEXT,
  eob_url TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_patient_claims" ON insurance_claims
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE INDEX idx_claims_status ON insurance_claims(status, doctor_id);
CREATE INDEX idx_claims_patient ON insurance_claims(patient_id, created_at DESC);

-- ─── 8. Membership Plans ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'premium', 'family')),
  monthly_price NUMERIC(10,2) NOT NULL,
  annual_price NUMERIC(10,2) NOT NULL,
  benefits JSONB NOT NULL DEFAULT '[]',
  max_members INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_read_all" ON membership_plans FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id),
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  next_payment_date DATE,
  payment_method_last4 TEXT,
  total_paid NUMERIC(10,2) DEFAULT 0,
  savings_to_date NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE membership_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patient_own_subscriptions" ON membership_subscriptions
  FOR ALL USING (patient_id = auth.uid());

-- ─── 9. Inventory Items (enhanced with QR/barcode) ───────────────────────────
CREATE TABLE IF NOT EXISTS clinic_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  barcode TEXT,
  qr_code TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('composite', 'anesthetic', 'gloves', 'impression', 'cements', 'instruments', 'disposable', 'other')),
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 5,
  maximum_stock INTEGER DEFAULT 100,
  unit TEXT NOT NULL DEFAULT 'unit',
  unit_cost NUMERIC(10,2) DEFAULT 0,
  supplier TEXT DEFAULT '',
  expiration_date DATE,
  lot_number TEXT,
  location TEXT DEFAULT '',
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clinic_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_access" ON clinic_inventory FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS inventory_scan_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES clinic_inventory(id) ON DELETE SET NULL,
  barcode TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('add', 'remove', 'lookup', 'restock')),
  quantity INTEGER DEFAULT 1,
  scanned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inventory_scan_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scan_log_access" ON inventory_scan_log FOR ALL USING (true);

CREATE INDEX idx_inventory_barcode ON clinic_inventory(barcode);
CREATE INDEX idx_inventory_expiration ON clinic_inventory(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_inventory_low_stock ON clinic_inventory(current_stock, minimum_stock);

-- ─── 10 & 11. Diagnostic Imaging / DICOM ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnostic_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id),
  image_type TEXT NOT NULL CHECK (image_type IN ('periapical', 'bitewing', 'panoramic', 'cbct', 'intraoral_photo', 'cephalometric')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  ai_analysis JSONB,
  annotations JSONB DEFAULT '[]',
  captured_at TIMESTAMPTZ DEFAULT now(),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE diagnostic_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_patient_images" ON diagnostic_images
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE TABLE IF NOT EXISTS dicom_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  modality TEXT NOT NULL DEFAULT 'IO',
  description TEXT DEFAULT '',
  series_count INTEGER DEFAULT 0,
  image_count INTEGER DEFAULT 0,
  accession_number TEXT,
  referring_physician TEXT,
  series_data JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dicom_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_patient_dicom" ON dicom_studies
  FOR ALL USING (patient_id = auth.uid());

-- ─── 13. Call Records / VoIP ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  patient_id UUID REFERENCES auth.users(id),
  patient_name TEXT,
  caller_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'answered', 'missed', 'voicemail', 'completed')),
  duration INTEGER DEFAULT 0,
  recording_url TEXT,
  transcript TEXT,
  ai_summary TEXT,
  sentiment_score NUMERIC(3,2),
  extracted_actions JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_records_access" ON call_records FOR ALL USING (true);

-- ─── 15. Remote Monitoring ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS remote_monitoring_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES auth.users(id),
  monitoring_type TEXT NOT NULL CHECK (monitoring_type IN ('orthodontic_tracking', 'post_operative', 'periodontal', 'general_checkup')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'flagged')),
  schedule JSONB NOT NULL DEFAULT '{"frequency":"weekly","totalSessions":12,"completedSessions":0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE remote_monitoring_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_patient_monitoring" ON remote_monitoring_cases
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE TABLE IF NOT EXISTS monitoring_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES remote_monitoring_cases(id) ON DELETE CASCADE,
  photos TEXT[] DEFAULT '{}',
  self_assessment JSONB DEFAULT '{}',
  pain_level INTEGER DEFAULT 0 CHECK (pain_level BETWEEN 0 AND 10),
  notes TEXT DEFAULT '',
  ai_analysis JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  doctor_notes TEXT
);

ALTER TABLE monitoring_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monitoring_submissions_access" ON monitoring_submissions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM remote_monitoring_cases c WHERE c.id = case_id
    AND (c.doctor_id = auth.uid() OR c.patient_id = auth.uid())
  ));

CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES remote_monitoring_cases(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('deviation', 'missed_submission', 'pain_increase', 'photo_quality')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monitoring_alerts_access" ON monitoring_alerts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM remote_monitoring_cases c WHERE c.id = case_id
    AND (c.doctor_id = auth.uid() OR c.patient_id = auth.uid())
  ));

-- ─── Triggers for updated_at ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  EXECUTE 'CREATE TRIGGER trg_perio_exams_updated BEFORE UPDATE ON dental_perio_exams FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
  EXECUTE 'CREATE TRIGGER trg_soap_notes_updated BEFORE UPDATE ON soap_notes FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
  EXECUTE 'CREATE TRIGGER trg_lab_cases_updated BEFORE UPDATE ON lab_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
  EXECUTE 'CREATE TRIGGER trg_claims_updated BEFORE UPDATE ON insurance_claims FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
  EXECUTE 'CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON membership_subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
  EXECUTE 'CREATE TRIGGER trg_inventory_updated BEFORE UPDATE ON clinic_inventory FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
  EXECUTE 'CREATE TRIGGER trg_monitoring_updated BEFORE UPDATE ON remote_monitoring_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
