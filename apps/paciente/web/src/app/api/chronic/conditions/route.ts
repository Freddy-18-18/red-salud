import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { addConditionSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Chronic Conditions — BFF API Route
// -------------------------------------------------------------------
// GET:  List the authenticated patient's chronic conditions.
// POST: Register a new chronic condition.
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
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const { data: conditions, error } = await supabase
      .from("patient_chronic_conditions")
      .select(
        `
        id,
        condition_type,
        condition_label,
        diagnosed_date,
        severity,
        treating_doctor_id,
        notes,
        is_active,
        created_at,
        updated_at,
        treating_doctor:profiles!patient_chronic_conditions_treating_doctor_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq("patient_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Chronic Conditions GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener condiciones cronicas." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: conditions ?? [] });
  } catch (error) {
    console.error("[Chronic Conditions GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- POST: Register new chronic condition ---

const CONDITION_LABELS: Record<string, string> = {
  diabetes_1: "Diabetes tipo 1",
  diabetes_2: "Diabetes tipo 2",
  hipertension: "Hipertension arterial",
  asma: "Asma",
  hipotiroidismo: "Hipotiroidismo",
  hipertiroidismo: "Hipertiroidismo",
  epoc: "EPOC",
  artritis: "Artritis",
  epilepsia: "Epilepsia",
  insuficiencia_renal: "Insuficiencia renal",
  otro: "Otra condicion",
};

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

    const validation = validateBody(addConditionSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // Check for duplicate active condition of same type
    const { data: existing } = await supabase
      .from("patient_chronic_conditions")
      .select("id")
      .eq("patient_id", user.id)
      .eq("condition_type", data.condition_type)
      .eq("is_active", true)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya tenes registrada esta condicion cronica." },
        { status: 409 },
      );
    }

    const label =
      data.custom_label ||
      CONDITION_LABELS[data.condition_type] ||
      data.condition_type;

    const { data: condition, error: insertError } = await supabase
      .from("patient_chronic_conditions")
      .insert({
        patient_id: user.id,
        condition_type: data.condition_type,
        condition_label: label,
        diagnosed_date: data.diagnosed_date ?? null,
        severity: data.severity ?? null,
        treating_doctor_id: data.treating_doctor_id ?? null,
        notes: data.notes ?? null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Chronic Conditions POST] Insert error:", insertError);
      return NextResponse.json(
        { error: "Error al registrar la condicion cronica." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: condition }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida. Verifica los datos enviados." },
        { status: 400 },
      );
    }
    console.error("[Chronic Conditions POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
