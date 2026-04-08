import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Monitored Lab Parameters — BFF API Route
// -------------------------------------------------------------------
// Returns all lab parameters the patient has data for, with the
// latest value for each. Used for the health dashboard "monitored
// parameters" panel. Deduplicates by parameter_name keeping the
// most recent result.
// Auth required — filters by authenticated patient.
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

    const { data, error } = await supabase
      .from('lab_result_values')
      .select(
        `
        *,
        result:lab_results!inner(
          result_at,
          order:lab_orders!inner(patient_id)
        )
      `,
      )
      .eq('result.order.patient_id', user.id)
      .order('result(result_at)', { ascending: false });

    if (error) {
      console.error('[Monitored Parameters] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener parámetros monitoreados.' },
        { status: 500 },
      );
    }

    // Deduplicate by parameter_name — keep the latest (first) occurrence
    const seen = new Set<string>();
    const deduplicated = (data ?? []).filter((row) => {
      if (seen.has(row.parameter_name)) return false;
      seen.add(row.parameter_name);
      return true;
    });

    return NextResponse.json({ data: deduplicated });
  } catch (error) {
    console.error('[Monitored Parameters] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
