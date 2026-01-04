/**
 * @file documents-section.tsx
 * @description Sección de documentos profesionales para configuración del médico.
 * Muestra todos los tipos de documentos como tarjetas con acciones individuales.
 * La cédula usa verificación Didit para validar identidad + prueba de vida.
 * @module Dashboard/Medico/Configuracion
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FileText,
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
    type DoctorDocument,
    type DoctorDocumentType,
} from "@/lib/supabase/services/doctor-documents-service";
import { cn } from "@/lib/utils";
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
    extractedData: any;
}

/**
 * Estado de cada tipo de documento
 */
interface DocumentTypeState {
    type: DoctorDocumentType;
    config: typeof DOCUMENT_CONFIGS[DoctorDocumentType];
    document: DocumentUI | null;
    isUploading: boolean;
    isAnalyzing: boolean;
    isDeleting: boolean;
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
                    extractedData: doc.extracted_data,
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
        } catch (error: any) {
            toast.error(error.message || "Error al iniciar verificación");
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
        } catch (error: any) {
            toast.error(error.message || "Error al subir");
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
        } catch (error: any) {
            toast.error(error.message || "Error al analizar");
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
    const requiredTypes = Object.entries(DOCUMENT_CONFIGS).filter(([_, c]) => c.required);
    const uploadedRequired = requiredTypes.filter(([type]) => {
        if (type === "cedula") return identityVerified;
        return documents.some(d => d.type === type);
    }).length;
    const progressPercent = Math.round((uploadedRequired / requiredTypes.length) * 100);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con Progreso */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Documentos Profesionales
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Verifica tus documentos para completar tu perfil profesional
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Progreso:</span>
                    <Progress value={progressPercent} className="w-32" />
                    <Badge className={cn(
                        "font-medium",
                        progressPercent === 100
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                        {progressPercent}% Completo
                    </Badge>
                </div>
            </div>

            {/* Lista de todos los tipos de documentos */}
            <div className="space-y-3">
                {Object.entries(DOCUMENT_CONFIGS).map(([type, config], index) => {
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "border rounded-xl p-4 transition-all",
                                isVerified
                                    ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                                    : isPending
                                        ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10"
                                        : isRejected
                                            ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                {/* Info del documento */}
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center",
                                        isVerified
                                            ? "bg-green-100 dark:bg-green-900/40"
                                            : isPending
                                                ? "bg-yellow-100 dark:bg-yellow-900/40"
                                                : "bg-gray-100 dark:bg-gray-800"
                                    )}>
                                        <Icon className={cn(
                                            "h-6 w-6",
                                            isVerified
                                                ? "text-green-600 dark:text-green-400"
                                                : isPending
                                                    ? "text-yellow-600 dark:text-yellow-400"
                                                    : "text-gray-500 dark:text-gray-400"
                                        )} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                {config.name}
                                            </h3>
                                            {config.required && (
                                                <span className="text-xs text-red-500">*Requerido</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {config.description}
                                        </p>
                                        {/* Estado y fecha */}
                                        <div className="flex items-center gap-3 mt-1">
                                            {isVerified && (
                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verificado
                                                </Badge>
                                            )}
                                            {isPending && (
                                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    En revisión
                                                </Badge>
                                            )}
                                            {isRejected && (
                                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Rechazado
                                                </Badge>
                                            )}
                                            {doc && !isDiditType && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(doc.uploadDate)} • {formatFileSize(doc.fileSize)}
                                                </span>
                                            )}
                                            {doc?.extractedData && (
                                                <Badge variant="outline" className="text-purple-600 border-purple-200 dark:border-purple-800">
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    Analizado
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-2">
                                    {/* Para cédula: usa Didit */}
                                    {isDiditType ? (
                                        identityVerified ? (
                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Identidad Verificada
                                            </Badge>
                                        ) : (
                                            <Button
                                                onClick={handleDiditVerification}
                                                disabled={isVerifyingIdentity}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {isVerifyingIdentity ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Verificando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Verificar
                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                    </>
                                                )}
                                            </Button>
                                        )
                                    ) : (
                                        /* Para otros documentos: upload normal */
                                        hasDocument ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setPreviewDoc(doc);
                                                        setIsPreviewOpen(true);
                                                    }}
                                                    title="Ver documento"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAnalyze(doc!)}
                                                    disabled={analyzingId === doc?.id}
                                                    title="Analizar con IA"
                                                >
                                                    {analyzingId === doc?.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <FileScan className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(doc!)}
                                                    title="Descargar"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc!)}
                                                    disabled={deletingId === doc?.id}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Eliminar"
                                                >
                                                    {deletingId === doc?.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => openUploadModal(docType)}
                                                disabled={uploadingType === docType}
                                                className="bg-blue-600 hover:bg-blue-700"
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
                            </div>

                            {/* Datos extraídos por OCR */}
                            {doc?.extractedData && !isDiditType && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800"
                                >
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3 text-purple-500" />
                                        Información extraída automáticamente:
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        {doc.extractedData.institution && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">Institución</span>
                                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {doc.extractedData.institution}
                                                </p>
                                            </div>
                                        )}
                                        {doc.extractedData.full_name && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">Nombre</span>
                                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {doc.extractedData.full_name}
                                                </p>
                                            </div>
                                        )}
                                        {doc.extractedData.specialty && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">Especialidad</span>
                                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {doc.extractedData.specialty}
                                                </p>
                                            </div>
                                        )}
                                        {doc.extractedData.issue_date && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">Fecha</span>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {doc.extractedData.issue_date}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </motion.article>
                    );
                })}
            </div>

            {/* Nota informativa */}
            <aside className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-medium">📋 Nota:</span> Los documentos marcados con * son requeridos.
                    La cédula de identidad se verifica mediante reconocimiento facial y prueba de vida con Didit para mayor seguridad.
                    Los demás documentos son revisados por nuestro equipo en 24-48 horas.
                </p>
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
                                <img
                                    src={previewDoc.fileUrl}
                                    alt={previewDoc.name}
                                    className="w-full rounded-lg"
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
