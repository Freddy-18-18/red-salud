import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validation/validate';
import { createPriceAlertSchema } from '@/lib/validation/schemas';

// -------------------------------------------------------------------
// Pharmacy Price Alerts — BFF API Route
// -------------------------------------------------------------------
// GET: List the patient's active price alerts.
// POST: Create a new price alert for a medication.
// Auth required — patient sees only their own alerts.
// -------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: alerts, error } = await supabase
      .from('pharmacy_price_alerts')
      .select('*')
      .eq('patient_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Price Alerts] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener alertas de precio.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: alerts ?? [] });
  } catch (error) {
    console.error('[Price Alerts] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const validation = validateBody(createPriceAlertSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // Check for duplicate alert (same patient + medication + active)
    const { data: existing } = await supabase
      .from('pharmacy_price_alerts')
      .select('id')
      .eq('patient_id', user.id)
      .eq('medication_name', data.medication_name)
      .eq('active', true)
      .maybeSingle();

    if (existing) {
      // Update existing alert instead of creating duplicate
      const { data: updated, error: updateError } = await supabase
        .from('pharmacy_price_alerts')
        .update({
          target_price_usd: data.target_price_usd,
          prescription_id: data.prescription_id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('[Price Alerts] Update error:', updateError);
        return NextResponse.json(
          { error: 'Error al actualizar alerta.' },
          { status: 500 },
        );
      }

      return NextResponse.json({ data: updated });
    }

    // Create new alert
    const { data: alert, error } = await supabase
      .from('pharmacy_price_alerts')
      .insert({
        patient_id: user.id,
        medication_name: data.medication_name,
        target_price_usd: data.target_price_usd,
        prescription_id: data.prescription_id ?? null,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[Price Alerts] Insert error:', error);
      return NextResponse.json(
        { error: 'Error al crear alerta de precio.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: alert }, { status: 201 });
  } catch (error) {
    console.error('[Price Alerts] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
