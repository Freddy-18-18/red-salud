import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Emergency Profile — PUBLIC API Route (no auth required)
// -------------------------------------------------------------------
// GET: Fetch an emergency profile by its access_token.
//      Only returns fields the patient has opted to share.
//      Increments view_count for analytics.
// -------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const limited = checkRateLimit(_request, "public");
    if (limited) return limited;

    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Token invalido." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch the emergency profile by access_token
    const { data: profile, error } = await supabase
      .from("emergency_profiles")
      .select("*")
      .eq("access_token", token)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("[EmergencyProfile Public GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener perfil." },
        { status: 500 },
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado o desactivado." },
        { status: 404 },
      );
    }

    // Increment view count (best-effort, don't fail the request)
    supabase
      .from("emergency_profiles")
      .update({ view_count: (profile.view_count || 0) + 1 })
      .eq("id", profile.id)
      .then(({ error: updateError }) => {
        if (updateError) {
          console.error("[EmergencyProfile] View count update error:", updateError);
        }
      });

    // Fetch the patient's medical data
    const patientId = profile.patient_id as string;

    // Profile basics
    const { data: patientProfile } = await supabase
      .from("profiles")
      .select("full_name, date_of_birth, avatar_url")
      .eq("id", patientId)
      .maybeSingle();

    // Patient details (medical)
    let medical: Record<string, unknown> | null = null;
    try {
      const { data, error: medErr } = await supabase
        .from("patient_details")
        .select(
          "grupo_sanguineo, alergias, medicamentos_actuales, enfermedades_cronicas, contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion",
        )
        .eq("profile_id", patientId)
        .maybeSingle();
      if (!medErr) medical = data as Record<string, unknown> | null;
    } catch {
      // Table might not exist
    }

    // Insurance
    let insurance: { insurance_company: unknown; policy_number: unknown } | null = null;
    if (profile.share_insurance) {
      const { data: ins } = await supabase
        .from("patient_insurance")
        .select("insurance_company, policy_number")
        .eq("patient_id", patientId)
        .eq("is_active", true)
        .order("valid_until", { ascending: false })
        .limit(1)
        .maybeSingle();
      insurance = ins;
    }

    // Calculate age
    let age: number | null = null;
    if (patientProfile?.date_of_birth) {
      const birth = new Date(patientProfile.date_of_birth as string);
      const now = new Date();
      age = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
    }

    // Build the public response, only including opted-in fields
    const publicData: Record<string, unknown> = {
      full_name: (patientProfile?.full_name as string) || "Paciente",
      age,
    };

    if (profile.share_blood_type && medical?.grupo_sanguineo) {
      publicData.blood_type = medical.grupo_sanguineo;
    }

    if (profile.share_allergies) {
      publicData.allergies = parseArray(medical?.alergias);
    }

    if (profile.share_medications) {
      publicData.medications = parseMedications(medical?.medicamentos_actuales);
    }

    if (profile.share_conditions) {
      publicData.conditions = parseArray(medical?.enfermedades_cronicas);
    }

    if (profile.share_emergency_contacts) {
      const contactName = medical?.contacto_emergencia_nombre as string | null;
      if (contactName) {
        publicData.emergency_contacts = [
          {
            name: contactName,
            phone: (medical?.contacto_emergencia_telefono as string) || "",
            relationship: (medical?.contacto_emergencia_relacion as string) || "",
          },
        ];
      } else {
        publicData.emergency_contacts = [];
      }
    }

    if (profile.share_insurance && insurance) {
      publicData.insurance = {
        company: insurance.insurance_company as string,
        policy_number: insurance.policy_number as string,
      };
    }

    return NextResponse.json({
      data: publicData,
    });
  } catch (error) {
    console.error("[EmergencyProfile Public GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- Helpers ---

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
