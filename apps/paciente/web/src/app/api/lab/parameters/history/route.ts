import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Lab Parameter History — BFF API Route
// -------------------------------------------------------------------
// Returns historical values for a specific lab parameter over time.
// Used to render trend charts (e.g., glucose, hemoglobin).
// Auth required — filters by authenticated patient.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parameterName = searchParams.get('parameter_name');
    const since = searchParams.get('since');

    if (!parameterName) {
      return NextResponse.json(
        { error: 'El parámetro parameter_name es requerido.' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('lab_result_values')
      .select(
        `
        *,
        result:lab_results!inner(
          result_at,
          order:lab_orders!inner(patient_id)
        )
      `,
      )
      .eq('parameter_name', parameterName)
      .eq('result.order.patient_id', user.id);

    if (since) {
      query = query.gte('result.result_at', since);
    }

    query = query.order('result(result_at)', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[Lab Parameter History] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener historial del parámetro.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[Lab Parameter History] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
