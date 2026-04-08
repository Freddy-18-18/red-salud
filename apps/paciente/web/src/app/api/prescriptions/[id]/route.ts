import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Prescription Detail — BFF API Route
// -------------------------------------------------------------------
// Returns a single prescription with doctor info and medications.
// Auth required — verifies the prescription belongs to the patient.
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

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .select(
        `
        *,
        doctor:profiles!prescriptions_doctor_id_fkey(id, full_name, avatar_url),
        medications:prescription_medications(*)
      `,
      )
      .eq('id', id)
      .eq('patient_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Receta no encontrada.' },
          { status: 404 },
        );
      }
      console.error('[Prescription Detail] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener la receta.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: prescription });
  } catch (error) {
    console.error('[Prescription Detail] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
