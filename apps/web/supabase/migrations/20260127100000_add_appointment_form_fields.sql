-- Migration: Add missing appointment fields for complete form integration
-- Date: 2026-01-27
-- Description: Adds metodo_pago, enviar_recordatorio, and clinical fields to appointments table

-- Add payment method column
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'pendiente'
CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'seguro', 'pago_movil', 'pendiente'));

-- Add reminder flag
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS enviar_recordatorio BOOLEAN DEFAULT true;

-- Add clinical fields (for advanced mode)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS diagnostico_preliminar TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS antecedentes_relevantes TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS medicamentos_actuales TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS alergias TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS notas_clinicas TEXT;

-- Add services array for billing
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS servicios_ids UUID[] DEFAULT '{}';

-- Create index for payment method queries
CREATE INDEX IF NOT EXISTS idx_appointments_metodo_pago ON appointments(metodo_pago);

-- Create index for reminder scheduling
CREATE INDEX IF NOT EXISTS idx_appointments_enviar_recordatorio ON appointments(enviar_recordatorio) 
WHERE enviar_recordatorio = true;

-- Comment on columns for documentation
COMMENT ON COLUMN appointments.metodo_pago IS 'Payment method: efectivo, transferencia, tarjeta, seguro, pago_movil, pendiente';
COMMENT ON COLUMN appointments.enviar_recordatorio IS 'Whether to send reminder notification 24h before appointment';
COMMENT ON COLUMN appointments.diagnostico_preliminar IS 'Preliminary diagnosis notes (clinical mode)';
COMMENT ON COLUMN appointments.antecedentes_relevantes IS 'Relevant medical history (clinical mode)';
COMMENT ON COLUMN appointments.medicamentos_actuales IS 'Current medications (clinical mode)';
COMMENT ON COLUMN appointments.alergias IS 'Known allergies (clinical mode)';
COMMENT ON COLUMN appointments.notas_clinicas IS 'Clinical notes (clinical mode)';
COMMENT ON COLUMN appointments.servicios_ids IS 'Array of service IDs for billing';
