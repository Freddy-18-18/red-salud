import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Patient payment method — update / delete
// -------------------------------------------------------------------
// Most common UPDATE: flip `is_default`. The DB trigger
// `demote_other_payment_methods` handles demoting whatever was previously
// default, so the route just needs to pass the flag.
// -------------------------------------------------------------------

const updateSchema = z
  .object({
    label: z.string().trim().min(1).max(80).optional(),
    is_default: z.boolean().optional(),
    card_last_four: z
      .string()
      .regex(/^\d{4}$/)
      .optional()
      .nullable(),
    card_brand: z.string().trim().max(40).optional().nullable(),
    pago_movil_bank_code: z.string().trim().max(8).optional().nullable(),
    pago_movil_phone: z.string().trim().max(30).optional().nullable(),
    pago_movil_cedula: z.string().trim().max(20).optional().nullable(),
    bank_name: z.string().trim().max(80).optional().nullable(),
    account_last_four: z
      .string()
      .regex(/^\d{1,6}$/)
      .optional()
      .nullable(),
    zelle_email: z.string().trim().email().optional().nullable(),
  })
  .refine(
    (d) => Object.values(d).some((v) => v !== undefined),
    { message: 'Debes enviar al menos un campo.' },
  );

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('patient_payment_methods')
      .update(parsed.data)
      .eq('id', id)
      // RLS already filters by patient_id, but the explicit filter avoids a
      // round-trip on a row that doesn't belong to the user.
      .eq('patient_id', user.id)
      .select()
      .single();

    if (error) {
      if ((error as { code?: string }).code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Método no encontrado.' },
          { status: 404 },
        );
      }
      console.error('[PaymentMethod PATCH]', error);
      return NextResponse.json(
        { error: 'No pudimos actualizar el método.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[PaymentMethod PATCH] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('patient_payment_methods')
      .delete()
      .eq('id', id)
      .eq('patient_id', user.id);

    if (error) {
      console.error('[PaymentMethod DELETE]', error);
      return NextResponse.json(
        { error: 'No pudimos eliminar el método.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: null });
  } catch (error) {
    console.error('[PaymentMethod DELETE] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
