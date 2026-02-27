-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Enterprise Scheduling — TIER 1 Foundation
-- Date: 2026-02-21
-- Description:
--   1. appointment_series       — citas recurrentes (series)
--   2. time_blocks              — bloqueos de horario (vacaciones, almuerzo, prep)
--   3. appointment_reminders    — motor de recordatorios automáticos (multi-canal)
--   4. appointment_type_configs — config por tipo/especialidad (buffers, prep, etc.)
--   5. appointment_cancellation_logs — auditoría de cancelaciones y reschedule
--   6. Extend appointments      — series_id, recurrence_index, buffer_before/after
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. APPOINTMENT SERIES (Citas Recurrentes) ───────────────────────────────
CREATE TABLE IF NOT EXISTS appointment_series (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id           UUID        REFERENCES auth.users(id)         ON DELETE SET NULL,
  offline_patient_id   UUID        REFERENCES offline_patients(id)   ON DELETE SET NULL,
  office_id            UUID        REFERENCES doctor_offices(id)     ON DELETE SET NULL,

  -- Recurrence config
  recurrence_type      TEXT        NOT NULL
    CHECK (recurrence_type IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  recurrence_interval  INTEGER     NOT NULL DEFAULT 1,         -- cada N días/semanas
  recurrence_days      INTEGER[]   DEFAULT '{}',               -- días de semana [0-6]
  starts_on            DATE        NOT NULL,
  ends_on              DATE,                                   -- NULL = indefinido
  max_occurrences      INTEGER,                                -- o límite por número
  occurrences_created  INTEGER     NOT NULL DEFAULT 0,

  -- Appointment template
  duracion_minutos     INTEGER     NOT NULL DEFAULT 30,
  motivo               TEXT,
  tipo_cita            TEXT        NOT NULL DEFAULT 'presencial'
    CHECK (tipo_cita IN ('presencial', 'telemedicina', 'urgencia', 'seguimiento', 'primera_vez')),
  notas_internas       TEXT,
  precio               NUMERIC(12,2),
  metodo_pago          TEXT        DEFAULT 'pendiente',

  -- Metadata
  is_active            BOOLEAN     NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE appointment_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor_own_series" ON appointment_series
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_series_doctor        ON appointment_series(doctor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_series_patient       ON appointment_series(patient_id);
CREATE INDEX IF NOT EXISTS idx_series_starts        ON appointment_series(starts_on);

-- Add series link to appointments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'series_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN series_id UUID REFERENCES appointment_series(id) ON DELETE SET NULL;
    ALTER TABLE appointments ADD COLUMN recurrence_index INTEGER;
    CREATE INDEX IF NOT EXISTS idx_appointments_series ON appointments(series_id);
  END IF;
END $$;

-- ─── 2. TIME BLOCKS (Bloqueos de Horario) ────────────────────────────────────
-- Bloquea slots en el calendario: vacaciones, almuerzo, prep, reunión, emergencia
CREATE TABLE IF NOT EXISTS time_blocks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  office_id     UUID        REFERENCES doctor_offices(id)      ON DELETE SET NULL,

  tipo          TEXT        NOT NULL
    CHECK (tipo IN ('bloqueo', 'almuerzo', 'reunion', 'vacaciones', 'emergencia', 'preparacion', 'administrativa')),

  titulo        TEXT        NOT NULL DEFAULT 'Bloqueo',
  descripcion   TEXT,
  color         TEXT        DEFAULT '#94a3b8',

  -- Timing (puede ser todo-el-día o específico)
  fecha_inicio  TIMESTAMPTZ NOT NULL,
  fecha_fin     TIMESTAMPTZ NOT NULL,
  todo_el_dia   BOOLEAN     NOT NULL DEFAULT false,

  -- Recurrencia (para almuerzo diario, etc.)
  es_recurrente BOOLEAN     NOT NULL DEFAULT false,
  recurrence_rule JSONB,   -- { type: 'daily'|'weekly', days: [1,2,3,4,5], until: '2026-12-31' }

  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor_own_blocks" ON time_blocks
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_time_blocks_doctor  ON time_blocks(doctor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_time_blocks_dates   ON time_blocks(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_time_blocks_office  ON time_blocks(office_id);

-- ─── 3. APPOINTMENT REMINDERS (Motor de Recordatorios) ───────────────────────
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    UUID        NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id         UUID        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  patient_id        UUID        REFERENCES auth.users(id)            ON DELETE SET NULL,

  -- Trigger config
  trigger_type      TEXT        NOT NULL
    CHECK (trigger_type IN ('24h', '2h', '1h', '30min', 'day_of', 'custom', 'post_appointment')),
  trigger_offset_minutes INTEGER, -- minutos antes de la cita (negativo = después)
  scheduled_for     TIMESTAMPTZ NOT NULL,

  -- Channel cascade: push → whatsapp → sms → email
  channels          TEXT[]      NOT NULL DEFAULT ARRAY['push', 'whatsapp', 'sms', 'email'],

  -- Status per channel
  push_status       TEXT        DEFAULT 'pending'
    CHECK (push_status IN ('pending', 'sent', 'delivered', 'failed', 'skipped')),
  whatsapp_status   TEXT        DEFAULT 'pending'
    CHECK (whatsapp_status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'skipped')),
  sms_status        TEXT        DEFAULT 'pending'
    CHECK (sms_status IN ('pending', 'sent', 'delivered', 'failed', 'skipped')),
  email_status      TEXT        DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'delivered', 'opened', 'failed', 'skipped')),

  -- Overall
  overall_status    TEXT        NOT NULL DEFAULT 'scheduled'
    CHECK (overall_status IN ('scheduled', 'processing', 'sent', 'confirmed_by_patient', 'cancelled_by_patient', 'failed', 'skipped')),

  -- External IDs from providers
  whatsapp_message_id TEXT,
  sms_message_id      TEXT,
  email_message_id    TEXT,
  push_notification_id TEXT,

  -- Patient response (two-way confirmation)
  patient_response        TEXT
    CHECK (patient_response IN ('confirmed', 'cancelled', 'rescheduled', 'ignored')),
  patient_responded_at    TIMESTAMPTZ,
  patient_response_channel TEXT,

  -- Reschedule token (one-time link for patient to reschedule)
  reschedule_token        TEXT UNIQUE,
  reschedule_token_expires TIMESTAMPTZ,

  -- Message content (template snapshot)
  template_name     TEXT,
  message_variables JSONB,

  -- Metadata
  error_message     TEXT,
  retry_count       INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at           TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ
);

ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Doctores ven sus recordatorios. Pacientes ven los suyos (para responder).
CREATE POLICY "doctor_own_reminders" ON appointment_reminders
  FOR ALL USING (doctor_id = auth.uid());

CREATE POLICY "patient_own_reminders" ON appointment_reminders
  FOR SELECT USING (patient_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_reminders_scheduled  ON appointment_reminders(scheduled_for, overall_status);
CREATE INDEX IF NOT EXISTS idx_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminders_doctor      ON appointment_reminders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reminders_token       ON appointment_reminders(reschedule_token) WHERE reschedule_token IS NOT NULL;

-- Función para programar recordatorios automáticamente al crear/confirmar una cita
CREATE OR REPLACE FUNCTION schedule_appointment_reminders(p_appointment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appointment RECORD;
  v_fecha_hora TIMESTAMPTZ;
BEGIN
  SELECT a.*, a.medico_id as doctor_id_col
  INTO v_appointment
  FROM appointments a
  WHERE a.id = p_appointment_id;

  IF NOT FOUND THEN RETURN; END IF;

  v_fecha_hora := v_appointment.fecha_hora;

  -- Saltar si no hay reminder solicitado
  IF NOT COALESCE(v_appointment.enviar_recordatorio, true) THEN RETURN; END IF;

  -- Eliminar recordatorios futuros existentes para esta cita
  DELETE FROM appointment_reminders
  WHERE appointment_id = p_appointment_id
    AND overall_status = 'scheduled';

  -- 24h antes
  INSERT INTO appointment_reminders (
    appointment_id, doctor_id, patient_id,
    trigger_type, trigger_offset_minutes, scheduled_for
  )
  SELECT
    p_appointment_id,
    v_appointment.medico_id,
    v_appointment.paciente_id,
    '24h',
    -1440,
    v_fecha_hora - INTERVAL '24 hours'
  WHERE v_fecha_hora - INTERVAL '24 hours' > now();

  -- 2h antes
  INSERT INTO appointment_reminders (
    appointment_id, doctor_id, patient_id,
    trigger_type, trigger_offset_minutes, scheduled_for
  )
  SELECT
    p_appointment_id,
    v_appointment.medico_id,
    v_appointment.paciente_id,
    '2h',
    -120,
    v_fecha_hora - INTERVAL '2 hours'
  WHERE v_fecha_hora - INTERVAL '2 hours' > now();

  -- 30 min antes
  INSERT INTO appointment_reminders (
    appointment_id, doctor_id, patient_id,
    trigger_type, trigger_offset_minutes, scheduled_for
  )
  SELECT
    p_appointment_id,
    v_appointment.medico_id,
    v_appointment.paciente_id,
    '30min',
    -30,
    v_fecha_hora - INTERVAL '30 minutes'
  WHERE v_fecha_hora - INTERVAL '30 minutes' > now();

END;
$$;

-- Trigger: Programa recordatorios al crear o confirmar cita
CREATE OR REPLACE FUNCTION trigger_schedule_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Al insertar o al cambiar status a 'confirmada'
  IF (TG_OP = 'INSERT') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'confirmada' AND
      (OLD.status IS DISTINCT FROM 'confirmada')) THEN
    PERFORM schedule_appointment_reminders(NEW.id);
  END IF;

  -- Al cancelar: cancelar recordatorios pendientes
  IF TG_OP = 'UPDATE' AND NEW.status IN ('cancelada', 'no_asistio') THEN
    UPDATE appointment_reminders
    SET overall_status = 'skipped'
    WHERE appointment_id = NEW.id
      AND overall_status = 'scheduled';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_schedule_reminders ON appointments;
CREATE TRIGGER trg_schedule_reminders
  AFTER INSERT OR UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_schedule_reminders();

-- ─── 4. APPOINTMENT TYPE CONFIGS (Buffer Times + Specialty Config) ────────────
CREATE TABLE IF NOT EXISTS appointment_type_configs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificación del tipo (por especialidad + tipo)
  specialty_slug    TEXT,    -- 'odontologia', 'fisioterapia', 'psicologia', etc.
  tipo_cita         TEXT,    -- 'primera_vez', 'seguimiento', 'urgencia', etc.
  procedure_code    TEXT,    -- específico para odontología o procedimientos

  -- Duración por defecto
  duracion_default  INTEGER     NOT NULL DEFAULT 30,
  duracion_min      INTEGER     NOT NULL DEFAULT 15,
  duracion_max      INTEGER     NOT NULL DEFAULT 120,

  -- Buffers
  buffer_before_min INTEGER     NOT NULL DEFAULT 0,  -- prep antes de la cita
  buffer_after_min  INTEGER     NOT NULL DEFAULT 0,  -- limpieza/notas después

  -- Comportamiento del reminder (override del default)
  reminder_templates JSONB DEFAULT '{"24h": true, "2h": true, "30min": false}'::jsonb,
  reminder_message_override TEXT, -- mensaje personalizado para esta especialidad

  -- Formulario pre-cita
  pre_appointment_form_id UUID,   -- futuro: forms system
  preparation_instructions TEXT, -- instrucciones enviadas al confirmar

  -- Consentimiento requerido
  requires_consent_form   BOOLEAN NOT NULL DEFAULT false,
  consent_form_url        TEXT,

  -- Color en calendario
  color               TEXT    DEFAULT '#3B82F6',

  -- Specialty-specific flags
  is_high_privacy     BOOLEAN NOT NULL DEFAULT false, -- psicología: no detalle en reminders
  shows_tooth_selector BOOLEAN NOT NULL DEFAULT false, -- odontología
  shows_session_counter BOOLEAN NOT NULL DEFAULT false, -- fisioterapia, psicología
  allow_online_booking  BOOLEAN NOT NULL DEFAULT true,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (doctor_id, specialty_slug, tipo_cita)
);

ALTER TABLE appointment_type_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor_own_configs" ON appointment_type_configs
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_appt_type_configs_doctor ON appointment_type_configs(doctor_id);

-- Seed configs por defecto para especialidades conocidas
-- (se corren al crear el primer perfil del doctor — a través de la app)

-- ─── 5. APPOINTMENT CANCELLATION LOGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointment_cancellation_logs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    UUID        NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id         UUID        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  patient_id        UUID        REFERENCES auth.users(id)            ON DELETE SET NULL,

  cancelled_by      TEXT        NOT NULL
    CHECK (cancelled_by IN ('medico', 'paciente', 'secretaria', 'sistema')),
  cancellation_reason TEXT,
  reason_category   TEXT
    CHECK (reason_category IN (
      'emergencia_medica', 'emergencia_personal', 'conflicto_horario',
      'olvido', 'costo', 'mejoria', 'traslado', 'no_encontro_lugar',
      'otro_medico', 'sistema', 'otro'
    )),

  -- Reschedule tracking
  reschedule_offered  BOOLEAN    NOT NULL DEFAULT false,
  reschedule_accepted BOOLEAN    DEFAULT NULL,
  new_appointment_id  UUID       REFERENCES appointments(id) ON DELETE SET NULL,
  offered_slots       JSONB,     -- [ { fecha_hora, duracion_minutos } ]

  -- Waitlist notification
  waitlist_notified   BOOLEAN    NOT NULL DEFAULT false,
  waitlist_matches    INTEGER    DEFAULT 0,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE appointment_cancellation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor_own_cancellations" ON appointment_cancellation_logs
  FOR ALL USING (doctor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_cancellations_apt    ON appointment_cancellation_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_doctor ON appointment_cancellation_logs(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cancellations_reason ON appointment_cancellation_logs(reason_category);

-- ─── 6. EXTEND APPOINTMENTS — Buffer-aware fields ────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'buffer_before_min'
  ) THEN
    ALTER TABLE appointments ADD COLUMN buffer_before_min INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE appointments ADD COLUMN buffer_after_min  INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Computed column helper: effective end time including buffer
-- (used in conflict queries)
COMMENT ON COLUMN appointments.buffer_after_min IS
  'Minutes reserved after appointment ends (cleaning, notes, recovery). Included in conflict detection.';

-- ─── 7. SPECIALTY-AWARE CHECK-IN TOKENS ──────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'checkin_token'
  ) THEN
    ALTER TABLE appointments ADD COLUMN checkin_token TEXT UNIQUE;
    ALTER TABLE appointments ADD COLUMN checkin_at TIMESTAMPTZ;
    ALTER TABLE appointments ADD COLUMN checkin_method TEXT
      CHECK (checkin_method IN ('qr', 'app', 'manual', 'kiosk'));
    CREATE INDEX IF NOT EXISTS idx_appointments_checkin_token
      ON appointments(checkin_token) WHERE checkin_token IS NOT NULL;
  END IF;
END $$;

-- Function: generate check-in token on confirmation
CREATE OR REPLACE FUNCTION generate_checkin_token(p_appointment_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
BEGIN
  v_token := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  UPDATE appointments
  SET checkin_token = v_token
  WHERE id = p_appointment_id
    AND checkin_token IS NULL;

  RETURN v_token;
END;
$$;

-- ─── 8. VIEW: Agenda Conflict Detection (includes buffers) ───────────────────
CREATE OR REPLACE VIEW appointment_effective_slots AS
SELECT
  id,
  medico_id,
  location_id,
  fecha_hora,
  duracion_minutos,
  buffer_before_min,
  buffer_after_min,
  status,
  -- Effective start (including buffer before)
  fecha_hora - make_interval(mins => buffer_before_min) AS effective_start,
  -- Effective end (including buffer after)
  fecha_hora + make_interval(mins => duracion_minutos + buffer_after_min) AS effective_end
FROM appointments
WHERE status NOT IN ('cancelada', 'no_asistio');

COMMENT ON VIEW appointment_effective_slots IS
  'Appointments with buffer zones for conflict detection. Use effective_start/effective_end.';

-- ─── 9. FUNCTION: Check slot availability (buffer-aware) ─────────────────────
CREATE OR REPLACE FUNCTION check_slot_available(
  p_doctor_id     UUID,
  p_location_id   UUID,
  p_start         TIMESTAMPTZ,
  p_duration_min  INTEGER,
  p_buffer_before INTEGER DEFAULT 0,
  p_buffer_after  INTEGER DEFAULT 0,
  p_exclude_id    UUID DEFAULT NULL
)
RETURNS TABLE (
  is_available BOOLEAN,
  conflicts    JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_effective_start TIMESTAMPTZ := p_start - make_interval(mins => p_buffer_before);
  v_effective_end   TIMESTAMPTZ := p_start + make_interval(mins => p_duration_min + p_buffer_after);
  v_conflicts JSONB := '[]'::jsonb;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'id',           s.id,
    'fecha_hora',   s.fecha_hora,
    'patient_name', COALESCE(p.nombre_completo, 'Paciente'),
    'tipo',         a.tipo_cita
  ))
  INTO v_conflicts
  FROM appointment_effective_slots s
  JOIN appointments a ON a.id = s.id
  LEFT JOIN profiles p ON p.id = a.paciente_id
  WHERE s.medico_id = p_doctor_id
    AND (p_location_id IS NULL OR s.location_id = p_location_id)
    AND s.id IS DISTINCT FROM p_exclude_id
    AND s.effective_start < v_effective_end
    AND s.effective_end   > v_effective_start;

  RETURN QUERY SELECT
    (v_conflicts IS NULL OR jsonb_array_length(v_conflicts) = 0),
    COALESCE(v_conflicts, '[]'::jsonb);
END;
$$;

-- ─── 10. TIME BLOCK CONFLICT CHECK ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_time_block_conflict(
  p_doctor_id  UUID,
  p_start      TIMESTAMPTZ,
  p_end        TIMESTAMPTZ,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM time_blocks
    WHERE doctor_id = p_doctor_id
      AND is_active = true
      AND id IS DISTINCT FROM p_exclude_id
      AND fecha_inicio < p_end
      AND fecha_fin    > p_start
  );
$$;

COMMENT ON FUNCTION check_time_block_conflict IS
  'Returns true if no time blocks conflict with the given range.';
