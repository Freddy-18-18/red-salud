import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { updateGoalSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Chronic Goal Detail — BFF API Route
// -------------------------------------------------------------------
// PATCH: Update goal progress or mark as completed.
// Auth required.
// -------------------------------------------------------------------

type RouteParams = { params: Promise<{ id: string }> };

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

    const validation = validateBody(updateGoalSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    const updates: Record<string, unknown> = {};
    if (data.current_value !== undefined) updates.current_value = data.current_value;
    if (data.is_completed !== undefined) updates.is_completed = data.is_completed;
    if (data.is_active !== undefined) updates.is_active = data.is_active;
    if (data.description !== undefined) updates.description = data.description;
    if (data.target_value !== undefined) updates.target_value = data.target_value;
    if (data.target_date !== undefined) updates.target_date = data.target_date;

    updates.updated_at = new Date().toISOString();

    const { data: goal, error } = await supabase
      .from("chronic_goals")
      .update(updates)
      .eq("id", id)
      .eq("patient_id", user.id)
      .select()
      .single();

    if (error || !goal) {
      console.error("[Chronic Goal PATCH] Error:", error);
      return NextResponse.json(
        { error: "Error al actualizar la meta." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: goal });
  } catch (error) {
    console.error("[Chronic Goal PATCH] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
