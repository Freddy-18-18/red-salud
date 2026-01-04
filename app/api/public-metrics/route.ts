import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Pacientes
    const { count: patientsCount, error: patientsError } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "paciente");

    if (patientsError) console.warn("[metrics] patients error:", patientsError.message);

    // Médicos
    const { count: doctorsCount, error: doctorsError } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "medico");

    if (doctorsError) console.warn("[metrics] doctors error:", doctorsError.message);

    // Especialidades - AHORA desde la tabla specialties (única fuente de verdad)
    const { count: specialtiesCount, error: specError } = await supabaseAdmin
      .from("specialties")
      .select("id", { count: "exact", head: true })
      .eq("active", true);

    if (specError) {
      console.error("[metrics] specialties error:", specError.message);
    }

    // Satisfacción desde reviews
    let satisfaction = 0;
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from("doctor_reviews")
      .select("rating");
    if (!reviewsError && Array.isArray(reviews) && reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
      satisfaction = Math.round((avg / 5) * 100);
    }

    return NextResponse.json({
      total_patients: patientsCount || 0,
      total_doctors: doctorsCount || 0,
      total_specialties: specialtiesCount || 132, // Fallback a 132 si hay error
      satisfaction_percentage: satisfaction,
    }, { status: 200 });
  } catch (error: any) {
    console.error("[metrics] error:", error?.message || error);
    return NextResponse.json({ error: "failed to fetch metrics" }, { status: 500 });
  }
}

