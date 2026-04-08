import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Latest Lab Results — BFF API Route
// -------------------------------------------------------------------
// Returns the most recent lab results across all orders for the
// authenticated patient. Includes test type info, result values,
// and parent order metadata.
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
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') ?? '10', 10) || 10, 1),
      100,
    );

    const { data, error } = await supabase
      .from('lab_results')
      .select(
        `
        *,
        test_type:lab_test_types(id, name, description),
        values:lab_result_values(*),
        order:lab_orders!inner(patient_id, order_number, ordered_at)
      `,
      )
      .eq('order.patient_id', user.id)
      .order('result_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Latest Lab Results] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener últimos resultados.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[Latest Lab Results] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
