-- Migración: Campos adicionales para información profesional del médico
-- Fecha: 2026-02-13
-- Descripción: Agrega campos para publicaciones, asociaciones, condiciones tratadas,
--              experiencia laboral, seguros, datos académicos y presencia digital

-- ============================================
-- 1. NUEVOS CAMPOS EN doctor_profiles
-- ============================================

ALTER TABLE doctor_profiles
  -- Información académica adicional
  ADD COLUMN IF NOT EXISTS university TEXT,
  ADD COLUMN IF NOT EXISTS college_number TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year INTEGER CHECK (graduation_year >= 1950 AND graduation_year <= 2100),
  
  -- Reconocimientos y publicaciones
  ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS publications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS associations JSONB DEFAULT '[]'::jsonb,
  
  -- Práctica médica
  ADD COLUMN IF NOT EXISTS conditions_treated TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS age_groups TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]'::jsonb,
  
  -- Seguros y pagos (actualizado)
  ADD COLUMN IF NOT EXISTS accepted_insurances JSONB DEFAULT '[]'::jsonb,
  
  -- Presencia digital
  ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS website TEXT;

-- ============================================
-- 2. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON COLUMN doctor_profiles.university IS 'Universidad donde estudió medicina';
COMMENT ON COLUMN doctor_profiles.college_number IS 'Número de colegio médico/asociación profesional';
COMMENT ON COLUMN doctor_profiles.graduation_year IS 'Año de graduación de medicina';

COMMENT ON COLUMN doctor_profiles.awards IS 'Premios y reconocimientos [{name, issuer, year, description}]';
COMMENT ON COLUMN doctor_profiles.publications IS 'Publicaciones científicas [{title, journal, year, doi, url}]';
COMMENT ON COLUMN doctor_profiles.associations IS 'Asociaciones médicas [{name, role, since_year, membership_number}]';

COMMENT ON COLUMN doctor_profiles.conditions_treated IS 'Condiciones médicas que trata (e.g., "Diabetes", "Hipertensión")';
COMMENT ON COLUMN doctor_profiles.age_groups IS 'Grupos de edad que atiende (e.g., "Niños", "Adultos", "Ancianos")';
COMMENT ON COLUMN doctor_profiles.work_experience IS 'Experiencia laboral [{institution, position, start_date, end_date, description, is_current}]';

COMMENT ON COLUMN doctor_profiles.accepted_insurances IS 'Seguros aceptados [{name, plans, copay_info}]';
COMMENT ON COLUMN doctor_profiles.social_media IS 'Redes sociales {facebook, twitter, instagram, linkedin, youtube}';
COMMENT ON COLUMN doctor_profiles.website IS 'Sitio web personal o del consultorio';

-- ============================================
-- 3. ÍNDICES PARA BÚSQUEDAS
-- ============================================

-- Índice GIN para búsquedas en conditions_treated
CREATE INDEX IF NOT EXISTS idx_doctor_conditions_treated 
ON doctor_profiles USING GIN (conditions_treated);

-- Índice GIN para búsquedas en age_groups
CREATE INDEX IF NOT EXISTS idx_doctor_age_groups 
ON doctor_profiles USING GIN (age_groups);

-- Índice GIN para búsquedas en publications
CREATE INDEX IF NOT EXISTS idx_doctor_publications 
ON doctor_profiles USING GIN (publications);

-- Índice GIN para búsquedas en work_experience
CREATE INDEX IF NOT EXISTS idx_doctor_work_experience 
ON doctor_profiles USING GIN (work_experience);

-- Índice para búsquedas por universidad
CREATE INDEX IF NOT EXISTS idx_doctor_university 
ON doctor_profiles (university) 
WHERE university IS NOT NULL;

-- ============================================
-- 4. DATOS DE EJEMPLO (OPCIONAL - comentado)
-- ============================================

-- Descomentar para agregar datos de ejemplo a un doctor existente
/*
UPDATE doctor_profiles 
SET 
  conditions_treated = ARRAY['Diabetes Tipo 2', 'Hipertensión Arterial', 'Obesidad'],
  age_groups = ARRAY['Adultos', 'Ancianos'],
  publications = '[
    {
      "title": "Manejo integral de diabetes en pacientes geriátricos",
      "journal": "Revista Médica de Venezuela",
      "year": 2023,
      "url": "https://example.com/paper"
    }
  ]'::jsonb,
  awards = '[
    {
      "name": "Mejor Médico del Año",
      "issuer": "Colegio de Médicos",
      "year": 2024
    }
  ]'::jsonb,
  associations = '[
    {
      "name": "Sociedad Venezolana de Medicina Interna",
      "role": "Miembro Activo",
      "since_year": 2020
    }
  ]'::jsonb,
  social_media = '{
    "linkedin": "https://linkedin.com/in/drjuan",
    "instagram": "https://instagram.com/drjuanmedico"
  }'::jsonb,
  website = 'https://drjuan.com'
WHERE license_number = 'EXAMPLE_LICENSE';
*/

-- ============================================
-- 5. VALIDACIONES Y CONSTRAINTS
-- ============================================

-- Validación básica de URLs en website
ALTER TABLE doctor_profiles 
ADD CONSTRAINT check_website_format 
CHECK (
  website IS NULL OR 
  website ~ '^https?://'
);

-- ============================================
-- 6. FUNCIÓN HELPER PARA BÚSQUEDAS
-- ============================================

-- Función para buscar médicos por condiciones tratadas
CREATE OR REPLACE FUNCTION search_doctors_by_condition(search_term TEXT)
RETURNS TABLE (
  doctor_id UUID,
  full_name TEXT,
  conditions TEXT[],
  specialty TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    CONCAT(p.nombres, ' ', p.apellidos) as full_name,
    dp.conditions_treated,
    ms.name as specialty
  FROM doctor_profiles dp
  JOIN profiles p ON dp.id = p.id
  LEFT JOIN medical_specialties ms ON dp.specialty_id = ms.id
  WHERE 
    search_term = ANY(dp.conditions_treated)
    AND dp.is_active = true
    AND dp.accepts_new_patients = true
  ORDER BY dp.average_rating DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_doctors_by_condition IS 'Busca médicos que traten una condición específica';

-- ============================================
-- 7. RETROCOMPATIBILIDAD
-- ============================================

-- Migrar datos existentes de insurance_providers a accepted_insurances
-- (si existían datos en el campo viejo)
UPDATE doctor_profiles
SET accepted_insurances = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', provider,
        'plans', ARRAY[]::text[],
        'copay_info', ''
      )
    )
    FROM jsonb_array_elements_text(insurance_providers) provider
  ),
  '[]'::jsonb
)
WHERE insurance_providers IS NOT NULL 
  AND insurance_providers != '[]'::jsonb
  AND (accepted_insurances IS NULL OR accepted_insurances = '[]'::jsonb);

-- ============================================
-- 8. PERMISOS RLS (mantener políticas existentes)
-- ============================================

-- Las políticas RLS existentes se mantienen automáticamente
-- ya que solo estamos agregando columnas

-- ============================================
-- NOTAS DE MIGRACIÓN
-- ============================================

-- Esta migración:
-- ✅ Agrega 13 campos nuevos sin romper datos existentes
-- ✅ Mantiene retrocompatibilidad con campos existentes
-- ✅ Agrega índices para optimizar búsquedas
-- ✅ Incluye función helper para búsquedas por condición
-- ✅ Migra datos de insurance_providers a accepted_insurances
-- ✅ Todas las columnas son opcionales (nullable o con defaults)

-- Para revertir esta migración (rollback):
/*
ALTER TABLE doctor_profiles
  DROP COLUMN IF EXISTS university,
  DROP COLUMN IF EXISTS college_number,
  DROP COLUMN IF EXISTS graduation_year,
  DROP COLUMN IF EXISTS awards,
  DROP COLUMN IF EXISTS publications,
  DROP COLUMN IF EXISTS associations,
  DROP COLUMN IF EXISTS conditions_treated,
  DROP COLUMN IF EXISTS age_groups,
  DROP COLUMN IF EXISTS work_experience,
  DROP COLUMN IF EXISTS accepted_insurances,
  DROP COLUMN IF EXISTS social_media,
  DROP COLUMN IF EXISTS website;

DROP FUNCTION IF EXISTS search_doctors_by_condition;
*/
