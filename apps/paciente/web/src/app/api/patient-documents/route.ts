import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Storage layout: bucket "documents", path "documents/{user_id}/{file}".
// RLS policies enforce that only the owner can read/insert/delete this prefix.
const STORAGE_BUCKET = "documents";
const STORAGE_PREFIX = "documents";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// List the authenticated patient's stored documents.
export async function GET(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "authenticated");
    if (limited) return limited;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data, error } = await supabase
      .from("patient_documents")
      .select(
        "id, document_type, document_name, file_url, file_size, mime_type, status, uploaded_at, created_at",
      )
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[patient-documents GET]", error);
      return NextResponse.json({ data: [] });
    }
    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    console.error("[patient-documents GET]", e);
    return NextResponse.json({ data: [] });
  }
}

// Upload a new document — multipart form with `file`.
export async function POST(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, "mutation");
    if (limited) return limited;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Adjuntá un archivo válido." },
        { status: 400 },
      );
    }
    if (!ACCEPTED_MIMES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Usá PDF, JPG, PNG o WebP." },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "El archivo supera el tamaño máximo de 10 MB." },
        { status: 400 },
      );
    }

    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const filePath = `${STORAGE_PREFIX}/${user.id}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      console.error("[patient-documents POST upload]", uploadErr);
      return NextResponse.json(
        { error: "No se pudo subir el archivo." },
        { status: 500 },
      );
    }

    // The "documents" bucket is private. Issue a signed URL with a long TTL
    // so the public share page (and the patient's library) can render the
    // file without re-authenticating. Refreshing is handled by re-uploading.
    const { data: signed, error: signErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signErr || !signed?.signedUrl) {
      console.error("[patient-documents POST sign]", signErr);
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      return NextResponse.json(
        { error: "No se pudo firmar el archivo." },
        { status: 500 },
      );
    }
    const fileUrl = signed.signedUrl;

    const documentType = inferType(file.name, file.type);
    const documentName = file.name.replace(/\.[^.]+$/, "").slice(0, 120);

    const { data, error } = await supabase
      .from("patient_documents")
      .insert({
        patient_id: user.id,
        document_type: documentType,
        document_name: documentName,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.type,
        status: "pending",
      })
      .select(
        "id, document_type, document_name, file_url, file_size, mime_type, status, uploaded_at, created_at",
      )
      .single();

    if (error || !data) {
      console.error("[patient-documents POST insert]", error);
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      return NextResponse.json(
        { error: "No se pudo registrar el documento." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error("[patient-documents POST]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

function inferType(fileName: string, mime: string): string {
  const lower = fileName.toLowerCase();
  if (
    lower.includes("hemograma") ||
    lower.includes("lab") ||
    lower.includes("lipid") ||
    lower.includes("perfil") ||
    lower.includes("sangre")
  )
    return "laboratorio";
  if (
    lower.includes("eco") ||
    lower.includes("rayos") ||
    lower.includes("rx") ||
    lower.includes("tomografia") ||
    lower.includes("resonancia") ||
    mime.startsWith("image/")
  )
    return "imagen";
  if (lower.includes("receta") || lower.includes("prescri")) return "receta";
  if (lower.includes("informe") || lower.includes("reporte")) return "informe";
  return "otro";
}
