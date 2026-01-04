import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const onlyWithDoctors = searchParams.get("onlyWithDoctors") === "true";

  try {
    // Fetch all specialties
    const { data: specialtiesData, error: specialtiesError } = await supabaseAdmin
      .from("specialties")
      .select("id, name, description, icon, created_at")
      .order("name");

    if (specialtiesError) throw specialtiesError;

    // Fetch doctor counts per specialty
    // We use a raw query or a second request because Supabase doesn't support count on foreign key easily in one go without a view
    // Alternatively, we can fetch all verified doctors and count them in memory (efficient enough for < 1000 doctors)
    const { data: doctorsData, error: doctorsError } = await supabaseAdmin
      .from("doctor_details")
      .select("especialidad_id")
      .eq("verified", true);

    if (doctorsError) throw doctorsError;

    // Count doctors per specialty
    const doctorCounts = new Map<string, number>();
    (doctorsData || []).forEach((doc: any) => {
      if (doc.especialidad_id) {
        doctorCounts.set(doc.especialidad_id, (doctorCounts.get(doc.especialidad_id) || 0) + 1);
      }
    });

    // Merge data
    const result = (specialtiesData || []).map((specialty: any) => ({
      ...specialty,
      doctorCount: doctorCounts.get(specialty.id) || 0,
    }));

    // If onlyWithDoctors is true, filter
    if (onlyWithDoctors) {
      const filtered = result.filter((s: any) => s.doctorCount > 0);
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[doctor-specialties] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
