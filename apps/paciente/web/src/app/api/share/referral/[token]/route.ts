import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Public endpoint for shared referral links. Uses the `get_shared_referral`
// RPC (security definer) so we DON'T need a service-role key on this app —
// the function does its own validation server-side. The anon key suffices.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const limited = await checkRateLimit(request, "public");
    if (limited) return limited;

    const { token } = await params;
    if (!token || token.length < 10) {
      return NextResponse.json({ error: "Enlace inválido." }, { status: 404 });
    }

    const supabase = createSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );

    const { data, error } = await supabase.rpc("get_shared_referral", {
      p_token: token,
    });

    if (error) {
      console.error("[share/referral RPC]", error);
      return NextResponse.json({ error: "Error interno." }, { status: 500 });
    }

    const status = (data as { status?: string } | null)?.status;
    if (!status || status === "invalid") {
      return NextResponse.json({ error: "Enlace inválido." }, { status: 404 });
    }
    if (status === "revoked") {
      return NextResponse.json(
        { error: "Este enlace fue revocado." },
        { status: 410 },
      );
    }
    if (status === "expired") {
      return NextResponse.json(
        { error: "Este enlace ya venció." },
        { status: 410 },
      );
    }

    return NextResponse.json({ data });
  } catch (e) {
    console.error("[share/referral GET]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
