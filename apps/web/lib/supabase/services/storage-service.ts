import { supabase } from "../client";
import { logActivity } from "./activity-service";

export async function uploadAvatar(userId: string, file: File) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    await logActivity(userId, "avatar_update", "Foto de perfil actualizada");

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error };
  }
}

export async function uploadDocument(
  userId: string,
  file: File,
  documentType: string,
  documentName: string
) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${documentType}-${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from("patient_documents")
      .insert({
        patient_id: userId,
        document_type: documentType,
        document_name: documentName,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        status: "pending",
      });

    if (insertError) throw insertError;

    await logActivity(
      userId,
      "document_upload",
      `Documento subido: ${documentName}`
    );

    return { success: true };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { success: false, error };
  }
}
