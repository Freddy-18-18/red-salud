"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Bell,
  Shield,
  Monitor,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useConfiguracion,
  PatientDetails,
} from "@/hooks/paciente/useConfiguracion";
import { ProfileCard } from "@/components/paciente/configuracion/ProfileCard";
import { MedicalInfoCard } from "@/components/paciente/configuracion/MedicalInfoCard";
import { PreferencesCard } from "@/components/paciente/configuracion/PreferencesCard";
import { NotificationsCard } from "@/components/paciente/configuracion/NotificationsCard";
import { PrivacyCard } from "@/components/paciente/configuracion/PrivacyCard";

export default function ConfiguracionPage() {
  const {
    loading,
    saving,
    message,
    setMessage,
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

  useEffect(() => {
    // Garantiza restaurar mensajes al navegar
    return () => setMessage(null);
  }, [setMessage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu perfil y preferencias
        </p>
      </div>

      {/* Mensaje de éxito/error */}
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Monitor className="h-4 w-4 mr-2" />
            Médico
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Monitor className="h-4 w-4 mr-2" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacidad
          </TabsTrigger>
        </TabsList>

        {/* Perfil Personal */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileCard profile={profile} setProfile={(p) => setProfile(p)} saving={saving} onSave={saveProfile} />
        </TabsContent>

        {/* Información Médica */}
        <TabsContent value="medical" className="space-y-6">
          <MedicalInfoCard
            details={patientDetails as PatientDetails}
            setDetails={(d) => setPatientDetails(d)}
            saving={saving}
            onSave={savePatientDetails}
          />
        </TabsContent>

        {/* Preferencias */}
        <TabsContent value="preferences" className="space-y-6">
          <PreferencesCard preferences={preferences} setPreferences={(p) => setPreferences(p)} saving={saving} onSave={savePreferences} />
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsCard
            notifications={notifications}
            setNotifications={(n) => setNotifications(n)}
            saving={saving}
            onSave={saveNotifications}
          />
        </TabsContent>

        {/* Privacidad */}
        <TabsContent value="privacy" className="space-y-6">
          <PrivacyCard privacy={privacy} setPrivacy={(p) => setPrivacy(p)} saving={saving} onSave={savePrivacy} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
