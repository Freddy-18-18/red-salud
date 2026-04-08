import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Pharmacy Search — BFF API Route
// -------------------------------------------------------------------
// Searches active pharmacies by name and/or city.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'search');
    if (limited) return limited;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const city = searchParams.get('city');
    const name = searchParams.get('name');

    let query = supabase
      .from('pharmacy_details')
      .select(
        'id, name, address, phone, logo_url, rating, review_count, lat, lng, opening_hours',
      )
      .eq('is_active', true);

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    const { data: pharmacies, error } = await query;

    if (error) {
      console.error('[Pharmacy Search] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al buscar farmacias.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: pharmacies ?? [] });
  } catch (error) {
    console.error('[Pharmacy Search] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
