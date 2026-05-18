-- =============================================================================
-- Migration: doctor_profiles schema cleanup
-- Fecha: 2026-05-13
-- Descripción:
--   1. DROP doctor_profiles.consultation_price (duplicado con consultation_fee,
--      este último es el canónico — 84 ocurrencias en código vs 25).
--   2. DROP doctor_profiles.office_hours (duplicado con schedule, este último
--      es el canónico — 69 ocurrencias vs 15. office_hours seguirá existiendo
--      en clinic_details, laboratory_details y pharmacy_details como campo
--      legítimo de esas entidades).
--   3. ALTER doctor_profiles.accepts_telemedicine SET DEFAULT false.
--      No podemos asumir consentimiento de telemedicina por defecto: hay
--      especialidades (cirugía, traumatología) donde no aplica.
--
-- Riesgo: nulo. doctor_profiles está vacía (0 rows) al momento de esta
-- migration. La única dependencia (view public_doctor_directory) se recrea
-- abajo sin la columna dropeada.
-- =============================================================================

BEGIN;

-- 1. Drop the dependent view (will be recreated without consultation_price).
DROP VIEW IF EXISTS public.public_doctor_directory;

-- 2. Drop redundant columns.
ALTER TABLE public.doctor_profiles
  DROP COLUMN IF EXISTS consultation_price,
  DROP COLUMN IF EXISTS office_hours;

-- 3. Change accepts_telemedicine default. Tabla vacía, ningún row afectado.
ALTER TABLE public.doctor_profiles
  ALTER COLUMN accepts_telemedicine SET DEFAULT false;

-- 4. Recreate public_doctor_directory view without consultation_price.
CREATE OR REPLACE VIEW public.public_doctor_directory AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.city,
  p.state,
  dp.id AS doctor_profile_id,
  dp.specialty_id,
  dp.consultation_fee,
  dp.consultation_duration,
  dp.accepts_insurance,
  dp.accepts_telemedicine,
  dp.accepts_new_patients,
  dp.accepted_insurances,
  dp.years_experience,
  dp.average_rating,
  dp.total_reviews,
  dp.total_consultations,
  dp.languages,
  dp.subspecialties,
  dp.specialization_areas,
  dp.conditions_treated,
  dp.age_groups,
  dp.is_featured,
  dp.slug,
  dp.biography,
  dp.clinic_address,
  dp.sacs_verified,
  dp.verified,
  dp.verified_at,
  dp.awards,
  dp.publications,
  dp.associations,
  dp.work_experience,
  dp.university,
  dp.graduation_year,
  dp.professional_type,
  dp.social_media,
  dp.website,
  dp.certifications,
  dp.created_at,
  dp.updated_at
FROM public.profiles p
  JOIN public.doctor_profiles dp ON dp.profile_id = p.id
WHERE p.role = 'medico'::user_role AND dp.verified = true;

COMMENT ON VIEW public.public_doctor_directory IS
  'Doctor directory for patient-facing search and listings. Only verified medicos.';

-- 5. Document the cleanup.
COMMENT ON COLUMN public.doctor_profiles.consultation_fee IS
  'Honorarios de consulta del médico (NUMERIC). Campo canónico de precio.';

COMMENT ON COLUMN public.doctor_profiles.schedule IS
  'Horarios de atención del médico (JSONB: { workingDays, timeBlocks }). Campo canónico de horarios.';

COMMENT ON COLUMN public.doctor_profiles.accepts_telemedicine IS
  'Indica si el médico acepta consultas por telemedicina. Default false: requiere consentimiento explícito.';

COMMIT;
