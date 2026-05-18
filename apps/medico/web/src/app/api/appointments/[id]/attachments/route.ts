import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Attachment endpoints for an appointment.
 *
 *   POST   /api/appointments/[id]/attachments   - upload (FormData)
 *   GET    /api/appointments/[id]/attachments   - list
 *
 * Per-attachment deletion lives in [attId]/route.ts.
 *
 * Auth: caller MUST be the appointment.doctor_id (enforced via RLS on
 * appointment_attachments + the storage bucket policies).
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_APPT = 5;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, ctx: Params) {
  try {
    const { id: appointmentId } = await ctx.params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: true, message: 'No autenticado' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('appointment_attachments')
      .select('id, file_name, file_size, mime_type, storage_path, uploaded_at')
      .eq('appointment_id', appointmentId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: true, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: false, data: data ?? [] });
  } catch (err) {
    console.error('[attachments GET] error', err);
    return NextResponse.json({ error: true, message: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, ctx: Params) {
  try {
    const { id: appointmentId } = await ctx.params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: true, message: 'No autenticado' }, { status: 401 });
    }

    // Caller debe ser el doctor de la cita (RLS también lo enforce).
    const { data: appt, error: apptError } = await supabase
      .from('appointments')
      .select('id, doctor_id, attachments_count')
      .eq('id', appointmentId)
      .maybeSingle();

    if (apptError || !appt || appt.doctor_id !== user.id) {
      return NextResponse.json(
        { error: true, message: 'Cita no encontrada o sin permisos.' },
        { status: 403 },
      );
    }

    if ((appt.attachments_count ?? 0) >= MAX_FILES_PER_APPT) {
      return NextResponse.json(
        {
          error: true,
          message: `Máximo ${MAX_FILES_PER_APPT} archivos por cita.`,
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: true, message: 'Archivo faltante.' },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: true, message: 'Archivo inválido o supera 10MB.' },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        {
          error: true,
          message: 'Tipo de archivo no permitido. Aceptamos JPG, PNG, WEBP, GIF, PDF, DOC y DOCX.',
        },
        { status: 400 },
      );
    }

    // Path convention: {appointment_id}/{timestamp}-{filename}
    // Sanitize filename — solo alphanum, dash, dot, underscore.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const storagePath = `${appointmentId}/${Date.now()}-${safeName}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('appointment_attachments')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: true, message: `Upload falló: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // Registrar la fila en appointment_attachments (el trigger actualiza attachments_count).
    const { data: rowData, error: insertError } = await supabase
      .from('appointment_attachments')
      .insert({
        appointment_id: appointmentId,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      })
      .select('id, file_name, file_size, mime_type, storage_path, uploaded_at')
      .single();

    if (insertError) {
      // Rollback storage si falló la fila DB
      await supabase.storage.from('appointment_attachments').remove([storagePath]);
      return NextResponse.json(
        { error: true, message: `Registro falló: ${insertError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: false, data: rowData });
  } catch (err) {
    console.error('[attachments POST] error', err);
    return NextResponse.json({ error: true, message: 'Error interno' }, { status: 500 });
  }
}
