import { supabase } from "../client";

export async function getPatientDocuments(userId: string) {
  try {
    const { data, error } = await supabase
      .from("patient_documents")
      .select("*")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { success: false, error };
  }
}
