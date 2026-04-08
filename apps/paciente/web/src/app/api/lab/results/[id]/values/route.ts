import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Lab Result Values — BFF API Route
// -------------------------------------------------------------------
// Returns all parameter values for a specific lab result.
// Auth required — RLS enforces patient ownership at DB level.
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

    const { data, error } = await supabase
      .from('lab_result_values')
      .select('*')
      .eq('result_id', id)
      .order('parameter_name', { ascending: true });

    if (error) {
      console.error('[Lab Result Values] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener valores del resultado.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[Lab Result Values] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
