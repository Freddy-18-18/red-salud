-- Migration: Add subespecialidades column to doctor_details
-- Description: Agrega columna para almacenar especialidades adicionales (postgrados) de los médicos
-- Date: 2025-01-27

-- Agregar columna de especialidades adicionales
ALTER TABLE doctor_details
ADD COLUMN IF NOT EXISTS subespecialidades TEXT[] DEFAULT '{}';

-- Índice para búsquedas eficientes en arrays
CREATE INDEX IF NOT EXISTS idx_doctor_details_subespecialties
ON doctor_details USING GIN(subespecialidades);

-- Comentario explicativo
COMMENT ON COLUMN doctor_details.subespecialidades IS
'Especialidades adicionales del médico (postgrados, sub-especialidades verificadas)';
