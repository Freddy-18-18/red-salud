-- =====================================================
-- MIGRACIÓN: Sistema de Recetas Médicas
-- Fecha: 2026-02-01
-- Descripción: Tablas para gestión de recetas digitales
-- =====================================================

-- Tabla de recetas
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id),
  doctor_name VARCHAR(255) NOT NULL,
  doctor_license VARCHAR(50) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de items de receta
CREATE TABLE IF NOT EXISTS prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  dispensed_quantity INTEGER DEFAULT 0 CHECK (dispensed_quantity >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_expiry ON prescriptions(expiry_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_number ON prescriptions(prescription_number);
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_product ON prescription_items(product_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_prescriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_prescriptions_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE prescriptions IS 'Recetas médicas digitales';
COMMENT ON TABLE prescription_items IS 'Medicamentos prescritos en cada receta';
COMMENT ON COLUMN prescriptions.status IS 'Estado: pending (pendiente), dispensed (dispensada), cancelled (cancelada)';
COMMENT ON COLUMN prescription_items.dispensed_quantity IS 'Cantidad ya dispensada del medicamento';
