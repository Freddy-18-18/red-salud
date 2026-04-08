import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { validateBody } from '@/lib/validation/validate';
import { createPharmacyOrderSchema } from '@/lib/validation/schemas';

// -------------------------------------------------------------------
// Pharmacy Orders — BFF API Route
// -------------------------------------------------------------------
// GET:  Lists the authenticated patient's pharmacy orders.
// POST: Creates a new pharmacy order.
// Auth required — patient sees only their own orders.
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

    const { data: orders, error } = await supabase
      .from('pharmacy_orders')
      .select(
        `
        *,
        pharmacy:profiles!pharmacy_orders_pharmacy_id_fkey(id, full_name, avatar_url)
      `,
      )
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Pharmacy Orders] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener pedidos.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: orders ?? [] });
  } catch (error) {
    console.error('[Pharmacy Orders] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    const validation = validateBody(createPharmacyOrderSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    const { data: order, error } = await supabase
      .from('pharmacy_orders')
      .insert({
        patient_id: user.id,
        pharmacy_id: data.pharmacy_id,
        prescription_id: data.prescription_id,
        items: data.items,
        total_bs: data.total_bs,
        delivery_type: data.delivery_type,
        payment_method: data.payment_method,
        delivery_address: data.delivery_address ?? null,
        payment_reference: data.payment_reference ?? null,
        notes: data.notes ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[Pharmacy Orders] Insert error:', error);
      return NextResponse.json(
        { error: 'Error al crear el pedido.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error('[Pharmacy Orders] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
