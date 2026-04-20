import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validation/validate';
import { createAppointmentSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Appointments — BFF API Route
// -------------------------------------------------------------------
// GET:  List the authenticated patient's appointments (with filters).
// POST: Create a new appointment for the authenticated patient.
// Conflict detection runs through the `check_slot_available` and
// `check_time_block_conflict` Postgres RPCs so the same business rules
// are enforced regardless of caller (paciente, medico, secretaria).
// -------------------------------------------------------------------

type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'waiting'
  | 'in_progress'
  | 'no_show';

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión para continuar.' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') as AppointmentStatus | null;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('page_size') ?? '10', 10)));
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('appointments')
      .select(
        `
        id,
        doctor_id,
        scheduled_at,
        duration_minutes,
        status,
        appointment_type,
        reason,
        notes,
        location_id,
        price,
        payment_method,
        created_at,
        doctor:doctor_profiles!appointments_doctor_id_fkey (
          id,
          specialty_id,
          consultation_fee,
          profile:profiles!doctor_profiles_profile_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        )
        `,
        { count: 'exact' },
      )
      .eq('patient_id', user.id)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: false });

    if (statusParam) {
      query = query.eq('status', statusParam);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data: appointments, error, count } = await query;

    if (error) {
      console.error('[Appointments GET] Supabase error:', error);
      return NextResponse.json({ error: 'Error al obtener citas.' }, { status: 500 });
    }

    return NextResponse.json({
      data: appointments ?? [],
      pagination: {
        page,
        page_size: pageSize,
        total: count ?? 0,
        total_pages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (error) {
    console.error('[Appointments GET] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión para continuar.' },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    const validation = validateBody(createAppointmentSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;
    const scheduledAt = data.scheduled_at;
    const durationMin = data.duration_minutes;
    const locationId = data.location_id && data.location_id !== '' ? data.location_id : null;

    // --- Slot conflict check (buffers, other appointments) ---
    const { data: slotCheck, error: slotErr } = await supabase.rpc('check_slot_available', {
      p_doctor_id: data.doctor_id,
      p_location_id: locationId,
      p_start: scheduledAt,
      p_duration_min: durationMin,
      p_buffer_before: 0,
      p_buffer_after: 0,
      p_exclude_id: null,
    });

    if (slotErr) {
      console.error('[Appointments POST] check_slot_available error:', slotErr);
      return NextResponse.json({ error: 'Error al verificar disponibilidad.' }, { status: 500 });
    }

    const slotRow = Array.isArray(slotCheck) ? slotCheck[0] : slotCheck;
    if (slotRow && slotRow.is_available === false) {
      return NextResponse.json(
        { error: 'El horario seleccionado ya no está disponible.', conflicts: slotRow.conflicts ?? [] },
        { status: 409 },
      );
    }

    // --- Time-block check (doctor vacations, blocked ranges) ---
    const endISO = new Date(new Date(scheduledAt).getTime() + durationMin * 60_000).toISOString();
    const { data: blockOk, error: blockErr } = await supabase.rpc('check_time_block_conflict', {
      p_doctor_id: data.doctor_id,
      p_start: scheduledAt,
      p_end: endISO,
      p_exclude_id: null,
    });

    if (blockErr) {
      console.error('[Appointments POST] check_time_block_conflict error:', blockErr);
      return NextResponse.json({ error: 'Error al verificar bloqueos de agenda.' }, { status: 500 });
    }

    if (blockOk === false) {
      return NextResponse.json(
        { error: 'El médico no atiende en ese rango (bloqueo de agenda).' },
        { status: 409 },
      );
    }

    // --- Insert ---
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        doctor_id: data.doctor_id,
        scheduled_at: scheduledAt,
        duration_minutes: durationMin,
        reason: data.reason,
        notes: data.notes ?? null,
        appointment_type: data.appointment_type,
        price: data.price ?? null,
        payment_method: data.payment_method ?? 'cash',
        location_id: locationId,
        status: 'pending' satisfies AppointmentStatus,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Appointments POST] Insert error:', insertError);
      return NextResponse.json({ error: 'Error al crear la cita.' }, { status: 500 });
    }

    // --- Log activity (best-effort) ---
    void supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'appointment_created',
        details: {
          appointment_id: appointment.id,
          doctor_id: data.doctor_id,
          scheduled_at: scheduledAt,
        },
      })
      .then(({ error: logError }) => {
        if (logError) console.error('[Appointments POST] Activity log error:', logError);
      });

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Solicitud inválida. Verifica los datos enviados.' },
        { status: 400 },
      );
    }
    console.error('[Appointments POST] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
