import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { updateNotificationSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Single Notification — BFF API Route
// -------------------------------------------------------------------
// PATCH:  Mark a single notification as read/unread.
// DELETE: Dismiss (delete) a single notification.
// Both handlers require authentication + ownership check.
// -------------------------------------------------------------------

// --- PATCH: Toggle read/unread ---

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const validation = validateBody(updateNotificationSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    const updateData: Record<string, unknown> = { is_read: data.is_read };
    if (data.is_read) {
      updateData.read_at = new Date().toISOString();
    } else {
      updateData.read_at = null;
    }

    const { data: notification, error } = await supabase
      .from("patient_notifications")
      .update(updateData)
      .eq("id", id)
      .eq("patient_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Notificacion no encontrada." },
          { status: 404 },
        );
      }
      console.error("[Notification PATCH] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al actualizar notificacion." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: notification });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida." },
        { status: 400 },
      );
    }
    console.error("[Notification PATCH] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- DELETE: Dismiss notification ---

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const { error } = await supabase
      .from("patient_notifications")
      .delete()
      .eq("id", id)
      .eq("patient_id", user.id);

    if (error) {
      console.error("[Notification DELETE] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al eliminar notificacion." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[Notification DELETE] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
