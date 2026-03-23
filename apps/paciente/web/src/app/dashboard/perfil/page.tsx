"use client";

import { useConfiguracion } from "@/hooks/paciente/useConfiguracion";
import { ProfileCard } from "@/components/paciente/configuracion/ProfileCard";
import { MedicalInfoCard } from "@/components/paciente/configuracion/MedicalInfoCard";
import { NotificationsCard } from "@/components/paciente/configuracion/NotificationsCard";
import { PreferencesCard } from "@/components/paciente/configuracion/PreferencesCard";
import { PrivacyCard } from "@/components/paciente/configuracion/PrivacyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Heart, Bell, Settings, Shield } from "lucide-react";
import { useState } from "react";

type Section = "personal" | "medical" | "notifications" | "preferences" | "privacy";

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "personal", label: "Personal", icon: User },
  { id: "medical", label: "Medica", icon: Heart },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "preferences", label: "Preferencias", icon: Settings },
  { id: "privacy", label: "Privacidad", icon: Shield },
];

export default function PerfilPage() {
  const [activeSection, setActiveSection] = useState<Section>("personal");
  const {
    loading,
    saving,
    message,
    profile,
    setProfile,
    patientDetails,
    setPatientDetails,
    preferences,
    setPreferences,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    saveProfile,
    savePatientDetails,
    savePreferences,
    saveNotifications,
    savePrivacy,
  } = useConfiguracion();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Gestiona tu informacion personal y preferencias</p>
      </div>

      {/* Success/error message */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          message.type === "success"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-3xl">
        {activeSection === "personal" && (
          <ProfileCard
            profile={profile}
            setProfile={setProfile}
            saving={saving}
            onSave={saveProfile}
          />
        )}
        {activeSection === "medical" && (
          <MedicalInfoCard
            details={patientDetails}
            setDetails={setPatientDetails}
            saving={saving}
            onSave={savePatientDetails}
          />
        )}
        {activeSection === "notifications" && (
          <NotificationsCard
            notifications={notifications}
            setNotifications={setNotifications}
            saving={saving}
            onSave={saveNotifications}
          />
        )}
        {activeSection === "preferences" && (
          <PreferencesCard
            preferences={preferences}
            setPreferences={setPreferences}
            saving={saving}
            onSave={savePreferences}
          />
        )}
        {activeSection === "privacy" && (
          <PrivacyCard
            privacy={privacy}
            setPrivacy={setPrivacy}
            saving={saving}
            onSave={savePrivacy}
          />
        )}
      </div>
    </div>
  );
}
