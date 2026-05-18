import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/patients/lookup?cedula=12345678&nacionalidad=V
 *
 * Looks up a patient by national_id across the doctor's universe:
 *   1. Doctor's roster (doctor_patients → profiles) — `kind: 'registered'`
 *   2. Doctor's offline patients — `kind: 'offline'`
 *   3. (Optionally) any registered patient in the platform with that cedula
 *      whom the doctor hasn't added yet — `kind: 'platform'`. Useful so the
 *      doctor can attach an existing patient without re-registering them.
 *
 * Never returns patients of OTHER doctors as offline rows — RLS enforces it.
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: 'No autenticado.' },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'medico') {
      return NextResponse.json(
        { error: true, message: 'Solo los médicos pueden usar este endpoint.' },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const cedula = (searchParams.get('cedula') ?? '').replace(/\D/g, '');
    const nacionalidad = (searchParams.get('nacionalidad') ?? 'V').toUpperCase();

    if (!cedula || cedula.length < 6 || cedula.length > 9) {
      return NextResponse.json(
        { error: true, message: 'Cédula inválida.' },
        { status: 400 },
      );
    }
    if (!['V', 'E'].includes(nacionalidad)) {
      return NextResponse.json(
        { error: true, message: 'Nacionalidad inválida.' },
        { status: 400 },
      );
    }

    // 1) Doctor's registered roster
    const { data: rosterRows } = await supabase
      .from('doctor_patients')
      .select(
        `patient_id,
         patient:profiles!doctor_patients_patient_id_fkey(
           id, full_name, national_id, phone, date_of_birth, avatar_url, email
         )`,
      )
      .eq('doctor_id', user.id);

    type RegisteredProfile = {
      id: string;
      full_name: string;
      national_id: string | null;
      phone: string | null;
      avatar_url: string | null;
    };

    // PostgREST puede devolver `patient` como array u objeto según cardinalidad.
    const registeredMatch = (rosterRows ?? [])
      .map((row) => {
        const raw = (row as { patient: unknown }).patient;
        const p = (Array.isArray(raw) ? raw[0] : raw) as
          | RegisteredProfile
          | null
          | undefined;
        return p;
      })
      .find((p) => p && p.national_id === cedula);

    if (registeredMatch) {
      return NextResponse.json({
        error: false,
        data: {
          kind: 'registered' as const,
          patient_id: registeredMatch.id,
          full_name: registeredMatch.full_name,
          national_id: registeredMatch.national_id,
          phone: registeredMatch.phone ?? null,
          avatar_url: registeredMatch.avatar_url ?? null,
        },
      });
    }

    // 2) Doctor's offline patients
    const { data: offlineRows } = await supabase
      .from('offline_patients')
      .select(
        'id, full_name, cedula, phone, nacionalidad, status, linked_profile_id, rif, cne_estado, cne_municipio, cne_parroquia, cne_centro_electoral',
      )
      .eq('doctor_id', user.id)
      .eq('cedula', cedula)
      .maybeSingle();

    if (offlineRows) {
      return NextResponse.json({
        error: false,
        data: {
          kind: 'offline' as const,
          offline_patient_id: offlineRows.id,
          full_name: offlineRows.full_name,
          national_id: offlineRows.cedula,
          nacionalidad: offlineRows.nacionalidad,
          phone: offlineRows.phone,
          status: offlineRows.status,
          linked_profile_id: offlineRows.linked_profile_id,
          rif: offlineRows.rif,
          cne_estado: offlineRows.cne_estado,
          cne_municipio: offlineRows.cne_municipio,
          cne_parroquia: offlineRows.cne_parroquia,
          cne_centro_electoral: offlineRows.cne_centro_electoral,
        },
      });
    }

    // 3) Platform-wide patient profile not yet in the doctor's roster
    const { data: platformPatient } = await supabase
      .from('profiles')
      .select('id, full_name, national_id, phone, avatar_url, role')
      .eq('national_id', cedula)
      .eq('role', 'paciente')
      .maybeSingle();

    if (platformPatient) {
      return NextResponse.json({
        error: false,
        data: {
          kind: 'platform' as const,
          patient_id: platformPatient.id,
          full_name: platformPatient.full_name,
          national_id: platformPatient.national_id,
          phone: platformPatient.phone,
          avatar_url: platformPatient.avatar_url,
        },
      });
    }

    return NextResponse.json({
      error: false,
      data: { kind: 'not_found' as const },
    });
  } catch (error) {
    console.error('[patients/lookup] error', error);
    return NextResponse.json(
      { error: true, message: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
