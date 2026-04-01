-- =============================================================================
-- Migration: Patient Portal Complete Schema
-- Date: 2026-04-01
-- Description: Creates ALL tables required by the patient web app services.
--   Covers: patient medical details, documents, insurance, family, emergency,
--   medication reminders, health metrics/goals, community (posts/replies/votes),
--   health articles, rewards/badges, second opinions, post-consultation actions,
--   notifications, push subscriptions, QR preferences, referrals, activity log,
--   pharmacy comparator, directory (provider reviews, clinic/lab details),
--   telemedicine, booking availability, blog posts, and testimonials.
--
-- All operations are idempotent (CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS).
-- Uses UUID primary keys, created_at/updated_at timestamps, and RLS policies.
-- =============================================================================

-- =============================================================================
-- 0. HELPER: updated_at trigger function (if not already created)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 0b. SPECIALTIES TABLE — ensure it exists before tables that reference it
-- The codebase references both 'specialties' and 'medical_specialties'.
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'specialties'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'medical_specialties'
    ) THEN
      -- Create a view alias
      EXECUTE 'CREATE OR REPLACE VIEW public.specialties AS SELECT * FROM public.medical_specialties';
      RAISE NOTICE 'Created specialties view aliasing medical_specialties.';
    ELSE
      -- Create the table
      CREATE TABLE public.specialties (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        TEXT NOT NULL,
        slug        TEXT UNIQUE,
        description TEXT,
        icon        TEXT,
        created_at  TIMESTAMPTZ DEFAULT now()
      );
      ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "anyone_read_specialties" ON public.specialties
        FOR SELECT USING (true);
      RAISE NOTICE 'Created specialties table.';
    END IF;
  END IF;
END $$;


-- =============================================================================
-- 1. PATIENT DETAILS (profile-service.ts, medical-id-service.ts, emergency-service.ts)
-- Extended medical information linked to a patient profile.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_details (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  grupo_sanguineo           TEXT,
  alergias                  JSONB DEFAULT '[]'::jsonb,
  contacto_emergencia_nombre    TEXT,
  contacto_emergencia_telefono  TEXT,
  contacto_emergencia_relacion  TEXT,
  enfermedades_cronicas     JSONB DEFAULT '[]'::jsonb,
  medicamentos_actuales     TEXT,
  cirugias_previas          TEXT,
  peso_kg                   NUMERIC(5,2),
  altura_cm                 NUMERIC(5,1),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_details" ON public.patient_details;
CREATE POLICY "patients_read_own_details" ON public.patient_details
  FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "patients_insert_own_details" ON public.patient_details;
CREATE POLICY "patients_insert_own_details" ON public.patient_details
  FOR INSERT WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "patients_update_own_details" ON public.patient_details;
CREATE POLICY "patients_update_own_details" ON public.patient_details
  FOR UPDATE USING (profile_id = auth.uid());

DROP TRIGGER IF EXISTS set_patient_details_updated_at ON public.patient_details;
CREATE TRIGGER set_patient_details_updated_at
  BEFORE UPDATE ON public.patient_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 2. PATIENT DOCUMENTS (documents-service.ts)
-- Patient-uploaded documents (lab results, prescriptions, reports, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('laboratorio','receta','informe','seguro','vacuna','factura','otro')),
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_size       BIGINT NOT NULL DEFAULT 0,
  provider_name   TEXT,
  notes           TEXT,
  document_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON public.patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_category ON public.patient_documents(patient_id, category);
CREATE INDEX IF NOT EXISTS idx_patient_documents_date ON public.patient_documents(patient_id, document_date DESC);

ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_documents" ON public.patient_documents;
CREATE POLICY "patients_read_own_documents" ON public.patient_documents
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_insert_own_documents" ON public.patient_documents;
CREATE POLICY "patients_insert_own_documents" ON public.patient_documents
  FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_delete_own_documents" ON public.patient_documents;
CREATE POLICY "patients_delete_own_documents" ON public.patient_documents
  FOR DELETE USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_patient_documents_updated_at ON public.patient_documents;
CREATE TRIGGER set_patient_documents_updated_at
  BEFORE UPDATE ON public.patient_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 3. SHARED DOCUMENTS (documents-service.ts)
-- Documents shared by patients with specific doctors.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.shared_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES public.patient_documents(id) ON DELETE CASCADE,
  doctor_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_shared_documents_document ON public.shared_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_shared_documents_doctor ON public.shared_documents(doctor_id);

ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_shares" ON public.shared_documents;
CREATE POLICY "patients_read_own_shares" ON public.shared_documents
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_insert_shares" ON public.shared_documents;
CREATE POLICY "patients_insert_shares" ON public.shared_documents
  FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_read_shared_with_them" ON public.shared_documents;
CREATE POLICY "doctors_read_shared_with_them" ON public.shared_documents
  FOR SELECT USING (doctor_id = auth.uid());


-- =============================================================================
-- 4. VACCINATION RECORDS (documents-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.vaccination_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vaccine_name      TEXT NOT NULL,
  dose_number       INT,
  administered_date DATE NOT NULL,
  provider_name     TEXT,
  lot_number        TEXT,
  next_dose_date    DATE,
  notes             TEXT,
  document_id       UUID REFERENCES public.patient_documents(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vaccination_records_patient ON public.vaccination_records(patient_id);

ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_vaccinations" ON public.vaccination_records;
CREATE POLICY "patients_read_own_vaccinations" ON public.vaccination_records
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_insert_own_vaccinations" ON public.vaccination_records;
CREATE POLICY "patients_insert_own_vaccinations" ON public.vaccination_records
  FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_delete_own_vaccinations" ON public.vaccination_records;
CREATE POLICY "patients_delete_own_vaccinations" ON public.vaccination_records
  FOR DELETE USING (patient_id = auth.uid());


-- =============================================================================
-- 5. PATIENT INSURANCE (insurance-service.ts, medical-id-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_insurance (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurance_company   TEXT NOT NULL,
  plan_name           TEXT NOT NULL,
  policy_number       TEXT NOT NULL,
  member_id           TEXT NOT NULL,
  group_number        TEXT,
  coverage_type       TEXT NOT NULL CHECK (coverage_type IN ('individual','familiar','colectivo')),
  valid_from          DATE NOT NULL,
  valid_until         DATE NOT NULL,
  is_active           BOOLEAN DEFAULT true,
  coverage_details    JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient ON public.patient_insurance(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_active ON public.patient_insurance(patient_id, is_active);

ALTER TABLE public.patient_insurance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_insurance" ON public.patient_insurance;
CREATE POLICY "patients_manage_own_insurance" ON public.patient_insurance
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_patient_insurance_updated_at ON public.patient_insurance;
CREATE TRIGGER set_patient_insurance_updated_at
  BEFORE UPDATE ON public.patient_insurance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 6. INSURANCE PREAUTHORIZATIONS (insurance-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.insurance_preauthorizations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurance_id            UUID NOT NULL REFERENCES public.patient_insurance(id) ON DELETE CASCADE,
  appointment_id          UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  procedure_code          TEXT,
  procedure_description   TEXT NOT NULL,
  estimated_cost          NUMERIC(12,2) NOT NULL DEFAULT 0,
  covered_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  copay_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','expired')),
  authorization_number    TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insurance_preauth_patient ON public.insurance_preauthorizations(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_preauth_insurance ON public.insurance_preauthorizations(insurance_id);

ALTER TABLE public.insurance_preauthorizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_preauths" ON public.insurance_preauthorizations;
CREATE POLICY "patients_manage_own_preauths" ON public.insurance_preauthorizations
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_insurance_preauth_updated_at ON public.insurance_preauthorizations;
CREATE TRIGGER set_insurance_preauth_updated_at
  BEFORE UPDATE ON public.insurance_preauthorizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 7. INSURANCE CLAIMS (insurance-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurance_id            UUID NOT NULL REFERENCES public.patient_insurance(id) ON DELETE CASCADE,
  appointment_id          UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  claim_type              TEXT NOT NULL CHECK (claim_type IN ('consulta','laboratorio','farmacia','hospitalizacion','emergencia','otro')),
  total_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  covered_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  patient_responsibility  NUMERIC(12,2) NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','in_review','approved','partially_approved','denied','paid')),
  claim_number            TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient ON public.insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_insurance ON public.insurance_claims(insurance_id);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_claims" ON public.insurance_claims;
CREATE POLICY "patients_manage_own_claims" ON public.insurance_claims
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_insurance_claims_updated_at ON public.insurance_claims;
CREATE TRIGGER set_insurance_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 8. FAMILY MEMBERS (family-service.ts, emergency-service.ts)
-- Two services use this table with different column naming conventions.
-- family-service.ts: owner_id, full_name, relationship, date_of_birth, gender,
--   blood_type, allergies (JSONB), chronic_conditions (JSONB),
--   current_medications (JSONB), emergency_contact (JSONB), national_id, avatar_url
-- emergency-service.ts: patient_id, nombre_completo, parentesco, fecha_nacimiento,
--   grupo_sanguineo, alergias (JSONB), enfermedades_cronicas (JSONB), medicamentos_actuales
-- We create columns for BOTH patterns so both services work.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.family_members (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- family-service.ts uses owner_id; emergency-service.ts uses patient_id
  -- We store both and keep them in sync via trigger
  owner_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- family-service.ts names
  full_name             TEXT NOT NULL,
  relationship          TEXT NOT NULL,
  date_of_birth         DATE,
  gender                TEXT,
  blood_type            TEXT,
  allergies             JSONB DEFAULT '[]'::jsonb,
  chronic_conditions    JSONB DEFAULT '[]'::jsonb,
  current_medications   JSONB DEFAULT '[]'::jsonb,
  emergency_contact     JSONB,
  national_id           TEXT,
  avatar_url            TEXT,
  -- emergency-service.ts names (Spanish aliases)
  nombre_completo       TEXT,
  parentesco            TEXT,
  fecha_nacimiento      DATE,
  grupo_sanguineo       TEXT,
  -- alergias/enfermedades_cronicas reuse allergies/chronic_conditions JSONB
  -- medicamentos_actuales is separate TEXT for emergency-service
  medicamentos_actuales TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Trigger to keep English and Spanish columns in sync
CREATE OR REPLACE FUNCTION public.sync_family_member_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync owner_id <-> patient_id
  IF NEW.patient_id IS NULL AND NEW.owner_id IS NOT NULL THEN
    NEW.patient_id := NEW.owner_id;
  ELSIF NEW.owner_id IS NULL AND NEW.patient_id IS NOT NULL THEN
    NEW.owner_id := NEW.patient_id;
  END IF;
  -- Sync English -> Spanish
  IF NEW.nombre_completo IS NULL OR NEW.nombre_completo = '' THEN
    NEW.nombre_completo := NEW.full_name;
  END IF;
  IF NEW.parentesco IS NULL OR NEW.parentesco = '' THEN
    NEW.parentesco := NEW.relationship;
  END IF;
  IF NEW.fecha_nacimiento IS NULL AND NEW.date_of_birth IS NOT NULL THEN
    NEW.fecha_nacimiento := NEW.date_of_birth;
  END IF;
  IF NEW.grupo_sanguineo IS NULL AND NEW.blood_type IS NOT NULL THEN
    NEW.grupo_sanguineo := NEW.blood_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_family_member_names_trigger ON public.family_members;
CREATE TRIGGER sync_family_member_names_trigger
  BEFORE INSERT OR UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_family_member_names();

CREATE INDEX IF NOT EXISTS idx_family_members_owner ON public.family_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_patient ON public.family_members(patient_id);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_family" ON public.family_members;
CREATE POLICY "patients_manage_own_family" ON public.family_members
  FOR ALL USING (owner_id = auth.uid() OR patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_family_members_updated_at ON public.family_members;
CREATE TRIGGER set_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 9. EMERGENCY REQUESTS (emergency-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  family_member_id  UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  priority          TEXT NOT NULL CHECK (priority IN ('red','yellow','green')),
  location_lat      DOUBLE PRECISION NOT NULL,
  location_lng      DOUBLE PRECISION NOT NULL,
  location_address  TEXT NOT NULL,
  symptoms          TEXT NOT NULL,
  medical_summary   JSONB,
  ambulance_id      UUID,
  status            TEXT NOT NULL DEFAULT 'requesting'
    CHECK (status IN ('requesting','dispatched','en_route','on_scene','transporting','completed','cancelled')),
  dispatched_at     TIMESTAMPTZ,
  arrived_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_requests_patient ON public.emergency_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);

ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_emergencies" ON public.emergency_requests;
CREATE POLICY "patients_manage_own_emergencies" ON public.emergency_requests
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_emergency_requests_updated_at ON public.emergency_requests;
CREATE TRIGGER set_emergency_requests_updated_at
  BEFORE UPDATE ON public.emergency_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime for emergency status updates
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests; EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- 10. MEDICATION REMINDERS (reminders-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.medication_reminders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_name   TEXT NOT NULL,
  dosage            TEXT,
  frequency         TEXT,
  starts_at         DATE NOT NULL,
  ends_at           DATE,
  schedule_times    JSONB NOT NULL DEFAULT '[]'::jsonb,  -- e.g. ["08:00","12:00","20:00"]
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medication_reminders_patient ON public.medication_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_active ON public.medication_reminders(patient_id, starts_at, ends_at);

ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_reminders" ON public.medication_reminders;
CREATE POLICY "patients_manage_own_reminders" ON public.medication_reminders
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_medication_reminders_updated_at ON public.medication_reminders;
CREATE TRIGGER set_medication_reminders_updated_at
  BEFORE UPDATE ON public.medication_reminders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 11. MEDICATION INTAKE LOG (reminders-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.medication_intake_log (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_reminder_id  UUID NOT NULL REFERENCES public.medication_reminders(id) ON DELETE CASCADE,
  scheduled_at            TIMESTAMPTZ NOT NULL,
  taken_at                TIMESTAMPTZ,
  status                  TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('taken','missed','pending')),
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medication_intake_patient ON public.medication_intake_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_intake_scheduled ON public.medication_intake_log(patient_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_medication_intake_reminder ON public.medication_intake_log(medication_reminder_id, scheduled_at);

ALTER TABLE public.medication_intake_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_intake" ON public.medication_intake_log;
CREATE POLICY "patients_manage_own_intake" ON public.medication_intake_log
  FOR ALL USING (patient_id = auth.uid());


-- =============================================================================
-- 12. HEALTH METRIC TYPES (reminders-service.ts)
-- Catalog of metric types (e.g. weight, blood pressure, glucose).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.health_metric_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  unit        TEXT NOT NULL,
  min_value   NUMERIC,
  max_value   NUMERIC,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.health_metric_types ENABLE ROW LEVEL SECURITY;

-- Metric types are read-only for all authenticated users
DROP POLICY IF EXISTS "authenticated_read_metric_types" ON public.health_metric_types;
CREATE POLICY "authenticated_read_metric_types" ON public.health_metric_types
  FOR SELECT TO authenticated USING (true);

-- Seed common metric types
INSERT INTO public.health_metric_types (name, unit, description, min_value, max_value) VALUES
  ('Peso',              'kg',     'Peso corporal',                      1,    300),
  ('Altura',            'cm',     'Estatura',                           30,   250),
  ('Presion sistolica', 'mmHg',   'Presion arterial sistolica',         60,   250),
  ('Presion diastolica','mmHg',   'Presion arterial diastolica',        30,   150),
  ('Frecuencia cardiaca','bpm',   'Pulso en reposo',                    30,   220),
  ('Glucosa en ayunas', 'mg/dL',  'Glucosa en sangre en ayunas',        30,   500),
  ('Temperatura',       '°C',     'Temperatura corporal',               34,   42),
  ('Saturacion O2',     '%',      'Saturacion de oxigeno en sangre',    70,   100),
  ('IMC',               'kg/m2',  'Indice de masa corporal',            10,   60)
ON CONFLICT (name) DO NOTHING;


-- =============================================================================
-- 13. HEALTH METRICS (reminders-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.health_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type_id  UUID NOT NULL REFERENCES public.health_metric_types(id) ON DELETE CASCADE,
  value           NUMERIC NOT NULL,
  measured_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_patient ON public.health_metrics(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON public.health_metrics(patient_id, metric_type_id, measured_at DESC);

ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_metrics" ON public.health_metrics;
CREATE POLICY "patients_manage_own_metrics" ON public.health_metrics
  FOR ALL USING (patient_id = auth.uid());


-- =============================================================================
-- 14. HEALTH GOALS (reminders-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.health_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  target_value    NUMERIC,
  current_value   NUMERIC DEFAULT 0,
  unit            TEXT,
  starts_at       DATE NOT NULL,
  target_date     DATE,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_goals_patient ON public.health_goals(patient_id);

ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_goals" ON public.health_goals;
CREATE POLICY "patients_manage_own_goals" ON public.health_goals
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_health_goals_updated_at ON public.health_goals;
CREATE TRIGGER set_health_goals_updated_at
  BEFORE UPDATE ON public.health_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 15. COMMUNITY POSTS (community-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.community_posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  content           TEXT NOT NULL,
  category          TEXT NOT NULL CHECK (category IN ('pregunta','experiencia','tip','articulo')),
  specialty_id      UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  tags              JSONB DEFAULT '[]'::jsonb,
  upvotes           INT NOT NULL DEFAULT 0,
  views             INT NOT NULL DEFAULT 0,
  is_verified_answer BOOLEAN NOT NULL DEFAULT false,
  status            TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft','hidden')),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category, status);
CREATE INDEX IF NOT EXISTS idx_community_posts_specialty ON public.community_posts(specialty_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status_date ON public.community_posts(status, created_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Published posts are readable by all authenticated users
DROP POLICY IF EXISTS "authenticated_read_published_posts" ON public.community_posts;
CREATE POLICY "authenticated_read_published_posts" ON public.community_posts
  FOR SELECT TO authenticated USING (status = 'published' OR author_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_posts" ON public.community_posts;
CREATE POLICY "users_insert_own_posts" ON public.community_posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_posts" ON public.community_posts;
CREATE POLICY "users_update_own_posts" ON public.community_posts
  FOR UPDATE USING (author_id = auth.uid());

DROP TRIGGER IF EXISTS set_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER set_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RPC for incrementing views
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.community_posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- 16. COMMUNITY REPLIES (community-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.community_replies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_doctor_reply BOOLEAN NOT NULL DEFAULT false,
  upvotes         INT NOT NULL DEFAULT 0,
  is_best_answer  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_replies_post ON public.community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_author ON public.community_replies(author_id);

ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_replies" ON public.community_replies;
CREATE POLICY "authenticated_read_replies" ON public.community_replies
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "users_insert_own_replies" ON public.community_replies;
CREATE POLICY "users_insert_own_replies" ON public.community_replies
  FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_replies" ON public.community_replies;
CREATE POLICY "users_update_own_replies" ON public.community_replies
  FOR UPDATE USING (author_id = auth.uid());

DROP TRIGGER IF EXISTS set_community_replies_updated_at ON public.community_replies;
CREATE TRIGGER set_community_replies_updated_at
  BEFORE UPDATE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 17. COMMUNITY VOTES (community-service.ts)
-- Handles votes on both posts and replies, plus article likes.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.community_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id     UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id    UUID REFERENCES public.community_replies(id) ON DELETE CASCADE,
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('up','down')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  -- A user can only vote once per post or reply
  UNIQUE(user_id, post_id, reply_id)
);

CREATE INDEX IF NOT EXISTS idx_community_votes_user ON public.community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_post ON public.community_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_reply ON public.community_votes(reply_id);

ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_votes" ON public.community_votes;
CREATE POLICY "authenticated_read_votes" ON public.community_votes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "users_manage_own_votes" ON public.community_votes;
CREATE POLICY "users_manage_own_votes" ON public.community_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_votes" ON public.community_votes;
CREATE POLICY "users_update_own_votes" ON public.community_votes
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_votes" ON public.community_votes;
CREATE POLICY "users_delete_own_votes" ON public.community_votes
  FOR DELETE USING (user_id = auth.uid());


-- =============================================================================
-- 18. HEALTH ARTICLES (community-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.health_articles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  summary               TEXT NOT NULL,
  content               TEXT NOT NULL,
  cover_image_url       TEXT,
  category              TEXT NOT NULL CHECK (category IN (
    'nutricion','ejercicio','salud_mental','prevencion','medicamentos',
    'enfermedades','embarazo','pediatria','dental','cardiologia','general'
  )),
  reading_time_minutes  INT NOT NULL DEFAULT 1,
  views                 INT NOT NULL DEFAULT 0,
  likes                 INT NOT NULL DEFAULT 0,
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  status                TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft','hidden')),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_articles_author ON public.health_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_health_articles_category ON public.health_articles(category, status);
CREATE INDEX IF NOT EXISTS idx_health_articles_featured ON public.health_articles(is_featured, status);
CREATE INDEX IF NOT EXISTS idx_health_articles_status_date ON public.health_articles(status, created_at DESC);

ALTER TABLE public.health_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_published_articles" ON public.health_articles;
CREATE POLICY "authenticated_read_published_articles" ON public.health_articles
  FOR SELECT TO authenticated USING (status = 'published' OR author_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_articles" ON public.health_articles;
CREATE POLICY "users_insert_own_articles" ON public.health_articles
  FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_articles" ON public.health_articles;
CREATE POLICY "users_update_own_articles" ON public.health_articles
  FOR UPDATE USING (author_id = auth.uid());

DROP TRIGGER IF EXISTS set_health_articles_updated_at ON public.health_articles;
CREATE TRIGGER set_health_articles_updated_at
  BEFORE UPDATE ON public.health_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 19. PATIENT REWARDS (rewards-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_rewards (
  patient_id        UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points      INT NOT NULL DEFAULT 0,
  level             INT NOT NULL DEFAULT 1,
  streak_days       INT NOT NULL DEFAULT 0,
  longest_streak    INT NOT NULL DEFAULT 0,
  last_activity_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_rewards" ON public.patient_rewards;
CREATE POLICY "patients_manage_own_rewards" ON public.patient_rewards
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_patient_rewards_updated_at ON public.patient_rewards;
CREATE TRIGGER set_patient_rewards_updated_at
  BEFORE UPDATE ON public.patient_rewards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 20. REWARD TRANSACTIONS (rewards-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points        INT NOT NULL,
  action_type   TEXT NOT NULL,
  description   TEXT NOT NULL,
  reference_id  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_patient ON public.reward_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_date ON public.reward_transactions(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_action ON public.reward_transactions(patient_id, action_type);

ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_transactions" ON public.reward_transactions;
CREATE POLICY "patients_manage_own_transactions" ON public.reward_transactions
  FOR ALL USING (patient_id = auth.uid());


-- =============================================================================
-- 21. REWARD BADGES (rewards-service.ts) — Catalog
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reward_badges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,
  description       TEXT NOT NULL,
  icon              TEXT NOT NULL DEFAULT 'award',
  points_required   INT NOT NULL DEFAULT 0,
  category          TEXT NOT NULL DEFAULT 'milestone' CHECK (category IN ('health','engagement','community','milestone')),
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reward_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_badges" ON public.reward_badges;
CREATE POLICY "authenticated_read_badges" ON public.reward_badges
  FOR SELECT TO authenticated USING (true);

-- Seed badges
INSERT INTO public.reward_badges (name, description, icon, points_required, category) VALUES
  ('Primera Cita',     'Completaste tu primera cita medica',               'calendar-check', 0,    'milestone'),
  ('Perfil Completo',  'Completaste toda la informacion de tu perfil',     'user-check',     0,    'milestone'),
  ('Familia Unida',    'Agregaste tu primer familiar',                     'users',          0,    'engagement'),
  ('Constante',        'Mantuviste una racha de 7 dias consecutivos',      'flame',          0,    'health'),
  ('Saludable',        'Mantuviste una racha de 30 dias consecutivos',     'heart-pulse',    0,    'health'),
  ('Preventivo',       'Realizaste un chequeo preventivo',                 'shield-check',   0,    'health'),
  ('Comunicador',      'Enviaste 5 mensajes a tus medicos',               'message-circle', 0,    'engagement'),
  ('Embajador',        'Referiste a 3 personas exitosamente',             'share-2',        0,    'community'),
  ('Nivel 5',          'Alcanzaste el nivel 5',                           'star',           1250, 'milestone'),
  ('Nivel 10',         'Alcanzaste el nivel 10',                          'crown',          5000, 'milestone')
ON CONFLICT (name) DO NOTHING;


-- =============================================================================
-- 22. PATIENT BADGES (rewards-service.ts) — Earned badges
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES public.reward_badges(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_badges_patient ON public.patient_badges(patient_id);

ALTER TABLE public.patient_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_badges" ON public.patient_badges;
CREATE POLICY "patients_manage_own_badges" ON public.patient_badges
  FOR ALL USING (patient_id = auth.uid());


-- =============================================================================
-- 22b. MEDICAL RECORDS (second-opinion-service.ts, post-consultation-service.ts)
-- Must exist BEFORE second_opinion_requests and post_consultation_actions.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.medical_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  specialty_id    UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  diagnosis       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON public.medical_records(doctor_id);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_records" ON public.medical_records;
CREATE POLICY "patients_read_own_records" ON public.medical_records
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_manage_records" ON public.medical_records;
CREATE POLICY "doctors_manage_records" ON public.medical_records
  FOR ALL USING (doctor_id = auth.uid());

DROP TRIGGER IF EXISTS set_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER set_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 23. SECOND OPINION REQUESTS (second-opinion-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.second_opinion_requests (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_doctor_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewing_doctor_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  original_diagnosis        TEXT NOT NULL,
  original_medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  specialty_id              UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  reason                    TEXT NOT NULL,
  patient_notes             TEXT,
  reviewer_opinion          TEXT,
  reviewer_diagnosis        TEXT,
  agrees_with_original      BOOLEAN,
  status                    TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','in_review','completed','declined')),
  consultation_type         TEXT NOT NULL DEFAULT 'remote'
    CHECK (consultation_type IN ('remote','in_person')),
  fee                       NUMERIC(12,2),
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_second_opinion_patient ON public.second_opinion_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_second_opinion_reviewer ON public.second_opinion_requests(reviewing_doctor_id);
CREATE INDEX IF NOT EXISTS idx_second_opinion_status ON public.second_opinion_requests(status);

ALTER TABLE public.second_opinion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_second_opinions" ON public.second_opinion_requests;
CREATE POLICY "patients_read_own_second_opinions" ON public.second_opinion_requests
  FOR SELECT USING (patient_id = auth.uid() OR reviewing_doctor_id = auth.uid() OR original_doctor_id = auth.uid());

DROP POLICY IF EXISTS "patients_insert_own_second_opinions" ON public.second_opinion_requests;
CREATE POLICY "patients_insert_own_second_opinions" ON public.second_opinion_requests
  FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_update_second_opinions" ON public.second_opinion_requests;
CREATE POLICY "doctors_update_second_opinions" ON public.second_opinion_requests
  FOR UPDATE USING (reviewing_doctor_id = auth.uid() OR patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_second_opinion_updated_at ON public.second_opinion_requests;
CREATE TRIGGER set_second_opinion_updated_at
  BEFORE UPDATE ON public.second_opinion_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime for second opinion status updates
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.second_opinion_requests; EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- 24. POST CONSULTATION ACTIONS (post-consultation-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.post_consultation_actions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id      UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  medical_record_id   UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  action_type         TEXT NOT NULL CHECK (action_type IN ('prescription','lab_order','referral','follow_up','care_instructions')),
  action_data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','viewed','in_progress','completed')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_consultation_patient ON public.post_consultation_actions(patient_id);
CREATE INDEX IF NOT EXISTS idx_post_consultation_appointment ON public.post_consultation_actions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_post_consultation_status ON public.post_consultation_actions(patient_id, status);

ALTER TABLE public.post_consultation_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_actions" ON public.post_consultation_actions;
CREATE POLICY "patients_read_own_actions" ON public.post_consultation_actions
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_update_own_actions" ON public.post_consultation_actions;
CREATE POLICY "patients_update_own_actions" ON public.post_consultation_actions
  FOR UPDATE USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_manage_actions" ON public.post_consultation_actions;
CREATE POLICY "doctors_manage_actions" ON public.post_consultation_actions
  FOR ALL USING (doctor_id = auth.uid());

DROP TRIGGER IF EXISTS set_post_consultation_updated_at ON public.post_consultation_actions;
CREATE TRIGGER set_post_consultation_updated_at
  BEFORE UPDATE ON public.post_consultation_actions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 25. PATIENT NOTIFICATIONS (notification-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('medication','appointment','lab_result','message','reward','insurance','emergency','community','system')),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  action_url  TEXT,
  action_label TEXT,
  action_data JSONB,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient ON public.patient_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_unread ON public.patient_notifications(patient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_type ON public.patient_notifications(patient_id, type);

ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_notifications" ON public.patient_notifications;
CREATE POLICY "patients_manage_own_notifications" ON public.patient_notifications
  FOR ALL USING (patient_id = auth.uid());

-- Enable realtime for new notifications
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_notifications; EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- 26. PUSH SUBSCRIPTIONS (notification-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT,
  auth        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_push" ON public.push_subscriptions;
CREATE POLICY "users_manage_own_push" ON public.push_subscriptions
  FOR ALL USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS set_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER set_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 27. PATIENT QR PREFERENCES (medical-id-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_qr_preferences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_qr_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_qr_prefs" ON public.patient_qr_preferences;
CREATE POLICY "patients_manage_own_qr_prefs" ON public.patient_qr_preferences
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_patient_qr_prefs_updated_at ON public.patient_qr_preferences;
CREATE TRIGGER set_patient_qr_prefs_updated_at
  BEFORE UPDATE ON public.patient_qr_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 28. REFERRALS (referral-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referred_name   TEXT,
  referred_email  TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','registered','expired')),
  points_earned   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  registered_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status, registered_at);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_referrals" ON public.referrals;
CREATE POLICY "users_read_own_referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_referrals" ON public.referrals;
CREATE POLICY "users_insert_referrals" ON public.referrals
  FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- Add referral_code column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
  END IF;
END $$;


-- =============================================================================
-- 29. USER ACTIVITY LOG (multiple services)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL,
  description     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'success',
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity_log(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON public.user_activity_log(user_id, created_at DESC);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_insert_own_activity" ON public.user_activity_log;
CREATE POLICY "users_insert_own_activity" ON public.user_activity_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_read_own_activity" ON public.user_activity_log;
CREATE POLICY "users_read_own_activity" ON public.user_activity_log
  FOR SELECT USING (user_id = auth.uid());


-- =============================================================================
-- 30. PRESCRIPTION FULFILLMENT OPTIONS (pharmacy-comparator-service.ts)
-- Pre-computed pharmacy pricing options for a prescription.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.prescription_fulfillment_options (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id   UUID NOT NULL,
  pharmacy_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pharmacy_name     TEXT NOT NULL,
  total_price_bs    NUMERIC(12,2) NOT NULL DEFAULT 0,
  items_available   INT NOT NULL DEFAULT 0,
  items_total       INT NOT NULL DEFAULT 0,
  all_available     BOOLEAN NOT NULL DEFAULT false,
  offers_delivery   BOOLEAN NOT NULL DEFAULT false,
  delivery_fee      NUMERIC(12,2),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fulfillment_prescription ON public.prescription_fulfillment_options(prescription_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_pharmacy ON public.prescription_fulfillment_options(pharmacy_id);

ALTER TABLE public.prescription_fulfillment_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_fulfillment" ON public.prescription_fulfillment_options;
CREATE POLICY "authenticated_read_fulfillment" ON public.prescription_fulfillment_options
  FOR SELECT TO authenticated USING (true);

DROP TRIGGER IF EXISTS set_fulfillment_updated_at ON public.prescription_fulfillment_options;
CREATE TRIGGER set_fulfillment_updated_at
  BEFORE UPDATE ON public.prescription_fulfillment_options
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 31. PHARMACY INVENTORY (pharmacy-comparator-service.ts)
-- Per-pharmacy medication stock and pricing for price comparison.
-- NOTE: This is separate from the pharmacy domain's internal inventory.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_name   TEXT NOT NULL,
  generic_name      TEXT,
  price_bs          NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_usd         NUMERIC(12,2),
  stock_quantity    INT NOT NULL DEFAULT 0,
  in_stock          BOOLEAN NOT NULL DEFAULT true,
  offers_delivery   BOOLEAN NOT NULL DEFAULT false,
  delivery_fee      NUMERIC(12,2),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_pharmacy ON public.pharmacy_inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_medication ON public.pharmacy_inventory(medication_name);

ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_pharmacy_inv" ON public.pharmacy_inventory;
CREATE POLICY "authenticated_read_pharmacy_inv" ON public.pharmacy_inventory
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pharmacies_manage_own_inv" ON public.pharmacy_inventory;
CREATE POLICY "pharmacies_manage_own_inv" ON public.pharmacy_inventory
  FOR ALL USING (pharmacy_id = auth.uid());

DROP TRIGGER IF EXISTS set_pharmacy_inventory_updated_at ON public.pharmacy_inventory;
CREATE TRIGGER set_pharmacy_inventory_updated_at
  BEFORE UPDATE ON public.pharmacy_inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 32. PHARMACY ORDERS (pharmacy-comparator-service.ts)
-- Patient-facing pharmacy orders (medication delivery/pickup).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pharmacy_orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pharmacy_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prescription_id     UUID,
  items               JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_bs            NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_type       TEXT NOT NULL CHECK (delivery_type IN ('delivery','pickup')),
  delivery_address    TEXT,
  payment_method      TEXT NOT NULL CHECK (payment_method IN ('pago_movil','zelle','transferencia','efectivo')),
  payment_reference   TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_patient ON public.pharmacy_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_pharmacy ON public.pharmacy_orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_status ON public.pharmacy_orders(status);

ALTER TABLE public.pharmacy_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_orders" ON public.pharmacy_orders;
CREATE POLICY "patients_read_own_orders" ON public.pharmacy_orders
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_insert_orders" ON public.pharmacy_orders;
CREATE POLICY "patients_insert_orders" ON public.pharmacy_orders
  FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "pharmacies_manage_their_orders" ON public.pharmacy_orders;
CREATE POLICY "pharmacies_manage_their_orders" ON public.pharmacy_orders
  FOR ALL USING (pharmacy_id = auth.uid());

DROP TRIGGER IF EXISTS set_pharmacy_orders_updated_at ON public.pharmacy_orders;
CREATE TRIGGER set_pharmacy_orders_updated_at
  BEFORE UPDATE ON public.pharmacy_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime for order status updates
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.pharmacy_orders; EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- 33. PROVIDER REVIEWS (directory-service.ts)
-- Unified reviews for doctors, pharmacies, clinics, and labs.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.provider_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_type   TEXT NOT NULL CHECK (provider_type IN ('doctor','pharmacy','clinic','laboratory')),
  rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title           TEXT,
  comment         TEXT,
  would_recommend BOOLEAN NOT NULL DEFAULT true,
  visit_date      DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  -- One review per user per provider
  UNIQUE(reviewer_id, provider_id, provider_type)
);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider ON public.provider_reviews(provider_id, provider_type);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_reviewer ON public.provider_reviews(reviewer_id);

ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_reviews" ON public.provider_reviews;
CREATE POLICY "authenticated_read_reviews" ON public.provider_reviews
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_provider_reviews" ON public.provider_reviews;
CREATE POLICY "anon_read_provider_reviews" ON public.provider_reviews
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "users_insert_reviews" ON public.provider_reviews;
CREATE POLICY "users_insert_reviews" ON public.provider_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());


-- =============================================================================
-- 34. DIRECTORY DETAIL TABLES (directory-service.ts)
-- Extended details for pharmacies, clinics, and labs in the directory.
-- These use profile_id FK to link to the profiles table.
-- NOTE: pharmacy_details already exists (from pharmacy domain) with different
-- structure (rif-based). We create a directory-facing view pattern instead
-- by adding missing columns if the table exists.
-- =============================================================================

-- 34a. PHARMACY DETAILS for directory — add profile_id and directory columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'pharmacy_details'
  ) THEN
    -- Add profile_id if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pharmacy_details' AND column_name = 'profile_id'
    ) THEN
      ALTER TABLE public.pharmacy_details ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    -- Add pharmacy_license if not exists (alias for sanitary_license_number)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pharmacy_details' AND column_name = 'pharmacy_license'
    ) THEN
      ALTER TABLE public.pharmacy_details ADD COLUMN pharmacy_license TEXT;
    END IF;
    -- Add pharmacy_type if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pharmacy_details' AND column_name = 'pharmacy_type'
    ) THEN
      ALTER TABLE public.pharmacy_details ADD COLUMN pharmacy_type TEXT;
    END IF;
    -- Add office_hours if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pharmacy_details' AND column_name = 'office_hours'
    ) THEN
      ALTER TABLE public.pharmacy_details ADD COLUMN office_hours TEXT;
    END IF;
    -- Add accepts_digital_prescriptions if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pharmacy_details' AND column_name = 'accepts_digital_prescriptions'
    ) THEN
      ALTER TABLE public.pharmacy_details ADD COLUMN accepts_digital_prescriptions BOOLEAN DEFAULT false;
    END IF;
  END IF;
END $$;


-- 34b. CLINIC DETAILS
CREATE TABLE IF NOT EXISTS public.clinic_details (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name     TEXT NOT NULL,
  clinic_license    TEXT,
  clinic_type       TEXT,
  office_hours      TEXT,
  bed_count         INT,
  specialties       JSONB DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinic_details_profile ON public.clinic_details(profile_id);

ALTER TABLE public.clinic_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_clinics" ON public.clinic_details;
CREATE POLICY "authenticated_read_clinics" ON public.clinic_details
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_clinics" ON public.clinic_details;
CREATE POLICY "anon_read_clinics" ON public.clinic_details
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "clinics_manage_own" ON public.clinic_details;
CREATE POLICY "clinics_manage_own" ON public.clinic_details
  FOR ALL USING (profile_id = auth.uid());

DROP TRIGGER IF EXISTS set_clinic_details_updated_at ON public.clinic_details;
CREATE TRIGGER set_clinic_details_updated_at
  BEFORE UPDATE ON public.clinic_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- 34c. LABORATORY DETAILS
CREATE TABLE IF NOT EXISTS public.laboratory_details (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id                UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name             TEXT NOT NULL,
  laboratory_license        TEXT,
  laboratory_type           TEXT,
  office_hours              TEXT,
  avg_delivery_time_hours   INT,
  accepts_digital_orders    BOOLEAN DEFAULT false,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_laboratory_details_profile ON public.laboratory_details(profile_id);

ALTER TABLE public.laboratory_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_labs" ON public.laboratory_details;
CREATE POLICY "authenticated_read_labs" ON public.laboratory_details
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_labs" ON public.laboratory_details;
CREATE POLICY "anon_read_labs" ON public.laboratory_details
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "labs_manage_own" ON public.laboratory_details;
CREATE POLICY "labs_manage_own" ON public.laboratory_details
  FOR ALL USING (profile_id = auth.uid());

DROP TRIGGER IF EXISTS set_laboratory_details_updated_at ON public.laboratory_details;
CREATE TRIGGER set_laboratory_details_updated_at
  BEFORE UPDATE ON public.laboratory_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 35. DOCTOR OFFICES (directory-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.doctor_offices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT,
  state       TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctor_offices_doctor ON public.doctor_offices(doctor_id);

ALTER TABLE public.doctor_offices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_offices" ON public.doctor_offices;
CREATE POLICY "authenticated_read_offices" ON public.doctor_offices
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "doctors_manage_own_offices" ON public.doctor_offices;
CREATE POLICY "doctors_manage_own_offices" ON public.doctor_offices
  FOR ALL USING (doctor_id = auth.uid());


-- =============================================================================
-- 36. TELEMEDICINE SESSIONS (telemedicine-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.telemedicine_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','waiting','in_progress','completed','cancelled','no_show')),
  scheduled_at      TIMESTAMPTZ NOT NULL,
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  duration_minutes  INT,
  meeting_url       TEXT,
  recording_url     TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemedicine_patient ON public.telemedicine_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_doctor ON public.telemedicine_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_status ON public.telemedicine_sessions(status, scheduled_at);

ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_read_sessions" ON public.telemedicine_sessions;
CREATE POLICY "participants_read_sessions" ON public.telemedicine_sessions
  FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());

DROP POLICY IF EXISTS "participants_update_sessions" ON public.telemedicine_sessions;
CREATE POLICY "participants_update_sessions" ON public.telemedicine_sessions
  FOR UPDATE USING (patient_id = auth.uid() OR doctor_id = auth.uid());

DROP POLICY IF EXISTS "doctors_insert_sessions" ON public.telemedicine_sessions;
CREATE POLICY "doctors_insert_sessions" ON public.telemedicine_sessions
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

DROP TRIGGER IF EXISTS set_telemedicine_sessions_updated_at ON public.telemedicine_sessions;
CREATE TRIGGER set_telemedicine_sessions_updated_at
  BEFORE UPDATE ON public.telemedicine_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime for session status
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.telemedicine_sessions; EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- 37. TELEMEDICINE CHAT MESSAGES (telemedicine-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.telemedicine_chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.telemedicine_sessions(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemedicine_chat_session ON public.telemedicine_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_chat_sender ON public.telemedicine_chat_messages(sender_id);

ALTER TABLE public.telemedicine_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_participants_read_chat" ON public.telemedicine_chat_messages;
CREATE POLICY "session_participants_read_chat" ON public.telemedicine_chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.telemedicine_sessions
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "session_participants_insert_chat" ON public.telemedicine_chat_messages;
CREATE POLICY "session_participants_insert_chat" ON public.telemedicine_chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Enable realtime for chat
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.telemedicine_chat_messages; EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- 38. TELEMEDICINE SESSION RATINGS (telemedicine-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.telemedicine_session_ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.telemedicine_sessions(id) ON DELETE CASCADE,
  patient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_telemedicine_ratings_session ON public.telemedicine_session_ratings(session_id);

ALTER TABLE public.telemedicine_session_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_ratings" ON public.telemedicine_session_ratings;
CREATE POLICY "patients_manage_own_ratings" ON public.telemedicine_session_ratings
  FOR ALL USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_read_ratings" ON public.telemedicine_session_ratings;
CREATE POLICY "doctors_read_ratings" ON public.telemedicine_session_ratings
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.telemedicine_sessions WHERE doctor_id = auth.uid()
    )
  );


-- =============================================================================
-- 39. DOCTOR AVAILABILITY (booking-service.ts)
-- Doctor's weekly schedule template (which days/hours they work).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dia_semana  INT NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),  -- 0=Sunday
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor ON public.doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_active ON public.doctor_availability(doctor_id, activo);

ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

-- Patients can read availability for booking
DROP POLICY IF EXISTS "authenticated_read_availability" ON public.doctor_availability;
CREATE POLICY "authenticated_read_availability" ON public.doctor_availability
  FOR SELECT TO authenticated USING (true);

-- Doctors manage their own availability
DROP POLICY IF EXISTS "doctors_manage_own_availability" ON public.doctor_availability;
CREATE POLICY "doctors_manage_own_availability" ON public.doctor_availability
  FOR ALL USING (doctor_id = auth.uid());

DROP TRIGGER IF EXISTS set_doctor_availability_updated_at ON public.doctor_availability;
CREATE TRIGGER set_doctor_availability_updated_at
  BEFORE UPDATE ON public.doctor_availability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 40. LAB TABLES (lab-results-service.ts)
-- Lab orders, test types, results, and result values for patient view.
-- =============================================================================

-- 40a. LAB TEST TYPES (catalog)
CREATE TABLE IF NOT EXISTS public.lab_test_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  reference_price NUMERIC(12,2),
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_test_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_test_types" ON public.lab_test_types;
CREATE POLICY "authenticated_read_test_types" ON public.lab_test_types
  FOR SELECT TO authenticated USING (true);


-- 40b. LAB ORDERS
CREATE TABLE IF NOT EXISTS public.lab_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  laboratory_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_number    TEXT NOT NULL,
  ordered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          TEXT NOT NULL DEFAULT 'ordenada'
    CHECK (status IN ('ordenada','muestra_tomada','en_proceso','completada','cancelada')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON public.lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_doctor ON public.lab_orders(doctor_id);

ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_orders" ON public.lab_orders;
CREATE POLICY "patients_read_own_orders" ON public.lab_orders
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_read_their_orders" ON public.lab_orders;
CREATE POLICY "doctors_read_their_orders" ON public.lab_orders
  FOR SELECT USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "labs_manage_their_orders" ON public.lab_orders;
CREATE POLICY "labs_manage_their_orders" ON public.lab_orders
  FOR ALL USING (laboratory_id = auth.uid());

DROP TRIGGER IF EXISTS set_lab_orders_updated_at ON public.lab_orders;
CREATE TRIGGER set_lab_orders_updated_at
  BEFORE UPDATE ON public.lab_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- 40c. LAB ORDER TESTS (which tests are part of an order)
CREATE TABLE IF NOT EXISTS public.lab_order_tests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  test_type_id      UUID NOT NULL REFERENCES public.lab_test_types(id) ON DELETE CASCADE,
  result_available  BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_order_tests_order ON public.lab_order_tests(order_id);

ALTER TABLE public.lab_order_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_participants_read_tests" ON public.lab_order_tests;
CREATE POLICY "order_participants_read_tests" ON public.lab_order_tests
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.lab_orders
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid() OR laboratory_id = auth.uid()
    )
  );


-- 40d. LAB RESULTS
CREATE TABLE IF NOT EXISTS public.lab_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  test_type_id          UUID NOT NULL REFERENCES public.lab_test_types(id) ON DELETE CASCADE,
  result_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated_at          TIMESTAMPTZ,
  general_observations  TEXT,
  result_pdf_url        TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_results_order ON public.lab_results(order_id);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_participants_read_results" ON public.lab_results;
CREATE POLICY "order_participants_read_results" ON public.lab_results
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.lab_orders
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid() OR laboratory_id = auth.uid()
    )
  );


-- 40e. LAB RESULT VALUES
CREATE TABLE IF NOT EXISTS public.lab_result_values (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id       UUID NOT NULL REFERENCES public.lab_results(id) ON DELETE CASCADE,
  parameter_name  TEXT NOT NULL,
  value           NUMERIC NOT NULL,
  unit            TEXT NOT NULL,
  reference_min   NUMERIC NOT NULL,
  reference_max   NUMERIC NOT NULL,
  status          TEXT NOT NULL DEFAULT 'normal'
    CHECK (status IN ('normal','alto','bajo','critico')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_result_values_result ON public.lab_result_values(result_id);
CREATE INDEX IF NOT EXISTS idx_lab_result_values_param ON public.lab_result_values(parameter_name);

ALTER TABLE public.lab_result_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "result_readers_read_values" ON public.lab_result_values;
CREATE POLICY "result_readers_read_values" ON public.lab_result_values
  FOR SELECT USING (
    result_id IN (
      SELECT lr.id FROM public.lab_results lr
      JOIN public.lab_orders lo ON lr.order_id = lo.id
      WHERE lo.patient_id = auth.uid() OR lo.doctor_id = auth.uid() OR lo.laboratory_id = auth.uid()
    )
  );


-- =============================================================================
-- 41. BLOG POSTS (feature-flags-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE,
  content       TEXT NOT NULL,
  excerpt       TEXT,
  cover_image   TEXT,
  author_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published     BOOLEAN NOT NULL DEFAULT false,
  published_at  TIMESTAMPTZ,
  tags          JSONB DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_published_blog" ON public.blog_posts;
CREATE POLICY "anon_read_published_blog" ON public.blog_posts
  FOR SELECT TO anon USING (published = true);

DROP POLICY IF EXISTS "authenticated_read_published_blog" ON public.blog_posts;
CREATE POLICY "authenticated_read_published_blog" ON public.blog_posts
  FOR SELECT TO authenticated USING (published = true OR author_id = auth.uid());

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 42. TESTIMONIALS (feature-flags-service.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  patient_name  TEXT NOT NULL,
  content       TEXT NOT NULL,
  rating        INT CHECK (rating >= 1 AND rating <= 5),
  approved      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_approved_testimonials" ON public.testimonials;
CREATE POLICY "anon_read_approved_testimonials" ON public.testimonials
  FOR SELECT TO anon USING (approved = true);

DROP POLICY IF EXISTS "authenticated_read_approved_testimonials" ON public.testimonials;
CREATE POLICY "authenticated_read_approved_testimonials" ON public.testimonials
  FOR SELECT TO authenticated USING (approved = true OR patient_id = auth.uid());


-- =============================================================================
-- DONE
-- =============================================================================

-- Summary of tables created/modified:
-- patient_details, patient_documents, shared_documents, vaccination_records,
-- patient_insurance, insurance_preauthorizations, insurance_claims,
-- family_members, emergency_requests, medication_reminders, medication_intake_log,
-- health_metric_types, health_metrics, health_goals, community_posts,
-- community_replies, community_votes, health_articles, patient_rewards,
-- reward_transactions, reward_badges, patient_badges, second_opinion_requests,
-- post_consultation_actions, patient_notifications, push_subscriptions,
-- patient_qr_preferences, referrals, user_activity_log,
-- prescription_fulfillment_options, pharmacy_inventory, pharmacy_orders,
-- provider_reviews, clinic_details, laboratory_details, doctor_offices,
-- telemedicine_sessions, telemedicine_chat_messages, telemedicine_session_ratings,
-- doctor_availability, lab_test_types, lab_orders, lab_order_tests,
-- lab_results, lab_result_values, blog_posts, testimonials, medical_records
-- + specialties alias/creation
-- + pharmacy_details column additions (profile_id, pharmacy_license, etc.)
-- + profiles.referral_code column
