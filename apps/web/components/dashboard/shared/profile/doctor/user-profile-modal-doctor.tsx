"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Stethoscope,
  FileText,
  Shield,
  Settings,
  Eye,
  Activity,
  CreditCard,
  Star,
} from "lucide-react";
import { ModalHeader } from "../components/modal-header";
import { TabNavigation } from "../components/tab-navigation";
import { ProfileTabDoctor } from "./tabs/profile-tab-doctor";
import { MedicalTabDoctor } from "./tabs/medical-tab-doctor";
import { DocumentsTabDoctor } from "./tabs/documents-tab-doctor";
import { SecurityTabNew as SecurityTab } from "../tabs/security-tab-new";
import { PreferencesTab } from "../tabs/preferences-tab";
import { PrivacyTab } from "../tabs/privacy-tab";
import { ActivityTab } from "../tabs/activity-tab";
import { BillingTab } from "../tabs/billing-tab";
import { useAvatarUpload } from "../hooks/use-avatar-upload";
import { useThemeColor } from "@red-salud/core/hooks";
import { Toast, type ToastType } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { useDoctorProfile } from "@/hooks/use-doctor-profile";
import type { TabType, TabConfig, DoctorProfileData } from "../types";

const TABS: TabConfig[] = [
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "medical", label: "Info. Profesional", icon: Stethoscope },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "preferences", label: "Preferencias", icon: Settings },
  { id: "privacy", label: "Privacidad", icon: Eye },
  { id: "activity", label: "Actividad", icon: Activity },
  { id: "billing", label: "Facturación", icon: CreditCard },
];

interface UserProfileModalDoctorProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userId?: string;
}

export function UserProfileModalDoctor({
  isOpen,
  onClose,
  userName,
  userEmail,
  userId,
}: UserProfileModalDoctorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { themeColor, setThemeColor } = useThemeColor();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [showToast, setShowToast] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Verificar si el médico tiene perfil
  const { profile: doctorProfile, loading: profileLoading } = useDoctorProfile(userId);

  // Estado del perfil del médico
  const [formData, setFormData] = useState<DoctorProfileData>({
    nombre_completo: userName,
    email: userEmail,
    telefono: "",
    cedula: "",
    mpps: "",
    especialidad: "",
    universidad: "",
    anos_experiencia: 0,
    bio: "",
    subespecialidades: "",
    certificaciones: "",
    idiomas: "",
  });

  const showNotification = (message: string, type: ToastType = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Cargar datos del perfil cuando el doctorProfile cambia
  useEffect(() => {
    if (doctorProfile) {
      // Extraer datos SACS si existen
      const sacsData = (doctorProfile.sacs_data as any) || {};
      const profile = doctorProfile as any;

      setFormData({
        nombre_completo: profile.nombre_completo || sacsData.nombre_completo || userName,
        email: profile.email || userEmail,
        telefono: doctorProfile.professional_phone || "",
        cedula: profile.cedula || sacsData.cedula || "",
        mpps: doctorProfile.license_number || sacsData.matricula_principal || "",
        especialidad: doctorProfile.specialty?.name || sacsData.especialidad_display || "",
        universidad: profile.universidad || "",
        anos_experiencia: doctorProfile.years_experience || 0,
        bio: doctorProfile.bio || "",
        subespecialidades: "",
        certificaciones: "",
        idiomas: Array.isArray(doctorProfile.languages) ? doctorProfile.languages.join(", ") : "",
      });
    }
  }, [doctorProfile, userName, userEmail]);

  const {
    avatarHover,
    setAvatarHover,
    fileInputRef,
    handleAvatarClick,
    handleFileChange,
  } = useAvatarUpload(async (file) => {
    if (!userId) {
      showNotification("Error: Usuario no identificado", "error");
      return;
    }

    try {
      showNotification("Subiendo imagen...", "info");
      // TODO: Implementar subida con Supabase Storage
      console.log("Uploading file:", file, "for user:", userId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showNotification(
        "Imagen subida correctamente (pendiente implementación)",
        "warning"
      );
    } catch (error) {
      showNotification("Error al subir la imagen", "error");
    }
  });

  const handleSave = async () => {
    if (!userId) {
      showNotification("Error: Usuario no identificado", "error");
      return { success: false, error: "Usuario no identificado" };
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/doctor/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || "Error al guardar el perfil";
        showNotification(errorMessage, "error");
        return { success: false, error: errorMessage };
      }

      setIsEditing(false);
      showNotification("Perfil actualizado correctamente", "success");

      // Recargar datos usando el hook
      // El hook se actualizará automáticamente

      return { success: true };
    } catch (error) {
      console.error("Error saving:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al conectar con el servidor";
      showNotification(errorMessage, "error");
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  const handleVerificationRedirect = () => {
    onClose();
    router.push("/dashboard/medico/perfil/setup");
  };

  // Si no tiene perfil, mostrar mensaje de verificación
  const needsVerification = !profileLoading && !doctorProfile;

  // Debug logging
  console.log('UserProfileModalDoctor state:', {
    userId,
    profileLoading,
    hasDoctorProfile: !!doctorProfile,
    needsVerification,
    doctorProfileId: doctorProfile?.id,
  });

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-100"
              aria-hidden="true"
            />

            {needsVerification ? (
              // Modal de verificación requerida
              <motion.dialog
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                open={isOpen}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-101 overflow-hidden"
                style={{ translateX: "-50%", translateY: "-50%" }}
                aria-labelledby="verification-modal-title"
                aria-modal="true"
              >
                <Card className="border-0 shadow-none">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl" id="verification-modal-title">
                      Completa tu Perfil Profesional
                    </CardTitle>
                    <p className="text-gray-600 mt-2">
                      Para acceder a tu perfil completo, necesitas verificar tu identidad
                      como profesional de la salud en Venezuela
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Beneficios */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        ¿Qué obtendrás?
                      </h3>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Gestión completa de tu agenda y citas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Acceso a historiales clínicos de tus pacientes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Sistema de telemedicina integrado</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Emisión de Recipe y órdenes médicas digitales</span>
                        </li>
                      </ul>
                    </div>

                    {/* Proceso de verificación */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">
                        Proceso de Verificación
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                            1
                          </div>
                          <span>Ingresa tu número de cédula venezolana</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                            2
                          </div>
                          <span>Verificamos tu registro en el SACS automáticamente</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                            3
                          </div>
                          <span>Completa tu información profesional</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleVerificationRedirect}
                        className="flex-1"
                      >
                        Comenzar Verificación
                      </Button>
                    </div>

                    <p className="text-xs text-center text-gray-500">
                      La verificación es instantánea y utiliza datos públicos del SACS
                      (Sistema de Atención al Ciudadano en Salud)
                    </p>
                  </CardContent>
                </Card>
              </motion.dialog>
            ) : (
              // Modal normal de perfil
              <motion.dialog
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                open={isOpen}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[95vh] bg-white rounded-xl shadow-2xl z-101 overflow-hidden flex flex-col"
                style={{ translateX: "-50%", translateY: "-50%" }}
                aria-labelledby="profile-modal-title"
                aria-modal="true"
              >
                <ModalHeader
                  userName={userName}
                  userEmail={userEmail}
                  onClose={onClose}
                  avatarHover={avatarHover}
                  onAvatarHover={setAvatarHover}
                  onAvatarClick={handleAvatarClick}
                  fileInputRef={fileInputRef}
                  onFileChange={handleFileChange}
                  themeColor={themeColor}
                  onThemeColorChange={setThemeColor}
                />

                <TabNavigation
                  tabs={TABS}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />

                <main className="flex-1 overflow-y-auto">
                  <div className="p-8">
                    {profileLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-3">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-600">Cargando perfil...</p>
                        </div>
                      </div>
                    ) : (
                      <AnimatePresence mode="wait">
                        {activeTab === "profile" && (
                          <ProfileTabDoctor
                            formData={formData}
                            setFormData={setFormData}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            handleSave={handleSave}
                          />
                        )}
                        {activeTab === "medical" && (
                          <MedicalTabDoctor
                            formData={formData}
                            setFormData={setFormData}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            handleSave={handleSave}
                          />
                        )}
                        {activeTab === "documents" && <DocumentsTabDoctor />}
                        {activeTab === "security" && userId && (
                          <SecurityTab userEmail={userEmail} userId={userId} />
                        )}
                        {activeTab === "preferences" && <PreferencesTab />}
                        {activeTab === "privacy" && userId && <PrivacyTab userId={userId} />}
                        {activeTab === "activity" && userId && <ActivityTab userId={userId} />}
                        {activeTab === "billing" && userId && <BillingTab userId={userId} />}
                      </AnimatePresence>
                    )}
                  </div>
                </main>
              </motion.dialog>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
