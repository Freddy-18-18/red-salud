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

    // Default: return all specialties
    const { data: specialties, error } = await supabase
      .from('specialties')
      .select('id, name, icon, description')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Specialties] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener especialidades.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: specialties ?? [] });
  } catch (error) {
    console.error('[Specialties] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
