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
// Both handlers require authentication.
// -------------------------------------------------------------------

// --- GET: List patient's appointments ---

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const supabase = await createClient();

    // Auth check
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
    const status = searchParams.get('status'); // pendiente, confirmada, completada, cancelada
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('page_size') ?? '10', 10)));
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('appointments')
      .select(
        `
        id,
        doctor_id,
        start_time,
        end_time,
        status,
        type,
        motivo,
        notes,
        created_at,
        doctor:doctor_details!appointments_doctor_id_fkey (
          id,
          consultation_fee,
          city,
          profile:profiles!doctor_details_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          specialty:medical_specialties!doctor_details_specialty_id_fkey (
            id,
            name,
            icon
          )
        )
        `,
        { count: 'exact' },
      )
      .eq('patient_id', user.id)
      .order('start_time', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data: appointments, error, count } = await query;

    if (error) {
      console.error('[Appointments GET] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener citas.' },
        { status: 500 },
      );
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
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

// --- POST: Create appointment ---

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const supabase = await createClient();

    // Auth check
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

    // --- Check for time conflicts ---
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', data.doctor_id)
      .neq('status', 'cancelada')
      .lt('start_time', data.end_time)
      .gt('end_time', data.start_time)
      .limit(1);

    if (conflictError) {
      console.error('[Appointments POST] Conflict check error:', conflictError);
      return NextResponse.json(
        { error: 'Error al verificar disponibilidad.' },
        { status: 500 },
      );
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'El horario seleccionado ya no está disponible.' },
        { status: 409 },
      );
    }

    // --- Insert appointment ---
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        doctor_id: data.doctor_id,
        start_time: data.start_time,
        end_time: data.end_time,
        type: data.tipo_cita,
        motivo: data.motivo ?? null,
        notes: data.notas_internas ?? null,
        status: 'pendiente',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Appointments POST] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Error al crear la cita.' },
        { status: 500 },
      );
    }

    // --- Log activity (best-effort, don't fail the request) ---
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'appointment_created',
        details: {
          appointment_id: appointment.id,
          doctor_id: data.doctor_id,
          start_time: data.start_time,
        },
      })
      .then(({ error: logError }) => {
        if (logError) {
          console.error('[Appointments POST] Activity log error:', logError);
        }
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
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
