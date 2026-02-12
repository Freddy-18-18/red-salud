import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Check,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { CedulaPhotoUpload, type CedulaVerificationData } from "../components/cedula-photo-upload";

interface DocumentsTabProps {
  userId?: string;
}

interface ProfileData {
  photoVerified?: boolean;
  cedulaVerificada?: boolean;
  cedulaPhotoVerifiedAt?: string;
  cedula?: string;
  nombre?: string;
  photoUploadDeadline?: string;
}



export function DocumentsTab({ userId }: DocumentsTabProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/get");
      if (response.ok) {
        const result = await response.json();
        if (!result.error && result.data) {
          setProfileData(result.data);

          // Calcular días restantes
          if (result.data.photoUploadDeadline) {
            const deadline = new Date(result.data.photoUploadDeadline);
            const now = new Date();
            const diff = deadline.getTime() - now.getTime();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            setDaysRemaining(days > 0 ? days : 0);
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = async (data: CedulaVerificationData) => {
    if (data.verified) {
      // Actualizar el perfil con la verificación de foto
      try {
        const response = await fetch("/api/profile/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            photoVerified: true,
            diditRequestId: data.requestId || "",
          }),
        });

        if (response.ok) {
          await loadProfileData();
          alert("¡Cédula verificada exitosamente con foto!");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <motion.article
        key="documents"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
      >
        <p className="text-center text-gray-500">Cargando...</p>
      </motion.article>
    );
  }

  const getStatusBadge = () => {
    if (profileData?.photoVerified) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
          <Check className="h-3 w-3" aria-hidden="true" />
          Verificado
        </span>
      );
    }
    if (profileData?.cedulaVerificada) {
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
        No Disponible
      </span>
    );
  };

  const progressPercentage = profileData?.photoVerified ? 100 : profileData?.cedulaVerificada ? 50 : 0;

  return (
    <motion.article
      key="documents"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Verificación de Cédula con Foto
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Verifica tu identidad subiendo una foto de tu cédula
        </p>
      </header>

      {/* Verification Status */}
      <aside className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-blue-900">
              Estado de Verificación
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {profileData?.photoVerified
                ? "Cédula verificada con foto"
                : profileData?.cedulaVerificada
                  ? "Cédula anclada - Falta verificación con foto"
                  : "Primero debes anclar tu cédula en Mi Perfil"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {progressPercentage}%
            </div>
            <p className="text-xs text-blue-700">Completado</p>
          </div>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </aside>

      {/* Deadline Warning */}
      {profileData?.cedulaVerificada && !profileData?.photoVerified && daysRemaining !== null && (
        <aside className={`border rounded-lg p-4 mb-6 ${daysRemaining <= 7
          ? "bg-red-50 border-red-200"
          : "bg-yellow-50 border-yellow-200"
          }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 mt-0.5 ${daysRemaining <= 7 ? "text-red-600" : "text-yellow-600"
              }`} />
            <div>
              <h4 className={`font-semibold ${daysRemaining <= 7 ? "text-red-900" : "text-yellow-900"
                }`}>
                {daysRemaining <= 7 ? "⚠️ Tiempo Limitado" : "📅 Recordatorio"}
              </h4>
              <p className={`text-sm mt-1 ${daysRemaining <= 7 ? "text-red-800" : "text-yellow-800"
                }`}>
                Te quedan <strong>{daysRemaining} días</strong> para subir la foto de tu cédula.
                {daysRemaining <= 7 && " ¡Hazlo pronto para evitar restricciones en tu cuenta!"}
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Document Status */}
      <section className="space-y-4 mb-6">
        <article className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                Foto de Cédula de Identidad
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {profileData?.photoVerified
                  ? `Verificada el ${new Date(profileData.cedulaPhotoVerifiedAt || "").toLocaleDateString("es-VE")}`
                  : profileData?.cedulaVerificada
                    ? "Pendiente de verificación"
                    : "No disponible - Ancla tu cédula primero"}
              </p>
              <div className="mt-2">{getStatusBadge()}</div>
            </div>
          </div>
        </article>
      </section>

      {/* Upload Section */}
      {profileData?.cedulaVerificada && !profileData?.photoVerified ? (
        <CedulaPhotoUpload
          expectedCedula={profileData.cedula}
          expectedNombre={profileData.nombre}
          onVerificationComplete={handleVerificationComplete}
        />
      ) : profileData?.photoVerified ? (
        <aside className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">
                ✅ Verificación Completa
              </h4>
              <p className="text-sm text-green-800 mt-1">
                Tu cédula ha sido verificada exitosamente con foto. Tu cuenta está completamente verificada.
              </p>
            </div>
          </div>
        </aside>
      ) : (
        <aside className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900">
                Primero Ancla tu Cédula
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Para verificar tu cédula con foto, primero debes:
              </p>
              <ol className="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                <li>Ir a la sección &quot;Mi Perfil&quot;</li>
                <li>Ingresar tu número de cédula</li>
                <li>Validar con datos oficiales del CNE</li>
                <li>Hacer clic en &quot;Guardar&quot; para anclar tu cédula</li>
                <li>Regresar aquí para subir la foto</li>
              </ol>
            </div>
          </div>
        </aside>
      )}
    </motion.article>
  );
}
