/**
 * @file doctor-documents-service.ts
 * @description Servicio para gestionar documentos profesionales de médicos.
 * Incluye funciones para CRUD de documentos y análisis OCR con Gemini.
 * @module Services/DoctorDocuments
 * 
 * @example
 * import { uploadDoctorDocument, getDoctorDocuments } from '@/lib/supabase/services/doctor-documents-service';
 * const docs = await getDoctorDocuments(userId);
 */

import { supabase } from "../client";
import { logActivity } from "./activity-service";

/**
 * Tipos de documentos permitidos para médicos
 */
export const DOCTOR_DOCUMENT_TYPES = {
    titulo: { name: "Título Universitario", required: true },
    mpps: { name: "Certificado MPPS", required: true },
    cedula: { name: "Cédula de Identidad", required: true },
    especialidad: { name: "Certificado de Especialidad", required: false },
    curso: { name: "Certificados de Cursos", required: false },
    seguro: { name: "Póliza de Responsabilidad Civil", required: false },
} as const;

export type DoctorDocumentType = keyof typeof DOCTOR_DOCUMENT_TYPES;

/**
 * Representa un documento del médico en la base de datos
 */
export interface DoctorDocument {
    /** ID único del documento */
    id: string;
    /** ID del usuario (médico) propietario */
    user_id: string;
    /** Tipo de documento */
    document_type: DoctorDocumentType;
    /** Nombre descriptivo del documento */
    document_name: string;
    /** URL pública del archivo */
    file_url: string;
    /** Ruta del archivo en storage */
    file_path: string;
    /** Tamaño del archivo en bytes */
    file_size: number | null;
    /** Tipo MIME del archivo */
    mime_type: string | null;
    /** Estado de verificación */
    verification_status: "pending" | "verified" | "rejected";
    /** Notas de verificación */
    verification_notes: string | null;
    /** Fecha de verificación */
    verified_at: string | null;
    /** ID del usuario que verificó */
    verified_by: string | null;
    /** Datos extraídos por OCR */
    extracted_data: ExtractedDocumentData | null;
    /** Fecha de creación */
    created_at: string;
    /** Fecha de última actualización */
    updated_at: string;
}

/**
 * Datos extraídos de un documento mediante OCR
 */
export interface ExtractedDocumentData {
    /** Tipo de documento detectado */
    document_type_detected?: string | null;
    /** Institución que emite el documento */
    institution?: string | null;
    /** Nombre completo del profesional */
    full_name?: string | null;
    /** Fecha de emisión */
    issue_date?: string | null;
    /** Especialidad mencionada */
    specialty?: string | null;
    /** Número de registro */
    registration_number?: string | null;
    /** Texto completo extraído */
    raw_text?: string | null;
    /** Confianza del análisis (0-1) */
    confidence?: number | null;
    /** Timestamp del análisis */
    analyzed_at?: string;
}

/**
 * Parámetros para subir un documento
 */
export interface UploadDocumentParams {
    /** Archivo a subir */
    file: File;
    /** Tipo de documento */
    documentType: DoctorDocumentType;
    /** Nombre personalizado (opcional) */
    documentName?: string;
}

/**
 * Resultado del servicio
 */
export interface ServiceResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Sube un documento del médico a Supabase Storage y guarda el registro
 * 
 * @param userId - ID del médico
 * @param params - Parámetros del documento
 * @returns Resultado con el documento creado
 */
export async function uploadDoctorDocument(
    userId: string,
    params: UploadDocumentParams
): Promise<ServiceResult<DoctorDocument>> {
    try {
        const { file, documentType, documentName } = params;

        // Validar tipo de archivo
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return {
                success: false,
                error: "Tipo de archivo no permitido. Solo PDF, JPG, PNG o WebP."
            };
        }

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return {
                success: false,
                error: "El archivo es demasiado grande. Máximo 10MB."
            };
        }

        // Generar nombre único para el archivo
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
        const timestamp = Date.now();
        const fileName = `${userId}/${documentType}/${timestamp}.${fileExt}`;

        // Subir archivo a Storage
        const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("[DoctorDocuments] Upload error:", uploadError);
            return {
                success: false,
                error: "Error al subir el archivo. Intenta nuevamente."
            };
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
            .from("documents")
            .getPublicUrl(fileName);

        // Nombre del documento
        const docName = documentName || DOCTOR_DOCUMENT_TYPES[documentType].name;

        // Crear registro en la base de datos
        const { data: docData, error: insertError } = await supabase
            .from("doctor_documents")
            .insert({
                user_id: userId,
                document_type: documentType,
                document_name: docName,
                file_url: urlData.publicUrl,
                file_path: fileName,
                file_size: file.size,
                mime_type: file.type,
                verification_status: "pending",
            })
            .select()
            .single();

        if (insertError) {
            console.error("[DoctorDocuments] Insert error:", insertError);
            // Intentar eliminar el archivo subido
            await supabase.storage.from("documents").remove([fileName]);
            return {
                success: false,
                error: "Error al registrar el documento."
            };
        }

        // Registrar actividad
        await logActivity(
            userId,
            "document_upload",
            `Documento subido: ${docName} (${documentType})`
        );

        return { success: true, data: docData as DoctorDocument };
    } catch (_error) {
        console.error("[DoctorDocuments] Unexpected error:", _error);
        return {
            success: false,
            error: _error instanceof Error ? _error.message : "Error inesperado al subir documento."
        };
    }
}

/**
 * Obtiene todos los documentos de un médico
 * 
 * @param userId - ID del médico
 * @returns Lista de documentos
 */
export async function getDoctorDocuments(
    userId: string
): Promise<ServiceResult<DoctorDocument[]>> {
    try {
        const { data, error } = await supabase
            .from("doctor_documents")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[DoctorDocuments] Fetch error:", error);
            return { success: false, error: "Error al obtener documentos." };
        }

        return { success: true, data: (data || []) as DoctorDocument[] };
    } catch (_error) {
        console.error("[DoctorDocuments] Unexpected error:", _error);
        return { success: false, error: _error instanceof Error ? _error.message : "Error desconocido" };
    }
}

/**
 * Obtiene un documento específico por ID
 * 
 * @param documentId - ID del documento
 * @param userId - ID del médico (para verificar propiedad)
 * @returns Documento encontrado
 */
export async function getDoctorDocument(
    documentId: string,
    userId: string
): Promise<ServiceResult<DoctorDocument>> {
    try {
        const { data, error } = await supabase
            .from("doctor_documents")
            .select("*")
            .eq("id", documentId)
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("[DoctorDocuments] Fetch single error:", error);
            return { success: false, error: "Documento no encontrado." };
        }

        return { success: true, data: data as DoctorDocument };
    } catch (_error) {
        console.error("[DoctorDocuments] Unexpected error:", _error);
        return { success: false, error: _error instanceof Error ? _error.message : "Error desconocido" };
    }
}

/**
 * Elimina un documento del médico
 * 
 * @param documentId - ID del documento
 * @param userId - ID del médico
 * @returns Resultado de la operación
 */
export async function deleteDoctorDocument(
    documentId: string,
    userId: string
): Promise<ServiceResult> {
    try {
        // Obtener documento para tener la ruta del archivo
        const { data: doc, error: fetchError } = await supabase
            .from("doctor_documents")
            .select("file_path, document_name, document_type")
            .eq("id", documentId)
            .eq("user_id", userId)
            .single();

        if (fetchError || !doc) {
            return { success: false, error: "Documento no encontrado." };
        }

        // Eliminar archivo de Storage
        const { error: storageError } = await supabase.storage
            .from("documents")
            .remove([doc.file_path]);

        if (storageError) {
            console.error("[DoctorDocuments] Storage delete error:", storageError);
            // Continuar con la eliminación del registro aunque falle storage
        }

        // Eliminar registro de la base de datos
        const { error: deleteError } = await supabase
            .from("doctor_documents")
            .delete()
            .eq("id", documentId)
            .eq("user_id", userId);

        if (deleteError) {
            console.error("[DoctorDocuments] Delete error:", deleteError);
            return { success: false, error: "Error al eliminar documento." };
        }

        // Registrar actividad
        await logActivity(
            userId,
            "document_delete",
            `Documento eliminado: ${doc.document_name} (${doc.document_type})`
        );

        return { success: true };
    } catch (_error) {
        console.error("[DoctorDocuments] Unexpected error:", _error);
        return { success: false, error: _error instanceof Error ? _error.message : "Error desconocido" };
    }
}

/**
 * Genera una URL de descarga temporal para un documento
 * 
 * @param filePath - Ruta del archivo en storage
 * @param expiresIn - Tiempo de expiración en segundos (default: 60)
 * @returns URL de descarga
 */
export async function getDocumentDownloadUrl(
    filePath: string,
    expiresIn: number = 60
): Promise<ServiceResult<string>> {
    try {
        const { data, error } = await supabase.storage
            .from("documents")
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            console.error("[DoctorDocuments] Signed URL error:", error);
            return { success: false, error: "Error al generar enlace de descarga." };
        }

        return { success: true, data: data.signedUrl };
    } catch (_error) {
        console.error("[DoctorDocuments] Unexpected error:", _error);
        return { success: false, error: _error instanceof Error ? _error.message : "Error desconocido" };
    }
}

/**
 * Actualiza los datos extraídos de un documento (para OCR)
 * 
 * @param documentId - ID del documento
 * @param userId - ID del médico
 * @param extractedData - Datos extraídos por OCR
 * @returns Resultado de la operación
 */
export async function updateDocumentExtractedData(
    documentId: string,
    userId: string,
    extractedData: ExtractedDocumentData
): Promise<ServiceResult> {
    try {
        const { error } = await supabase
            .from("doctor_documents")
            .update({
                extracted_data: {
                    ...extractedData,
                    analyzed_at: new Date().toISOString(),
                },
            })
            .eq("id", documentId)
            .eq("user_id", userId);

        if (error) {
            console.error("[DoctorDocuments] Update extracted data error:", error);
            return { success: false, error: "Error al guardar datos extraídos." };
        }

        return { success: true };
    } catch (_error) {
        console.error("[DoctorDocuments] Unexpected error:", _error);
        return { success: false, error: _error instanceof Error ? _error.message : "Error desconocido" };
    }
}

/**
 * Obtiene el progreso de documentos del médico
 * 
 * @param userId - ID del médico
 * @returns Estadísticas de documentos
 */
export async function getDocumentProgress(userId: string): Promise<ServiceResult<{
    total: number;
    required: number;
    uploaded: number;
    verified: number;
    pending: number;
    rejected: number;
    missingRequired: string[];
}>> {
    try {
        const { data: docs, error } = await supabase
            .from("doctor_documents")
            .select("document_type, verification_status")
            .eq("user_id", userId);

        if (error) {
            return { success: false, error: "Error al obtener progreso." };
        }

        const uploadedTypes = new Set(docs?.map(d => d.document_type) || []);
        const requiredTypes = Object.entries(DOCTOR_DOCUMENT_TYPES)
            .filter(([, config]) => config.required)
            .map(([type]) => type);

        const missingRequired = requiredTypes.filter(t => !uploadedTypes.has(t));

        return {
            success: true,
            data: {
                total: Object.keys(DOCTOR_DOCUMENT_TYPES).length,
                required: requiredTypes.length,
                uploaded: docs?.length || 0,
                verified: docs?.filter(d => d.verification_status === "verified").length || 0,
                pending: docs?.filter(d => d.verification_status === "pending").length || 0,
                rejected: docs?.filter(d => d.verification_status === "rejected").length || 0,
                missingRequired: missingRequired.map(t => DOCTOR_DOCUMENT_TYPES[t as DoctorDocumentType].name),
            },
        };
    } catch (_error) {
        return { success: false, error: _error instanceof Error ? _error.message : "Error desconocido" };
    }
}
