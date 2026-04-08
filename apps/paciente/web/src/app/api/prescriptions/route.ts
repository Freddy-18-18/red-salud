import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Prescriptions List — BFF API Route
// -------------------------------------------------------------------
// Lists the authenticated patient's prescriptions with doctor info
// and medication details. Optionally filters by status.
// Auth required — patient sees only their own prescriptions.
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
    const status = searchParams.get('status');

    let query = supabase
      .from('prescriptions')
      .select(
        `
        *,
        doctor:profiles!prescriptions_doctor_id_fkey(id, full_name, avatar_url),
        medications:prescription_medications(*)
      `,
      )
      .eq('patient_id', user.id)
      .order('prescribed_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: prescriptions, error } = await query;

    if (error) {
      console.error('[Prescriptions] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener recetas.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: prescriptions ?? [] });
  } catch (error) {
    console.error('[Prescriptions] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
