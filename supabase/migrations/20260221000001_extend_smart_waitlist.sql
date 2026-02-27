-- ─── Smart Waitlist — Production schema ──────────────────────────────────────
-- Includes all fields needed by the WaitlistEntry type + offline patient support,
-- office filtering, and dental specifics.

CREATE TABLE IF NOT EXISTS smart_waitlist (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id           UUID        REFERENCES auth.users(id)       ON DELETE CASCADE,
  offline_patient_id   UUID        REFERENCES offline_patients(id)  ON DELETE SET NULL,
  doctor_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  office_id            UUID        REFERENCES doctor_offices(id)    ON DELETE SET NULL,
  patient_name         TEXT        NOT NULL,
  patient_phone        TEXT        DEFAULT '',
  procedure_type       TEXT        NOT NULL,
  estimated_duration   INTEGER     NOT NULL DEFAULT 30,
  priority             TEXT        NOT NULL DEFAULT 'normal'
                         CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  preferred_days       TEXT[]      DEFAULT '{}',
  preferred_time_start TIME,
  preferred_time_end   TIME,
  status               TEXT        NOT NULL DEFAULT 'waiting'
                         CHECK (status IN ('waiting', 'notified', 'confirmed', 'expired', 'cancelled')),
  notified_at          TIMESTAMPTZ,
  confirmed_at         TIMESTAMPTZ,
  notes                TEXT        DEFAULT '',
  procedure_code       TEXT,
  tooth_numbers        INTEGER[]   DEFAULT '{}',
  requires_anesthesia  BOOLEAN     DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE smart_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor_own_waitlist" ON smart_waitlist
  FOR ALL USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_waitlist_status   ON smart_waitlist(status, doctor_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON smart_waitlist(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_office   ON smart_waitlist(office_id, status);

CREATE OR REPLACE VIEW waitlist_with_patient AS
SELECT
  w.*,
  COALESCE(p.nombre_completo, op.nombre_completo, w.patient_name) AS resolved_name,
  COALESCE(p.avatar_url, NULL)                                    AS resolved_avatar,
  COALESCE(p.telefono, op.telefono, w.patient_phone)              AS resolved_phone
FROM smart_waitlist w
LEFT JOIN profiles        p  ON p.id  = w.patient_id
LEFT JOIN offline_patients op ON op.id = w.offline_patient_id;
