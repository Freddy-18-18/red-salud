/**
 * @file avatar-upload.tsx
 * @description Componente de subida de avatar con preview, recorte y validación.
 * Sube imágenes a Supabase Storage.
 * @module UI/AvatarUpload
 * 
 * @example
 * <AvatarUpload 
 *   currentUrl="/path/to/avatar.jpg"
 *   onUpload={(url) => console.log('New URL:', url)}
 *   userName="Dr. García"
 * />
 */

"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Props del componente AvatarUpload
 */
interface AvatarUploadProps {
    /** URL actual del avatar */
    currentUrl?: string | null;
    /** Callback cuando se sube una nueva imagen */
    onUpload?: (url: string) => void;
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
 * Componente de subida de avatar con preview
 */
export function AvatarUpload({
    currentUrl,
    onUpload,
    userName = "Usuario",
    size = "lg",
    disabled = false,
    className,
}: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        if (!file) return;

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

        // Subir a Supabase
        await uploadFile(file);
    };

    /**
     * Sube el archivo a Supabase Storage
     */
    const uploadFile = async (file: File) => {
        setUploading(true);
        setError(null);

        try {
            // Obtener usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("No hay usuario autenticado");
            }

            // Generar nombre archivo único
            const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const fileName = `${Date.now()}.${fileExt}`;
            // Usar estructura de carpetas: avatars/USER_ID/filename
            // Esto coincide con la política RLS: (storage.foldername(name))[2] = auth.uid()
            const filePath = `avatars/${user.id}/${fileName}`;

            // Subir a Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("profiles")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: true,
                });

            if (uploadError) {
                throw uploadError;
            }

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from("profiles")
                .getPublicUrl(filePath);

            // Actualizar perfil en la base de datos
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", user.id);

            if (updateError) {
                console.error("Error updating profile:", updateError);
            }

            // Notificar al padre
            onUpload?.(publicUrl);

            // Limpiar preview
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);

        } catch (err: any) {
            console.error("Error uploading avatar:", err);
            setError(err.message || "Error al subir la imagen");
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
        if (!disabled && !uploading) {
            inputRef.current?.click();
        }
    };

    /**
     * Cancela la preview actual
     */
    const handleCancelPreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setError(null);
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
                    disabled={disabled || uploading}
                    className={cn(
                        "absolute bottom-0 right-0 p-2 rounded-full transition-all",
                        "bg-blue-600 text-white hover:bg-blue-700",
                        "shadow-lg border-2 border-white dark:border-gray-900",
                        disabled && "opacity-50 cursor-not-allowed",
                        uploading && "opacity-50 cursor-wait"
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
                disabled={disabled || uploading}
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
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                JPG, PNG o WebP • Máx. 5MB
            </p>
        </div>
    );
}
