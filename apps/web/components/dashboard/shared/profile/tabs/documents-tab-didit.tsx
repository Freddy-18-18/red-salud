"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FileText,
  Check,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@red-salud/ui";
import type { TabComponentProps } from "../types";

export function DocumentsTabDidit({
  formData,
  isLoading: parentLoading,
}: Omit<TabComponentProps, "setFormData" | "isEditing" | "setIsEditing" | "handleSave">) {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const router = useRouter();

  // Polling para verificar si el estado cambió
  useEffect(() => {
    if (!isPolling) return;

    const checkAndSync = async () => {
      try {
        console.log("🔄 Verificando y sincronizando estado...");
        
        // Primero verificar el estado
        const checkResponse = await fetch("/api/didit/check-status");
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          console.log("📊 Estado actual:", checkData);
          
          // Si está aprobado en Didit pero no localmente, forzar sincronización
          if (checkData.needs_update) {
            console.log("⚠️ Estado desincronizado, sincronizando...");
            // Aquí necesitaríamos el userId, lo obtendremos del formData si está disponible
            // Por ahora, solo refrescamos
          }
          
          // Si está completado, detener polling
          if (checkData.didit_status === "Approved" && checkData.local_photo_verified) {
            console.log("✅ Verificación completada y sincronizada");
            setIsPolling(false);
          }
        }
        
        router.refresh(); // Recargar datos del servidor
      } catch (error) {
        console.error("Error al verificar estado:", error);
      }
    };

    // Verificar inmediatamente
    checkAndSync();
    
    // Luego cada 3 segundos (más frecuente para mejor UX)
    const interval = setInterval(checkAndSync, 3000);

    return () => clearInterval(interval);
  }, [isPolling, router]);

  const handleStartVerification = async () => {
    setIsCreatingSession(true);
    setError(null);

    try {
      console.log("🚀 Iniciando verificación...");
      
      const response = await fetch("/api/didit/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📥 Respuesta recibida:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error en respuesta:", errorData);
        throw new Error(errorData.error || "Error al crear sesión de verificación");
      }

      const data = await response.json();
      console.log("📦 Datos recibidos:", data);
      
      if (data.session_url) {
        console.log("✅ Abriendo URL:", data.session_url);
        setSessionUrl(data.session_url);
        
        // Iniciar polling para verificar actualizaciones
        setIsPolling(true);
        
        // Abrir en ventana emergente (popup) centrada - más ancha
        const width = 700;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
        
        const newWindow = window.open(data.session_url, "DiditVerification", features);
        if (!newWindow) {
          setError("No se pudo abrir la ventana. Por favor, permite ventanas emergentes.");
          setIsPolling(false);
        } else {
          // Detectar cuando se cierra la ventana o cuando se completa la verificación
          const checkClosed = setInterval(() => {
            if (newWindow.closed) {
              console.log("🔄 Ventana cerrada, actualizando datos...");
              clearInterval(checkClosed);
              setIsPolling(false);
              router.refresh();
            }
          }, 1000);
          
          // Escuchar mensajes de la ventana de Didit para cerrar automáticamente
          const handleMessage = (event: MessageEvent) => {
            // Verificar que el mensaje viene de Didit
            if (event.origin === "https://verify.didit.me") {
              console.log("📨 Mensaje de Didit:", event.data);
              if (event.data.type === "verification_complete" || event.data.status === "completed") {
                console.log("✅ Verificación completada, cerrando ventana...");
                newWindow.close();
                clearInterval(checkClosed);
                setIsPolling(false);
                router.refresh();
              }
            }
          };
          
          window.addEventListener("message", handleMessage);
          
          // Limpiar listener cuando se cierre la ventana
          const cleanupInterval = setInterval(() => {
            if (newWindow.closed) {
              window.removeEventListener("message", handleMessage);
              clearInterval(cleanupInterval);
            }
          }, 1000);
        }
      } else {
        console.warn("⚠️ No se recibió session_url en la respuesta");
        setError("No se recibió la URL de verificación. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const getStatusBadge = () => {
    if (formData.photoVerified) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
          <Check className="h-3 w-3" aria-hidden="true" />
          Verificado
        </span>
      );
    }
    if (formData.cedulaVerificada) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
          <Clock className="h-3 w-3" aria-hidden="true" />
          Pendiente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
        <XCircle className="h-3 w-3" aria-hidden="true" />
        No Verificado
      </span>
    );
  };

  const progressPercentage = formData.photoVerified ? 100 : formData.cedulaVerificada ? 50 : 0;

  return (
    <motion.article
      key="documents"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-h-full"
    >
      <header className="mb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Verificación de Identidad
          </h2>
        </div>
        <p className="text-xs text-gray-500">
          Verifica tu identidad de forma segura con tecnología AI
        </p>
      </header>

      {/* Top Row: 3 Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Estado de Verificación */}
        <aside className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5">
          <h3 className="font-semibold text-xs text-blue-900 mb-0.5">
            Estado de Verificación
          </h3>
          <p className="text-xs text-blue-700 mb-1.5">
            {formData.photoVerified
              ? "✅ Completado"
              : formData.cedulaVerificada
              ? "⏳ En proceso"
              : "🔒 Pendiente"}
          </p>
          <div className="flex items-end justify-between mb-1">
            <div className="text-2xl font-bold text-blue-600">
              {progressPercentage}%
            </div>
            <p className="text-xs text-blue-700 mb-0.5">Completado</p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </aside>

        {/* Documento de Identidad */}
        <article className="border border-gray-200 rounded-lg p-2.5 hover:border-blue-300 transition-colors">
          <div className="flex items-start gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex-shrink-0">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-xs text-gray-900 mb-0.5">
                Documento de Identidad
              </h4>
              <p className="text-xs text-gray-500 mb-1 truncate">
                {formData.photoVerified
                  ? `Verificado el ${formData.cedulaPhotoVerifiedAt ? new Date(formData.cedulaPhotoVerifiedAt).toLocaleDateString("es-VE") : "recientemente"}`
                  : formData.cedulaVerificada
                  ? "Verificación en proceso"
                  : "Pendiente de verificación"}
              </p>
              {getStatusBadge()}
            </div>
          </div>
        </article>

        {/* Info Section */}
        <aside className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
          <h5 className="font-medium text-gray-900 text-xs mb-0.5">
            ℹ️ ¿Por qué verificar?
          </h5>
          <p className="text-xs text-gray-600 leading-snug">
            Requerido por regulaciones de salud para garantizar seguridad y cumplir con normativas médicas.
          </p>
        </aside>
      </div>

      {/* Error Message */}
      {error && (
        <aside className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-red-900">Error</h4>
              <p className="text-xs text-red-800 mt-0.5">{error}</p>
            </div>
          </div>
        </aside>
      )}

      {/* Action Section */}
      {formData.photoVerified ? (
        <aside className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 text-sm">
                ✅ Verificación Completa
              </h4>
              <p className="text-xs text-green-800 mt-0.5">
                Tu identidad ha sido verificada exitosamente. Puedes acceder a todos los servicios.
              </p>
              {formData.cedula && (
                <div className="mt-1.5 p-1.5 bg-white rounded-md border border-green-200">
                  <p className="text-xs text-green-700 font-medium">Documento Verificado</p>
                  <p className="text-xs text-gray-900 mt-0.5">Cédula: {formData.cedula}</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      ) : (
        <aside className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
                Verificación de Identidad con Didit
              </h4>
              <p className="text-xs text-gray-600 mb-1.5">
                Verifica tu identidad de forma rápida y segura. El proceso incluye:
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mb-2">
                <div className="flex items-start gap-1">
                  <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Captura de documento de identidad</span>
                </div>
                <div className="flex items-start gap-1">
                  <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Verificación de autenticidad con IA</span>
                </div>
                <div className="flex items-start gap-1">
                  <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Detección de vida para prevenir fraude</span>
                </div>
                <div className="flex items-start gap-1">
                  <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Comparación facial con el documento</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-1.5 mb-2">
                <p className="text-xs text-blue-900 font-medium mb-0.5">
                  🔒 Proceso Seguro y Privado
                </p>
                <p className="text-xs text-blue-800">
                  Encriptación nivel bancario. Toma 2-3 minutos.
                </p>
              </div>

              <div className="flex justify-center mb-1.5">
                <Button
                  onClick={handleStartVerification}
                  disabled={isCreatingSession}
                  className="px-4 h-8 text-xs"
                  size="sm"
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-1.5" />
                      Iniciar Verificación
                      <ExternalLink className="h-3 w-3 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>

              {sessionUrl && (
                <div className="mt-1.5 p-1.5 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-900 font-medium mb-0.5">
                    📱 Ventana Abierta
                  </p>
                  <a
                    href={sessionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    Abrir verificación
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-1.5 text-center">
                Al continuar, aceptas el procesamiento de datos para verificación
              </p>
            </div>
          </div>
        </aside>
      )}


    </motion.article>
  );
}
