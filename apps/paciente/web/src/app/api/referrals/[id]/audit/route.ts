import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Read the immutable timeline of events for a referral. RLS restricts visibility
// to the patient owner and the referring doctor.
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
    if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data, error } = await supabase
      .from("referral_audit_log")
      .select("id, actor_id, actor_role, action, from_status, to_status, metadata, created_at")
      .eq("referral_id", id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[audit GET]", error);
      return NextResponse.json({ data: [] });
    }
    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    console.error("[audit GET]", e);
    return NextResponse.json({ data: [] });
  }
}
