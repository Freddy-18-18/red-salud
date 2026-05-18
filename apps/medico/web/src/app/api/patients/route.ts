import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/patients
 *
 * Registers an offline patient under the calling doctor. Atomic via the
 * `create_offline_patient` RPC (SECURITY DEFINER + idempotent on doctor+cedula).
 *
 * If the cedula already matches a registered patient on the platform, the
 * RPC auto-links the offline row to that profile and creates the
 * doctor_patients link too — the doctor gets the patient in their roster
 * regardless of which path the patient took to get there.
 *
 * Body:
 *   {
 *     nacionalidad?: 'V'|'E',  // default 'V'
 *     cedula: string,
 *     full_name: string,
 *     first_name?, middle_name?, last_name?, second_last_name?,
 *     date_of_birth?: 'YYYY-MM-DD',
 *     gender?: 'M'|'F'|'O',
 *     phone?, email?, address?, city?, state?,
 *     blood_type?, allergies?: string[], chronic_conditions?: string[],
 *     current_medications?: string[], doctor_notes?,
 *     cne_estado?, cne_municipio?, cne_parroquia?
 *   }
 *
 * Response: { error: false, data: { offline_patient_id: uuid } }
 */

interface CreateBody {
  nacionalidad?: 'V' | 'E';
  cedula: string;
  full_name: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  second_last_name?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: string[];
  doctor_notes?: string;
  cne_estado?: string;
  cne_municipio?: string;
  cne_parroquia?: string;
}

export async function POST(request: NextRequest) {
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

    let body: CreateBody;
    try {
      body = (await request.json()) as CreateBody;
    } catch {
      return NextResponse.json(
        { error: true, message: 'JSON inválido.' },
        { status: 400 },
      );
    }

    const cedulaClean = (body.cedula ?? '').toString().replace(/\D/g, '');
    if (!cedulaClean || cedulaClean.length < 6 || cedulaClean.length > 9) {
      return NextResponse.json(
        { error: true, message: 'Cédula inválida (6-9 dígitos).' },
        { status: 400 },
      );
    }
    if (!body.full_name || body.full_name.trim().length === 0) {
      return NextResponse.json(
        { error: true, message: 'El nombre del paciente es obligatorio.' },
        { status: 400 },
      );
    }

    // Build payload — RPC validates the rest server-side.
    const payload = {
      nacionalidad: (body.nacionalidad ?? 'V') as 'V' | 'E',
      cedula: cedulaClean,
      full_name: body.full_name.trim(),
      first_name: body.first_name,
      middle_name: body.middle_name,
      last_name: body.last_name,
      second_last_name: body.second_last_name,
      date_of_birth: body.date_of_birth,
      gender: body.gender,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      blood_type: body.blood_type,
      allergies: body.allergies ?? [],
      chronic_conditions: body.chronic_conditions ?? [],
      current_medications: body.current_medications ?? [],
      doctor_notes: body.doctor_notes,
      cne_estado: body.cne_estado,
      cne_municipio: body.cne_municipio,
      cne_parroquia: body.cne_parroquia,
    };

    const { data, error } = await supabase.rpc('create_offline_patient', {
      payload,
    });

    if (error) {
      // Map RPC errors to friendly status codes.
      const sqlState = (error as { code?: string }).code;
      const message = error.message ?? 'No pudimos registrar al paciente.';

      if (sqlState === '42501') {
        return NextResponse.json(
          { error: true, message: 'Solo médicos pueden registrar pacientes.' },
          { status: 403 },
        );
      }
      if (sqlState === '23502' || sqlState === '23514') {
        return NextResponse.json(
          { error: true, message },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: true, message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      error: false,
      data: { offline_patient_id: data as string },
    });
  } catch (error) {
    console.error('[patients] error', error);
    return NextResponse.json(
      { error: true, message: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
