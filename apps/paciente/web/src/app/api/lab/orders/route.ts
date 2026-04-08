import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Lab Orders — BFF API Route
// -------------------------------------------------------------------
// Lists the authenticated patient's lab orders with doctor info and
// ordered tests. Supports filtering by status and date range.
// Supports count_only=true for lightweight totals.
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
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const countOnly = searchParams.get('count_only') === 'true';

    // Count-only mode — lightweight head request
    if (countOnly) {
      let countQuery = supabase
        .from('lab_orders')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id);

      if (status) countQuery = countQuery.eq('status', status);
      if (from) countQuery = countQuery.gte('ordered_at', from);
      if (to) countQuery = countQuery.lte('ordered_at', to);

      const { count, error } = await countQuery;

      if (error) {
        console.error('[Lab Orders] Count error:', error);
        return NextResponse.json(
          { error: 'Error al contar órdenes de laboratorio.' },
          { status: 500 },
        );
      }

      return NextResponse.json({ count: count ?? 0 });
    }

    // Full data mode
    let query = supabase
      .from('lab_orders')
      .select(
        `
        *,
        doctor:profiles!lab_orders_doctor_id_fkey(id, full_name, avatar_url),
        tests:lab_order_tests(*, test_type:lab_test_types(id, name, description))
      `,
      )
      .eq('patient_id', user.id);

    if (status) query = query.eq('status', status);
    if (from) query = query.gte('ordered_at', from);
    if (to) query = query.lte('ordered_at', to);

    query = query.order('ordered_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('[Lab Orders] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener órdenes de laboratorio.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[Lab Orders] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
