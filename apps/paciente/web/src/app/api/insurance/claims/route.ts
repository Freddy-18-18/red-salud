import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { validateBody } from '@/lib/validation/validate';
import { createClaimSchema } from '@/lib/validation/schemas';

// -------------------------------------------------------------------
// Insurance Claims — BFF API Route
// -------------------------------------------------------------------
// GET:  List the authenticated patient's insurance claims.
// POST: Create a new claim draft for the authenticated patient.
// Both handlers require authentication.
// -------------------------------------------------------------------

// --- GET: List patient's claims ---

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

    const { data: claims, error } = await supabase
      .from('insurance_claims')
      .select('*, insurance:patient_insurance(*)')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Insurance Claims GET] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener reclamos de seguro.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: claims ?? [] });
  } catch (error) {
    console.error('[Insurance Claims GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

// --- POST: Create claim draft ---

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

    const validation = validateBody(createClaimSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    const { data: claim, error: insertError } = await supabase
      .from('insurance_claims')
      .insert({
        patient_id: user.id,
        insurance_id: data.insurance_id,
        appointment_id: data.appointment_id ?? null,
        claim_type: data.claim_type,
        total_amount: data.total_amount,
        covered_amount: 0,
        patient_responsibility: data.total_amount,
        status: 'draft',
      })
      .select('*, insurance:patient_insurance(*)')
      .single();

    if (insertError) {
      console.error('[Insurance Claims POST] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Error al crear el reclamo.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: claim }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Solicitud inválida. Verifica los datos enviados.' },
        { status: 400 },
      );
    }
    console.error('[Insurance Claims POST] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
