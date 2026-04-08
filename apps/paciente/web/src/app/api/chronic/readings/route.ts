import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { logReadingSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Chronic Readings — BFF API Route
// -------------------------------------------------------------------
// GET:  List readings for a condition, with date range filter.
// POST: Log a new reading.
// Auth required — patient sees only their own data.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, "authenticated");
    if (limited) return limited;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const conditionId = searchParams.get("condition_id");
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(
      500,
      Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)),
    );

    let query = supabase
      .from("chronic_readings")
      .select("*")
      .eq("patient_id", user.id)
      .order("measured_at", { ascending: true });

    if (conditionId) {
      query = query.eq("condition_id", conditionId);
    }

    if (type) {
      query = query.eq("reading_type", type);
    }

    if (from) {
      query = query.gte("measured_at", from);
    }

    if (to) {
      query = query.lte("measured_at", to);
    }

    query = query.limit(limit);

    const { data: readings, error } = await query;

    if (error) {
      console.error("[Chronic Readings GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener lecturas." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: readings ?? [] });
  } catch (error) {
    console.error("[Chronic Readings GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- POST: Log new reading ---

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, "mutation");
    if (limited) return limited;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const validation = validateBody(logReadingSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // Verify condition belongs to patient
    const { data: condition } = await supabase
      .from("patient_chronic_conditions")
      .select("id")
      .eq("id", data.condition_id)
      .eq("patient_id", user.id)
      .eq("is_active", true)
      .single();

    if (!condition) {
      return NextResponse.json(
        { error: "Condicion cronica no encontrada." },
        { status: 404 },
      );
    }

    const measuredAt = data.measured_at || new Date().toISOString();

    const { data: reading, error: insertError } = await supabase
      .from("chronic_readings")
      .insert({
        patient_id: user.id,
        condition_id: data.condition_id,
        reading_type: data.type,
        value: data.value,
        value2: data.value2 ?? null,
        unit: data.unit,
        context: data.context ?? null,
        notes: data.notes ?? null,
        measured_at: measuredAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Chronic Readings POST] Insert error:", insertError);
      return NextResponse.json(
        { error: "Error al registrar la lectura." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: reading }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida." },
        { status: 400 },
      );
    }
    console.error("[Chronic Readings POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
