import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Doctor Reviews — GET (paginated + summary) and POST (verified review)
// -------------------------------------------------------------------
// `doctor_reviews.doctor_id` references `profiles.id`. The route accepts
// the `doctor_profiles.id` (UUID) and resolves the patient's session-side.
// We assume the caller already passed the doctor_profiles primary key.
// -------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, "public");
    if (limited) return limited;

    const { id: doctorProfileId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("page_size") ?? "10", 10)),
    );
    const offset = (page - 1) * pageSize;

    // Resolve doctor_profiles.id → profile_id (which is doctor_reviews.doctor_id)
    const { data: dp, error: dpErr } = await supabase
      .from("doctor_profiles")
      .select("profile_id")
      .eq("id", doctorProfileId)
      .single();

    if (dpErr || !dp) {
      return NextResponse.json(
        { error: "Médico no encontrado." },
        { status: 404 },
      );
    }

    const doctorUserId = dp.profile_id;

    const [{ data: reviews, error, count }, distRes] = await Promise.all([
      supabase
        .from("doctor_reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          punctuality_rating,
          communication_rating,
          professionalism_rating,
          time_dedicated_rating,
          bedside_manner_rating,
          is_anonymous,
          is_verified,
          doctor_response,
          doctor_response_at,
          helpful_count,
          patient:profiles!doctor_reviews_patient_id_fkey (
            first_name,
            avatar_url
          )
        `,
          { count: "exact" },
        )
        .eq("doctor_id", doctorUserId)
        .is("hidden_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1),
      supabase
        .from("doctor_reviews")
        .select("rating")
        .eq("doctor_id", doctorUserId)
        .is("hidden_at", null),
    ]);

    if (error) {
      console.error("[Doctor Reviews]", error);
      return NextResponse.json(
        { error: "Error al obtener reseñas." },
        { status: 500 },
      );
    }

    // Anonymise for display
    const cleaned = (reviews ?? []).map((r) => ({
      ...r,
      patient: r.is_anonymous ? null : r.patient,
    }));

    // Build distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    let sum = 0;
    for (const r of distRes.data ?? []) {
      const v = Math.max(1, Math.min(5, r.rating));
      distribution[v] = (distribution[v] ?? 0) + 1;
      sum += v;
    }
    const total = (distRes.data ?? []).length;
    const average = total > 0 ? +(sum / total).toFixed(2) : 0;

    return NextResponse.json({
      data: cleaned,
      summary: {
        average,
        total,
        distribution,
      },
      pagination: {
        page,
        page_size: pageSize,
        total: count ?? 0,
        total_pages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (error) {
    console.error("[Doctor Reviews]", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

const reviewBodySchema = z.object({
  appointment_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().nullable(),
  punctuality_rating: z.number().int().min(1).max(5).optional().nullable(),
  communication_rating: z.number().int().min(1).max(5).optional().nullable(),
  professionalism_rating: z.number().int().min(1).max(5).optional().nullable(),
  time_dedicated_rating: z.number().int().min(1).max(5).optional().nullable(),
  bedside_manner_rating: z.number().int().min(1).max(5).optional().nullable(),
  is_anonymous: z.boolean().optional().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, "mutation");
    if (limited) return limited;

    const { id: doctorProfileId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para dejar una reseña." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = reviewBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Resolve doctor_profiles.id → profile_id
    const { data: dp } = await supabase
      .from("doctor_profiles")
      .select("profile_id")
      .eq("id", doctorProfileId)
      .single();
    if (!dp) {
      return NextResponse.json(
        { error: "Médico no encontrado." },
        { status: 404 },
      );
    }

    // Verify the appointment belongs to (patient = current user, doctor = dp.profile_id)
    // and is completed — the only state where reviewing is allowed.
    const { data: appt } = await supabase
      .from("appointments")
      .select("id, status, patient_id, doctor_id")
      .eq("id", parsed.data.appointment_id)
      .single();

    if (!appt) {
      return NextResponse.json(
        { error: "Cita no encontrada." },
        { status: 404 },
      );
    }
    if (appt.patient_id !== user.id) {
      return NextResponse.json(
        { error: "No podés reseñar una cita que no es tuya." },
        { status: 403 },
      );
    }
    if (appt.doctor_id !== dp.profile_id) {
      return NextResponse.json(
        { error: "Esta cita no corresponde a este doctor." },
        { status: 400 },
      );
    }
    if (appt.status !== "completed") {
      return NextResponse.json(
        {
          error:
            "Sólo podés dejar una reseña después de que la consulta haya finalizado.",
        },
        { status: 400 },
      );
    }

    // Prevent duplicate reviews per appointment
    const { count: existing } = await supabase
      .from("doctor_reviews")
      .select("id", { count: "exact", head: true })
      .eq("appointment_id", parsed.data.appointment_id);
    if ((existing ?? 0) > 0) {
      return NextResponse.json(
        { error: "Ya dejaste una reseña para esta cita." },
        { status: 409 },
      );
    }

    const { data: created, error } = await supabase
      .from("doctor_reviews")
      .insert({
        doctor_id: dp.profile_id,
        patient_id: user.id,
        appointment_id: parsed.data.appointment_id,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
        punctuality_rating: parsed.data.punctuality_rating ?? null,
        communication_rating: parsed.data.communication_rating ?? null,
        professionalism_rating: parsed.data.professionalism_rating ?? null,
        time_dedicated_rating: parsed.data.time_dedicated_rating ?? null,
        bedside_manner_rating: parsed.data.bedside_manner_rating ?? null,
        is_anonymous: parsed.data.is_anonymous ?? false,
        is_verified: true, // server-side flag — backed by appointment check
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Doctor Reviews POST]", error);
      return NextResponse.json(
        { error: "No se pudo guardar la reseña." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[Doctor Reviews POST]", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
