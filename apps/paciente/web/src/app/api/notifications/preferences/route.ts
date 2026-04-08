import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { updateNotificationPrefsSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Notification Preferences — BFF API Route
// -------------------------------------------------------------------
// GET: Get patient's notification preferences.
// PUT: Update notification preferences.
// Both handlers require authentication.
// -------------------------------------------------------------------

/** Default preferences when none exist in the database. */
const DEFAULT_PREFERENCES = {
  email_enabled: true,
  push_enabled: true,
  categories: {
    appointments: { email: true, push: true },
    lab_results: { email: true, push: true },
    prescriptions: { email: true, push: true },
    messages: { email: true, push: true },
    chronic_alerts: { email: false, push: true },
    price_alerts: { email: true, push: false },
    follow_ups: { email: true, push: true },
    rewards: { email: false, push: true },
    system: { email: true, push: false },
  },
};

// --- GET: Get notification preferences ---

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

    // Try to get existing preferences
    const { data: prefs, error } = await supabase
      .from("patient_notification_preferences")
      .select("*")
      .eq("patient_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[NotifPrefs GET] Supabase error:", error);
      // Return defaults silently if table doesn't exist yet
      return NextResponse.json({ data: DEFAULT_PREFERENCES });
    }

    if (!prefs) {
      return NextResponse.json({ data: DEFAULT_PREFERENCES });
    }

    return NextResponse.json({
      data: {
        email_enabled: prefs.email_enabled ?? DEFAULT_PREFERENCES.email_enabled,
        push_enabled: prefs.push_enabled ?? DEFAULT_PREFERENCES.push_enabled,
        categories: prefs.categories ?? DEFAULT_PREFERENCES.categories,
      },
    });
  } catch (error) {
    console.error("[NotifPrefs GET] Unexpected error:", error);
    // Return defaults even on error so UI doesn't break
    return NextResponse.json({ data: DEFAULT_PREFERENCES });
  }
}

// --- PUT: Update notification preferences ---

export async function PUT(request: NextRequest) {
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

    const validation = validateBody(updateNotificationPrefsSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // Upsert preferences
    const { data: prefs, error } = await supabase
      .from("patient_notification_preferences")
      .upsert(
        {
          patient_id: user.id,
          email_enabled: data.email_enabled ?? DEFAULT_PREFERENCES.email_enabled,
          push_enabled: data.push_enabled ?? DEFAULT_PREFERENCES.push_enabled,
          categories: data.categories ?? DEFAULT_PREFERENCES.categories,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "patient_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("[NotifPrefs PUT] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al guardar preferencias." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: {
        email_enabled: prefs.email_enabled,
        push_enabled: prefs.push_enabled,
        categories: prefs.categories,
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida." },
        { status: 400 },
      );
    }
    console.error("[NotifPrefs PUT] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
