-- =====================================================
-- FASE 3 ODONTOLOGIA: RCM + GROWTH OPERABLE
-- Eligibility real-time, claim lifecycle, work queues, growth closed-loop
-- =====================================================

CREATE TABLE IF NOT EXISTS dental_eligibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES rcm_claims(id) ON DELETE SET NULL,
  payer_name TEXT NOT NULL,
  policy_number TEXT,
  eligibility_status TEXT NOT NULL CHECK (eligibility_status IN ('eligible', 'partial', 'ineligible', 'error')),
  estimated_copay NUMERIC(12,2) NOT NULL DEFAULT 0,
  estimated_coverage_pct NUMERIC(5,2) CHECK (estimated_coverage_pct BETWEEN 0 AND 100),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_claim_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES rcm_claims(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  denial_reason TEXT,
  denial_code TEXT,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_rcm_work_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES rcm_claims(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  queue_type TEXT NOT NULL CHECK (queue_type IN ('eligibility', 'denial', 'appeal', 'missing_docs', 'followup')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_growth_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  economic_value_level TEXT NOT NULL CHECK (economic_value_level IN ('low', 'medium', 'high')),
  return_probability_pct NUMERIC(5,2) NOT NULL CHECK (return_probability_pct BETWEEN 0 AND 100),
  segment_label TEXT NOT NULL,
  recommended_channel TEXT CHECK (recommended_channel IN ('sms', 'whatsapp', 'email', 'call')),
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

CREATE TABLE IF NOT EXISTS dental_growth_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  target_segment_label TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_growth_campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES dental_growth_campaigns(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'opened', 'clicked', 'booked', 'accepted_treatment', 'paid')),
  event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  claim_id UUID REFERENCES rcm_claims(id) ON DELETE SET NULL,
  amount NUMERIC(12,2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dental_eligibility_doctor_checked ON dental_eligibility_checks(doctor_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_dental_eligibility_claim ON dental_eligibility_checks(claim_id);

CREATE INDEX IF NOT EXISTS idx_dental_claim_events_claim_occurred ON dental_claim_lifecycle_events(claim_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_dental_claim_events_doctor_status ON dental_claim_lifecycle_events(doctor_id, to_status);

CREATE INDEX IF NOT EXISTS idx_dental_rcm_queue_doctor_status ON dental_rcm_work_queues(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_dental_rcm_queue_priority_due ON dental_rcm_work_queues(priority, due_at);
CREATE INDEX IF NOT EXISTS idx_dental_rcm_queue_claim ON dental_rcm_work_queues(claim_id);

CREATE INDEX IF NOT EXISTS idx_dental_growth_segments_doctor_label ON dental_growth_segments(doctor_id, segment_label);
CREATE INDEX IF NOT EXISTS idx_dental_growth_campaigns_doctor_status ON dental_growth_campaigns(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_dental_growth_events_campaign_type ON dental_growth_campaign_events(campaign_id, event_type);
CREATE INDEX IF NOT EXISTS idx_dental_growth_events_doctor_eventat ON dental_growth_campaign_events(doctor_id, event_at DESC);

CREATE OR REPLACE FUNCTION update_dental_phase3_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dental_eligibility_updated_at ON dental_eligibility_checks;
CREATE TRIGGER trg_dental_eligibility_updated_at
  BEFORE UPDATE ON dental_eligibility_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_phase3_updated_at();

DROP TRIGGER IF EXISTS trg_dental_rcm_queue_updated_at ON dental_rcm_work_queues;
CREATE TRIGGER trg_dental_rcm_queue_updated_at
  BEFORE UPDATE ON dental_rcm_work_queues
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_phase3_updated_at();

DROP TRIGGER IF EXISTS trg_dental_growth_segments_updated_at ON dental_growth_segments;
CREATE TRIGGER trg_dental_growth_segments_updated_at
  BEFORE UPDATE ON dental_growth_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_phase3_updated_at();

DROP TRIGGER IF EXISTS trg_dental_growth_campaigns_updated_at ON dental_growth_campaigns;
CREATE TRIGGER trg_dental_growth_campaigns_updated_at
  BEFORE UPDATE ON dental_growth_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_phase3_updated_at();

CREATE OR REPLACE FUNCTION queue_denied_dental_claims()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.to_status = 'denied' THEN
    INSERT INTO dental_rcm_work_queues (
      doctor_id,
      claim_id,
      patient_id,
      queue_type,
      priority,
      reason,
      status,
      due_at,
      metadata
    ) VALUES (
      NEW.doctor_id,
      NEW.claim_id,
      NEW.patient_id,
      'denial',
      'high',
      COALESCE(NEW.denial_reason, 'Claim denegado sin motivo explícito'),
      'open',
      NOW() + INTERVAL '2 days',
      jsonb_build_object('denial_code', NEW.denial_code, 'source', 'lifecycle_trigger')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_queue_denied_claims ON dental_claim_lifecycle_events;
CREATE TRIGGER trg_queue_denied_claims
  AFTER INSERT ON dental_claim_lifecycle_events
  FOR EACH ROW
  EXECUTE FUNCTION queue_denied_dental_claims();

ALTER TABLE dental_eligibility_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_claim_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_rcm_work_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_growth_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_growth_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_growth_campaign_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors manage own dental eligibility checks" ON dental_eligibility_checks;
CREATE POLICY "Doctors manage own dental eligibility checks"
  ON dental_eligibility_checks FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients view own dental eligibility checks" ON dental_eligibility_checks;
CREATE POLICY "Patients view own dental eligibility checks"
  ON dental_eligibility_checks FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage own dental claim lifecycle events" ON dental_claim_lifecycle_events;
CREATE POLICY "Doctors manage own dental claim lifecycle events"
  ON dental_claim_lifecycle_events FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients view own dental claim lifecycle events" ON dental_claim_lifecycle_events;
CREATE POLICY "Patients view own dental claim lifecycle events"
  ON dental_claim_lifecycle_events FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage own dental rcm queues" ON dental_rcm_work_queues;
CREATE POLICY "Doctors manage own dental rcm queues"
  ON dental_rcm_work_queues FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage own dental growth segments" ON dental_growth_segments;
CREATE POLICY "Doctors manage own dental growth segments"
  ON dental_growth_segments FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients view own dental growth segments" ON dental_growth_segments;
CREATE POLICY "Patients view own dental growth segments"
  ON dental_growth_segments FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage own dental growth campaigns" ON dental_growth_campaigns;
CREATE POLICY "Doctors manage own dental growth campaigns"
  ON dental_growth_campaigns FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage own dental growth campaign events" ON dental_growth_campaign_events;
CREATE POLICY "Doctors manage own dental growth campaign events"
  ON dental_growth_campaign_events FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients view own dental growth campaign events" ON dental_growth_campaign_events;
CREATE POLICY "Patients view own dental growth campaign events"
  ON dental_growth_campaign_events FOR SELECT
  USING (patient_id = auth.uid());

COMMENT ON TABLE dental_eligibility_checks IS 'Validaciones de elegibilidad de pagador para RCM dental';
COMMENT ON TABLE dental_claim_lifecycle_events IS 'Máquina de estados auditable de claims dentales';
COMMENT ON TABLE dental_rcm_work_queues IS 'Cola operativa para staff RCM dental (denials, appeals, followups)';
COMMENT ON TABLE dental_growth_segments IS 'Segmentación de recall por riesgo/valor/probabilidad de retorno';
COMMENT ON TABLE dental_growth_campaigns IS 'Campañas omnicanal de growth dental';
COMMENT ON TABLE dental_growth_campaign_events IS 'Trazabilidad closed-loop de campañas: envío→cita→aceptación→cobro';
