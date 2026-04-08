import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Pharmacy Order Detail — BFF API Route
// -------------------------------------------------------------------
// Returns a single pharmacy order with pharmacy info.
// Auth required — verifies the order belongs to the patient.
// -------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: order, error } = await supabase
      .from('pharmacy_orders')
      .select(
        `
        *,
        pharmacy:profiles!pharmacy_orders_pharmacy_id_fkey(id, full_name, avatar_url)
      `,
      )
      .eq('id', id)
      .eq('patient_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Pedido no encontrado.' },
          { status: 404 },
        );
      }
      console.error('[Pharmacy Order Detail] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener el pedido.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('[Pharmacy Order Detail] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
