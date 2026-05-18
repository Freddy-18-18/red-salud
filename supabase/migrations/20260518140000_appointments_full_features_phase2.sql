-- =============================================================================
-- Migration: appointments full features (Phase 2)
-- Date: 2026-05-18
-- Description: Adds dedicated columns to appointments + supporting tables for
--   notifications queue, insurance, attachments. Replaces internal_notes
--   prefix encoding with proper columns. Sets up Storage bucket for files.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. APPOINTMENTS columns
-- -----------------------------------------------------------------------------

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS notification_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_channel text
    CHECK (notification_channel IS NULL OR notification_channel IN ('whatsapp','sms','email')),
  ADD COLUMN IF NOT EXISTS notification_advance text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS notification_status text DEFAULT 'pending'
    CHECK (notification_status IN ('pending','scheduled','sent','failed','cancelled')),
  ADD COLUMN IF NOT EXISTS preparation_items text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS companion_name text,
  ADD COLUMN IF NOT EXISTS companion_relationship text,
  ADD COLUMN IF NOT EXISTS companion_phone text,
  ADD COLUMN IF NOT EXISTS attachments_count integer DEFAULT 0
    CHECK (attachments_count >= 0 AND attachments_count <= 5);

-- -----------------------------------------------------------------------------
-- 2. INSURANCE_PROVIDERS catalog + seed
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.insurance_providers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL UNIQUE,
  slug            text UNIQUE,
  website         text,
  logo_url        text,
  hcm_supported   boolean DEFAULT true,
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insurance_providers_active_name
  ON public.insurance_providers(active, name);

ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read insurance providers" ON public.insurance_providers;
CREATE POLICY "Authenticated can read insurance providers"
  ON public.insurance_providers
  FOR SELECT
  TO authenticated
  USING (active = true);

INSERT INTO public.insurance_providers (name, slug, website, hcm_supported) VALUES
  ('Mercantil Seguros', 'mercantil-seguros', 'https://www.mercantilseguros.com', true),
  ('Seguros Caracas (Liberty Mutual)', 'seguros-caracas', 'https://www.seguroscaracas.com', true),
  ('Mapfre La Seguridad', 'mapfre-la-seguridad', 'https://www.mapfre.com.ve', true),
  ('Banesco Seguros', 'banesco-seguros', 'https://www.banescoseguros.com.ve', true),
  ('Multinacional de Seguros', 'multinacional-seguros', 'https://www.multinacionaldeseguros.com', true),
  ('Seguros Universitas', 'seguros-universitas', 'https://www.universitasdeseguros.com.ve', true),
  ('La Internacional de Seguros', 'la-internacional', 'https://www.lainternacional.com.ve', true),
  ('Oceánica de Seguros', 'oceanica-seguros', 'https://www.oceanicaseguros.com', true),
  ('Seguros La Previsora', 'seguros-la-previsora', 'https://www.laprevisora.com.ve', true),
  ('Seguros Catatumbo', 'seguros-catatumbo', 'https://www.catatumbo.com', true),
  ('Seguros Constitución', 'seguros-constitucion', 'https://www.segurosconstitucion.com.ve', true),
  ('Seguros Pirámide', 'seguros-piramide', 'https://www.segurospiramide.com', true),
  ('Hispana de Seguros', 'hispana-seguros', 'https://www.hispanadeseguros.com.ve', true),
  ('Seguros Horizonte', 'seguros-horizonte', null, true),
  ('Aseguradora Nacional', 'aseguradora-nacional', null, true),
  ('La Vitalicia Seguros', 'la-vitalicia', null, true),
  ('Seguros Banvalor', 'seguros-banvalor', 'https://www.banvalor.com.ve', true),
  ('Federal de Seguros', 'federal-seguros', null, true),
  ('Adriática de Seguros', 'adriatica-seguros', null, true),
  ('Confianza C.A. de Seguros', 'confianza-seguros', null, true),
  ('Premier Compañía Anónima de Seguros', 'premier-seguros', null, true),
  ('Provincial Internacional de Seguros', 'provincial-internacional', null, true),
  ('Bolívar Compañía Anónima de Seguros', 'bolivar-seguros', null, true),
  ('Sudamericana de Seguros', 'sudamericana-seguros', null, true),
  ('Cobertura Total', 'cobertura-total', null, true),
  ('CONPRESALUD (Inversiones Salud)', 'conpresalud', null, true),
  ('Servicios Médicos Inversora (HEMI)', 'hemi', null, true),
  ('Otro', 'otro', null, true)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. APPOINTMENT_INSURANCE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.appointment_insurance (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id      uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  provider_id         uuid NOT NULL REFERENCES public.insurance_providers(id),
  policy_number       text NOT NULL,
  holder_name         text,
  holder_national_id  text,
  authorized_amount   numeric(12,2),
  status              text DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','claimed','paid','rejected','cancelled')),
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE (appointment_id, provider_id, policy_number)
);

CREATE INDEX IF NOT EXISTS idx_appointment_insurance_appointment
  ON public.appointment_insurance(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_insurance_provider
  ON public.appointment_insurance(provider_id);

ALTER TABLE public.appointment_insurance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctor can manage own appointment insurance" ON public.appointment_insurance;
CREATE POLICY "Doctor can manage own appointment insurance"
  ON public.appointment_insurance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_insurance.appointment_id
        AND a.doctor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_insurance.appointment_id
        AND a.doctor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 4. APPOINTMENT_ATTACHMENTS + trigger
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.appointment_attachments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  storage_path    text NOT NULL UNIQUE,
  file_name       text NOT NULL,
  file_size       integer NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  mime_type       text NOT NULL,
  uploaded_by     uuid NOT NULL REFERENCES public.profiles(id),
  uploaded_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_attachments_appointment
  ON public.appointment_attachments(appointment_id);

ALTER TABLE public.appointment_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctor can manage own appointment attachments" ON public.appointment_attachments;
CREATE POLICY "Doctor can manage own appointment attachments"
  ON public.appointment_attachments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_attachments.appointment_id
        AND a.doctor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_attachments.appointment_id
        AND a.doctor_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.sync_appointment_attachments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.appointments
       SET attachments_count = COALESCE(attachments_count, 0) + 1
     WHERE id = NEW.appointment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.appointments
       SET attachments_count = GREATEST(COALESCE(attachments_count, 0) - 1, 0)
     WHERE id = OLD.appointment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_attachments_count_trigger ON public.appointment_attachments;
CREATE TRIGGER sync_attachments_count_trigger
  AFTER INSERT OR DELETE ON public.appointment_attachments
  FOR EACH ROW EXECUTE FUNCTION public.sync_appointment_attachments_count();

-- -----------------------------------------------------------------------------
-- 5. APPOINTMENT_NOTIFICATIONS_QUEUE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.appointment_notifications_queue (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  channel         text NOT NULL CHECK (channel IN ('whatsapp','sms','email')),
  advance_label   text NOT NULL,
  scheduled_for   timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','sent','failed','cancelled')),
  attempts        integer NOT NULL DEFAULT 0,
  last_error      text,
  sent_at         timestamptz,
  recipient_phone text,
  recipient_name  text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_queue_pending_due
  ON public.appointment_notifications_queue(status, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notif_queue_appointment
  ON public.appointment_notifications_queue(appointment_id);

ALTER TABLE public.appointment_notifications_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctor can view own notification queue" ON public.appointment_notifications_queue;
CREATE POLICY "Doctor can view own notification queue"
  ON public.appointment_notifications_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_notifications_queue.appointment_id
        AND a.doctor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 6. RPC schedule_appointment_notifications
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.schedule_appointment_notifications(
  p_appointment_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appt RECORD;
  v_advance text;
  v_when timestamptz;
  v_recipient_phone text;
  v_recipient_name text;
  v_count integer := 0;
BEGIN
  SELECT a.*, p.phone AS patient_phone, p.full_name AS patient_name,
         op.phone AS offline_phone, op.full_name AS offline_name
    INTO v_appt
    FROM public.appointments a
    LEFT JOIN public.profiles p ON p.id = a.patient_id
    LEFT JOIN public.offline_patients op ON op.id = a.offline_patient_id
   WHERE a.id = p_appointment_id
     AND a.doctor_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found or not yours' USING ERRCODE = '42501';
  END IF;

  IF NOT v_appt.notification_enabled THEN
    RETURN 0;
  END IF;

  v_recipient_phone := COALESCE(v_appt.patient_phone, v_appt.offline_phone);
  v_recipient_name  := COALESCE(v_appt.patient_name, v_appt.offline_name);

  DELETE FROM public.appointment_notifications_queue
   WHERE appointment_id = p_appointment_id
     AND status = 'pending';

  FOREACH v_advance IN ARRAY v_appt.notification_advance LOOP
    v_when := CASE v_advance
      WHEN '24h'   THEN v_appt.scheduled_at - interval '24 hours'
      WHEN '2h'    THEN v_appt.scheduled_at - interval '2 hours'
      WHEN '30min' THEN v_appt.scheduled_at - interval '30 minutes'
      ELSE NULL
    END;

    IF v_when IS NULL THEN CONTINUE; END IF;

    INSERT INTO public.appointment_notifications_queue (
      appointment_id, channel, advance_label, scheduled_for,
      recipient_phone, recipient_name
    ) VALUES (
      p_appointment_id,
      v_appt.notification_channel,
      v_advance,
      v_when,
      v_recipient_phone,
      v_recipient_name
    );
    v_count := v_count + 1;
  END LOOP;

  UPDATE public.appointments
     SET notification_status = CASE WHEN v_count > 0 THEN 'scheduled' ELSE 'pending' END
   WHERE id = p_appointment_id;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.schedule_appointment_notifications(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 7. STORAGE bucket + policies
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'appointment_attachments',
  'appointment_attachments',
  false,
  10485760,
  ARRAY[
    'image/jpeg','image/png','image/webp','image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Doctor read own appointment attachments" ON storage.objects;
CREATE POLICY "Doctor read own appointment attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'appointment_attachments'
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id::text = (string_to_array(name, '/'))[1]
        AND a.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctor upload own appointment attachments" ON storage.objects;
CREATE POLICY "Doctor upload own appointment attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'appointment_attachments'
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id::text = (string_to_array(name, '/'))[1]
        AND a.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctor delete own appointment attachments" ON storage.objects;
CREATE POLICY "Doctor delete own appointment attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'appointment_attachments'
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id::text = (string_to_array(name, '/'))[1]
        AND a.doctor_id = auth.uid()
    )
  );
