import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Prescription Fulfillment Compare — BFF API Route
// -------------------------------------------------------------------
// Returns fulfillment options for a prescription, ordered by price.
// Auth required — patient must own the prescription.
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

    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('prescription_id');

    if (!prescriptionId) {
      return NextResponse.json(
        { error: 'Se requiere prescription_id.' },
        { status: 400 },
      );
    }

    // Verify the prescription belongs to the patient
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('id', prescriptionId)
      .eq('patient_id', user.id)
      .single();

    if (prescriptionError || !prescription) {
      return NextResponse.json(
        { error: 'Receta no encontrada.' },
        { status: 404 },
      );
    }

    const { data: options, error } = await supabase
      .from('prescription_fulfillment_options')
      .select('*')
      .eq('prescription_id', prescriptionId)
      .order('price', { ascending: true });

    if (error) {
      console.error('[Pharmacy Compare] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener opciones de surtido.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: options ?? [] });
  } catch (error) {
    console.error('[Pharmacy Compare] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
