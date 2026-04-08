import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Pharmacy Detail — BFF API Route
// -------------------------------------------------------------------
// Returns a single pharmacy's full details.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'public');
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();

    const { data: pharmacy, error } = await supabase
      .from('pharmacy_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Farmacia no encontrada.' },
          { status: 404 },
        );
      }
      console.error('[Pharmacy Detail] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener la farmacia.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: pharmacy });
  } catch (error) {
    console.error('[Pharmacy Detail] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
