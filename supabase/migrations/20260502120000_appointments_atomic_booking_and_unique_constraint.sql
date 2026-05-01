-- =============================================================================
-- A6 / Fase A — Atomic appointment booking + partial unique index
-- =============================================================================
--
-- Problem
-- -------
-- The previous booking flow ran a `check_slot_available` RPC, then a
-- `check_time_block_conflict` RPC, then a separate INSERT. Two concurrent
-- requests for the same (doctor_id, scheduled_at) could both pass the checks
-- before either INSERT landed, producing a double-booking. There was no
-- database-level guard.
--
-- Defense in depth
-- ----------------
-- 1. A partial UNIQUE index on (doctor_id, scheduled_at) makes the database
--    the ultimate authority — it refuses the second INSERT with SQLSTATE
--    23505 even if the application layer is bypassed, has a bug, or runs in
--    parallel across instances.
-- 2. A SECURITY DEFINER RPC, `book_appointment_atomic`, encapsulates the
--    check + insert in one server-side function. It catches the
--    unique-violation cleanly and returns a structured error so the API can
--    map it to HTTP 409 without leaking PostgREST internals.
--
-- The application keeps the pre-submit `check_slot_available` call as a UX
-- hint (so the form can show "slot taken" before submit), but the RPC is the
-- only writer.
--
-- Idempotent
-- ----------
-- - CREATE UNIQUE INDEX uses IF NOT EXISTS.
-- - CREATE OR REPLACE on the function so re-running this migration is safe.
-- =============================================================================

-- 1. Partial unique index: only "live" appointments hold the slot. Cancelled
--    and no-show rows release the slot for re-booking, and soft-deleted rows
--    are excluded entirely.
CREATE UNIQUE INDEX IF NOT EXISTS appointments_no_double_book
  ON public.appointments (doctor_id, scheduled_at)
  WHERE status NOT IN ('cancelled', 'no_show')
    AND deleted_at IS NULL;

-- 2. Atomic booking RPC.
CREATE OR REPLACE FUNCTION public.book_appointment_atomic(
  p_patient_id        uuid,
  p_doctor_id         uuid,
  p_scheduled_at      timestamptz,
  p_duration_minutes  integer,
  p_reason            text,
  p_appointment_type  text DEFAULT 'in_person',
  p_notes             text DEFAULT NULL,
  p_price             numeric DEFAULT NULL,
  p_payment_method    text DEFAULT 'cash',
  p_location_id       uuid DEFAULT NULL,
  p_buffer_before_min integer DEFAULT 0,
  p_buffer_after_min  integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller_id    uuid := auth.uid();
  v_appointment  appointments%ROWTYPE;
  v_slot_check   record;
  v_block_ok     boolean;
  v_end_at       timestamptz;
BEGIN
  -- Identity check: a user can only book for themselves. Service-role calls
  -- (no auth.uid()) bypass this so backoffice scripts still work.
  IF v_caller_id IS NOT NULL AND v_caller_id <> p_patient_id THEN
    RETURN jsonb_build_object(
      'error', 'unauthorized',
      'message', 'No puedes agendar citas para otro paciente.'
    );
  END IF;

  -- Required field guards. The HTTP layer validates first; this is defense
  -- in depth in case the function is called from other server code.
  IF p_doctor_id IS NULL OR p_scheduled_at IS NULL OR p_duration_minutes IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'invalid_input',
      'message', 'Faltan campos obligatorios para agendar la cita.'
    );
  END IF;

  v_end_at := p_scheduled_at + make_interval(mins => p_duration_minutes);

  -- Reuse existing business-rule RPCs. They run in the same transaction so
  -- the row they read is consistent with the INSERT below.
  SELECT *
  INTO v_slot_check
  FROM public.check_slot_available(
    p_doctor_id      := p_doctor_id,
    p_location_id    := p_location_id,
    p_start          := p_scheduled_at,
    p_duration_min   := p_duration_minutes,
    p_buffer_before  := p_buffer_before_min,
    p_buffer_after   := p_buffer_after_min,
    p_exclude_id     := NULL
  );

  IF v_slot_check.is_available IS DISTINCT FROM TRUE THEN
    RETURN jsonb_build_object(
      'error', 'slot_taken',
      'message', 'El horario seleccionado ya no está disponible.',
      'conflicts', COALESCE(v_slot_check.conflicts, '[]'::jsonb)
    );
  END IF;

  v_block_ok := public.check_time_block_conflict(
    p_doctor_id  := p_doctor_id,
    p_start      := p_scheduled_at,
    p_end        := v_end_at,
    p_exclude_id := NULL
  );

  IF v_block_ok IS DISTINCT FROM TRUE THEN
    RETURN jsonb_build_object(
      'error', 'time_block_conflict',
      'message', 'El médico no atiende en ese rango (bloqueo de agenda).'
    );
  END IF;

  -- Atomic insert. The partial unique index will raise SQLSTATE 23505 if a
  -- concurrent request already grabbed this slot between the check above and
  -- this insert. We translate that into the same `slot_taken` error shape
  -- the API consumer already handles.
  BEGIN
    INSERT INTO public.appointments (
      patient_id, doctor_id, scheduled_at, duration_minutes,
      reason, notes, appointment_type, price, payment_method,
      location_id, buffer_before_min, buffer_after_min, status
    )
    VALUES (
      p_patient_id, p_doctor_id, p_scheduled_at, p_duration_minutes,
      p_reason, p_notes, p_appointment_type, p_price, p_payment_method,
      p_location_id, p_buffer_before_min, p_buffer_after_min, 'pending'
    )
    RETURNING * INTO v_appointment;
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'error', 'slot_taken',
      'message', 'El horario seleccionado ya no está disponible.'
    );
  END;

  RETURN jsonb_build_object(
    'data', to_jsonb(v_appointment)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_appointment_atomic(
  uuid, uuid, timestamptz, integer, text, text, text, numeric, text, uuid, integer, integer
) TO authenticated;

COMMENT ON FUNCTION public.book_appointment_atomic(
  uuid, uuid, timestamptz, integer, text, text, text, numeric, text, uuid, integer, integer
) IS
  'Atomically validates and creates an appointment. Returns {data: appointment} on success or {error: code, message} on conflict.';

COMMENT ON INDEX public.appointments_no_double_book IS
  'Race-free guard: prevents two live appointments from holding the same (doctor_id, scheduled_at) tuple. Released by cancel/no-show/soft-delete.';
