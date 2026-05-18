import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Chat thread anchored to a referral. RLS restricts visibility to the
// patient owner and the referring doctor.

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
      .from("referral_messages")
      .select("id, sender_id, sender_role, body, read_at, created_at")
      .eq("referral_id", id)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      console.error("[messages GET]", error);
      return NextResponse.json({ error: "Error al cargar." }, { status: 500 });
    }

    // Mark unread doctor → patient messages as read.
    const unreadIds = (data ?? [])
      .filter(
        (m) => m.sender_role === "referring_doctor" && !m.read_at,
      )
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      await supabase
        .from("referral_messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    console.error("[messages GET]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

const postSchema = z
  .object({ body: z.string().trim().min(1).max(2000) })
  .strict();

export async function POST(
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
    if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("referral_messages")
      .insert({
        referral_id: id,
        sender_id: user.id,
        sender_role: "patient",
        body: parsed.data.body,
      })
      .select("id, sender_id, sender_role, body, read_at, created_at")
      .single();

    if (error || !data) {
      console.error("[messages POST]", error);
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje." },
        { status: 500 },
      );
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error("[messages POST]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
