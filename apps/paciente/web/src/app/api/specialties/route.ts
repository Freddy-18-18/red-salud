import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Medical Specialties — BFF API Route
// -------------------------------------------------------------------
// Lists all medical specialties. Optionally filters to only those
// that have at least one verified doctor.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------
//
// Schema notes (post Phase A5.5 migration):
// - Live source of truth: `doctor_profiles` (NOT the legacy `doctor_details`).
// - Specialty catalog: `specialties` (NOT `medical_specialties`).
// - Doctor activity flag: `verified` (NOT the legacy `is_active`).

export async function GET(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, 'public');
    if (limited) return limited;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const withDoctors = searchParams.get('with_doctors') === 'true';

    if (withDoctors) {
      // Specialties that have at least one verified doctor.
      const { data: doctorSpecialties, error: dsError } = await supabase
        .from('doctor_profiles')
        .select('specialty_id')
        .eq('verified', true);

      if (dsError) {
        console.error('[Specialties] Error fetching doctor specialties:', dsError);
        return NextResponse.json(
          { error: 'Error al obtener especialidades.' },
          { status: 500 },
        );
      }

      const uniqueIds = [
        ...new Set(
          (doctorSpecialties ?? [])
            .map((d) => d.specialty_id)
            .filter(Boolean),
        ),
      ];

      if (uniqueIds.length === 0) {
        return NextResponse.json({ data: [] });
      }

      const { data: specialties, error } = await supabase
        .from('specialties')
        .select('id, name, icon, description')
        .in('id', uniqueIds)
        .order('name', { ascending: true });

      if (error) {
        console.error('[Specialties] Supabase error:', error);
        return NextResponse.json(
          { error: 'Error al obtener especialidades.' },
          { status: 500 },
        );
      }

      return NextResponse.json({ data: specialties ?? [] });
    }

    // Default: return all specialties + the count of verified doctors per
    // specialty so the booking UI can flag "Próximamente" specialties without
    // a second round-trip. Two queries keeps this simple — joining count via
    // PostgREST is awkward on a many-to-one relation.
    const [{ data: specialties, error }, { data: doctorCounts, error: countErr }] =
      await Promise.all([
        supabase
          .from('specialties')
          .select('id, name, icon, description')
          .order('name', { ascending: true }),
        supabase
          .from('doctor_profiles')
          .select('specialty_id')
          .eq('verified', true),
      ]);

    if (error) {
      console.error('[Specialties] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener especialidades.' },
        { status: 500 },
      );
    }

    if (countErr) {
      // Non-fatal: log it and ship counts as zero everywhere. The UI will
      // just show every specialty as "Próximamente", which is recoverable
      // when the next request succeeds.
      console.error('[Specialties] Doctor count error (non-fatal):', countErr);
    }

    const counts = new Map<string, number>();
    for (const row of doctorCounts ?? []) {
      const id = row.specialty_id as string | null;
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    const enriched = (specialties ?? []).map((s) => ({
      ...s,
      doctor_count: counts.get(s.id as string) ?? 0,
    }));

    return NextResponse.json({ data: enriched });
  } catch (error) {
    console.error('[Specialties] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
