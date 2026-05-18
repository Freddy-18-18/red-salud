import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Lightweight referral snapshot for the booking wizard banner.
// Returns enough info to display "Agendando con tu referencia de X" and
// auto-fill the consultation reason, without exposing fields that aren't
// relevant in the booking flow.
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
        id, specialty_id, reason, urgency, status, expires_at,
        target_specialty:specialties!medical_referrals_specialty_id_fkey ( id, name )
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
    console.error("[Referral snapshot]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
