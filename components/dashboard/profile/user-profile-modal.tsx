"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, setProfile } from "@/lib/redux/profileSlice";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  FileText,
  Shield,
  Settings,
  Eye,
  Activity,
  CreditCard,
} from "lucide-react";
import { ModalHeader } from "./components/modal-header";
import { TabNavigation } from "./components/tab-navigation";
import { ProfileTab } from "./tabs/profile-tab";
import { MedicalTabImproved as MedicalTab } from "./tabs/medical-tab-improved";
import { DocumentsTabDidit as DocumentsTab } from "./tabs/documents-tab-didit";
import { SecurityTabNew as SecurityTab } from "./tabs/security-tab-new";
import { PreferencesTab } from "./tabs/preferences-tab";
import { PrivacyTab } from "./tabs/privacy-tab";
import { ActivityTab } from "./tabs/activity-tab";
import { BillingTab } from "./tabs/billing-tab";
import { useProfileForm } from "./hooks/use-profile-form";
import { useAvatarUpload } from "./hooks/use-avatar-upload";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Toast, type ToastType } from "@/components/ui/toast";
import type { UserProfileModalProps, TabType, TabConfig } from "./types";

const TABS: TabConfig[] = [
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "medical", label: "Info. Médica", icon: Heart },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "preferences", label: "Preferencias", icon: Settings },
  { id: "privacy", label: "Privacidad", icon: Eye },
  { id: "activity", label: "Actividad", icon: Activity },
  { id: "billing", label: "Facturación", icon: CreditCard },
];

export function UserProfileModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  userId,
}: UserProfileModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const dispatch = useDispatch<AppDispatch>();
    const profileState = useSelector((state: RootState) => state.profile);
  const { themeColor, setThemeColor } = useThemeColor();
  
  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [showToast, setShowToast] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const showNotification = (message: string, type: ToastType = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Cargar datos del perfil cuando se abre el modal
  useEffect(() => {
    if (isOpen && userId && profileState.status === "idle") {
      dispatch(fetchProfile(userId));
    }
  }, [isOpen, userId, dispatch, profileState.status]);

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
      
      // Simulación temporal - remover cuando se implemente Supabase Storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification("Imagen subida correctamente (pendiente implementación)", "warning");
    } catch (error) {
      showNotification("Error al subir la imagen", "error");
    }
  });

  const handleSave = async (dataOverride?: any) => {
    if (!userId) {
      showNotification("Error: Usuario no identificado", "error");
      return { success: false, error: "Usuario no identificado" };
    }

    // Usar datos proporcionados o los del estado de Redux
    const dataToSave = dataOverride || profileState.data;

    if (!dataToSave) {
      showNotification("Error: No hay datos para guardar", "error");
      return { success: false, error: "No hay datos para guardar" };
    }

    setIsSaving(true);
    try {
      console.log("📤 Enviando datos al backend:", {
        userId,
        ...dataToSave,
      });
      
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...dataToSave,
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
      
      // Esperar un momento antes de recargar para asegurar consistencia en la BD
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Recargar datos del perfil desde el servidor
      if (userId) {
        await dispatch(fetchProfile(userId));
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error saving:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al conectar con el servidor";
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

  return (
    <>
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-100"
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.dialog
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            open={isOpen}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[95vh] bg-white rounded-xl shadow-2xl z-101 overflow-hidden flex flex-col"
            style={{ translateX: '-50%', translateY: '-50%' }}
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

            {/* Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-8">
                {profileState.status === "loading" && (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}
                
                {profileState.status === "failed" && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-red-600 mb-4">{profileState.error || "Error al cargar el perfil"}</p>
                      <button
                        onClick={() => userId && dispatch(fetchProfile(userId))}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                )}

                {profileState.status === "succeeded" && profileState.data && (
                  <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                      <ProfileTab
                        formData={profileState.data}
                        setFormData={(data) => dispatch(setProfile(data))}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        handleSave={handleSave}
                      />
                    )}
                    {activeTab === "medical" && (
                      <MedicalTab
                        formData={profileState.data}
                        setFormData={(data) => dispatch(setProfile(data))}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        handleSave={handleSave}
                      />
                    )}
                    {activeTab === "documents" && (
                      <DocumentsTab
                        formData={profileState.data}
                        isLoading={false}
                      />
                    )}
                    {activeTab === "security" && (
                      <SecurityTab userEmail={userEmail ?? ""} userId={userId ?? ""} />
                    )}
                    {activeTab === "preferences" && <PreferencesTab />}
                    {activeTab === "privacy" && <PrivacyTab userId={userId ?? ""} />}
                    {activeTab === "activity" && <ActivityTab userId={userId ?? ""} />}
                    {activeTab === "billing" && <BillingTab userId={userId ?? ""} />}
                  </AnimatePresence>
                )}
              </div>
            </main>
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
