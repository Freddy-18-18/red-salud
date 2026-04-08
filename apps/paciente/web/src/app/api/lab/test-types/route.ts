import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Lab Test Types Catalog — BFF API Route
// -------------------------------------------------------------------
// Returns the full catalog of available lab test types.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'public');
    if (limited) return limited;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('lab_test_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Lab Test Types] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener tipos de exámenes.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[Lab Test Types] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
