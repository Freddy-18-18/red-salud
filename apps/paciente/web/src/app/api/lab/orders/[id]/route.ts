import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Lab Order Detail — BFF API Route
// -------------------------------------------------------------------
// Returns a single lab order with its tests and associated results
// (including result values). Auth required — patient must own the order.
// -------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    // Fetch the order with doctor info and ordered tests
    const { data: order, error: orderError } = await supabase
      .from('lab_orders')
      .select(
        `
        *,
        doctor:profiles!lab_orders_doctor_id_fkey(full_name, avatar_url),
        tests:lab_order_tests(*, test_type:lab_test_types(id, name, description, reference_price))
      `,
      )
      .eq('id', id)
      .eq('patient_id', user.id)
      .single();

    if (orderError) {
      console.error('[Lab Order Detail] Order error:', orderError);

      if (orderError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Orden de laboratorio no encontrada.' },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: 'Error al obtener la orden de laboratorio.' },
        { status: 500 },
      );
    }

    // Fetch results for this order
    const { data: results, error: resultsError } = await supabase
      .from('lab_results')
      .select(
        `
        *,
        test_type:lab_test_types(id, name, description),
        values:lab_result_values(*)
      `,
      )
      .eq('order_id', id)
      .order('result_at', { ascending: false });

    if (resultsError) {
      console.error('[Lab Order Detail] Results error:', resultsError);
      return NextResponse.json(
        { error: 'Error al obtener resultados de laboratorio.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        order,
        results: results ?? [],
      },
    });
  } catch (error) {
    console.error('[Lab Order Detail] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
