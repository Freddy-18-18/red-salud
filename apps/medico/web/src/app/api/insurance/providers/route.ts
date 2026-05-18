import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/insurance/providers
 *
 * Returns the active insurance providers catalog (ordered by name).
 * Auth required (any authenticated user) — the catalog is shared across
 * the platform but we don't expose it to anonymous traffic.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: 'No autenticado.' },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from('insurance_providers')
      .select('id, name, slug, website, hcm_supported')
      .eq('active', true)
      .order('name');

    if (error) {
      return NextResponse.json(
        { error: true, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: false, data: data ?? [] });
  } catch (err) {
    console.error('[insurance/providers] error', err);
    return NextResponse.json(
      { error: true, message: 'Error interno' },
      { status: 500 },
    );
  }
}
