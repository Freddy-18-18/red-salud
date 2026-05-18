import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Medical Referrals — patient inbox
// -------------------------------------------------------------------
// On every read, runtime-expire any `active` referral whose `expires_at`
// is in the past (cheaper than a cron, eventually-consistent within a
// single user session). Also detects duplicates per specialty so the UI
// can warn the patient.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "authenticated");
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    // Cheap auto-expire pass — only this patient's rows.
    await supabase
      .from("medical_referrals")
      .update({ status: "expired" })
      .eq("patient_id", user.id)
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString());

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("medical_referrals")
      .select(
        `
        id,
        patient_id,
        referring_doctor_id,
        specialty_id,
        reason,
        diagnosis,
        clinical_notes,
        exams_recommended,
        attached_documents,
        urgency,
        status,
        patient_consent_given,
        patient_consent_at,
        share_referrer_identity,
        used_appointment_id,
        used_at,
        expires_at,
        created_at,
        updated_at,
        referring_doctor:doctor_profiles!medical_referrals_referring_doctor_id_fkey (
          id,
          slug,
          profile:profiles!doctor_details_profile_id_fkey (
            full_name,
            avatar_url
          ),
          specialty:specialties!fk_doctor_specialty (
            id,
            name
          )
        ),
        target_specialty:specialties!medical_referrals_specialty_id_fkey (
          id,
          name,
          slug,
          icon
        )
        `,
      )
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      console.error("[Referrals GET]", error);
      return NextResponse.json(
        { error: "Error al obtener referencias." },
        { status: 500 },
      );
    }

    // Duplicate detection: count active+pending referrals per specialty
    // and tag rows whose specialty has more than one active/pending instance.
    const liveByspec = new Map<string, number>();
    for (const r of data ?? []) {
      if (r.status === "active" || r.status === "pending_consent") {
        liveByspec.set(
          r.specialty_id,
          (liveByspec.get(r.specialty_id) ?? 0) + 1,
        );
      }
    }
    const enriched = (data ?? []).map((r) => ({
      ...r,
      has_duplicate:
        (r.status === "active" || r.status === "pending_consent") &&
        (liveByspec.get(r.specialty_id) ?? 0) > 1,
    }));

    return NextResponse.json({ data: enriched });
  } catch (e) {
    console.error("[Referrals GET]", e);
    return NextResponse.json(
      { error: "Error interno." },
      { status: 500 },
    );
  }
}
