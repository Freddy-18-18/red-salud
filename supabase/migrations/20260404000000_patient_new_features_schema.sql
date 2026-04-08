-- =============================================================================
-- Migration: Patient New Features Schema
-- Date: 2026-04-04
-- Description: Creates tables for new patient app features including:
--   appointment ratings, follow-ups, pharmacy price alerts, emergency profiles,
--   chronic condition tracking (conditions, readings, goals), patient notifications
--   and preferences, medical referrals, and medical expenses.
--
-- All operations are idempotent (CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS).
-- Uses UUID primary keys, created_at/updated_at timestamps, and RLS policies.
-- =============================================================================


-- =============================================================================
-- 1. APPOINTMENT RATINGS
-- One rating per appointment. Patients rate their experience with a doctor.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.appointment_ratings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment           TEXT,
  would_recommend   BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_ratings_patient ON public.appointment_ratings(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_ratings_doctor ON public.appointment_ratings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_ratings_doctor_rating ON public.appointment_ratings(doctor_id, rating);

ALTER TABLE public.appointment_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_insert_own_ratings" ON public.appointment_ratings;
CREATE POLICY "patients_insert_own_ratings" ON public.appointment_ratings
  FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_read_own_ratings" ON public.appointment_ratings;
CREATE POLICY "patients_read_own_ratings" ON public.appointment_ratings
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_read_their_ratings" ON public.appointment_ratings;
CREATE POLICY "doctors_read_their_ratings" ON public.appointment_ratings
  FOR SELECT USING (doctor_id = auth.uid());


-- =============================================================================
-- 2. APPOINTMENT FOLLOW-UPS
-- Post-consultation tasks: lab exams, prescriptions, next appointments, custom.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.appointment_follow_ups (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('lab_exam', 'prescription', 'next_appointment', 'custom')),
  description       TEXT NOT NULL,
  due_date          DATE,
  completed         BOOLEAN DEFAULT false,
  completed_at      TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_follow_ups_patient ON public.appointment_follow_ups(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_follow_ups_appointment ON public.appointment_follow_ups(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_follow_ups_pending ON public.appointment_follow_ups(patient_id, completed, due_date);

ALTER TABLE public.appointment_follow_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_follow_ups" ON public.appointment_follow_ups;
CREATE POLICY "patients_read_own_follow_ups" ON public.appointment_follow_ups
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_update_own_follow_ups" ON public.appointment_follow_ups;
CREATE POLICY "patients_update_own_follow_ups" ON public.appointment_follow_ups
  FOR UPDATE USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_appointment_follow_ups_updated_at ON public.appointment_follow_ups;
CREATE TRIGGER set_appointment_follow_ups_updated_at
  BEFORE UPDATE ON public.appointment_follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 3. PHARMACY PRICE ALERTS
-- Patient sets a target price for a medication and gets notified when matched.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pharmacy_price_alerts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_name   TEXT NOT NULL,
  target_price_usd  NUMERIC(10,2) NOT NULL,
  prescription_id   UUID,
  active            BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id, medication_name, active)
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_price_alerts_patient ON public.pharmacy_price_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_price_alerts_active ON public.pharmacy_price_alerts(patient_id, active);

ALTER TABLE public.pharmacy_price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_price_alerts" ON public.pharmacy_price_alerts;
CREATE POLICY "patients_manage_own_price_alerts" ON public.pharmacy_price_alerts
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_pharmacy_price_alerts_updated_at ON public.pharmacy_price_alerts;
CREATE TRIGGER set_pharmacy_price_alerts_updated_at
  BEFORE UPDATE ON public.pharmacy_price_alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 4. EMERGENCY PROFILES
-- QR-based emergency medical profile. Public access via access_token when active.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.emergency_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_token            UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  is_active               BOOLEAN DEFAULT false,
  pin_code                TEXT,
  share_blood_type        BOOLEAN DEFAULT true,
  share_allergies         BOOLEAN DEFAULT true,
  share_medications       BOOLEAN DEFAULT true,
  share_conditions        BOOLEAN DEFAULT true,
  share_emergency_contacts BOOLEAN DEFAULT true,
  share_insurance         BOOLEAN DEFAULT false,
  view_count              INTEGER DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.emergency_profiles ENABLE ROW LEVEL SECURITY;

-- Patient can fully manage their own emergency profile
DROP POLICY IF EXISTS "patients_manage_own_emergency_profile" ON public.emergency_profiles;
CREATE POLICY "patients_manage_own_emergency_profile" ON public.emergency_profiles
  FOR ALL USING (patient_id = auth.uid());

-- Public access via access_token for the QR page (no auth required)
DROP POLICY IF EXISTS "public_read_active_emergency_profiles" ON public.emergency_profiles;
CREATE POLICY "public_read_active_emergency_profiles" ON public.emergency_profiles
  FOR SELECT USING (is_active = true);

DROP TRIGGER IF EXISTS set_emergency_profiles_updated_at ON public.emergency_profiles;
CREATE TRIGGER set_emergency_profiles_updated_at
  BEFORE UPDATE ON public.emergency_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 5. PATIENT CHRONIC CONDITIONS
-- Tracks diagnosed chronic conditions per patient.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_chronic_conditions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  condition_type      TEXT NOT NULL CHECK (condition_type IN (
    'diabetes_1', 'diabetes_2', 'hipertension', 'asma', 'hipotiroidismo',
    'hipertiroidismo', 'epoc', 'artritis', 'epilepsia', 'insuficiencia_renal', 'otro'
  )),
  custom_label        TEXT,
  diagnosed_date      DATE,
  severity            TEXT CHECK (severity IN ('leve', 'moderado', 'severo')),
  treating_doctor_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes               TEXT,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_chronic_conditions_patient ON public.patient_chronic_conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_chronic_conditions_active ON public.patient_chronic_conditions(patient_id, is_active);

ALTER TABLE public.patient_chronic_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_chronic_conditions" ON public.patient_chronic_conditions;
CREATE POLICY "patients_manage_own_chronic_conditions" ON public.patient_chronic_conditions
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_patient_chronic_conditions_updated_at ON public.patient_chronic_conditions;
CREATE TRIGGER set_patient_chronic_conditions_updated_at
  BEFORE UPDATE ON public.patient_chronic_conditions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 6. CHRONIC READINGS
-- Individual measurements linked to a chronic condition (glucose, BP, etc.).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chronic_readings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  condition_id    UUID NOT NULL REFERENCES public.patient_chronic_conditions(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN (
    'glucose', 'blood_pressure', 'peak_flow', 'weight',
    'heart_rate', 'temperature', 'oxygen_saturation'
  )),
  value           NUMERIC(10,2) NOT NULL,
  value2          NUMERIC(10,2),
  unit            TEXT NOT NULL,
  context         TEXT CHECK (context IN ('ayunas', 'postprandial', 'random', 'reposo', 'ejercicio')),
  notes           TEXT,
  measured_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chronic_readings_patient_condition ON public.chronic_readings(patient_id, condition_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_chronic_readings_patient ON public.chronic_readings(patient_id);
CREATE INDEX IF NOT EXISTS idx_chronic_readings_type ON public.chronic_readings(patient_id, type, measured_at DESC);

ALTER TABLE public.chronic_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_insert_own_readings" ON public.chronic_readings;
CREATE POLICY "patients_insert_own_readings" ON public.chronic_readings
  FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_read_own_readings" ON public.chronic_readings;
CREATE POLICY "patients_read_own_readings" ON public.chronic_readings
  FOR SELECT USING (patient_id = auth.uid());


-- =============================================================================
-- 7. CHRONIC GOALS
-- Target goals linked to a chronic condition (e.g., HbA1c < 7%).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chronic_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  condition_id    UUID NOT NULL REFERENCES public.patient_chronic_conditions(id) ON DELETE CASCADE,
  metric_type     TEXT NOT NULL,
  target_value    NUMERIC(10,2) NOT NULL,
  current_value   NUMERIC(10,2) DEFAULT 0,
  target_date     DATE,
  description     TEXT NOT NULL,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chronic_goals_patient ON public.chronic_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_chronic_goals_condition ON public.chronic_goals(condition_id);
CREATE INDEX IF NOT EXISTS idx_chronic_goals_active ON public.chronic_goals(patient_id, status);

ALTER TABLE public.chronic_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_chronic_goals" ON public.chronic_goals;
CREATE POLICY "patients_manage_own_chronic_goals" ON public.chronic_goals
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_chronic_goals_updated_at ON public.chronic_goals;
CREATE TRIGGER set_chronic_goals_updated_at
  BEFORE UPDATE ON public.chronic_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 8. PATIENT NOTIFICATIONS
-- In-app notifications for appointments, lab results, messages, etc.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}'::jsonb,
  read            BOOLEAN DEFAULT false,
  dismissed       BOOLEAN DEFAULT false,
  action_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_notifications_unread ON public.patient_notifications(patient_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_notifications_patient ON public.patient_notifications(patient_id, created_at DESC);

ALTER TABLE public.patient_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_notifications" ON public.patient_notifications;
CREATE POLICY "patients_read_own_notifications" ON public.patient_notifications
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "patients_update_own_notifications" ON public.patient_notifications;
CREATE POLICY "patients_update_own_notifications" ON public.patient_notifications
  FOR UPDATE USING (patient_id = auth.uid());


-- =============================================================================
-- 9. PATIENT NOTIFICATION PREFERENCES
-- Per-patient notification settings (email, push, per-category toggles).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patient_notification_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_enabled   BOOLEAN DEFAULT true,
  push_enabled    BOOLEAN DEFAULT true,
  categories      JSONB DEFAULT '{"appointments":true,"lab_results":true,"prescriptions":true,"messages":true,"chronic_alerts":true,"price_alerts":true,"follow_ups":true,"referrals":true,"rewards":true}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_notification_prefs" ON public.patient_notification_preferences;
CREATE POLICY "patients_manage_own_notification_prefs" ON public.patient_notification_preferences
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_patient_notification_preferences_updated_at ON public.patient_notification_preferences;
CREATE TRIGGER set_patient_notification_preferences_updated_at
  BEFORE UPDATE ON public.patient_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 10. MEDICAL REFERRALS
-- Doctor-to-specialist referrals visible to the patient.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.medical_referrals (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referring_doctor_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialist_doctor_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_specialty_id       UUID,
  status                    TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'expired')),
  urgency                   TEXT DEFAULT 'electivo' CHECK (urgency IN ('urgente', 'prioritario', 'electivo')),
  reason                    TEXT NOT NULL,
  diagnosis                 TEXT,
  clinical_notes            TEXT,
  attached_documents        JSONB DEFAULT '[]'::jsonb,
  expires_at                DATE,
  scheduled_appointment_id  UUID,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_referrals_patient ON public.medical_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_referrals_referring ON public.medical_referrals(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_referrals_specialist ON public.medical_referrals(specialist_doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_referrals_status ON public.medical_referrals(patient_id, status);

ALTER TABLE public.medical_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_read_own_referrals" ON public.medical_referrals;
CREATE POLICY "patients_read_own_referrals" ON public.medical_referrals
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "referring_doctors_read_referrals" ON public.medical_referrals;
CREATE POLICY "referring_doctors_read_referrals" ON public.medical_referrals
  FOR SELECT USING (referring_doctor_id = auth.uid());

DROP POLICY IF EXISTS "specialist_doctors_read_referrals" ON public.medical_referrals;
CREATE POLICY "specialist_doctors_read_referrals" ON public.medical_referrals
  FOR SELECT USING (specialist_doctor_id = auth.uid());

DROP TRIGGER IF EXISTS set_medical_referrals_updated_at ON public.medical_referrals;
CREATE TRIGGER set_medical_referrals_updated_at
  BEFORE UPDATE ON public.medical_referrals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 11. MEDICAL EXPENSES
-- Patient expense tracking with USD/Bs dual currency support.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.medical_expenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category          TEXT NOT NULL CHECK (category IN (
    'consulta', 'examen_lab', 'medicamento', 'cirugia',
    'hospitalizacion', 'seguro_prima', 'seguro_copago', 'otro'
  )),
  description       TEXT NOT NULL,
  amount_usd        NUMERIC(12,2) NOT NULL,
  amount_bs         NUMERIC(16,2),
  bcv_rate          NUMERIC(10,4),
  date              DATE NOT NULL,
  provider_name     TEXT,
  appointment_id    UUID,
  prescription_id   UUID,
  lab_order_id      UUID,
  receipt_url       TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_expenses_patient_date ON public.medical_expenses(patient_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_expenses_patient_category ON public.medical_expenses(patient_id, category);
CREATE INDEX IF NOT EXISTS idx_medical_expenses_patient ON public.medical_expenses(patient_id);

ALTER TABLE public.medical_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_manage_own_expenses" ON public.medical_expenses;
CREATE POLICY "patients_manage_own_expenses" ON public.medical_expenses
  FOR ALL USING (patient_id = auth.uid());

DROP TRIGGER IF EXISTS set_medical_expenses_updated_at ON public.medical_expenses;
CREATE TRIGGER set_medical_expenses_updated_at
  BEFORE UPDATE ON public.medical_expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
