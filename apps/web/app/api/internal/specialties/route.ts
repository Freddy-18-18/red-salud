// ============================================
// INTERNAL API: Specialties
// Protected endpoint for Corporativo desktop app communication
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Validate internal API key from request headers
 */
function validateApiKey(request: NextRequest): boolean {
  if (!INTERNAL_API_KEY) return false;
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  return apiKey === INTERNAL_API_KEY;
}

/**
 * GET /api/internal/specialties
 *
 * Returns all specialties with doctor counts and active status.
 * Supports query params:
 * - ?active=true|false — filter by active status
 * - ?category=<categoryId> — filter by category
 * - ?search=<term> — search by name or slug
 * - ?limit=<n> — limit results (default: 200)
 * - ?offset=<n> — offset for pagination (default: 0)
 */
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { searchParams } = new URL(request.url);

  const active = searchParams.get("active");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") || "200"), 1000);
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("specialties")
    .select(
      `
      id,
      name,
      slug,
      description,
      icon,
      created_at
    `,
      { count: "exact" }
    )
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data: specialties, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch specialties", details: error.message },
      { status: 500 }
    );
  }

  // Get doctor counts per specialty
  const { data: doctorCounts } = await supabase
    .from("profiles")
    .select("specialty_id")
    .eq("role", "medico")
    .not("specialty_id", "is", null);

  const countMap: Record<string, number> = {};
  for (const row of doctorCounts || []) {
    const id = row.specialty_id as string;
    countMap[id] = (countMap[id] || 0) + 1;
  }

  const enriched = (specialties || []).map((s) => ({
    ...s,
    doctorCount: countMap[s.id] || 0,
  }));

  return NextResponse.json({
    data: enriched,
    total: count,
    limit,
    offset,
  });
}

/**
 * PATCH /api/internal/specialties
 *
 * Update a specialty by slug.
 * Body: { slug: string, updates: { description?: string, icon?: string } }
 */
export async function PATCH(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let body: { slug?: string; updates?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.slug || !body.updates) {
    return NextResponse.json(
      { error: "Missing required fields: slug, updates" },
      { status: 400 }
    );
  }

  // Only allow safe fields to be updated
  const allowedFields = ["description", "icon"];
  const safeUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body.updates)) {
    if (allowedFields.includes(key)) {
      safeUpdates[key] = value;
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json(
      {
        error: "No valid fields to update",
        allowedFields,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("specialties")
    .update(safeUpdates)
    .eq("slug", body.slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update specialty", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
