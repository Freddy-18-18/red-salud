import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validation/validate';
import { completeFollowUpSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Follow-Up Item — BFF API Route
// -------------------------------------------------------------------
// PATCH: Mark a follow-up item as complete.
// Requires authentication and ownership verification.
// -------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const supabase = await createClient();
    const { id } = await params;

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesion para continuar.' },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    const validation = validateBody(completeFollowUpSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // --- Verify ownership ---
    const { data: existing, error: findError } = await supabase
      .from('appointment_follow_ups')
      .select('id, patient_id')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: 'Seguimiento no encontrado.' },
        { status: 404 },
      );
    }

    if (existing.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar este seguimiento.' },
        { status: 403 },
      );
    }

    // --- Update follow-up ---
    const updatePayload: Record<string, unknown> = {
      completed: data.completed,
      completed_at: data.completed ? new Date().toISOString() : null,
    };

    if (data.notes !== undefined) {
      updatePayload.notes = data.notes.trim() || null;
    }

    const { data: followUp, error: updateError } = await supabase
      .from('appointment_follow_ups')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Follow-Ups PATCH] Update error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar el seguimiento.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: followUp });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Solicitud invalida. Verifica los datos enviados.' },
        { status: 400 },
      );
    }
    console.error('[Follow-Ups PATCH] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
