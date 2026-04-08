import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// -------------------------------------------------------------------
// Single Price Alert — BFF API Route
// -------------------------------------------------------------------
// DELETE: Deactivate a price alert (soft delete).
// Auth required — patient must own the alert.
// -------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la alerta.' },
        { status: 400 },
      );
    }

    // Verify the alert belongs to the patient
    const { data: alert, error: fetchError } = await supabase
      .from('pharmacy_price_alerts')
      .select('id')
      .eq('id', id)
      .eq('patient_id', user.id)
      .single();

    if (fetchError || !alert) {
      return NextResponse.json(
        { error: 'Alerta no encontrada.' },
        { status: 404 },
      );
    }

    // Soft delete: set active = false
    const { error: deleteError } = await supabase
      .from('pharmacy_price_alerts')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) {
      console.error('[Price Alert Delete] Supabase error:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar la alerta.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('[Price Alert Delete] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
