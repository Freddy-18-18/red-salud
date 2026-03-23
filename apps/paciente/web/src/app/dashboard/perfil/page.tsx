"use client";

import { useConfiguracion } from "@/hooks/paciente/useConfiguracion";
import { ProfileCard } from "@/components/paciente/configuracion/ProfileCard";
import { MedicalInfoCard } from "@/components/paciente/configuracion/MedicalInfoCard";
import { NotificationsCard } from "@/components/paciente/configuracion/NotificationsCard";
import { PreferencesCard } from "@/components/paciente/configuracion/PreferencesCard";
import { PrivacyCard } from "@/components/paciente/configuracion/PrivacyCard";

export default function PerfilPage() {
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
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <ProfileCard
        profile={profile}
        setProfile={setProfile}
        saving={saving}
        onSave={saveProfile}
      />

      <MedicalInfoCard
        details={patientDetails}
        setDetails={setPatientDetails}
        saving={saving}
        onSave={savePatientDetails}
      />

      <NotificationsCard
        notifications={notifications}
        setNotifications={setNotifications}
        saving={saving}
        onSave={saveNotifications}
      />

      <PreferencesCard
        preferences={preferences}
        setPreferences={setPreferences}
        saving={saving}
        onSave={savePreferences}
      />

      <PrivacyCard
        privacy={privacy}
        setPrivacy={setPrivacy}
        saving={saving}
        onSave={savePrivacy}
      />
    </div>
  );
}
