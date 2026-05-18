import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  briefToNotes,
  summarizePreconsult,
  PreconsultUnavailableError,
} from '@/lib/services/preconsult/gemini-preconsult';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Pre-consultation summarizer — POST
// -------------------------------------------------------------------
// Body:
//   { symptoms: string, save?: boolean }
//
// Flow:
//   - Validates ownership + cita is upcoming and not cancelled/completed.
//   - Hands the symptoms text to Gemini, gets a structured brief.
//   - Returns the brief always.
//   - If `save` is true, also appends the formatted brief to
//     `appointments.notes` (replacing any previous "[Pre-consulta IA]"
//     block) so the doctor sees it on the medico side.
// -------------------------------------------------------------------

const PRECONSULT_NOTES_HEADER = '[Pre-consulta IA]';

const bodySchema = z.object({
  symptoms: z.string().trim().min(10, 'Cuéntanos un poco más').max(2000),
  save: z.boolean().optional().default(false),
});

function stripPreviousPreconsultBlock(notes: string | null): string {
  if (!notes) return '';
  // Remove a previous "[Pre-consulta IA]" block (header + every line until
  // the next blank line or end-of-string). We keep any free-form notes the
  // patient wrote outside the AI block intact.
  const idx = notes.indexOf(PRECONSULT_NOTES_HEADER);
  if (idx === -1) return notes;
  const before = notes.slice(0, idx).trimEnd();
  const after = notes.slice(idx);
  const blockEnd = after.indexOf('\n\n');
  const tail = blockEnd >= 0 ? after.slice(blockEnd).trimStart() : '';
  return [before, tail].filter(Boolean).join('\n\n').trim();
}

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
        {
          error: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
        },
        { status: 400 },
      );
    }
    const { symptoms, save } = parsed.data;

    const { data: appt, error: aptError } = await supabase
      .from('appointments')
      .select('id, patient_id, status, notes, scheduled_at')
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
    if (appt.status === 'cancelled') {
      return NextResponse.json(
        { error: 'No puedes completar la pre-consulta de una cita cancelada.' },
        { status: 400 },
      );
    }
    if (appt.status === 'completed') {
      return NextResponse.json(
        { error: 'La cita ya ocurrió.' },
        { status: 400 },
      );
    }

    let brief;
    try {
      brief = await summarizePreconsult(symptoms);
    } catch (err) {
      if (err instanceof PreconsultUnavailableError) {
        console.error('[Preconsult]', err.message);
        return NextResponse.json(
          {
            error:
              'El asistente IA no está disponible en este momento. Intenta de nuevo en unos minutos.',
            code: 'ai_unavailable',
          },
          { status: 503 },
        );
      }
      throw err;
    }

    if (save) {
      const cleaned = stripPreviousPreconsultBlock(appt.notes as string | null);
      const aiBlock = briefToNotes(brief);
      const updatedNotes = cleaned ? `${cleaned}\n\n${aiBlock}` : aiBlock;
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ notes: updatedNotes })
        .eq('id', appointmentId);
      if (updateError) {
        console.error('[Preconsult] save error:', updateError);
        // Non-fatal: brief already generated. Surface the partial state.
        return NextResponse.json({
          data: { brief, saved: false },
          warning:
            'El resumen se generó pero no pudimos guardarlo. Intenta de nuevo.',
        });
      }
    }

    return NextResponse.json({
      data: { brief, saved: !!save },
    });
  } catch (error) {
    console.error('[Preconsult] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
