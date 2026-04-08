import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { markNotificationsReadSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Notifications — BFF API Route
// -------------------------------------------------------------------
// GET:  List the authenticated patient's notifications (with filters).
// POST: Mark notifications as read (batch or all).
// Both handlers require authentication.
// -------------------------------------------------------------------

// --- GET: List patient's notifications ---

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
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread_only") === "true";
    const type = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("page_size") ?? "20", 10)),
    );
    const offset = (page - 1) * pageSize;

    // --- Build query ---
    let query = supabase
      .from("patient_notifications")
      .select("*", { count: "exact" })
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    if (type) {
      query = query.eq("type", type);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error("[Notifications GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener notificaciones." },
        { status: 500 },
      );
    }

    // --- Unread count (separate fast query) ---
    const { count: unreadCount, error: unreadError } = await supabase
      .from("patient_notifications")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("is_read", false);

    if (unreadError) {
      console.error("[Notifications GET] Unread count error:", unreadError);
    }

    return NextResponse.json({
      data: notifications ?? [],
      pagination: {
        page,
        page_size: pageSize,
        total: count ?? 0,
        total_pages: count ? Math.ceil(count / pageSize) : 0,
      },
      unread_count: unreadCount ?? 0,
    });
  } catch (error) {
    console.error("[Notifications GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- POST: Mark notifications as read ---

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
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const validation = validateBody(markNotificationsReadSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    if (data.mark_all) {
      // Mark all unread notifications as read for this patient
      const { error } = await supabase
        .from("patient_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("patient_id", user.id)
        .eq("is_read", false);

      if (error) {
        console.error("[Notifications POST] Mark all error:", error);
        return NextResponse.json(
          { error: "Error al marcar notificaciones." },
          { status: 500 },
        );
      }

      return NextResponse.json({ data: { marked: "all" } });
    }

    // Mark specific notifications as read (ensuring they belong to this patient)
    const { data: updated, error } = await supabase
      .from("patient_notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("patient_id", user.id)
      .in("id", data.notification_ids!)
      .select("id");

    if (error) {
      console.error("[Notifications POST] Mark specific error:", error);
      return NextResponse.json(
        { error: "Error al marcar notificaciones." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: { marked: updated?.length ?? 0 },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida. Verifica los datos enviados." },
        { status: 400 },
      );
    }
    console.error("[Notifications POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
