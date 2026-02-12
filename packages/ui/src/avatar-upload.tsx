/**
 * @file avatar-upload.tsx
 * @description Componente de subida de avatar con preview, recorte y validación.
 * La función de subida se inyecta vía prop `uploadImage` para desacoplar del backend.
 * @module UI/AvatarUpload
 * 
 * @example
 * <AvatarUpload 
 *   currentUrl="/path/to/avatar.jpg"
 *   onUpload={(url) => console.log('New URL:', url)}
 *   uploadImage={async (file) => { // upload to your backend; return public URL }}
 *   userName="Dr. García"
 * />
 */

"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "./lib/utils";

/**
 * Props del componente AvatarUpload
 */
interface AvatarUploadProps {
    /** URL actual del avatar */
    currentUrl?: string | null;
    /** Callback cuando se sube una nueva imagen (recibe la URL pública) */
    onUpload?: (url: string) => void;
    /**
     * Función inyectada para subir la imagen al backend.
     * Recibe el File y debe devolver la URL pública resultante.
     * Si no se provee, el botón de subida se deshabilita.
     */
    uploadImage?: (file: File) => Promise<string>;
    /** Nombre del usuario (para el fallback) */
    userName?: string;
    /** Tamaño del avatar */
    size?: "sm" | "md" | "lg" | "xl";
    /** Si está deshabilitado */
    disabled?: boolean;
    /** Clase CSS adicional */
    className?: string;
}

/** Tamaños del avatar en pixeles */
const SIZES = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
};

/** Tamaño máximo de archivo en bytes (5MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Tipos MIME permitidos */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Componente de subida de avatar con preview.
 * Requiere `uploadImage` para funcionar — si no se pasa, el botón queda deshabilitado.
 */
export function AvatarUpload({
    currentUrl,
    onUpload,
    uploadImage,
    userName = "Usuario",
    size = "lg",
    disabled = false,
    className,
}: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isUploadDisabled = disabled || uploading || !uploadImage;

    /** Obtiene las iniciales del nombre */
    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    /**
     * Valida el archivo seleccionado
     */
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Formato no permitido. Use JPG, PNG o WebP.";
        }
        if (file.size > MAX_FILE_SIZE) {
            return "El archivo es muy grande. Máximo 5MB.";
        }
        return null;
    };

    /**
     * Maneja la selección de archivo
     */
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadImage) return;

        // Validar archivo
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);

        // Mostrar preview local
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Subir usando la función inyectada
        setUploading(true);
        try {
            const publicUrl = await uploadImage(file);

            // Notificar al padre
            onUpload?.(publicUrl);

            // Limpiar preview
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
        } catch (err) {
            console.error("Error uploading avatar:", err);
            setError(err instanceof Error ? err.message : "Error al subir la imagen");
            setPreviewUrl(null);
        } finally {
            setUploading(false);
            // Limpiar input para permitir re-selección del mismo archivo
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    /**
     * Abre el selector de archivos
     */
    const handleClick = () => {
        if (!isUploadDisabled) {
            inputRef.current?.click();
        }
    };

    // URL a mostrar (preview > current)
    const displayUrl = previewUrl || currentUrl;

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            {/* Avatar con botón de cámara */}
            <div className="relative group">
                <Avatar className={cn(SIZES[size], "border-2 border-gray-200 dark:border-gray-700")}>
                    <AvatarImage src={displayUrl || undefined} alt={userName} />
                    <AvatarFallback className="text-xl font-medium bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                        {getInitials(userName)}
                    </AvatarFallback>
                </Avatar>

                {/* Overlay con spinner durante subida */}
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                )}

                {/* Botón de cámara */}
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isUploadDisabled}
                    className={cn(
                        "absolute bottom-0 right-0 p-2 rounded-full transition-all",
                        "bg-blue-600 text-white hover:bg-blue-700",
                        "shadow-lg border-2 border-white dark:border-gray-900",
                        isUploadDisabled && "opacity-50 cursor-not-allowed",
                        uploading && "cursor-wait"
                    )}
                    aria-label="Cambiar foto de perfil"
                >
                    <Camera className="h-4 w-4" />
                </button>
            </div>

            {/* Input oculto */}
            <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploadDisabled}
                aria-label="Seleccionar imagen de perfil"
            />

            {/* Mensaje de error */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <X className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Texto de ayuda */}
            {!uploadImage ? (
                <p className="text-xs text-amber-500 dark:text-amber-400 text-center">
                    Subida de imagen no configurada
                </p>
            ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    JPG, PNG o WebP • Máx. 5MB
                </p>
            )}
        </div>
    );
}
