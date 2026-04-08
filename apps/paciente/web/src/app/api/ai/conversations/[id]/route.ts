import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// AI Conversation — Detail Route
// -------------------------------------------------------------------
// GET:    Fetch messages for a specific conversation.
// DELETE: Delete a conversation and all its messages.
// -------------------------------------------------------------------

interface RouteParams {
  params: Promise<{ id: string }>;
}

// --- GET: Fetch conversation messages ---

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = checkRateLimit(request, "authenticated");
    if (limited) return limited;

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

    const { id } = await params;

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from("ai_conversations")
      .select("id, title, created_at")
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: true, message: "Conversación no encontrada." },
        { status: 404 }
      );
    }

    // Fetch all messages
    const { data: messages, error: msgError } = await supabase
      .from("ai_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgError) {
      console.error("[AI Conversation] Messages fetch error:", msgError);
      return NextResponse.json(
        { error: true, message: "Error al cargar mensajes." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        id: conversation.id,
        title: conversation.title,
        messages: (messages ?? []).map((msg) => ({
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("[AI Conversation] Unexpected error:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// --- DELETE: Delete a conversation ---

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = checkRateLimit(request, "mutation");
    if (limited) return limited;

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

    const { id } = await params;

    // Delete conversation (cascade deletes messages via FK)
    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", id)
      .eq("patient_id", user.id);

    if (error) {
      console.error("[AI Conversation] Delete error:", error);
      return NextResponse.json(
        { error: true, message: "Error al eliminar la conversación." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[AI Conversation] Delete unexpected error:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
