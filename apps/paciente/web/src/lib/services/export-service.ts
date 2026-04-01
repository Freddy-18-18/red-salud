import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

export type ExportCategory =
  | "perfil"
  | "citas"
  | "laboratorio"
  | "recetas"
  | "vacunas"
  | "vitales"
  | "documentos";

export type ExportFormat = "json" | "csv" | "pdf";

export type ExportStatus = "pending" | "generating" | "completed" | "failed";

export interface ExportRecord {
  id: string;
  patient_id: string;
  categories: ExportCategory[];
  format: ExportFormat;
  status: ExportStatus;
  file_url: string | null;
  file_size_bytes: number | null;
  date_from: string | null;
  date_to: string | null;
  record_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface ExportCategoryCount {
  category: ExportCategory;
  count: number;
}

export interface ExportableData {
  perfil?: Record<string, unknown>;
  citas?: Record<string, unknown>[];
  laboratorio?: Record<string, unknown>[];
  recetas?: Record<string, unknown>[];
  vacunas?: Record<string, unknown>[];
  vitales?: Record<string, unknown>[];
  documentos?: Record<string, unknown>[];
}

export interface CreateExportData {
  categories: ExportCategory[];
  format: ExportFormat;
  date_from?: string;
  date_to?: string;
}

// ─── Constants ───────────────────────────────────────────────────────

export const EXPORT_CATEGORY_CONFIG: Record<
  ExportCategory,
  { label: string; description: string }
> = {
  perfil: {
    label: "Perfil medico",
    description: "Datos personales, alergias, condiciones, medicamentos",
  },
  citas: {
    label: "Citas medicas",
    description: "Historial de consultas y diagnosticos",
  },
  laboratorio: {
    label: "Resultados de laboratorio",
    description: "Examenes y resultados de analisis",
  },
  recetas: {
    label: "Recetas medicas",
    description: "Prescripciones y medicamentos recetados",
  },
  vacunas: {
    label: "Registro de vacunas",
    description: "Vacunas aplicadas y proximas dosis",
  },
  vitales: {
    label: "Signos vitales",
    description: "Mediciones de presion, peso, glucosa, etc.",
  },
  documentos: {
    label: "Documentos medicos",
    description: "Informes, imagenes y archivos subidos",
  },
};

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  json: "JSON",
  csv: "CSV",
  pdf: "PDF",
};

export const EXPORT_STATUS_CONFIG: Record<
  ExportStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "En cola", bg: "bg-gray-100", text: "text-gray-600" },
  generating: { label: "Generando", bg: "bg-blue-50", text: "text-blue-700" },
  completed: { label: "Completado", bg: "bg-emerald-50", text: "text-emerald-700" },
  failed: { label: "Error", bg: "bg-red-50", text: "text-red-700" },
};

// ─── Service ─────────────────────────────────────────────────────────

export const exportService = {
  /**
   * Gathers exportable data counts per category for a patient.
   */
  async getExportCounts(
    patientId: string
  ): Promise<ExportCategoryCount[]> {
    const counts: ExportCategoryCount[] = [];

    // Profile — always 1 if exists
    const { count: profileCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("id", patientId);
    counts.push({ category: "perfil", count: profileCount ?? 0 });

    // Appointments
    const { count: citasCount } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId);
    counts.push({ category: "citas", count: citasCount ?? 0 });

    // Lab results
    const { count: labCount } = await supabase
      .from("lab_orders")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId);
    counts.push({ category: "laboratorio", count: labCount ?? 0 });

    // Prescriptions
    const { count: rxCount } = await supabase
      .from("prescriptions")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId);
    counts.push({ category: "recetas", count: rxCount ?? 0 });

    // Vaccinations
    const { count: vacCount } = await supabase
      .from("vaccination_records")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId);
    counts.push({ category: "vacunas", count: vacCount ?? 0 });

    // Vital signs
    const { count: vitalCount } = await supabase
      .from("vital_signs")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId);
    counts.push({ category: "vitales", count: vitalCount ?? 0 });

    // Documents
    const { count: docCount } = await supabase
      .from("patient_documents")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId);
    counts.push({ category: "documentos", count: docCount ?? 0 });

    return counts;
  },

  /**
   * Fetches exportable data for the selected categories.
   */
  async getExportableData(
    patientId: string,
    categories: ExportCategory[],
    dateRange?: { from?: string; to?: string }
  ): Promise<ExportableData> {
    const result: ExportableData = {};

    for (const cat of categories) {
      switch (cat) {
        case "perfil": {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", patientId)
            .single();
          if (data) result.perfil = data as Record<string, unknown>;
          break;
        }
        case "citas": {
          let query = supabase
            .from("appointments")
            .select("*")
            .eq("patient_id", patientId)
            .order("scheduled_at", { ascending: false });
          if (dateRange?.from) query = query.gte("scheduled_at", dateRange.from);
          if (dateRange?.to) query = query.lte("scheduled_at", dateRange.to);
          const { data } = await query;
          result.citas = (data ?? []) as Record<string, unknown>[];
          break;
        }
        case "laboratorio": {
          let query = supabase
            .from("lab_orders")
            .select("*, lab_results(*)")
            .eq("patient_id", patientId)
            .order("created_at", { ascending: false });
          if (dateRange?.from) query = query.gte("created_at", dateRange.from);
          if (dateRange?.to) query = query.lte("created_at", dateRange.to);
          const { data } = await query;
          result.laboratorio = (data ?? []) as Record<string, unknown>[];
          break;
        }
        case "recetas": {
          let query = supabase
            .from("prescriptions")
            .select("*, prescription_medications(*)")
            .eq("patient_id", patientId)
            .order("prescribed_at", { ascending: false });
          if (dateRange?.from) query = query.gte("prescribed_at", dateRange.from);
          if (dateRange?.to) query = query.lte("prescribed_at", dateRange.to);
          const { data } = await query;
          result.recetas = (data ?? []) as Record<string, unknown>[];
          break;
        }
        case "vacunas": {
          const { data } = await supabase
            .from("vaccination_records")
            .select("*")
            .eq("patient_id", patientId)
            .order("administered_at", { ascending: false });
          result.vacunas = (data ?? []) as Record<string, unknown>[];
          break;
        }
        case "vitales": {
          let query = supabase
            .from("vital_signs")
            .select("*")
            .eq("patient_id", patientId)
            .order("recorded_at", { ascending: false });
          if (dateRange?.from) query = query.gte("recorded_at", dateRange.from);
          if (dateRange?.to) query = query.lte("recorded_at", dateRange.to);
          const { data } = await query;
          result.vitales = (data ?? []) as Record<string, unknown>[];
          break;
        }
        case "documentos": {
          const { data } = await supabase
            .from("patient_documents")
            .select("id, title, category, file_url, created_at")
            .eq("patient_id", patientId)
            .order("created_at", { ascending: false });
          result.documentos = (data ?? []) as Record<string, unknown>[];
          break;
        }
      }
    }

    return result;
  },

  /**
   * Creates an export record and stores the export file.
   */
  async createExport(
    patientId: string,
    payload: CreateExportData
  ): Promise<ExportRecord> {
    // Gather data
    const exportableData = await exportService.getExportableData(
      patientId,
      payload.categories,
      { from: payload.date_from, to: payload.date_to }
    );

    // Count total records
    let recordCount = 0;
    for (const key of Object.keys(exportableData) as (keyof ExportableData)[]) {
      const val = exportableData[key];
      if (Array.isArray(val)) {
        recordCount += val.length;
      } else if (val) {
        recordCount += 1;
      }
    }

    // Generate file content
    let fileContent: string;
    let mimeType: string;
    let fileExtension: string;

    switch (payload.format) {
      case "csv": {
        fileContent = exportDataToCsv(exportableData);
        mimeType = "text/csv";
        fileExtension = "csv";
        break;
      }
      case "pdf": {
        // PDF generation simplified — store as text-based summary
        fileContent = exportDataToText(exportableData);
        mimeType = "text/plain";
        fileExtension = "txt";
        break;
      }
      case "json":
      default: {
        fileContent = JSON.stringify(exportableData, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
        break;
      }
    }

    const fileName = `exports/${patientId}/${Date.now()}-export.${fileExtension}`;
    const fileBlob = new Blob([fileContent], { type: mimeType });

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("patient-exports")
      .upload(fileName, fileBlob, { contentType: mimeType });

    let fileUrl: string | null = null;
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("patient-exports")
        .getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    }

    // Save export record
    const { data, error } = await supabase
      .from("patient_exports")
      .insert({
        patient_id: patientId,
        categories: payload.categories,
        format: payload.format,
        status: "completed" as ExportStatus,
        file_url: fileUrl,
        file_size_bytes: fileBlob.size,
        date_from: payload.date_from ?? null,
        date_to: payload.date_to ?? null,
        record_count: recordCount,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating export record:", error);
      throw error;
    }

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "data_export",
      description: `Exportacion de datos: ${payload.categories.join(", ")} (${payload.format.toUpperCase()})`,
      status: "success",
    });

    return normalizeExportRecord(data);
  },

  /**
   * Gets past export history.
   */
  async getExportHistory(patientId: string): Promise<ExportRecord[]> {
    const { data, error } = await supabase
      .from("patient_exports")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching export history:", error);
      throw error;
    }

    return (data ?? []).map(normalizeExportRecord);
  },
};

// ─── Normalizers ─────────────────────────────────────────────────────

function normalizeExportRecord(raw: Record<string, unknown>): ExportRecord {
  return {
    id: raw.id as string,
    patient_id: raw.patient_id as string,
    categories: (raw.categories as ExportCategory[]) ?? [],
    format: raw.format as ExportFormat,
    status: raw.status as ExportStatus,
    file_url: (raw.file_url as string) ?? null,
    file_size_bytes: raw.file_size_bytes != null ? Number(raw.file_size_bytes) : null,
    date_from: (raw.date_from as string) ?? null,
    date_to: (raw.date_to as string) ?? null,
    record_count: Number(raw.record_count) || 0,
    created_at: raw.created_at as string,
    completed_at: (raw.completed_at as string) ?? null,
  };
}

// ─── Export formatters ───────────────────────────────────────────────

function exportDataToCsv(data: ExportableData): string {
  const sections: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;

    const rows = Array.isArray(value) ? value : [value];
    if (rows.length === 0) continue;

    // Section header
    sections.push(`\n--- ${key.toUpperCase()} ---`);

    // Get all keys from the first row
    const headers = Object.keys(rows[0]);
    sections.push(headers.join(","));

    for (const row of rows) {
      const values = headers.map((h) => {
        const val = (row as Record<string, unknown>)[h];
        if (val == null) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        // Escape CSV values
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      });
      sections.push(values.join(","));
    }
  }

  return sections.join("\n");
}

function exportDataToText(data: ExportableData): string {
  const lines: string[] = [
    "═══════════════════════════════════════",
    "  EXPORTACION DE DATOS MEDICOS",
    `  Fecha: ${new Date().toLocaleDateString("es-VE")}`,
    "═══════════════════════════════════════",
    "",
  ];

  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;

    const rows = Array.isArray(value) ? value : [value];
    const categoryConfig = EXPORT_CATEGORY_CONFIG[key as ExportCategory];
    lines.push(`── ${categoryConfig?.label ?? key} ──`);
    lines.push(`   (${rows.length} registro${rows.length !== 1 ? "s" : ""})`);
    lines.push("");

    for (const row of rows) {
      for (const [field, val] of Object.entries(row as Record<string, unknown>)) {
        if (val != null && field !== "id" && !field.endsWith("_id")) {
          const display =
            typeof val === "object" ? JSON.stringify(val) : String(val);
          lines.push(`   ${field}: ${display}`);
        }
      }
      lines.push("   ---");
    }

    lines.push("");
  }

  return lines.join("\n");
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function formatFileSize(bytes: number | null): string {
  if (bytes == null || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIdx = 0;
  while (size >= 1024 && unitIdx < units.length - 1) {
    size /= 1024;
    unitIdx++;
  }
  return `${size.toFixed(unitIdx === 0 ? 0 : 1)} ${units[unitIdx]}`;
}

export function formatExportDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
