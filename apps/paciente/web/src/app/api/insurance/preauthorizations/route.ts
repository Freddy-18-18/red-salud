import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { validateBody } from '@/lib/validation/validate';
import { createPreauthorizationSchema } from '@/lib/validation/schemas';

// -------------------------------------------------------------------
// Insurance Preauthorizations — BFF API Route
// -------------------------------------------------------------------
// GET:  List the authenticated patient's preauthorizations.
// POST: Create a new preauthorization request.
// Both handlers require authentication.
// -------------------------------------------------------------------

// --- GET: List patient's preauthorizations ---

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

    const { data: preauthorizations, error } = await supabase
      .from('insurance_preauthorizations')
      .select('*, insurance:patient_insurance(*)')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Insurance Preauthorizations GET] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener preautorizaciones.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: preauthorizations ?? [] });
  } catch (error) {
    console.error('[Insurance Preauthorizations GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

// --- POST: Create preauthorization request ---

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

    const validation = validateBody(createPreauthorizationSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    const { data: preauth, error: insertError } = await supabase
      .from('insurance_preauthorizations')
      .insert({
        patient_id: user.id,
        insurance_id: data.insurance_id,
        appointment_id: data.appointment_id ?? null,
        procedure_code: data.procedure_code,
        procedure_description: data.procedure_description,
        estimated_cost: data.estimated_cost,
        covered_amount: 0,
        copay_amount: 0,
        status: 'pending',
      })
      .select('*, insurance:patient_insurance(*)')
      .single();

    if (insertError) {
      console.error('[Insurance Preauthorizations POST] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Error al crear la preautorización.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: preauth }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Solicitud inválida. Verifica los datos enviados.' },
        { status: 400 },
      );
    }
    console.error('[Insurance Preauthorizations POST] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
