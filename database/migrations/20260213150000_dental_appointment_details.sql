-- =============================================================================
-- Migration: Dental Appointment Details & Chairs
-- Description: Agrega campos odontológicos a las citas (sillas, procedimientos, etc.)
-- Author: AI Assistant
-- Date: 2026-02-13
-- =============================================================================

-- ─── 1. Dental Chairs (Sillas Dentales) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS dental_chairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES doctor_offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  equipment_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(office_id, number)
);

ALTER TABLE dental_chairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_view_chairs" ON dental_chairs
  FOR SELECT USING (
    office_id IN (
      SELECT id FROM doctor_offices WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "doctors_manage_chairs" ON dental_chairs
  FOR ALL USING (
    office_id IN (
      SELECT id FROM doctor_offices WHERE doctor_id = auth.uid()
    )
  );

CREATE INDEX idx_dental_chairs_office ON dental_chairs(office_id);

-- ─── 2. Dental Appointment Details ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dental_appointment_details (
  appointment_id UUID PRIMARY KEY REFERENCES appointments(id) ON DELETE CASCADE,
  
  -- Chair & Staff
  chair_id UUID REFERENCES dental_chairs(id) ON DELETE SET NULL,
  hygienist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assistant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Procedure Information
  procedure_code VARCHAR(20),
  procedure_name TEXT,
  tooth_numbers INTEGER[], -- FDI notation (11-48)
  surfaces TEXT[], -- M, D, O, B, L, I
  quadrant INTEGER, -- 1, 2, 3, 4 (para procedimientos por cuadrante)
  
  -- Clinical Details
  requires_anesthesia BOOLEAN DEFAULT false,
  anesthesia_type VARCHAR(50),
  requires_sedation BOOLEAN DEFAULT false,
  sedation_type VARCHAR(50),
  
  -- Materials & Preparation
  materials_needed TEXT[],
  materials_prepared BOOLEAN DEFAULT false,
  special_equipment TEXT[],
  
  -- Financial
  estimated_cost NUMERIC(10,2),
  insurance_authorization TEXT,
  
  -- Clinical Notes
  preop_notes TEXT DEFAULT '',
  postop_notes TEXT DEFAULT '',
  complications TEXT DEFAULT '',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dental_appointment_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_view_appointment_details" ON dental_appointment_details
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "doctors_manage_appointment_details" ON dental_appointment_details
  FOR ALL USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE doctor_id = auth.uid()
    )
  );

CREATE INDEX idx_dental_appointment_details_chair ON dental_appointment_details(chair_id);
CREATE INDEX idx_dental_appointment_details_procedure ON dental_appointment_details(procedure_code);

-- ─── 3. Procedure Catalog (Catálogo de Procedimientos) ───────────────────────
CREATE TABLE IF NOT EXISTS dental_procedure_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'preventive', 'restorative', 'endodontic', 'periodontic', 'surgical', 'prosthetic', 'orthodontic'
  subcategory TEXT DEFAULT '',
  description TEXT DEFAULT '',
  default_duration INTEGER NOT NULL DEFAULT 30, -- minutos
  requires_anesthesia BOOLEAN DEFAULT false,
  typical_materials TEXT[] DEFAULT '{}',
  typical_cost_min NUMERIC(10,2),
  typical_cost_max NUMERIC(10,2),
  ada_code VARCHAR(10), -- American Dental Association code
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dental_procedure_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "everyone_read_catalog" ON dental_procedure_catalog
  FOR SELECT USING (is_active = true);

CREATE INDEX idx_procedure_catalog_code ON dental_procedure_catalog(code);
CREATE INDEX idx_procedure_catalog_category ON dental_procedure_catalog(category);

-- ─── 4. Seed Data: Common Procedures ──────────────────────────────────────────
INSERT INTO dental_procedure_catalog (code, name, category, subcategory, default_duration, requires_anesthesia, typical_cost_min, typical_cost_max, ada_code) VALUES
  -- Preventive
  ('EXAM-001', 'Examen Oral Completo', 'preventive', 'diagnostic', 30, false, 30.00, 50.00, 'D0150'),
  ('CLEAN-001', 'Profilaxis (Limpieza)', 'preventive', 'hygiene', 45, false, 40.00, 80.00, 'D1110'),
  ('FLUOR-001', 'Aplicación de Flúor', 'preventive', 'fluoride', 15, false, 15.00, 30.00, 'D1206'),
  ('SEAL-001', 'Sellante de Fosas y Fisuras', 'preventive', 'sealant', 20, false, 25.00, 45.00, 'D1351'),
  
  -- Restorative
  ('REST-001', 'Obturación (Resina) 1 Superficie', 'restorative', 'filling', 45, true, 50.00, 100.00, 'D2391'),
  ('REST-002', 'Obturación (Resina) 2 Superficies', 'restorative', 'filling', 60, true, 70.00, 130.00, 'D2392'),
  ('REST-003', 'Obturación (Resina) 3+ Superficies', 'restorative', 'filling', 75, true, 90.00, 160.00, 'D2393'),
  ('CROWN-001', 'Corona de Porcelana', 'restorative', 'crown', 90, true, 400.00, 800.00, 'D2740'),
  ('INLAY-001', 'Inlay/Onlay', 'restorative', 'inlay', 90, true, 350.00, 700.00, 'D2510'),
  
  -- Endodontic
  ('ENDO-001', 'Endodoncia Anterior', 'endodontic', 'root_canal', 90, true, 250.00, 450.00, 'D3310'),
  ('ENDO-002', 'Endodoncia Premolar', 'endodontic', 'root_canal', 120, true, 300.00, 550.00, 'D3320'),
  ('ENDO-003', 'Endodoncia Molar', 'endodontic', 'root_canal', 150, true, 400.00, 700.00, 'D3330'),
  
  -- Surgical
  ('EXTR-001', 'Extracción Simple', 'surgical', 'extraction', 30, true, 50.00, 120.00, 'D7140'),
  ('EXTR-002', 'Extracción Quirúrgica', 'surgical', 'extraction', 60, true, 120.00, 250.00, 'D7210'),
  ('EXTR-003', 'Extracción Cordal', 'surgical', 'extraction', 90, true, 150.00, 350.00, 'D7240'),
  ('IMPL-001', 'Implante Dental', 'surgical', 'implant', 120, true, 800.00, 1500.00, 'D6010'),
  
  -- Periodontic
  ('PERIO-001', 'Limpieza Profunda (Cuadrante)', 'periodontic', 'deep_cleaning', 60, true, 80.00, 150.00, 'D4341'),
  ('PERIO-002', 'Injerto de Tejido Blando', 'periodontic', 'graft', 90, true, 500.00, 900.00, 'D4273'),
  
  -- Prosthetic
  ('PROST-001', 'Prótesis Completa', 'prosthetic', 'denture', 120, false, 600.00, 1200.00, 'D5110'),
  ('PROST-002', 'Prótesis Parcial', 'prosthetic', 'partial', 90, false, 400.00, 900.00, 'D5213'),
  
  -- Orthodontic
  ('ORTHO-001', 'Consulta Ortodóncica', 'orthodontic', 'consultation', 60, false, 30.00, 80.00, 'D8010'),
  ('ORTHO-002', 'Ajuste de Brackets', 'orthodontic', 'adjustment', 30, false, 40.00, 80.00, 'D8090')
ON CONFLICT (code) DO NOTHING;

-- ─── 5. Functions & Triggers ──────────────────────────────────────────────────

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dental_appointment_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dental_appointment_details
  BEFORE UPDATE ON dental_appointment_details
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_appointment_details_updated_at();

CREATE TRIGGER trigger_update_dental_chairs
  BEFORE UPDATE ON dental_chairs
  FOR EACH ROW
  EXECUTE FUNCTION update_dental_appointment_details_updated_at();

-- ─── 6. Views ─────────────────────────────────────────────────────────────────

-- Vista: Citas con detalles dentales completos
CREATE OR REPLACE VIEW appointments_with_dental_details AS
SELECT 
  a.id,
  a.doctor_id,
  a.patient_id,
  a.fecha_hora,
  a.duracion,
  a.motivo_consulta,
  a.status,
  a.notas,
  dad.chair_id,
  dc.name as chair_name,
  dc.number as chair_number,
  dad.procedure_code,
  dad.procedure_name,
  dad.tooth_numbers,
  dad.surfaces,
  dad.requires_anesthesia,
  dad.anesthesia_type,
  dad.materials_needed,
  dad.materials_prepared,
  dad.estimated_cost,
  dpc.category as procedure_category,
  dpc.default_duration as procedure_duration
FROM appointments a
LEFT JOIN dental_appointment_details dad ON a.id = dad.appointment_id
LEFT JOIN dental_chairs dc ON dad.chair_id = dc.id
LEFT JOIN dental_procedure_catalog dpc ON dad.procedure_code = dpc.code;

-- ─── 7. Comments ──────────────────────────────────────────────────────────────
COMMENT ON TABLE dental_chairs IS 'Sillas/unidades dentales por consultorio';
COMMENT ON TABLE dental_appointment_details IS 'Detalles odontológicos específicos de cada cita';
COMMENT ON TABLE dental_procedure_catalog IS 'Catálogo de procedimientos dentales comunes';
COMMENT ON VIEW appointments_with_dental_details IS 'Vista completa de citas con información dental';
