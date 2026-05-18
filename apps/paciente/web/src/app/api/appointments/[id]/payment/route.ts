import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Appointment payment registration — POST
// -------------------------------------------------------------------
// Records the patient's payment intent: method (pago móvil, transferencia,
// efectivo, etc.) + reference number. The doctor side verifies the payment
// and flips the appointment status. We store both:
//   - A row in `payments` (full audit trail with USD/Bs at the BCV rate)
//   - `appointments.payment_method` / `appointments.payment_status` updated
//
// Status semantics:
//   - 'pending'   → patient hasn't paid
//   - 'processing' → patient registered a payment, doctor must confirm
//   - 'paid'       → doctor confirmed (medico app territory)
// -------------------------------------------------------------------

const PAYMENT_METHODS = [
  'pago_movil',
  'transferencia',
  'efectivo',
  'zelle',
  'tarjeta_credito',
  'tarjeta_debito',
] as const;

const bodySchema = z
  .object({
    method: z.enum(PAYMENT_METHODS),
    reference_number: z.string().trim().max(120).optional().nullable(),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .superRefine((d, ctx) => {
    // Cash payments don't need a reference — every other method does.
    if (d.method !== 'efectivo' && !d.reference_number?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reference_number'],
        message: 'Ingresá la referencia o número de operación.',
      });
    }
  });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const { id: appointmentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
        },
        { status: 400 },
      );
    }
    const { method, reference_number, notes } = parsed.data;

    const { data: appt, error: aptError } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id, price, payment_status, status')
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (aptError || !appt) {
      return NextResponse.json(
        { error: 'Cita no encontrada.' },
        { status: 404 },
      );
    }
    if (appt.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'Cita no encontrada.' },
        { status: 404 },
      );
    }
    if (appt.status === 'cancelled') {
      return NextResponse.json(
        { error: 'No puedes pagar una cita cancelada.' },
        { status: 400 },
      );
    }
    if (appt.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Esta cita ya está pagada.' },
        { status: 400 },
      );
    }
    const priceUsd = Number(appt.price ?? 0);
    if (!(priceUsd > 0)) {
      return NextResponse.json(
        { error: 'Esta cita no tiene un monto definido.' },
        { status: 400 },
      );
    }

    // BCV exchange rate at registration time. We snapshot it on the payment
    // row so audits don't depend on the live rate moving later.
    const { data: bcvRate } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('source', 'BCV')
      .eq('currency', 'USD')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const exchangeRate = Number(bcvRate?.rate ?? 0) || 1;
    const amountBs = +(priceUsd * exchangeRate).toFixed(2);

    // 1. Create the audit row in `payments`. The table is bank-transfer
    //    shaped (amount + currency + exchange_rate + reference_number) — we
    //    persist the USD amount as the canonical figure with currency='USD',
    //    and snapshot the BCV rate so the historial can render Bs without
    //    re-querying. The status enum is `pending | approved | rejected` —
    //    we default to 'pending' (doctor confirms via the medico app).
    const { data: paymentRow, error: paymentInsertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: priceUsd,
        currency: 'USD',
        exchange_rate: exchangeRate,
        reference_number: reference_number ?? `${method}-${Date.now()}`,
        bank_origin: method === 'efectivo' ? null : (notes ?? null),
        payment_method: method,
        payment_type: 'consulta',
        description: 'Pago anticipado de consulta',
        appointment_id: appointmentId,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentInsertError) {
      console.error('[Payment] insert error:', paymentInsertError);
      return NextResponse.json(
        { error: 'No pudimos registrar el pago. Intentá de nuevo.' },
        { status: 500 },
      );
    }

    // 2. Stamp the appointment so the medico app and the patient detail
    //    surface the in-progress state. The doctor confirms later from
    //    their side, which flips status to 'paid'.
    const { error: aptUpdateError } = await supabase
      .from('appointments')
      .update({
        payment_method: method,
        payment_status: 'processing',
        ...(notes
          ? {
              notes:
                appt.payment_status === 'paid' || !appt.payment_status
                  ? notes
                  : notes,
            }
          : {}),
      })
      .eq('id', appointmentId);

    if (aptUpdateError) {
      console.error('[Payment] appointment update error:', aptUpdateError);
      // Non-fatal: the payment row is the source of truth, the medico app
      // can still read it. Surface a soft warning.
    }

    return NextResponse.json({
      data: {
        payment_id: paymentRow.id,
        amount_usd: priceUsd,
        amount_bs: amountBs,
        exchange_rate: exchangeRate,
        status: 'processing',
      },
    });
  } catch (error) {
    console.error('[Payment] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
