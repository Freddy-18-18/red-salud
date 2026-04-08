import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Medical Referrals — BFF API Route
// -------------------------------------------------------------------
// GET: List the authenticated patient's medical referrals (doctor → specialist).
// Supports filtering by status: pending, scheduled, completed, expired.
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, scheduled, completed, expired

    let query = supabase
      .from("medical_referrals")
      .select(
        `
        id,
        patient_id,
        referring_doctor_id,
        specialist_doctor_id,
        specialty_id,
        urgency,
        status,
        reason,
        diagnosis,
        clinical_notes,
        expires_at,
        scheduled_appointment_id,
        created_at,
        updated_at,
        referring_doctor:doctor_details!medical_referrals_referring_doctor_id_fkey (
          id,
          consultation_fee,
          profile:profiles!doctor_details_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          specialty:medical_specialties!doctor_details_specialty_id_fkey (
            id,
            name,
            icon
          )
        ),
        specialist:doctor_details!medical_referrals_specialist_doctor_id_fkey (
          id,
          consultation_fee,
          profile:profiles!doctor_details_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          specialty:medical_specialties!doctor_details_specialty_id_fkey (
            id,
            name,
            icon
          )
        ),
        target_specialty:medical_specialties!medical_referrals_specialty_id_fkey (
          id,
          name,
          icon
        )
        `,
      )
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: referrals, error } = await query;

    if (error) {
      console.error("[Medical Referrals GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener referencias medicas." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: referrals ?? [] });
  } catch (error) {
    console.error("[Medical Referrals GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
