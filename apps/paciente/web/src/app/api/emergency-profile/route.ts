import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { validateBody } from "@/lib/validation/validate";
import { updateEmergencyProfileSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Emergency Profile — BFF API Route (authenticated)
// -------------------------------------------------------------------
// GET:  Get the patient's emergency profile configuration.
// PUT:  Update (or create) emergency profile settings.
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

    // Fetch the emergency profile config
    const { data: profile, error } = await supabase
      .from("emergency_profiles")
      .select("*")
      .eq("patient_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[EmergencyProfile GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener perfil de emergencia." },
        { status: 500 },
      );
    }

    // Also fetch current medical data for preview
    const medicalData = await fetchMedicalData(supabase, user.id);

    return NextResponse.json({
      data: {
        config: profile
          ? {
              id: profile.id,
              access_token: profile.access_token,
              is_active: profile.is_active,
              pin_code: profile.pin_code,
              share_blood_type: profile.share_blood_type,
              share_allergies: profile.share_allergies,
              share_medications: profile.share_medications,
              share_conditions: profile.share_conditions,
              share_emergency_contacts: profile.share_emergency_contacts,
              share_insurance: profile.share_insurance,
              view_count: profile.view_count,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
            }
          : null,
        medical_data: medicalData,
      },
    });
  } catch (error) {
    console.error("[EmergencyProfile GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

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

    const validation = validateBody(updateEmergencyProfileSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // Check if profile already exists
    const { data: existing } = await supabase
      .from("emergency_profiles")
      .select("id, access_token")
      .eq("patient_id", user.id)
      .maybeSingle();

    const accessToken = existing?.access_token ?? randomUUID();

    const profileData = {
      patient_id: user.id,
      access_token: accessToken,
      is_active: data.is_active ?? true,
      pin_code: data.pin_code ?? null,
      share_blood_type: data.share_blood_type ?? true,
      share_allergies: data.share_allergies ?? true,
      share_medications: data.share_medications ?? true,
      share_conditions: data.share_conditions ?? true,
      share_emergency_contacts: data.share_emergency_contacts ?? true,
      share_insurance: data.share_insurance ?? true,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("emergency_profiles")
        .update(profileData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("[EmergencyProfile PUT] Update error:", error);
        return NextResponse.json(
          { error: "Error al actualizar perfil de emergencia." },
          { status: 500 },
        );
      }
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("emergency_profiles")
        .insert({
          ...profileData,
          view_count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("[EmergencyProfile PUT] Insert error:", error);
        return NextResponse.json(
          { error: "Error al crear perfil de emergencia." },
          { status: 500 },
        );
      }
      result = data;
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida. Verifica los datos enviados." },
        { status: 400 },
      );
    }
    console.error("[EmergencyProfile PUT] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- Helpers ---

async function fetchMedicalData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  // Profile basics
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  // Patient details (medical)
  let medical: Record<string, unknown> | null = null;
  try {
    const { data, error } = await supabase
      .from("patient_details")
      .select(
        "grupo_sanguineo, alergias, medicamentos_actuales, enfermedades_cronicas, contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion",
      )
      .eq("profile_id", userId)
      .maybeSingle();
    if (!error) medical = data as Record<string, unknown> | null;
  } catch {
    // Table might not exist
  }

  // Insurance
  const { data: insurance } = await supabase
    .from("patient_insurance")
    .select("insurance_company, policy_number")
    .eq("patient_id", userId)
    .eq("is_active", true)
    .order("valid_until", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    full_name: (profile?.full_name as string) || null,
    date_of_birth: (profile?.date_of_birth as string) || null,
    avatar_url: (profile?.avatar_url as string) || null,
    blood_type: (medical?.grupo_sanguineo as string) || null,
    allergies: parseArray(medical?.alergias),
    medications: parseMedications(medical?.medicamentos_actuales),
    conditions: parseArray(medical?.enfermedades_cronicas),
    emergency_contacts: buildEmergencyContacts(medical),
    insurance: insurance
      ? {
          company: insurance.insurance_company as string,
          policy_number: insurance.policy_number as string,
        }
      : null,
  };
}

function parseArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function parseMedications(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function buildEmergencyContacts(
  medical: Record<string, unknown> | null,
): Array<{ name: string; phone: string; relationship: string }> {
  if (!medical) return [];
  const name = medical.contacto_emergencia_nombre as string | null;
  if (!name) return [];
  return [
    {
      name,
      phone: (medical.contacto_emergencia_telefono as string) || "",
      relationship: (medical.contacto_emergencia_relacion as string) || "",
    },
  ];
}
