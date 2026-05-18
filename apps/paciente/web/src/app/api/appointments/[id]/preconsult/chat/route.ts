import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  preconsultChatTurn,
  PreconsultChatUnavailableError,
} from '@/lib/services/preconsult/gemini-preconsult-chat';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Pre-consulta IA — chat turn
// -------------------------------------------------------------------
// Body: { history: ChatMessage[], message: string }
// Returns the assistant's next message in plain text. Chat history is kept
// client-side to avoid a write per turn — the existing single-turn
// `/preconsult` endpoint is what saves the final structured brief.
// -------------------------------------------------------------------

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().trim().min(1).max(2000),
});

const bodySchema = z.object({
  history: z.array(messageSchema).max(50),
  message: z.string().trim().min(1).max(2000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const { id: appointmentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' },
        { status: 400 },
      );
    }

    const { data: appt, error: aptError } = await supabase
      .from('appointments')
      .select('id, patient_id, status')
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (aptError || !appt) {
      return NextResponse.json(
        { error: 'Cita no encontrada.' },
        { status: 404 },
      );
    }
    if (appt.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'Cita no encontrada.' },
        { status: 404 },
      );
    }
    if (appt.status === 'cancelled' || appt.status === 'completed') {
      return NextResponse.json(
        { error: 'No puedes usar la pre-consulta para esta cita.' },
        { status: 400 },
      );
    }

    let reply: string;
    try {
      reply = await preconsultChatTurn(parsed.data.history, parsed.data.message);
    } catch (err) {
      if (err instanceof PreconsultChatUnavailableError) {
        console.error('[Preconsult Chat]', err.message);
        return NextResponse.json(
          {
            error:
              'El asistente IA no está disponible. Intenta de nuevo en unos minutos.',
            code: 'ai_unavailable',
          },
          { status: 503 },
        );
      }
      throw err;
    }

    return NextResponse.json({ data: { reply } });
  } catch (error) {
    console.error('[Preconsult Chat] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
