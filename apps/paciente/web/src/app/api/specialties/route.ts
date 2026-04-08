import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Medical Specialties — BFF API Route
// -------------------------------------------------------------------
// Lists all medical specialties. Optionally filters to only those
// that have at least one active, verified doctor.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'public');
    if (limited) return limited;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const withDoctors = searchParams.get('with_doctors') === 'true';

    if (withDoctors) {
      // Fetch specialties that have at least one active doctor
      // We query doctor_details to get distinct specialty IDs, then
      // fetch those specialties.
      const { data: doctorSpecialties, error: dsError } = await supabase
        .from('doctor_details')
        .select('specialty_id')
        .eq('is_active', true);

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
        .from('medical_specialties')
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
      .from('medical_specialties')
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
