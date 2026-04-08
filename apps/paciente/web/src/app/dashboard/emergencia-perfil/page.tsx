"use client";

import {
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ProfileConfig } from "@/components/emergency/profile-config";
import { QRDisplay } from "@/components/emergency/qr-display";
import { PublicProfileView } from "@/components/emergency/public-profile-view";
import {
  useEmergencyProfile,
  useUpdateEmergencyProfile,
} from "@/hooks/use-emergency-profile";
import { generateQRUrl } from "@/lib/services/emergency-profile-service";
import type { PublicEmergencyProfile } from "@/lib/services/emergency-profile-service";

export default function EmergenciaPerfilPage() {
  const { data, isLoading, error } = useEmergencyProfile();
  const updateMutation = useUpdateEmergencyProfile();
  const [showPreview, setShowPreview] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-[300px] w-[260px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Error al cargar el perfil de emergencia
            </p>
            <p className="text-xs text-red-600 mt-1">
              {error.message || "Intenta recargar la pagina."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const config = data?.config ?? null;
  const medicalData = data?.medical_data ?? {
    full_name: null,
    date_of_birth: null,
    avatar_url: null,
    blood_type: null,
    allergies: [],
    medications: [],
    conditions: [],
    emergency_contacts: [],
    insurance: null,
  };

  // Build a preview profile for the preview section
  const previewProfile: PublicEmergencyProfile | null = config?.is_active
    ? buildPreviewProfile(config, medicalData)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Info banner — first time setup */}
      {!config && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Configura tu perfil de emergencia
              </p>
              <p className="text-xs text-red-600 mt-1">
                En una emergencia, un profesional medico puede escanear tu
                codigo QR y acceder a informacion critica sobre tu salud
                SIN necesitar iniciar sesion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main layout: config + QR side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Configuration */}
        <div>
          <ProfileConfig
            config={config}
            medicalData={medicalData}
            onUpdate={(settings) => updateMutation.mutate(settings)}
            isPending={updateMutation.isPending}
          />
        </div>

        {/* Right: QR Code */}
        <div className="flex flex-col items-center">
          {config?.access_token ? (
            <QRDisplay
              accessToken={config.access_token}
              viewCount={config.view_count}
              isActive={config.is_active}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-[200px] h-[200px] bg-gray-100 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="h-16 w-16 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Activa tu perfil de emergencia para generar el codigo QR
              </p>
            </div>
          )}

          {/* Link to public profile */}
          {config?.access_token && config.is_active && (
            <a
              href={generateQRUrl(config.access_token)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 mt-4 transition"
            >
              Ver perfil publico
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Preview section */}
      {previewProfile && (
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className="text-sm font-semibold text-gray-700">
              Vista previa del perfil publico
            </span>
            {showPreview ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {showPreview && (
            <div className="border-t border-gray-200 max-h-[600px] overflow-y-auto">
              <div className="transform scale-[0.85] origin-top">
                <PublicProfileView profile={previewProfile} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function PageHeader() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Perfil de Emergencia
        </h1>
      </div>
      <p className="text-sm text-gray-500">
        Configura tu informacion medica de emergencia accesible via QR.
        Cualquier profesional de salud puede escanearlo sin iniciar sesion.
      </p>
    </div>
  );
}

// --- Helpers ---

function buildPreviewProfile(
  config: NonNullable<typeof undefined & { share_blood_type: boolean }>,
  medicalData: {
    full_name: string | null;
    date_of_birth: string | null;
    blood_type: string | null;
    allergies: string[];
    medications: string[];
    conditions: string[];
    emergency_contacts: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    insurance: { company: string; policy_number: string } | null;
  },
): PublicEmergencyProfile {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cfg = config as any;

  const profile: PublicEmergencyProfile = {
    full_name: medicalData.full_name || "Paciente",
    age: medicalData.date_of_birth ? calculateAge(medicalData.date_of_birth) : null,
  };

  if (cfg.share_blood_type && medicalData.blood_type) {
    profile.blood_type = medicalData.blood_type;
  }
  if (cfg.share_allergies) {
    profile.allergies = medicalData.allergies;
  }
  if (cfg.share_medications) {
    profile.medications = medicalData.medications;
  }
  if (cfg.share_conditions) {
    profile.conditions = medicalData.conditions;
  }
  if (cfg.share_emergency_contacts) {
    profile.emergency_contacts = medicalData.emergency_contacts;
  }
  if (cfg.share_insurance && medicalData.insurance) {
    profile.insurance = medicalData.insurance;
  }

  return profile;
}

function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
