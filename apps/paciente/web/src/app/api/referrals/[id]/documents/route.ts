import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

interface AttachedDoc {
  id?: string;
  name: string;
  url: string;
  type: string;
}

const putSchema = z.object({
  document_ids: z.array(z.string().uuid()).max(10),
});

// Replace the attached_documents list of a referral with documents from the
// patient's library. The patient owns both, so we just verify ownership.
export async function PUT(
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
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    // Verify the referral belongs to the patient.
    const { data: ref } = await supabase
      .from("medical_referrals")
      .select("id")
      .eq("id", id)
      .eq("patient_id", user.id)
      .maybeSingle();
    if (!ref) return NextResponse.json({ error: "Referencia no encontrada." }, { status: 404 });

    // Fetch the documents and ensure they belong to the patient.
    let attached: AttachedDoc[] = [];
    if (parsed.data.document_ids.length > 0) {
      const { data: docs } = await supabase
        .from("patient_documents")
        .select("id, document_name, file_url, mime_type")
        .eq("patient_id", user.id)
        .in("id", parsed.data.document_ids);
      attached = (docs ?? []).map((d) => ({
        id: d.id,
        name: d.document_name,
        url: d.file_url,
        type: d.mime_type,
      }));
    }

    const { error } = await supabase
      .from("medical_referrals")
      .update({ attached_documents: attached })
      .eq("id", id)
      .eq("patient_id", user.id);

    if (error) {
      console.error("[referral docs PUT]", error);
      return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
    }
    return NextResponse.json({ data: { attached } });
  } catch (e) {
    console.error("[referral docs PUT]", e);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
