import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ id: string; attId: string }>;
}

/**
 * DELETE /api/appointments/[id]/attachments/[attId]
 * Removes both the row in appointment_attachments (which fires the trigger to
 * decrement attachments_count) AND the actual file from Storage.
 */
export async function DELETE(_request: NextRequest, ctx: Params) {
  try {
    const { id: appointmentId, attId } = await ctx.params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: true, message: 'No autenticado' }, { status: 401 });
    }

    // Fetch para obtener el storage_path (necesario para borrar del bucket).
    const { data: row, error: fetchError } = await supabase
      .from('appointment_attachments')
      .select('id, storage_path, appointment_id')
      .eq('id', attId)
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (fetchError || !row) {
      return NextResponse.json(
        { error: true, message: 'Adjunto no encontrado.' },
        { status: 404 },
      );
    }

    // Borrar del bucket
    const { error: removeError } = await supabase.storage
      .from('appointment_attachments')
      .remove([row.storage_path]);

    // Aunque falle Storage (archivo huérfano), borrar la fila igual — el RLS
    // garantiza que sea del doctor.
    const { error: deleteError } = await supabase
      .from('appointment_attachments')
      .delete()
      .eq('id', attId);

    if (deleteError) {
      return NextResponse.json(
        { error: true, message: `No pudimos borrar la referencia: ${deleteError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      error: false,
      data: { storage_removed: !removeError },
    });
  } catch (err) {
    console.error('[attachments DELETE] error', err);
    return NextResponse.json({ error: true, message: 'Error interno' }, { status: 500 });
  }
}
