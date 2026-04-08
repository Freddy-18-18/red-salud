import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { updateExpenseSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Medical Expenses — Single Expense BFF API Route
// -------------------------------------------------------------------
// GET:    Retrieve a single expense by id.
// PATCH:  Update an expense.
// DELETE: Remove an expense.
// -------------------------------------------------------------------

type RouteContext = { params: Promise<{ id: string }> };

// --- GET: Single expense ---

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const { data: expense, error } = await supabase
      .from("medical_expenses")
      .select("*")
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();

    if (error || !expense) {
      return NextResponse.json(
        { error: "Gasto medico no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: expense });
  } catch (error) {
    console.error("[Expenses GET/:id] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- PATCH: Update expense ---

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    // Verify ownership
    const { data: existing, error: findError } = await supabase
      .from("medical_expenses")
      .select("id")
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: "Gasto medico no encontrado." },
        { status: 404 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const validation = validateBody(updateExpenseSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // Build update payload — only include provided fields
    const updates: Record<string, unknown> = {};

    if (data.category !== undefined) updates.category = data.category;
    if (data.description !== undefined) updates.description = data.description;
    if (data.amount_usd !== undefined) updates.amount_usd = data.amount_usd;
    if (data.amount_bs !== undefined) updates.amount_bs = data.amount_bs;
    if (data.bcv_rate !== undefined) updates.bcv_rate = data.bcv_rate;
    if (data.date !== undefined) updates.date = data.date;
    if (data.provider_name !== undefined) updates.provider_name = data.provider_name;
    if (data.appointment_id !== undefined) updates.appointment_id = data.appointment_id;
    if (data.prescription_id !== undefined) updates.prescription_id = data.prescription_id;
    if (data.lab_order_id !== undefined) updates.lab_order_id = data.lab_order_id;
    if (data.receipt_url !== undefined) updates.receipt_url = data.receipt_url;
    if (data.notes !== undefined) updates.notes = data.notes;

    updates.updated_at = new Date().toISOString();

    const { data: expense, error: updateError } = await supabase
      .from("medical_expenses")
      .update(updates)
      .eq("id", id)
      .eq("patient_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("[Expenses PATCH] Update error:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar el gasto medico." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: expense });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida. Verifica los datos enviados." },
        { status: 400 },
      );
    }
    console.error("[Expenses PATCH] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- DELETE: Remove expense ---

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const { error: deleteError } = await supabase
      .from("medical_expenses")
      .delete()
      .eq("id", id)
      .eq("patient_id", user.id);

    if (deleteError) {
      console.error("[Expenses DELETE] Delete error:", deleteError);
      return NextResponse.json(
        { error: "Error al eliminar el gasto medico." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[Expenses DELETE] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
