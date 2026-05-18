import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Patient saved payment methods — list / create
// -------------------------------------------------------------------
// RLS scopes everything to auth.uid(), so we don't filter by patient_id
// explicitly in the SELECT — the policy does it for us. The INSERT does
// supply patient_id because RLS WITH CHECK requires it.
// -------------------------------------------------------------------

const PAYMENT_METHOD_TYPES = [
  'pago_movil',
  'transferencia',
  'efectivo',
  'zelle',
  'tarjeta_credito',
  'tarjeta_debito',
] as const;

const baseSchema = z.object({
  type: z.enum(PAYMENT_METHOD_TYPES),
  label: z.string().trim().min(1).max(80),
  is_default: z.boolean().optional().default(false),

  card_last_four: z
    .string()
    .regex(/^\d{4}$/, 'Cuatro dígitos exactos')
    .optional()
    .nullable(),
  card_brand: z.string().trim().max(40).optional().nullable(),

  pago_movil_bank_code: z.string().trim().max(8).optional().nullable(),
  pago_movil_phone: z.string().trim().max(30).optional().nullable(),
  pago_movil_cedula: z.string().trim().max(20).optional().nullable(),

  bank_name: z.string().trim().max(80).optional().nullable(),
  account_last_four: z
    .string()
    .regex(/^\d{1,6}$/, 'Hasta 6 dígitos')
    .optional()
    .nullable(),

  zelle_email: z
    .string()
    .trim()
    .email('Email inválido')
    .optional()
    .nullable(),
});

const createSchema = baseSchema.superRefine((data, ctx) => {
  // Per-type required-field rules. Patients can leave whatever they want
  // empty if they only use the method as a quick label, but for the most
  // common channels we ask for at least the identifying field.
  if (data.type === 'pago_movil' && !data.pago_movil_phone?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pago_movil_phone'],
      message: 'Teléfono requerido para Pago Móvil',
    });
  }
  if (data.type === 'zelle' && !data.zelle_email?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['zelle_email'],
      message: 'Email requerido para Zelle',
    });
  }
  if (
    (data.type === 'tarjeta_credito' || data.type === 'tarjeta_debito') &&
    !data.card_last_four
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['card_last_four'],
      message: 'Últimos 4 dígitos de la tarjeta',
    });
  }
});

export async function GET(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('patient_payment_methods')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PaymentMethods GET]', error);
      return NextResponse.json(
        { error: 'No pudimos cargar tus métodos.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[PaymentMethods GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('patient_payment_methods')
      .insert({ ...parsed.data, patient_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('[PaymentMethods POST]', error);
      return NextResponse.json(
        { error: 'No pudimos guardar el método.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[PaymentMethods POST] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
