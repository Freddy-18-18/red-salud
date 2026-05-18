import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Patient-managed share tokens for a referral.
// GET — list active and past shares.
// POST — create a new short-lived public token.
// DELETE — revoke a share.

function makeToken(): string {
  // 22-char URL-safe token (base64url of 16 random bytes).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

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
      .from("referral_shares")
      .select("id, token, share_referrer_identity, recipient_label, expires_at, revoked_at, accessed_count, last_accessed_at, created_at")
      .eq("referral_id", id)
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Shares GET]", error);
      return NextResponse.json({ error: "Error al cargar." }, { status: 500 });
    }
    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    console.error("[Shares GET]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

const postSchema = z
  .object({
    expires_in_hours: z.number().int().min(1).max(168), // 1h .. 7d
    share_referrer_identity: z.boolean(),
    recipient_label: z.string().trim().max(60).optional().nullable(),
  })
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
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    // Verify the referral belongs to this patient and is shareable.
    const { data: ref } = await supabase
      .from("medical_referrals")
      .select("id, patient_id, status")
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();
    if (!ref) return NextResponse.json({ error: "Referencia no encontrada." }, { status: 404 });
    if (!["active", "used", "completed"].includes(ref.status)) {
      return NextResponse.json(
        { error: "Sólo podés compartir referencias activas o ya usadas." },
        { status: 400 },
      );
    }

    const token = makeToken();
    const expiresAt = new Date(
      Date.now() + parsed.data.expires_in_hours * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("referral_shares")
      .insert({
        referral_id: id,
        patient_id: user.id,
        token,
        share_referrer_identity: parsed.data.share_referrer_identity,
        recipient_label: parsed.data.recipient_label ?? null,
        expires_at: expiresAt,
      })
      .select("id, token, share_referrer_identity, recipient_label, expires_at, created_at")
      .single();

    if (error || !data) {
      console.error("[Shares POST]", error);
      return NextResponse.json({ error: "No se pudo crear el enlace." }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error("[Shares POST]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("share_id");
    if (!shareId) {
      return NextResponse.json({ error: "share_id requerido." }, { status: 400 });
    }

    const { error } = await supabase
      .from("referral_shares")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", shareId)
      .eq("patient_id", user.id)
      .eq("referral_id", id);

    if (error) {
      console.error("[Shares DELETE]", error);
      return NextResponse.json({ error: "No se pudo revocar." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Shares DELETE]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
