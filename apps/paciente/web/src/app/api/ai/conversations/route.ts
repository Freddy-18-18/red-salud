import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// AI Conversations — List Route
// -------------------------------------------------------------------
// GET: List all conversations for the authenticated patient.
// Returns conversations ordered by most recently updated.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const limited = checkRateLimit(request, "authenticated");
    if (limited) return limited;

    // Auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: "No autenticado." },
        { status: 401 }
      );
    }

    // Fetch conversations with last message preview
    const { data: conversations, error } = await supabase
      .from("ai_conversations")
      .select(
        `
        id,
        title,
        created_at,
        updated_at
      `
      )
      .eq("patient_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[AI Conversations] Fetch error:", error);
      return NextResponse.json(
        { error: true, message: "Error al cargar conversaciones." },
        { status: 500 }
      );
    }

    // For each conversation, fetch the last message to use as preview
    const conversationsWithPreview = await Promise.all(
      (conversations ?? []).map(async (conv) => {
        const { data: lastMsg } = await supabase
          .from("ai_messages")
          .select("content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          id: conv.id,
          title: conv.title,
          last_message: lastMsg?.content
            ? lastMsg.content.length > 80
              ? lastMsg.content.slice(0, 77) + "..."
              : lastMsg.content
            : null,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
        };
      })
    );

    return NextResponse.json({ data: conversationsWithPreview });
  } catch (error) {
    console.error("[AI Conversations] Unexpected error:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
