import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Insurance Claim Detail — BFF API Route
// -------------------------------------------------------------------
// GET:   Returns a single claim with insurance info.
// PATCH: Submits a draft claim (transitions status to 'submitted').
// Both handlers require authentication and verify ownership.
// -------------------------------------------------------------------

// --- GET: Single claim detail ---

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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión para continuar.' },
        { status: 401 },
      );
    }

    const { data: claim, error } = await supabase
      .from('insurance_claims')
      .select('*, insurance:patient_insurance(*)')
      .eq('id', id)
      .eq('patient_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Reclamo no encontrado.' },
          { status: 404 },
        );
      }
      console.error('[Insurance Claim Detail GET] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener el reclamo.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: claim });
  } catch (error) {
    console.error('[Insurance Claim Detail GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

// --- PATCH: Submit a draft claim ---

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión para continuar.' },
        { status: 401 },
      );
    }

    // Verify the claim belongs to the patient and is in draft status
    const { data: existing, error: fetchError } = await supabase
      .from('insurance_claims')
      .select('id, status')
      .eq('id', id)
      .eq('patient_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Reclamo no encontrado.' },
          { status: 404 },
        );
      }
      console.error('[Insurance Claim Detail PATCH] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Error al verificar el reclamo.' },
        { status: 500 },
      );
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden enviar reclamos en estado borrador.' },
        { status: 400 },
      );
    }

    const { data: claim, error: updateError } = await supabase
      .from('insurance_claims')
      .update({
        status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('patient_id', user.id)
      .select('*, insurance:patient_insurance(*)')
      .single();

    if (updateError) {
      console.error('[Insurance Claim Detail PATCH] Update error:', updateError);
      return NextResponse.json(
        { error: 'Error al enviar el reclamo.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: claim });
  } catch (error) {
    console.error('[Insurance Claim Detail PATCH] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
