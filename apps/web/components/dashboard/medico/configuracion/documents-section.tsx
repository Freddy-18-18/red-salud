/**
 * @file documents-section.tsx
 * @description Sección de documentos profesionales para configuración del médico.
 * Muestra todos los tipos de documentos como tarjetas con acciones individuales.
 * La cédula usa verificación Didit para validar identidad + prueba de vida.
 * @module Dashboard/Medico/Configuracion
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Progress } from "@red-salud/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@red-salud/ui";
import {
    Upload,
    Download,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    Eye,
    Trash2,
    Shield,
    Sparkles,
    FileImage,
    FileScan,
    ExternalLink,
    GraduationCap,
    IdCard,
    Stethoscope,
    Award,
    FileCheck,
    X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
    getDoctorDocuments,
    uploadDoctorDocument,
    deleteDoctorDocument,
    getDocumentDownloadUrl,
    type DoctorDocumentType,
} from "@/lib/supabase/services/doctor-documents-service";
import { cn } from "@red-salud/core/utils";
import { toast } from "sonner";

/**
 * Configuración de cada tipo de documento
 */
const DOCUMENT_CONFIGS: Record<DoctorDocumentType, {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    required: boolean;
    useDidit?: boolean; // Si usa verificación Didit
}> = {
    cedula: {
        name: "Cédula de Identidad",
        description: "Verificación de identidad con foto y prueba de vida",
        icon: IdCard,
        required: true,
        useDidit: true, // Este usa Didit para verificación
    },
    titulo: {
        name: "Título Universitario",
        description: "Título de Médico Cirujano o equivalente",
        icon: GraduationCap,
        required: true,
    },
    mpps: {
        name: "Certificado MPPS",
        description: "Registro del Ministerio de Salud vigente",
        icon: FileCheck,
        required: true,
    },
    especialidad: {
        name: "Certificado de Especialidad",
        description: "Título de especialista médico (si aplica)",
        icon: Stethoscope,
        required: false,
    },
    curso: {
        name: "Certificados de Cursos",
        description: "Diplomados, cursos y formación adicional",
        icon: Award,
        required: false,
    },
    seguro: {
        name: "Póliza de Responsabilidad Civil",
        description: "Seguro de responsabilidad profesional",
        icon: Shield,
        required: false,
    },
};

/**
 * Documento formateado para la UI
 */
interface DocumentUI {
    id: string;
    name: string;
    type: DoctorDocumentType;
    status: "verified" | "pending" | "rejected";
    uploadDate: string;
    fileUrl: string;
    filePath: string;
    fileSize: number | null;
    mimeType: string | null;
    extractedData: Record<string, unknown>;
}

export function DocumentsSection() {
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<DocumentUI[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<DocumentUI | null>(null);
    const [uploadingType, setUploadingType] = useState<DoctorDocumentType | null>(null);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Estados de Didit
    const [identityVerified, setIdentityVerified] = useState(false);
    const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);

    // Modal de upload
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadType, setUploadType] = useState<DoctorDocumentType | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Carga documentos y estado de verificación
     */
    const loadData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            // Verificar estado de Didit
            const { data: profile } = await supabase
                .from("profiles")
                .select("photo_verified, cedula_verificada, cedula")
                .eq("id", user.id)
                .single();

            if (profile) {
                setIdentityVerified(profile.photo_verified || false);
            }

            // Cargar documentos
            const result = await getDoctorDocuments(user.id);
            if (result.success && result.data) {
                setDocuments(result.data.map(doc => ({
                    id: doc.id,
                    name: doc.document_name,
                    type: doc.document_type,
                    status: doc.verification_status,
                    uploadDate: doc.created_at,
                    fileUrl: doc.file_url,
                    filePath: doc.file_path,
                    fileSize: doc.file_size,
                    mimeType: doc.mime_type,
                    extractedData: (doc.extracted_data || {}) as Record<string, unknown>,
                })));
            }
        } catch (error) {
            console.error("[DocumentsSection] Error:", error);
            toast.error("Error al cargar documentos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    /**
     * Obtener documento por tipo
     */
    const getDocByType = (type: DoctorDocumentType): DocumentUI | null => {
        return documents.find(d => d.type === type) || null;
    };

    /**
     * Inicia verificación Didit (para cédula)
     */
    const handleDiditVerification = async () => {
        setIsVerifyingIdentity(true);
        try {
            const response = await fetch("/api/didit/create-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Error al crear sesión de verificación");
            }

            const data = await response.json();
            if (data.session_url) {
                const width = 700;
                const height = 700;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;

                const popup = window.open(
                    data.session_url,
                    "DiditVerification",
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                // Polling para detectar cuando se cierra
                if (popup) {
                    const checkClosed = setInterval(() => {
                        if (popup.closed) {
                            clearInterval(checkClosed);
                            setIsVerifyingIdentity(false);
                            toast.info("Verificando estado...");
                            setTimeout(() => loadData(), 2000);
                        }
                    }, 1000);
                }

                toast.success("Completa la verificación en la ventana emergente");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error al iniciar verificación");
            setIsVerifyingIdentity(false);
        }
    };

    /**
     * Maneja drop de archivo
     */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Solo PDF, JPG, PNG o WebP");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Máximo 10MB");
            return;
        }
        setSelectedFile(file);
    };

    /**
     * Sube documento
     */
    const handleUpload = async () => {
        if (!selectedFile || !uploadType || !userId) return;

        setUploadingType(uploadType);
        try {
            const result = await uploadDoctorDocument(userId, {
                file: selectedFile,
                documentType: uploadType,
            });

            if (result.success) {
                toast.success("Documento subido correctamente");
                setUploadModalOpen(false);
                setSelectedFile(null);
                setUploadType(null);
                await loadData();
            } else {
                toast.error(result.error || "Error al subir");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error al subir");
        } finally {
            setUploadingType(null);
        }
    };

    /**
     * Abre modal de upload para un tipo específico
     */
    const openUploadModal = (type: DoctorDocumentType) => {
        setUploadType(type);
        setSelectedFile(null);
        setUploadModalOpen(true);
    };

    /**
     * Descarga documento
     */
    const handleDownload = async (doc: DocumentUI) => {
        const result = await getDocumentDownloadUrl(doc.filePath);
        if (result.success && result.data) {
            window.open(result.data, "_blank");
        } else {
            toast.error("Error al descargar");
        }
    };

    /**
     * Elimina documento
     */
    const handleDelete = async (doc: DocumentUI) => {
        if (!userId) return;
        setDeletingId(doc.id);
        try {
            const result = await deleteDoctorDocument(doc.id, userId);
            if (result.success) {
                toast.success("Documento eliminado");
                await loadData();
            } else {
                toast.error(result.error || "Error al eliminar");
            }
        } finally {
            setDeletingId(null);
        }
    };

    /**
     * Analiza documento con OCR
     */
    const handleAnalyze = async (doc: DocumentUI) => {
        setAnalyzingId(doc.id);
        try {
            const response = await fetch(doc.fileUrl);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const analyzeResponse = await fetch("/api/documents/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    documentId: doc.id,
                    imageBase64: base64,
                    mimeType: doc.mimeType,
                }),
            });

            const result = await analyzeResponse.json();
            if (result.success) {
                toast.success("Documento analizado");
                await loadData();
            } else {
                toast.error(result.error || "Error al analizar");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error al recibir respuesta");
        } finally {
            setAnalyzingId(null);
        }
    };

    /** Formato de fecha */
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-VE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    /** Formato de tamaño */
    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "";
        const mb = bytes / (1024 * 1024);
        return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
    };

    // Calcular progreso
    const requiredTypes = Object.entries(DOCUMENT_CONFIGS).filter(([, c]) => c.required);
    const uploadedRequired = requiredTypes.filter(([type]) => {
        if (type === "cedula") return identityVerified;
        return documents.some(d => d.type === type);
    }).length;
    const progressPercent = Math.round((uploadedRequired / requiredTypes.length) * 100);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cargando documentos...</p>
                </div>
            </div>
        );
    }

    // Categorizar documentos
    const requiredDocs = Object.entries(DOCUMENT_CONFIGS).filter(([, c]) => c.required);
    const optionalDocs = Object.entries(DOCUMENT_CONFIGS).filter(([, c]) => !c.required);

    return (
        <div className="space-y-8 -m-10 p-10 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20 min-h-screen">
            {/* Hero Header con estadísticas */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
                            <div className="relative h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <FileCheck className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Verificación de Documentos
                            </h2>
                            <p className="text-blue-100 text-sm max-w-2xl">
                                Completa la verificación de tus documentos profesionales para activar todas las funciones de la plataforma
                            </p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 min-w-[140px]">
                            <div className="text-2xl font-bold text-white mb-1">
                                {uploadedRequired}/{requiredTypes.length}
                            </div>
                            <div className="text-xs text-blue-100">Documentos Requeridos</div>
                            <Progress value={progressPercent} className="h-1.5 mt-2 bg-white/20" />
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 min-w-[140px]">
                            <div className="text-2xl font-bold text-white mb-1">
                                {documents.filter(d => d.status === 'verified').length}
                            </div>
                            <div className="text-xs text-blue-100">Verificados</div>
                            <div className="flex items-center gap-1 mt-2">
                                <CheckCircle className="h-3 w-3 text-green-300" />
                                <span className="text-xs text-green-200">Aprobados</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documentos Requeridos */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 w-1 rounded-full bg-red-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Documentos Obligatorios
                    </h3>
                    <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-400">
                        Requerido
                    </Badge>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {requiredDocs.map(([type, config], index) => {
                    const docType = type as DoctorDocumentType;
                    const doc = getDocByType(docType);
                    const Icon = config.icon;
                    const isDiditType = config.useDidit;
                    const isVerified = isDiditType ? identityVerified : doc?.status === "verified";
                    const isPending = !isDiditType && doc?.status === "pending";
                    const isRejected = !isDiditType && doc?.status === "rejected";
                    const hasDocument = isDiditType ? identityVerified : !!doc;

                    return (
                        <motion.article
                            key={type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl",
                                "bg-white dark:bg-gray-900 border-2",
                                isVerified
                                    ? "border-green-500/50 shadow-lg shadow-green-500/20 hover:border-green-500"
                                    : isPending
                                        ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20 hover:border-yellow-500"
                                        : isRejected
                                            ? "border-red-500/50 shadow-lg shadow-red-500/20 hover:border-red-500"
                                            : "border-gray-200 dark:border-gray-700 hover:border-blue-500/50 shadow-lg"
                            )}
                        >
                            {/* Background gradient decoration */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                isVerified
                                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
                                    : "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
                            )} />
                            
                            <div className="relative space-y-4">
                                {/* Header con Icon y Status */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "relative h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                            isVerified
                                                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                                : isPending
                                                    ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                                                    : isRejected
                                                        ? "bg-gradient-to-br from-red-500 to-pink-600"
                                                        : "bg-gradient-to-br from-gray-400 to-gray-600"
                                        )}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                {config.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {config.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Estado y metadata */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {isVerified && (
                                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1">
                                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Verificado
                                        </Badge>
                                    )}
                                    {isPending && (
                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 px-3 py-1">
                                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                                            En revisión
                                        </Badge>
                                    )}
                                    {isRejected && (
                                        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 px-3 py-1">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Rechazado
                                        </Badge>
                                    )}
                                    {doc && !isDiditType && (
                                        <>
                                            <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                                                {formatDate(doc.uploadDate)}
                                            </Badge>
                                            <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                                                {formatFileSize(doc.fileSize)}
                                            </Badge>
                                        </>
                                    )}
                                    {doc?.extractedData && Object.keys(doc.extractedData).length > 0 && (
                                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 px-3 py-1">
                                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                            Analizado con IA
                                        </Badge>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    {/* Para cédula: usa Didit */}
                                    {isDiditType ? (
                                        identityVerified ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium shadow-lg shadow-green-500/30">
                                                <CheckCircle className="h-5 w-5" />
                                                Identidad Verificada
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={handleDiditVerification}
                                                disabled={isVerifyingIdentity}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
                                            >
                                                {isVerifyingIdentity ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Verificando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Verificar con Didit
                                                        <ExternalLink className="h-3 w-3 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        )
                                    ) : (
                                        /* Para otros documentos: upload normal */
                                        hasDocument ? (
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setPreviewDoc(doc);
                                                        setIsPreviewOpen(true);
                                                    }}
                                                    className="border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-500 transition-all"
                                                    title="Ver documento"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Ver
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAnalyze(doc!)}
                                                    disabled={analyzingId === doc?.id}
                                                    className="border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-500 transition-all"
                                                    title="Analizar con IA"
                                                >
                                                    {analyzingId === doc?.id ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <FileScan className="h-4 w-4 mr-2" />
                                                    )}
                                                    Analizar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(doc!)}
                                                    className="border-2 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-500 transition-all"
                                                    title="Descargar"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Descargar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc!)}
                                                    disabled={deletingId === doc?.id}
                                                    className="border-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500 text-red-600 hover:text-red-700 transition-all"
                                                    title="Eliminar"
                                                >
                                                    {deletingId === doc?.id ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                    )}
                                                    Eliminar
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => openUploadModal(docType)}
                                                disabled={uploadingType === docType}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
                                            >
                                                {uploadingType === docType ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Subiendo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Subir Documento
                                                    </>
                                                )}
                                            </Button>
                                        )
                                    )}
                                </div>

                                {/* Datos extraídos por OCR */}
                                {doc?.extractedData && Object.keys(doc.extractedData).length > 0 && !isDiditType && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700"
                                    >
                                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Información extraída automáticamente con IA:
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {!!doc.extractedData.institution && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Institución</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.extractedData.institution as string}
                                                    </p>
                                                </div>
                                            )}
                                            {!!doc.extractedData.full_name && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Nombre</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.extractedData.full_name as string}
                                                    </p>
                                                </div>
                                            )}
                                            {!!doc.extractedData.specialty && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Especialidad</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.extractedData.specialty as string}
                                                    </p>
                                                </div>
                                            )}
                                            {!!doc.extractedData.issue_date && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fecha de emisión</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.extractedData.issue_date as string}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.article>
                    );
                })}
                </div>
            </section>

            {/* Documentos Opcionales */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Documentos Adicionales
                    </h3>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400">
                        Opcional
                    </Badge>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {optionalDocs.map(([type, config], index) => {
                    const docType = type as DoctorDocumentType;
                    const doc = getDocByType(docType);
                    const Icon = config.icon;
                    const isDiditType = config.useDidit;
                    const isVerified = isDiditType ? identityVerified : doc?.status === "verified";
                    const isPending = !isDiditType && doc?.status === "pending";
                    const isRejected = !isDiditType && doc?.status === "rejected";
                    const hasDocument = isDiditType ? identityVerified : !!doc;

                    return (
                        <motion.article
                            key={type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (requiredDocs.length * 0.08) + (index * 0.08), type: "spring", stiffness: 100 }}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl",
                                "bg-white dark:bg-gray-900 border-2",
                                isVerified
                                    ? "border-green-500/50 shadow-lg shadow-green-500/20 hover:border-green-500"
                                    : isPending
                                        ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20 hover:border-yellow-500"
                                        : isRejected
                                            ? "border-red-500/50 shadow-lg shadow-red-500/20 hover:border-red-500"
                                            : "border-gray-200 dark:border-gray-700 hover:border-blue-500/50 shadow-lg"
                            )}
                        >
                            {/* Background gradient decoration */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                isVerified
                                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
                                    : "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
                            )} />
                            
                            <div className="relative space-y-4">
                                {/* Header con Icon y Status */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "relative h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                            isVerified
                                                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                                : isPending
                                                    ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                                                    : isRejected
                                                        ? "bg-gradient-to-br from-red-500 to-pink-600"
                                                        : "bg-gradient-to-br from-gray-400 to-gray-600"
                                        )}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                {config.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {config.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Estado y metadata */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {isVerified && (
                                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1">
                                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Verificado
                                        </Badge>
                                    )}
                                    {isPending && (
                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 px-3 py-1">
                                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                                            En revisión
                                        </Badge>
                                    )}
                                    {isRejected && (
                                        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 px-3 py-1">
                                            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                                            Rechazado
                                        </Badge>
                                    )}
                                    {doc && !isDiditType && (
                                        <>
                                            <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                                                {formatDate(doc.uploadDate)}
                                            </Badge>
                                            <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                                                {formatFileSize(doc.fileSize)}
                                            </Badge>
                                        </>
                                    )}
                                    {doc?.extractedData && Object.keys(doc.extractedData).length > 0 && (
                                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 px-3 py-1">
                                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                            Analizado con IA
                                        </Badge>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    {hasDocument ? (
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setPreviewDoc(doc);
                                                    setIsPreviewOpen(true);
                                                }}
                                                className="border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-500 transition-all"
                                                title="Ver documento"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAnalyze(doc!)}
                                                disabled={analyzingId === doc?.id}
                                                className="border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-500 transition-all"
                                                title="Analizar con IA"
                                            >
                                                {analyzingId === doc?.id ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <FileScan className="h-4 w-4 mr-2" />
                                                )}
                                                Analizar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownload(doc!)}
                                                className="border-2 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-500 transition-all"
                                                title="Descargar"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(doc!)}
                                                disabled={deletingId === doc?.id}
                                                className="border-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500 text-red-600 hover:text-red-700 transition-all"
                                                title="Eliminar"
                                            >
                                                {deletingId === doc?.id ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Eliminar
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => openUploadModal(docType)}
                                            disabled={uploadingType === docType}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
                                        >
                                            {uploadingType === docType ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Subir Documento
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>

                                {/* Datos extraídos por OCR */}
                                {doc?.extractedData && Object.keys(doc.extractedData).length > 0 && !isDiditType && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700"
                                    >
                                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Información extraída automáticamente con IA:
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {!!doc.extractedData.institution && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Institución</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.extractedData.institution as string}
                                                    </p>
                                                </div>
                                            )}
                                            {!!doc.extractedData.full_name && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Nombre</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.extractedData.full_name as string}
                                                    </p>
                                                </div>
                                            )}
                                            {!!doc.extractedData.specialty && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Especialidad</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.extractedData.specialty as string}
                                                    </p>
                                                </div>
                                            )}
                                            {!!doc.extractedData.issue_date && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fecha de emisión</span>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.extractedData.issue_date as string}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.article>
                    );
                })}
                </div>
            </section>

            {/* Nota informativa mejorada */}
            <aside className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border-2 border-blue-200/50 dark:border-blue-800/50 p-6 shadow-lg">
                <div className="absolute inset-0 bg-grid-blue-500/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.3))]" />
                <div className="relative flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">Verificación de Documentos Profesionales</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-semibold text-blue-700 dark:text-blue-400">Cédula de Identidad:</span> Utiliza verificación biométrica con reconocimiento facial y prueba de vida mediante Didit para garantizar máxima seguridad.
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-semibold text-purple-700 dark:text-purple-400">Documentos Profesionales:</span> Son revisados manualmente por nuestro equipo de verificación en un plazo de 24-48 horas hábiles.
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">💡 Tip:</span> Asegúrate de que tus documentos sean legibles y estén actualizados para agilizar el proceso de verificación.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Modal de Upload */}
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {uploadType && DOCUMENT_CONFIGS[uploadType]?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Sube el documento en formato PDF o imagen
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Área de drag & drop */}
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer",
                                dragActive
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-300 dark:border-gray-700 hover:border-blue-400",
                                selectedFile && "border-green-500 bg-green-50 dark:bg-green-900/20"
                            )}
                            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            />

                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileImage className="h-10 w-10 text-green-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        Arrastra un archivo o <span className="text-blue-600 font-medium">haz clic</span>
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        PDF, JPG, PNG o WebP • Máximo 10MB
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setUploadModalOpen(false);
                                setSelectedFile(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadingType !== null}
                        >
                            {uploadingType ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Vista Previa */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{previewDoc?.name}</DialogTitle>
                    </DialogHeader>
                    {previewDoc && (
                        <div className="py-4">
                            {previewDoc.mimeType?.startsWith("image/") ? (
                                <Image
                                    src={previewDoc.fileUrl}
                                    alt={previewDoc.name}
                                    width={600}
                                    height={400}
                                    className="w-full rounded-lg object-cover"
                                />
                            ) : (
                                <iframe
                                    src={previewDoc.fileUrl}
                                    className="w-full h-[500px] rounded-lg border"
                                    title={previewDoc.name}
                                />
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
