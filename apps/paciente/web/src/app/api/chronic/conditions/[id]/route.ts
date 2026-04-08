import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { updateConditionSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Chronic Condition Detail — BFF API Route
// -------------------------------------------------------------------
// GET:    Condition detail with latest readings.
// PATCH:  Update condition info.
// DELETE: Soft-delete (deactivate) a condition.
// Auth required — patient sees only their own data.
// -------------------------------------------------------------------

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const limited = checkRateLimit(_request, "authenticated");
    if (limited) return limited;

    const { id } = await params;
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

    // Fetch condition
    const { data: condition, error } = await supabase
      .from("patient_chronic_conditions")
      .select(
        `
        *,
        treating_doctor:profiles!patient_chronic_conditions_treating_doctor_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();

    if (error || !condition) {
      return NextResponse.json(
        { error: "Condicion no encontrada." },
        { status: 404 },
      );
    }

    // Fetch latest 5 readings for this condition
    const { data: latestReadings } = await supabase
      .from("chronic_readings")
      .select("*")
      .eq("condition_id", id)
      .eq("patient_id", user.id)
      .order("measured_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      data: {
        ...condition,
        latest_readings: latestReadings ?? [],
      },
    });
  } catch (error) {
    console.error("[Chronic Condition GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = checkRateLimit(request, "mutation");
    if (limited) return limited;

    const { id } = await params;
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

    const validation = validateBody(updateConditionSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    const updates: Record<string, unknown> = {};
    if (data.severity !== undefined) updates.severity = data.severity;
    if (data.treating_doctor_id !== undefined) updates.treating_doctor_id = data.treating_doctor_id;
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.condition_label !== undefined) updates.condition_label = data.condition_label;

    updates.updated_at = new Date().toISOString();

    const { data: condition, error } = await supabase
      .from("patient_chronic_conditions")
      .update(updates)
      .eq("id", id)
      .eq("patient_id", user.id)
      .select()
      .single();

    if (error || !condition) {
      console.error("[Chronic Condition PATCH] Error:", error);
      return NextResponse.json(
        { error: "Error al actualizar la condicion." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: condition });
  } catch (error) {
    console.error("[Chronic Condition PATCH] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const limited = checkRateLimit(_request, "mutation");
    if (limited) return limited;

    const { id } = await params;
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

    // Soft delete — deactivate the condition
    const { data: condition, error } = await supabase
      .from("patient_chronic_conditions")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("patient_id", user.id)
      .select()
      .single();

    if (error || !condition) {
      return NextResponse.json(
        { error: "Condicion no encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[Chronic Condition DELETE] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
