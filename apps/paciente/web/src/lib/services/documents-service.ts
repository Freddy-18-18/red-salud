import { supabase } from "@/lib/supabase/client";

// --- Types ---

export type DocumentCategory =
  | "laboratorio"
  | "receta"
  | "informe"
  | "seguro"
  | "vacuna"
  | "factura"
  | "otro";

export interface PatientDocument {
  id: string;
  patient_id: string;
  title: string;
  document_type: DocumentCategory;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  provider_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentMetadata {
  title: string;
  document_type: DocumentCategory;
  provider_name?: string | null;
  notes?: string | null;
}

export interface VaccinationRecord {
  id: string;
  patient_id: string;
  vaccine_name: string;
  dose_number: number | null;
  administered_date: string;
  provider_name: string | null;
  lot_number: string | null;
  next_dose_date: string | null;
  notes: string | null;
  document_id: string | null;
  created_at: string;
}

export interface CreateVaccinationData {
  vaccine_name: string;
  dose_number?: number | null;
  administered_date: string;
  provider_name?: string | null;
  lot_number?: string | null;
  next_dose_date?: string | null;
  notes?: string | null;
  document_id?: string | null;
}

export interface CategoryCount {
  category: DocumentCategory;
  count: number;
}

export interface SharedDocument {
  id: string;
  document_id: string;
  doctor_id: string;
  shared_at: string;
  doctor_name?: string;
}

// --- Constants ---

export const DOCUMENT_CATEGORIES: {
  value: DocumentCategory;
  label: string;
  icon: string;
}[] = [
  { value: "laboratorio", label: "Resultados de laboratorio", icon: "flask-conical" },
  { value: "receta", label: "Recetas", icon: "pill" },
  { value: "informe", label: "Informes medicos", icon: "hospital" },
  { value: "seguro", label: "Tarjetas de seguro", icon: "credit-card" },
  { value: "vacuna", label: "Vacunas", icon: "syringe" },
  { value: "factura", label: "Facturas y recibos", icon: "receipt" },
  { value: "otro", label: "Otros documentos", icon: "file" },
];

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const STORAGE_BUCKET = "patient-documents";

// --- Service ---

export const documentsService = {
  async getDocuments(
    patientId: string,
    category?: DocumentCategory
  ): Promise<PatientDocument[]> {
    let query = supabase
      .from("patient_documents")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("document_type", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }

    return (data ?? []).map(normalizeDocument);
  },

  async getDocument(id: string): Promise<PatientDocument> {
    const { data, error } = await supabase
      .from("patient_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching document:", error);
      throw error;
    }

    return normalizeDocument(data);
  },

  async uploadDocument(
    patientId: string,
    file: File,
    metadata: DocumentMetadata
  ): Promise<PatientDocument> {
    // Upload file to storage
    const ext = file.name.split(".").pop() || "bin";
    const filePath = `${patientId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    // Insert metadata
    const { data, error } = await supabase
      .from("patient_documents")
      .insert({
        patient_id: patientId,
        title: metadata.title,
        document_type: metadata.document_type,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        provider_name: metadata.provider_name || null,
        notes: metadata.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving document metadata:", error);
      // Try to clean up the uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      throw error;
    }

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "document_uploaded",
      description: `Documento subido: ${metadata.title} (${getCategoryLabel(metadata.document_type)})`,
      status: "success",
    });

    return normalizeDocument(data);
  },

  async deleteDocument(id: string, fileUrl: string): Promise<void> {
    // Extract file path from URL
    const urlParts = fileUrl.split(`/${STORAGE_BUCKET}/`);
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    }

    const { error } = await supabase
      .from("patient_documents")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  async shareWithDoctor(
    documentId: string,
    doctorId: string,
    patientId: string
  ): Promise<SharedDocument> {
    const { data, error } = await supabase
      .from("shared_documents")
      .insert({
        document_id: documentId,
        doctor_id: doctorId,
        patient_id: patientId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error sharing document:", error);
      throw error;
    }

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "document_shared",
      description: `Documento compartido con doctor`,
      status: "success",
    });

    return {
      id: data.id as string,
      document_id: data.document_id as string,
      doctor_id: data.doctor_id as string,
      shared_at: data.shared_at as string,
    };
  },

  async getSharedDoctors(documentId: string): Promise<SharedDocument[]> {
    const { data, error } = await supabase
      .from("shared_documents")
      .select("*, doctor:profiles!doctor_id(full_name)")
      .eq("document_id", documentId)
      .order("shared_at", { ascending: false });

    if (error) {
      console.error("Error fetching shared doctors:", error);
      throw error;
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      document_id: row.document_id as string,
      doctor_id: row.doctor_id as string,
      shared_at: row.shared_at as string,
      doctor_name: (row.doctor as Record<string, unknown>)?.full_name as string | undefined,
    }));
  },

  async getRecentDocuments(
    patientId: string,
    limit = 5
  ): Promise<PatientDocument[]> {
    const { data, error } = await supabase
      .from("patient_documents")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent documents:", error);
      throw error;
    }

    return (data ?? []).map(normalizeDocument);
  },

  async getDocumentsByCategory(
    patientId: string
  ): Promise<CategoryCount[]> {
    const { data, error } = await supabase
      .from("patient_documents")
      .select("document_type")
      .eq("patient_id", patientId);

    if (error) {
      console.error("Error fetching category counts:", error);
      throw error;
    }

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const cat = row.document_type as string;
      counts[cat] = (counts[cat] || 0) + 1;
    }

    return DOCUMENT_CATEGORIES.map((c) => ({
      category: c.value,
      count: counts[c.value] || 0,
    }));
  },

  async searchDocuments(
    patientId: string,
    query: string
  ): Promise<PatientDocument[]> {
    const { data, error } = await supabase
      .from("patient_documents")
      .select("*")
      .eq("patient_id", patientId)
      .or(
        `title.ilike.%${query}%,provider_name.ilike.%${query}%,notes.ilike.%${query}%`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching documents:", error);
      throw error;
    }

    return (data ?? []).map(normalizeDocument);
  },

  // ---- Vaccination Records ----

  async getVaccinations(patientId: string): Promise<VaccinationRecord[]> {
    const { data, error } = await supabase
      .from("vaccination_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("administered_date", { ascending: false });

    if (error) {
      console.error("Error fetching vaccinations:", error);
      throw error;
    }

    return (data ?? []).map(normalizeVaccination);
  },

  async addVaccination(
    patientId: string,
    payload: CreateVaccinationData
  ): Promise<VaccinationRecord> {
    const { data, error } = await supabase
      .from("vaccination_records")
      .insert({
        patient_id: patientId,
        vaccine_name: payload.vaccine_name,
        dose_number: payload.dose_number || null,
        administered_date: payload.administered_date,
        provider_name: payload.provider_name || null,
        lot_number: payload.lot_number || null,
        next_dose_date: payload.next_dose_date || null,
        notes: payload.notes || null,
        document_id: payload.document_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding vaccination:", error);
      throw error;
    }

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "vaccination_added",
      description: `Vacuna registrada: ${payload.vaccine_name}`,
      status: "success",
    });

    return normalizeVaccination(data);
  },

  async deleteVaccination(id: string): Promise<void> {
    const { error } = await supabase
      .from("vaccination_records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting vaccination:", error);
      throw error;
    }
  },
};

// --- Normalizers ---

function normalizeDocument(raw: Record<string, unknown>): PatientDocument {
  return {
    id: raw.id as string,
    patient_id: raw.patient_id as string,
    title: raw.title as string,
    document_type: raw.document_type as DocumentCategory,
    file_url: raw.file_url as string,
    file_name: raw.file_name as string,
    file_type: raw.file_type as string,
    file_size: Number(raw.file_size) || 0,
    provider_name: (raw.provider_name as string) ?? null,
    notes: (raw.notes as string) ?? null,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  };
}

function normalizeVaccination(raw: Record<string, unknown>): VaccinationRecord {
  return {
    id: raw.id as string,
    patient_id: raw.patient_id as string,
    vaccine_name: raw.vaccine_name as string,
    dose_number: raw.dose_number != null ? Number(raw.dose_number) : null,
    administered_date: raw.administered_date as string,
    provider_name: (raw.provider_name as string) ?? null,
    lot_number: (raw.lot_number as string) ?? null,
    next_dose_date: (raw.next_dose_date as string) ?? null,
    notes: (raw.notes as string) ?? null,
    document_id: (raw.document_id as string) ?? null,
    created_at: raw.created_at as string,
  };
}

// --- Helpers ---

export function getCategoryLabel(category: DocumentCategory): string {
  return (
    DOCUMENT_CATEGORIES.find((c) => c.value === category)?.label ?? category
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function isImageFile(fileType: string): boolean {
  return fileType.startsWith("image/");
}

export function isPdfFile(fileType: string): boolean {
  return fileType === "application/pdf";
}

export function validateFile(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return "Tipo de archivo no soportado. Usa PDF, JPG, PNG o WebP.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "El archivo excede el tamano maximo de 10MB.";
  }
  return null;
}

export function guessCategory(fileName: string): DocumentCategory {
  const lower = fileName.toLowerCase();
  if (
    lower.includes("lab") ||
    lower.includes("resultado") ||
    lower.includes("hemograma") ||
    lower.includes("sangre")
  ) {
    return "laboratorio";
  }
  if (lower.includes("receta") || lower.includes("prescri")) {
    return "receta";
  }
  if (
    lower.includes("informe") ||
    lower.includes("reporte") ||
    lower.includes("eco") ||
    lower.includes("rayos") ||
    lower.includes("tomografia")
  ) {
    return "informe";
  }
  if (lower.includes("seguro") || lower.includes("poliza") || lower.includes("carnet")) {
    return "seguro";
  }
  if (lower.includes("vacuna") || lower.includes("covid") || lower.includes("inmuniz")) {
    return "vacuna";
  }
  if (lower.includes("factura") || lower.includes("recibo") || lower.includes("pago")) {
    return "factura";
  }
  return "otro";
}
