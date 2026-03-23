-- ============================================
-- CORE CLINICO DENTAL + IMAGING / AI TRACEABILITY
-- ============================================

CREATE TABLE IF NOT EXISTS dental_clinical_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  finding_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  tooth_code TEXT,
  surface_code TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai')),
  ai_model_version TEXT,
  validation_status TEXT NOT NULL DEFAULT 'validated' CHECK (validation_status IN ('pending_validation', 'validated', 'rejected')),
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_perio_chart_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  tooth_code TEXT NOT NULL,
  site TEXT NOT NULL CHECK (site IN ('MB', 'B', 'DB', 'ML', 'L', 'DL')),
  probing_depth_mm INTEGER NOT NULL CHECK (probing_depth_mm BETWEEN 0 AND 20),
  recession_mm INTEGER NOT NULL DEFAULT 0 CHECK (recession_mm BETWEEN -5 AND 15),
  bleeding BOOLEAN NOT NULL DEFAULT false,
  mobility_grade INTEGER CHECK (mobility_grade BETWEEN 0 AND 3),
  furcation_grade INTEGER CHECK (furcation_grade BETWEEN 0 AND 3),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  phase TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'proposed', 'accepted', 'in_progress', 'completed', 'cancelled')),
  estimated_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_treatment_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES dental_treatment_plans(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  procedure_code TEXT,
  procedure_name TEXT NOT NULL,
  tooth_code TEXT,
  surface_code TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  estimated_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_imaging_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  study_type TEXT NOT NULL CHECK (study_type IN ('periapical', 'bitewing', 'panoramic', 'cbct', 'intraoral_photo', 'other')),
  study_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL DEFAULT 'manual_upload' CHECK (source IN ('manual_upload', 'device', 'external_pacs')),
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'analyzed', 'validated', 'archived')),
  ai_analysis_status TEXT NOT NULL DEFAULT 'not_requested' CHECK (ai_analysis_status IN ('not_requested', 'pending', 'completed', 'failed')),
  file_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dental_ai_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imaging_study_id UUID NOT NULL REFERENCES dental_imaging_studies(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  tooth_code TEXT,
  surface_code TEXT,
  confidence NUMERIC(5,4),
  suggested_diagnosis TEXT,
  status TEXT NOT NULL DEFAULT 'pending_validation' CHECK (status IN ('pending_validation', 'accepted', 'rejected')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dental_findings_doctor_observed ON dental_clinical_findings(doctor_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_dental_findings_patient ON dental_clinical_findings(patient_id);
CREATE INDEX IF NOT EXISTS idx_dental_findings_validation ON dental_clinical_findings(validation_status);

CREATE INDEX IF NOT EXISTS idx_dental_perio_doctor_recorded ON dental_perio_chart_entries(doctor_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dental_perio_patient ON dental_perio_chart_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_dental_perio_probing ON dental_perio_chart_entries(probing_depth_mm);

CREATE INDEX IF NOT EXISTS idx_dental_plans_doctor_status ON dental_treatment_plans(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_dental_plan_items_doctor_status ON dental_treatment_plan_items(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_dental_plan_items_patient ON dental_treatment_plan_items(patient_id);

CREATE INDEX IF NOT EXISTS idx_dental_imaging_doctor_date ON dental_imaging_studies(doctor_id, study_date DESC);
CREATE INDEX IF NOT EXISTS idx_dental_imaging_ai_status ON dental_imaging_studies(ai_analysis_status);

CREATE INDEX IF NOT EXISTS idx_dental_ai_findings_doctor_status ON dental_ai_findings(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_dental_ai_findings_study ON dental_ai_findings(imaging_study_id);
CREATE INDEX IF NOT EXISTS idx_dental_ai_findings_generated ON dental_ai_findings(generated_at DESC);

CREATE OR REPLACE FUNCTION update_dental_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dental_findings_updated_at ON dental_clinical_findings;
CREATE TRIGGER trg_dental_findings_updated_at
  BEFORE UPDATE ON dental_clinical_findings
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_updated_at_column();

DROP TRIGGER IF EXISTS trg_dental_perio_updated_at ON dental_perio_chart_entries;
CREATE TRIGGER trg_dental_perio_updated_at
  BEFORE UPDATE ON dental_perio_chart_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_updated_at_column();

DROP TRIGGER IF EXISTS trg_dental_plans_updated_at ON dental_treatment_plans;
CREATE TRIGGER trg_dental_plans_updated_at
  BEFORE UPDATE ON dental_treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_updated_at_column();

DROP TRIGGER IF EXISTS trg_dental_plan_items_updated_at ON dental_treatment_plan_items;
CREATE TRIGGER trg_dental_plan_items_updated_at
  BEFORE UPDATE ON dental_treatment_plan_items
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_updated_at_column();

DROP TRIGGER IF EXISTS trg_dental_imaging_updated_at ON dental_imaging_studies;
CREATE TRIGGER trg_dental_imaging_updated_at
  BEFORE UPDATE ON dental_imaging_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_updated_at_column();

DROP TRIGGER IF EXISTS trg_dental_ai_findings_updated_at ON dental_ai_findings;
CREATE TRIGGER trg_dental_ai_findings_updated_at
  BEFORE UPDATE ON dental_ai_findings
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_updated_at_column();

ALTER TABLE dental_clinical_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_perio_chart_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_treatment_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_ai_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can manage their own dental findings" ON dental_clinical_findings;
CREATE POLICY "Doctors can manage their own dental findings"
  ON dental_clinical_findings FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients can view their dental findings" ON dental_clinical_findings;
CREATE POLICY "Patients can view their dental findings"
  ON dental_clinical_findings FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can manage their own perio entries" ON dental_perio_chart_entries;
CREATE POLICY "Doctors can manage their own perio entries"
  ON dental_perio_chart_entries FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients can view their perio entries" ON dental_perio_chart_entries;
CREATE POLICY "Patients can view their perio entries"
  ON dental_perio_chart_entries FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can manage their own treatment plans" ON dental_treatment_plans;
CREATE POLICY "Doctors can manage their own treatment plans"
  ON dental_treatment_plans FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients can view their treatment plans" ON dental_treatment_plans;
CREATE POLICY "Patients can view their treatment plans"
  ON dental_treatment_plans FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can manage their own treatment plan items" ON dental_treatment_plan_items;
CREATE POLICY "Doctors can manage their own treatment plan items"
  ON dental_treatment_plan_items FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients can view their treatment plan items" ON dental_treatment_plan_items;
CREATE POLICY "Patients can view their treatment plan items"
  ON dental_treatment_plan_items FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can manage their own imaging studies" ON dental_imaging_studies;
CREATE POLICY "Doctors can manage their own imaging studies"
  ON dental_imaging_studies FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients can view their own imaging studies" ON dental_imaging_studies;
CREATE POLICY "Patients can view their own imaging studies"
  ON dental_imaging_studies FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can manage their own AI findings" ON dental_ai_findings;
CREATE POLICY "Doctors can manage their own AI findings"
  ON dental_ai_findings FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Patients can view their own AI findings" ON dental_ai_findings;
CREATE POLICY "Patients can view their own AI findings"
  ON dental_ai_findings FOR SELECT
  USING (patient_id = auth.uid());

COMMENT ON TABLE dental_clinical_findings IS 'Hallazgos clínicos dentales con trazabilidad de validación';
COMMENT ON TABLE dental_perio_chart_entries IS 'Mediciones periodontales estructuradas por pieza/sitio';
COMMENT ON TABLE dental_treatment_plans IS 'Planes de tratamiento dental por paciente';
COMMENT ON TABLE dental_treatment_plan_items IS 'Procedimientos y fases de planes dentales';
COMMENT ON TABLE dental_imaging_studies IS 'Estudios de imagen dental (2D/3D/foto)';
COMMENT ON TABLE dental_ai_findings IS 'Hallazgos generados por IA y su validación profesional';
