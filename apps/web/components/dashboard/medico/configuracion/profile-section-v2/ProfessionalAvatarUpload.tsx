/**
 * @file ProfessionalAvatarUpload.tsx
 * @description Upload de avatar premium con guías profesionales y validación
 */

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";

interface ProfessionalAvatarUploadProps {
  currentUrl: string | null;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => Promise<void>;
  userName: string;
}

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

export function ProfessionalAvatarUpload({
  currentUrl,
  onUpload,
  onRemove,
  userName,
}: ProfessionalAvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Valida la calidad de la imagen
   */
  const validateImage = async (file: File): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;

        img.onload = () => {
          const issues: string[] = [];
          const suggestions: string[] = [];
          let score = 100;

          // Validar dimensiones
          if (img.width < 200 || img.height < 200) {
            issues.push("Imagen muy pequeña");
            suggestions.push("Usa una imagen de al menos 400x400 píxeles");
            score -= 30;
          }

          // Validar aspecto ratio
          const ratio = img.width / img.height;
          if (ratio < 0.8 || ratio > 1.2) {
            issues.push("Proporción no cuadrada");
            suggestions.push("Usa una imagen cuadrada o casi cuadrada");
            score -= 20;
          }

          // Validar tamaño de archivo
          if (file.size > 5 * 1024 * 1024) {
            issues.push("Archivo muy grande");
            suggestions.push("Reduce el tamaño a menos de 5MB");
            score -= 15;
          }

          // Sugerencias generales
          if (score === 100) {
            suggestions.push("¡Excelente! La imagen cumple con todos los requisitos");
          } else if (score >= 70) {
            suggestions.push("Buena imagen, pero puede mejorar");
          }

          resolve({
            isValid: score >= 50,
            score,
            issues,
            suggestions,
          });
        };
      };

      reader.readAsDataURL(file);
    });
  };

  /**
   * Maneja la subida de imagen usando la función inyectada
   */
  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await onUpload(file);
      setPreview(null);
      setValidation(null);
    } catch (error) {
      console.error("[ProfessionalAvatarUpload] Error:", error);
      alert("Error al subir la imagen. Por favor intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Maneja la selección de archivo
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Validar imagen
    const validationResult = await validateImage(file);
    setValidation(validationResult);

    // Si es válida, subir automáticamente
    if (validationResult.isValid) {
      await handleUpload(file);
    }
  };

  /**
   * Elimina el avatar actual
   */
  const handleRemove = async () => {
    if (!confirm("¿Estás seguro de eliminar tu foto de perfil?")) return;

    if (onRemove) {
      setUploading(true);
      try {
        await onRemove();
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
      }
    }
  };



  const displayUrl = preview || currentUrl;

  return (
    <div className="space-y-6">
      {/* Avatar Display */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-xl">
              <AvatarImage src={displayUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold">
                {getInitials(userName || "MD")}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Upload overlay */}
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Info and Actions */}
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Foto Profesional
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Una foto profesional aumenta la confianza de los pacientes
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {currentUrl ? "Foto activa" : "Sin foto"}
              </span>
            </div>
            {currentUrl && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Sparkles className="h-3 w-3 mr-1" />
                +3x más citas
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {currentUrl ? "Cambiar Foto" : "Subir Foto"}
            </Button>

            {currentUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowGuidelines(!showGuidelines)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Guías
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Result */}
      <AnimatePresence>
        {validation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-lg border",
              validation.isValid
                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
            )}
          >
            <div className="flex items-start gap-3">
              {validation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "font-medium",
                    validation.isValid
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  )}>
                    {validation.isValid ? "¡Imagen válida!" : "Imagen necesita mejoras"}
                  </p>
                  <Badge variant="secondary">
                    {validation.score}/100
                  </Badge>
                </div>

                {validation.issues.length > 0 && (
                  <ul className="space-y-1">
                    {validation.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                        <span>•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {validation.suggestions.length > 0 && (
                  <ul className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {validation.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span>💡</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guidelines */}
      <AnimatePresence>
        {showGuidelines && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Guía para una Foto Profesional
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium text-blue-800 dark:text-blue-200">✓ Recomendaciones:</p>
                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Fondo neutro y limpio</li>
                    <li>• Buena iluminación natural</li>
                    <li>• Vestimenta profesional</li>
                    <li>• Sonrisa natural y amigable</li>
                    <li>• Imagen cuadrada (400x400px mínimo)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-blue-800 dark:text-blue-200">✗ Evitar:</p>
                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Fotos borrosas o pixeladas</li>
                    <li>• Selfies casuales</li>
                    <li>• Fondos desordenados</li>
                    <li>• Filtros excesivos</li>
                    <li>• Fotos de grupo</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 <strong>Dato importante:</strong> Los perfiles con foto profesional reciben hasta 3 veces más solicitudes de citas.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
