"use client";

import { User, Heart, Bell, Shield, Lock } from "lucide-react";
import { useState } from "react";

import { TabPersonalData } from "@/components/paciente/settings/TabPersonalData";
import { TabMedicalInfo } from "@/components/paciente/settings/TabMedicalInfo";
import { TabNotifications } from "@/components/paciente/settings/TabNotifications";
import { TabPrivacy } from "@/components/paciente/settings/TabPrivacy";
import { TabSecurity } from "@/components/paciente/settings/TabSecurity";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/paciente/useSettings";

type TabId = "personal" | "medical" | "security" | "notifications" | "privacy";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "personal", label: "Datos personales", icon: User },
  { id: "medical", label: "Info medica", icon: Heart },
  { id: "security", label: "Seguridad", icon: Lock },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "privacy", label: "Privacidad", icon: Shield },
];

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const {
    loading,
    saving,
    message,
    profile,
    setProfile,
    patientDetails,
    setPatientDetails,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    saveProfile,
    savePatientDetails,
    saveNotifications,
    savePrivacy,
    changePassword,
    exportData,
    deleteAccount,
  } = useSettings();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-lg" />
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
          Mi Perfil
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Gestiona tu informacion personal, seguridad y preferencias
        </p>
      </div>

      {/* Toast message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400"
              : "bg-red-50 border border-red-200 text-red-600 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="max-w-3xl">
        {activeTab === "personal" && (
          <TabPersonalData
            profile={profile}
            setProfile={setProfile}
            saving={saving}
            onSave={saveProfile}
          />
        )}
        {activeTab === "medical" && (
          <TabMedicalInfo
            details={patientDetails}
            setDetails={setPatientDetails}
            saving={saving}
            onSave={savePatientDetails}
          />
        )}
        {activeTab === "security" && (
          <TabSecurity saving={saving} onChangePassword={changePassword} />
        )}
        {activeTab === "notifications" && (
          <TabNotifications
            notifications={notifications}
            setNotifications={setNotifications}
            saving={saving}
            onSave={saveNotifications}
          />
        )}
        {activeTab === "privacy" && (
          <TabPrivacy
            privacy={privacy}
            setPrivacy={setPrivacy}
            saving={saving}
            onSave={savePrivacy}
            onExportData={exportData}
            onDeleteAccount={deleteAccount}
          />
        )}
      </div>
    </div>
  );
}
