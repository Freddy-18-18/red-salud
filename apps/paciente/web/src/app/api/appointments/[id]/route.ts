import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Single Appointment — BFF API Route
// -------------------------------------------------------------------
// GET: Returns the full detail of one appointment owned by the authenticated
// patient. Includes doctor (basic profile + medical profile + specialty),
// the sede (organization_locations + parent organization), and the
// cancellation window the patient is bound to (from doctor_settings or the
// platform default).
//
// RLS: organization_locations and organizations are gated by the policies
// added in 20260507000000_paciente_read_appointment_locations — a patient
// can only read locations where THEY have an appointment.
// -------------------------------------------------------------------

const DEFAULT_CANCELLATION_WINDOW_HOURS = 24;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const { id: appointmentId } = await params;
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

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(
        `
        id,
        patient_id,
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
        payment_status,
        cancelled_at,
        cancelled_by,
        cancellation_reason,
        created_at,
        updated_at,
        doctor:profiles!appointments_medico_id_fkey (
          id,
          first_name,
          last_name,
          full_name,
          avatar_url,
          city,
          state,
          email,
          phone,
          doctor_profile:doctor_profiles!doctor_details_profile_id_fkey (
            id,
            biography,
            consultation_fee,
            consultation_duration,
            accepts_telemedicine,
            verified,
            sacs_verified,
            years_experience,
            languages,
            specialty:specialties!fk_doctor_specialty (
              id,
              name,
              icon
            )
          )
        ),
        location:organization_locations (
          id,
          name,
          address_line,
          city,
          state,
          phone,
          latitude,
          longitude,
          organization:organizations (
            id,
            name
          )
        ),
        review:doctor_reviews!doctor_reviews_appointment_id_fkey (
          id,
          rating,
          created_at
        )
        `,
      )
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Cita no encontrada.' },
          { status: 404 },
        );
      }
      console.error('[Appointment GET] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener la cita.' },
        { status: 500 },
      );
    }

    if (appointment.patient_id !== user.id) {
      // Don't leak existence — the user has no business knowing this row exists.
      return NextResponse.json(
        { error: 'Cita no encontrada.' },
        { status: 404 },
      );
    }

    // --- Cancellation window for THIS doctor ---
    // The cancel route does the same lookup; we surface it on read so the UI
    // can show "Cancelación gratuita hasta {N}h antes" without a second call.
    const { data: settingsRow } = await supabase
      .from('doctor_settings')
      .select('cancellation_window_hours')
      .eq('doctor_id', appointment.doctor_id)
      .maybeSingle();

    const cancellationWindowHours =
      settingsRow?.cancellation_window_hours ?? DEFAULT_CANCELLATION_WINDOW_HOURS;

    // --- Patient waitlist opt-in for this cita ---
    // RLS enforces ownership, so this only ever returns the user's own row.
    const { data: waitlistRow } = await supabase
      .from('patient_appointment_waitlist')
      .select('id, status, before_at, created_at')
      .eq('patient_id', user.id)
      .eq('current_appointment_id', appointmentId)
      .maybeSingle();

    return NextResponse.json({
      data: {
        ...appointment,
        cancellation_window_hours: cancellationWindowHours,
        waitlist: waitlistRow ?? null,
      },
    });
  } catch (error) {
    console.error('[Appointment GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
