import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { createGoalSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Chronic Goals — BFF API Route
// -------------------------------------------------------------------
// GET:  List active goals for patient.
// POST: Create a new goal.
// Auth required.
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

    const { data: goals, error } = await supabase
      .from("chronic_goals")
      .select(
        `
        *,
        condition:patient_chronic_conditions!chronic_goals_condition_id_fkey (
          id,
          condition_type,
          condition_label
        )
      `,
      )
      .eq("patient_id", user.id)
      .eq("is_active", true)
      .order("target_date", { ascending: true });

    if (error) {
      console.error("[Chronic Goals GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener metas." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: goals ?? [] });
  } catch (error) {
    console.error("[Chronic Goals GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- POST: Create goal ---

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

    const validation = validateBody(createGoalSchema, body);
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

    const { data: goal, error: insertError } = await supabase
      .from("chronic_goals")
      .insert({
        patient_id: user.id,
        condition_id: data.condition_id,
        metric_type: data.metric_type,
        target_value: data.target_value,
        current_value: data.current_value ?? 0,
        target_date: data.target_date ?? null,
        description: data.description,
        is_active: true,
        is_completed: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Chronic Goals POST] Insert error:", insertError);
      return NextResponse.json(
        { error: "Error al crear la meta." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: goal }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida." },
        { status: 400 },
      );
    }
    console.error("[Chronic Goals POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
