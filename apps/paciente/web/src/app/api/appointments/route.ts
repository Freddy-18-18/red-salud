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
    const limited = await checkRateLimit(request, 'authenticated');
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
    const limited = await checkRateLimit(request, 'mutation');
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
    const durationMin = data.duration_minutes ?? 30;
    const locationId = data.location_id && data.location_id !== '' ? data.location_id : null;

    // Atomic booking — runs slot/block checks + INSERT inside a SECURITY
    // DEFINER function on the database. The partial unique index
    // `appointments_no_double_book` is the ultimate guard: even if two
    // requests pass `check_slot_available` simultaneously, only one INSERT
    // wins and the other is mapped to `slot_taken` here.
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'book_appointment_atomic',
      {
        p_patient_id: user.id,
        p_doctor_id: data.doctor_id,
        p_scheduled_at: scheduledAt,
        p_duration_minutes: durationMin,
        p_reason: data.reason,
        p_appointment_type: data.appointment_type,
        p_notes: data.notes ?? null,
        p_price: data.price ?? null,
        p_payment_method: data.payment_method ?? 'cash',
        p_location_id: locationId,
        p_buffer_before_min: 0,
        p_buffer_after_min: 0,
      },
    );

    if (rpcError) {
      console.error('[Appointments POST] book_appointment_atomic error:', rpcError);
      return NextResponse.json(
        { error: 'Error al crear la cita.' },
        { status: 500 },
      );
    }

    const result = (rpcResult ?? {}) as {
      data?: Record<string, unknown>;
      error?: string;
      message?: string;
      conflicts?: unknown;
    };

    if (result.error) {
      const status =
        result.error === 'unauthorized'
          ? 403
          : result.error === 'invalid_input'
            ? 400
            : 409;
      return NextResponse.json(
        {
          error: result.message ?? 'No se pudo crear la cita.',
          code: result.error,
          conflicts: result.conflicts ?? undefined,
        },
        { status },
      );
    }

    const appointment = result.data as { id: string } | undefined;
    if (!appointment) {
      console.error('[Appointments POST] RPC returned no data:', rpcResult);
      return NextResponse.json(
        { error: 'Error al crear la cita.' },
        { status: 500 },
      );
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
