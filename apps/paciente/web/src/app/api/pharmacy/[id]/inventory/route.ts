import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Pharmacy Inventory — BFF API Route
// -------------------------------------------------------------------
// Returns the inventory for a specific pharmacy.
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

    const { data: inventory, error } = await supabase
      .from('pharmacy_inventory')
      .select('*')
      .eq('pharmacy_id', id);

    if (error) {
      console.error('[Pharmacy Inventory] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener el inventario.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: inventory ?? [] });
  } catch (error) {
    console.error('[Pharmacy Inventory] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
