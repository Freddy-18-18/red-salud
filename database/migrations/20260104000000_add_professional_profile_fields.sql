-- Add professional profile fields to doctor_profiles table
ALTER TABLE doctor_profiles
ADD COLUMN IF NOT EXISTS college_number TEXT,
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS insurance_companies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS conditions_treated TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS patient_age_groups TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- Comment on new columns
COMMENT ON COLUMN doctor_profiles.college_number IS 'Número de Colegio de Médicos';
COMMENT ON COLUMN doctor_profiles.graduation_year IS 'Año de graduación para calcular experiencia';
COMMENT ON COLUMN doctor_profiles.insurance_companies IS 'Lista de aseguradoras aceptadas';
COMMENT ON COLUMN doctor_profiles.conditions_treated IS 'Lista de enfermedades o condiciones tratadas (SEO)';
COMMENT ON COLUMN doctor_profiles.patient_age_groups IS 'Grupos de edad atendidos (Bebés, Niños, Adultos, etc.)';
COMMENT ON COLUMN doctor_profiles.social_media IS 'Enlaces a redes sociales (Instagram, LinkedIn, Web)';
