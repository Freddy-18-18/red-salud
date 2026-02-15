/**
 * @file file-upload.tsx
 * @description Componente reutilizable para upload de archivos con drag & drop
 * Soporta PDF, imágenes y validación de tamaño
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@red-salud/ui";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  /** Tipos de archivo aceptados (ej: '.pdf,.jpg,.png') */
  accept?: string;
  /** Tamaño máximo en MB */
  maxSizeMB?: number;
  /** Callback cuando se sube un archivo */
  onUpload?: (file: File) => Promise<void>;
  /** Callback cuando se elimina un archivo */
  onRemove?: () => void;
  /** Archivo actual (si ya existe uno subido) */
  currentFile?: {
    name: string;
    url: string;
    size?: number;
  } | null;
  /** Texto personalizado */
  label?: string;
  /** Descripción */
  description?: string;
  /** Deshabilitado */
  disabled?: boolean;
  /** Múltiples archivos */
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  onUpload,
  onRemove,
  currentFile,
  label = "Subir archivo",
  description = "Arrastra y suelta o haz clic para seleccionar",
  disabled = false,
  multiple = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `El archivo excede el tamaño máximo de ${maxSizeMB}MB`;
    }

    // Validar tipo
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(fileExt)) {
      return `Tipo de archivo no permitido. Solo: ${accept}`;
    }

    return null;
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !onUpload) return;

      const file = files[0];
      if (!file) return;
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        await onUpload(file);
      } catch (err) {
        setError("Error al subir el archivo. Intenta nuevamente.");
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, maxSizeMB, accept]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Area */}
      {!currentFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
            "hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
            isDragging && "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.02]",
            disabled && "opacity-50 cursor-not-allowed hover:border-gray-300 hover:bg-transparent",
            error && "border-red-300 bg-red-50/50 dark:bg-red-950/20",
            !error && !isDragging && "border-gray-300 dark:border-gray-700"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            multiple={multiple}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subiendo archivo...
                </p>
              </>
            ) : (
              <>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Máx. {maxSizeMB}MB • {accept.replace(/\./g, "").toUpperCase()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Current File Display */}
      {currentFile && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {currentFile.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Archivo subido {currentFile.size && `• ${formatFileSize(currentFile.size)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(currentFile.url, "_blank")}
              className="h-8 w-8 p-0"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
