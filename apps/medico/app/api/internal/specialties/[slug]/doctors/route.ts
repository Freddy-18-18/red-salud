// ============================================
// INTERNAL API: Doctors by Specialty
// GET /api/internal/specialties/[slug]/doctors
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function validateApiKey(request: NextRequest): boolean {
  if (!INTERNAL_API_KEY) return false;
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  return apiKey === INTERNAL_API_KEY;
}

/**
 * GET /api/internal/specialties/[slug]/doctors
 *
 * Returns all doctors registered under a specialty.
 * Query params:
 * - ?limit=<n> — limit results (default: 50)
 * - ?offset=<n> — offset for pagination
 * - ?verified=true|false — filter by SACS verification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { searchParams } = new URL(request.url);

  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");
  const verified = searchParams.get("verified");

  // First, get the specialty ID from slug
  const { data: specialty, error: specError } = await supabase
    .from("specialties")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (specError || !specialty) {
    return NextResponse.json(
      { error: `Specialty not found: ${slug}` },
      { status: 404 }
    );
  }

  // Build doctor query
  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      phone,
      cedula,
      cedula_verificada,
      sacs_verificado,
      sacs_especialidad,
      sacs_matricula,
      avatar_url,
      created_at
    `,
      { count: "exact" }
    )
    .eq("role", "medico")
    .eq("specialty_id", specialty.id)
    .order("full_name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (verified === "true") {
    query = query.eq("sacs_verificado", true);
  } else if (verified === "false") {
    query = query.or("sacs_verificado.is.null,sacs_verificado.eq.false");
  }

  const { data: doctors, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch doctors", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    specialty: {
      id: specialty.id,
      name: specialty.name,
      slug: specialty.slug,
    },
    data: doctors,
    total: count,
    limit,
    offset,
  });
}
