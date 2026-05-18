import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// GET — full detail (always accessible to the owner patient).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, "authenticated");
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("medical_referrals")
      .select(
        `
        id, patient_id, referring_doctor_id, specialty_id, reason, diagnosis,
        clinical_notes, exams_recommended, attached_documents, urgency, status,
        patient_consent_given, patient_consent_at, share_referrer_identity,
        used_appointment_id, used_at, expires_at, created_at, updated_at,
        referring_doctor:doctor_profiles!medical_referrals_referring_doctor_id_fkey (
          id, slug,
          profile:profiles!doctor_details_profile_id_fkey ( full_name, avatar_url ),
          specialty:specialties!fk_doctor_specialty ( id, name )
        ),
        target_specialty:specialties!medical_referrals_specialty_id_fkey (
          id, name, slug, icon
        )
        `,
      )
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Referencia no encontrada." },
        { status: 404 },
      );
    }
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[Referrals GET id]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

// PATCH — patient updates consent / privacy choices / lifecycle.
const patchSchema = z
  .object({
    action: z.enum(["consent", "decline", "mark_used"]).optional(),
    share_referrer_identity: z.boolean().optional(),
    used_appointment_id: z.string().uuid().optional(),
  })
  .strict();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, "mutation");
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos." },
        { status: 400 },
      );
    }

    const { action, share_referrer_identity, used_appointment_id } =
      parsed.data;

    const update: Record<string, unknown> = {};

    if (action === "consent") {
      update.patient_consent_given = true;
      update.patient_consent_at = new Date().toISOString();
      update.status = "active";
      if (typeof share_referrer_identity === "boolean") {
        update.share_referrer_identity = share_referrer_identity;
      }
    } else if (action === "decline") {
      update.status = "declined";
      update.patient_consent_given = false;
    } else if (action === "mark_used") {
      update.status = "used";
      update.used_at = new Date().toISOString();
      if (used_appointment_id) update.used_appointment_id = used_appointment_id;
    } else if (typeof share_referrer_identity === "boolean") {
      update.share_referrer_identity = share_referrer_identity;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "Sin cambios para aplicar." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("medical_referrals")
      .update(update)
      .eq("id", id)
      .eq("patient_id", user.id)
      .select("id, status, patient_consent_given, share_referrer_identity")
      .single();

    if (error || !data) {
      console.error("[Referrals PATCH]", error);
      return NextResponse.json(
        { error: "No se pudo actualizar la referencia." },
        { status: 500 },
      );
    }
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[Referrals PATCH]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
