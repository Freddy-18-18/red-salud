import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { updateReferralSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Medical Referral Detail — BFF API Route
// -------------------------------------------------------------------
// GET:   Full referral detail with doctor profiles and medical context.
// PATCH: Update referral status (patient marks as scheduled after booking).
// -------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const { data: referral, error } = await supabase
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
        attached_documents,
        expires_at,
        scheduled_appointment_id,
        created_at,
        updated_at,
        referring_doctor:doctor_details!medical_referrals_referring_doctor_id_fkey (
          id,
          consultation_fee,
          years_experience,
          biografia,
          profile:profiles!doctor_details_user_id_fkey (
            first_name,
            last_name,
            avatar_url,
            phone
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
          years_experience,
          biografia,
          profile:profiles!doctor_details_user_id_fkey (
            first_name,
            last_name,
            avatar_url,
            phone
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
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Referencia medica no encontrada." },
          { status: 404 },
        );
      }
      console.error("[Medical Referral GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener la referencia medica." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: referral });
  } catch (error) {
    console.error("[Medical Referral GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- PATCH: Update referral status ---

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

    const validation = validateBody(updateReferralSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("medical_referrals")
      .select("id, status")
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Referencia medica no encontrada." },
        { status: 404 },
      );
    }

    // Build update payload
    const updateData: Record<string, unknown> = {
      status: data.status,
      updated_at: new Date().toISOString(),
    };

    if (data.scheduled_appointment_id) {
      updateData.scheduled_appointment_id = data.scheduled_appointment_id;
    }

    const { data: updated, error: updateError } = await supabase
      .from("medical_referrals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[Medical Referral PATCH] Supabase error:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar la referencia medica." },
        { status: 500 },
      );
    }

    // Log activity
    await supabase
      .from("user_activity_log")
      .insert({
        user_id: user.id,
        action: "medical_referral_updated",
        details: {
          referral_id: id,
          new_status: data.status,
        },
      })
      .then(({ error: logError }) => {
        if (logError) {
          console.error("[Medical Referral PATCH] Activity log error:", logError);
        }
      });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida. Verifica los datos enviados." },
        { status: 400 },
      );
    }
    console.error("[Medical Referral PATCH] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
