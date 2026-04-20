-- Phase 1 booking flow: SECURITY DEFINER RPCs that expose doctor availability
-- without leaking any patient PII.
--
-- Why SECURITY DEFINER: the public doctor-search flow (paciente app, anonymous
-- visitors comparing doctors) needs to know which slots are already booked, but
-- the `appointments` table has RLS that only lets the patient or the doctor
-- read rows. These RPCs encapsulate the conflict check so the SQL runs with
-- the function owner's privileges, yet the projection is strictly
-- `(slot_start, slot_end, is_available)` — no patient IDs, no reasons, nothing.
--
-- Data sources:
--   * weekly_schedule_template — doctor's working weekly pattern
--   * doctor_availability_exceptions — one-off day overrides
--   * time_blocks — ad-hoc blocked ranges (vacations, surgery time, etc.)
--   * appointments — existing bookings (overlap check incl. buffers)
--
-- Timezone: stored local times are combined with America/Caracas (es-VE).

CREATE OR REPLACE FUNCTION public.get_doctor_public_availability(
  p_doctor_id uuid,
  p_date date,
  p_slot_duration_mins integer DEFAULT NULL
)
RETURNS TABLE (
  slot_start   timestamptz,
  slot_end     timestamptz,
  is_available boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_tz         text    := 'America/Caracas';
  v_dow        integer := EXTRACT(ISODOW FROM p_date)::integer % 7; -- 0=Sun..6=Sat
  v_template   record;
  v_exception  record;
  v_segment    jsonb;
  v_break      jsonb;
  v_duration   integer;
  v_buffer     integer;
  v_step       timestamptz;
  v_end        timestamptz;
  v_seg_start  timestamptz;
  v_seg_end    timestamptz;
  v_break_s    timestamptz;
  v_break_e    timestamptz;
  v_in_break   boolean;
  v_avail      boolean;
BEGIN
  -- 1. Exception wins over weekly template when the day is marked unavailable.
  SELECT * INTO v_exception
    FROM doctor_availability_exceptions
   WHERE doctor_id = p_doctor_id AND date = p_date
   LIMIT 1;

  IF FOUND AND NOT v_exception.is_available THEN
    RETURN;
  END IF;

  -- 2. Pick the active weekly template row for that weekday.
  SELECT * INTO v_template
    FROM weekly_schedule_template
   WHERE doctor_id = p_doctor_id
     AND day_of_week = v_dow
     AND COALESCE(is_active, true)      = true
     AND COALESCE(is_working_day, true) = true
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_duration := COALESCE(p_slot_duration_mins, v_template.default_duration_mins, 30);
  v_buffer   := COALESCE(v_template.buffer_after_mins, 0);

  -- 3. Iterate every working segment (slots jsonb: [{start, end}, ...]).
  FOR v_segment IN
    SELECT value FROM jsonb_array_elements(COALESCE(v_template.slots, '[]'::jsonb))
  LOOP
    v_seg_start := (p_date::text || ' ' || (v_segment->>'start') || ':00')::timestamp AT TIME ZONE v_tz;
    v_seg_end   := (p_date::text || ' ' || (v_segment->>'end')   || ':00')::timestamp AT TIME ZONE v_tz;

    v_step := v_seg_start;
    WHILE v_step + make_interval(mins => v_duration) <= v_seg_end LOOP
      v_end := v_step + make_interval(mins => v_duration);

      -- 4. Skip if slot overlaps a declared break.
      v_in_break := false;
      FOR v_break IN
        SELECT value FROM jsonb_array_elements(COALESCE(v_template.breaks, '[]'::jsonb))
      LOOP
        v_break_s := (p_date::text || ' ' || (v_break->>'start') || ':00')::timestamp AT TIME ZONE v_tz;
        v_break_e := (p_date::text || ' ' || (v_break->>'end')   || ':00')::timestamp AT TIME ZONE v_tz;
        IF v_step < v_break_e AND v_end > v_break_s THEN
          v_in_break := true;
          EXIT;
        END IF;
      END LOOP;

      IF NOT v_in_break THEN
        -- 5. Availability = no overlapping non-cancelled appointment AND no time block.
        v_avail := NOT EXISTS (
          SELECT 1 FROM appointments a
           WHERE a.doctor_id   = p_doctor_id
             AND a.deleted_at IS NULL
             AND a.status::text NOT IN ('cancelled', 'no_show')
             AND (a.scheduled_at - make_interval(mins => COALESCE(a.buffer_before_min, 0))) < v_end
             AND (a.scheduled_at + make_interval(mins => a.duration_minutes + COALESCE(a.buffer_after_min, 0))) > v_step
        ) AND NOT EXISTS (
          SELECT 1 FROM time_blocks tb
           WHERE tb.doctor_id = p_doctor_id
             AND COALESCE(tb.is_active, true) = true
             AND tb.starts_at < v_end
             AND tb.ends_at   > v_step
        );

        RETURN QUERY SELECT v_step, v_end, v_avail;
      END IF;

      v_step := v_end + make_interval(mins => v_buffer);
    END LOOP;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_doctor_public_availability(uuid, date, integer) TO anon, authenticated;

COMMENT ON FUNCTION public.get_doctor_public_availability(uuid, date, integer) IS
  'Public availability for a doctor on a given day. Returns only (slot_start, slot_end, is_available). Safe to expose to anon role.';


CREATE OR REPLACE FUNCTION public.get_doctor_available_dates(
  p_doctor_id uuid,
  p_days_ahead integer DEFAULT 30
)
RETURNS TABLE (
  date             date,
  available_count  integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_start  date := CURRENT_DATE;
  v_cursor date := v_start;
BEGIN
  IF p_days_ahead IS NULL OR p_days_ahead <= 0 OR p_days_ahead > 180 THEN
    p_days_ahead := 30;
  END IF;

  WHILE v_cursor < v_start + p_days_ahead LOOP
    RETURN QUERY
      SELECT v_cursor,
             (SELECT COUNT(*)::integer
                FROM public.get_doctor_public_availability(p_doctor_id, v_cursor)
               WHERE is_available);
    v_cursor := v_cursor + 1;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_doctor_available_dates(uuid, integer) TO anon, authenticated;

COMMENT ON FUNCTION public.get_doctor_available_dates(uuid, integer) IS
  'For each of the next N days, returns the number of free slots. Capped at 180 days. Safe for anon.';
