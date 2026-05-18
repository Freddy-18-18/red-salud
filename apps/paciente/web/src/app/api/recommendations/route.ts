import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// "Para vos" recommendations.
// Strategy v1 (no ML — pure heuristics with explainability):
//   1) Doctors the patient already booked with → "Vuelve a ver"
//   2) Doctors in the patient's state with high rating → "Cerca de vos"
//   3) Top-rated doctors overall (fallback) → "Más recomendados"
//
// Each entry returns a `reason` so the UI can show WHY it's suggested.

interface ReasonedDoctor {
  id: string;
  slug: string | null;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  specialty_name: string | null;
  consultation_fee: number | null;
  average_rating: number | null;
  total_reviews: number | null;
  accepts_telemedicine: boolean | null;
  sacs_verified: boolean | null;
  reason: string;
  bucket: "history" | "nearby" | "top_rated";
}

export async function GET(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "authenticated");
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ data: [] });
    }

    // Patient profile (state / city)
    const { data: profile } = await supabase
      .from("profiles")
      .select("state, city")
      .eq("id", user.id)
      .single();

    const out: ReasonedDoctor[] = [];
    const seen = new Set<string>();

    // ── 1) History: doctors with completed appointments ─────────
    const { data: pastAppts } = await supabase
      .from("appointments")
      .select("doctor_id, status, scheduled_at")
      .eq("patient_id", user.id)
      .in("status", ["completed", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(20);

    const pastDoctorIds = Array.from(
      new Set((pastAppts ?? []).map((a) => a.doctor_id).filter(Boolean)),
    );

    // Helper: hydrate specialty names for a batch of specialty_ids in one round-trip.
    const fetchSpecialtyNames = async (
      ids: (string | null | undefined)[],
    ): Promise<Map<string, string>> => {
      const unique = Array.from(
        new Set(ids.filter((id): id is string => typeof id === "string")),
      );
      if (unique.length === 0) return new Map();
      const { data } = await supabase
        .from("specialties")
        .select("id, name")
        .in("id", unique);
      return new Map((data ?? []).map((s) => [s.id, s.name]));
    };

    if (pastDoctorIds.length > 0) {
      const { data } = await supabase
        .from("public_doctor_directory")
        .select(
          `
          doctor_profile_id, id, slug, consultation_fee, accepts_telemedicine, sacs_verified,
          average_rating, total_reviews, full_name, avatar_url, city, state, specialty_id
        `,
        )
        .in("id", pastDoctorIds)
        .limit(6);

      const specMap = await fetchSpecialtyNames(
        (data ?? []).map((d) => d.specialty_id),
      );
      for (const d of data ?? []) {
        if (seen.has(d.doctor_profile_id)) continue;
        seen.add(d.doctor_profile_id);
        out.push({
          id: d.doctor_profile_id,
          slug: d.slug ?? null,
          full_name: d.full_name ?? "",
          avatar_url: d.avatar_url ?? null,
          city: d.city ?? null,
          state: d.state ?? null,
          specialty_name: d.specialty_id ? specMap.get(d.specialty_id) ?? null : null,
          consultation_fee: d.consultation_fee ?? null,
          average_rating: d.average_rating ?? null,
          total_reviews: d.total_reviews ?? null,
          accepts_telemedicine: d.accepts_telemedicine ?? null,
          sacs_verified: d.sacs_verified ?? null,
          reason: "Ya tuviste una cita con este doctor.",
          bucket: "history",
        });
      }
    }

    // ── 2) Nearby: same state as patient, ordered by rating ──────
    const patientState = (profile?.state ?? "").trim() || null;
    if (patientState) {
      const { data } = await supabase
        .from("public_doctor_directory")
        .select(
          `
          doctor_profile_id, id, slug, consultation_fee, accepts_telemedicine, sacs_verified,
          average_rating, total_reviews, full_name, avatar_url, city, state, specialty_id
        `,
        )
        .eq("state", patientState)
        .order("average_rating", { ascending: false, nullsFirst: false })
        .limit(8);
      const specMap = await fetchSpecialtyNames(
        (data ?? []).map((d) => d.specialty_id),
      );
      for (const d of data ?? []) {
        if (seen.has(d.doctor_profile_id) || out.length >= 12) continue;
        seen.add(d.doctor_profile_id);
        out.push({
          id: d.doctor_profile_id,
          slug: d.slug ?? null,
          full_name: d.full_name ?? "",
          avatar_url: d.avatar_url ?? null,
          city: d.city ?? null,
          state: d.state ?? null,
          specialty_name: d.specialty_id ? specMap.get(d.specialty_id) ?? null : null,
          consultation_fee: d.consultation_fee ?? null,
          average_rating: d.average_rating ?? null,
          total_reviews: d.total_reviews ?? null,
          accepts_telemedicine: d.accepts_telemedicine ?? null,
          sacs_verified: d.sacs_verified ?? null,
          reason: `En tu estado (${patientState}).`,
          bucket: "nearby",
        });
      }
    }

    // ── 3) Top-rated fallback ──────────────────────────────────
    if (out.length < 6) {
      const { data } = await supabase
        .from("public_doctor_directory")
        .select(
          `
          doctor_profile_id, id, slug, consultation_fee, accepts_telemedicine, sacs_verified,
          average_rating, total_reviews, full_name, avatar_url, city, state, specialty_id
        `,
        )
        .order("average_rating", { ascending: false, nullsFirst: false })
        .limit(6);
      const specMap = await fetchSpecialtyNames(
        (data ?? []).map((d) => d.specialty_id),
      );
      for (const d of data ?? []) {
        if (seen.has(d.doctor_profile_id) || out.length >= 12) continue;
        seen.add(d.doctor_profile_id);
        out.push({
          id: d.doctor_profile_id,
          slug: d.slug ?? null,
          full_name: d.full_name ?? "",
          avatar_url: d.avatar_url ?? null,
          city: d.city ?? null,
          state: d.state ?? null,
          specialty_name: d.specialty_id ? specMap.get(d.specialty_id) ?? null : null,
          consultation_fee: d.consultation_fee ?? null,
          average_rating: d.average_rating ?? null,
          total_reviews: d.total_reviews ?? null,
          accepts_telemedicine: d.accepts_telemedicine ?? null,
          sacs_verified: d.sacs_verified ?? null,
          reason: "Más recomendados de la plataforma.",
          bucket: "top_rated",
        });
      }
    }

    return NextResponse.json({ data: out });
  } catch (e) {
    console.error("[Recommendations]", e);
    return NextResponse.json({ data: [] });
  }
}
