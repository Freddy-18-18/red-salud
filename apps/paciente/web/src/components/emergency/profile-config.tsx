"use client";

import {
  Droplets,
  AlertTriangle,
  Pill,
  Activity,
  Phone,
  Shield,
  ShieldCheck,
  ShieldOff,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

import type {
  EmergencyProfileConfig,
  EmergencyMedicalData,
  UpdateEmergencyProfileSettings,
} from "@/lib/services/emergency-profile-service";

// --- Types ---

interface ProfileConfigProps {
  config: EmergencyProfileConfig | null;
  medicalData: EmergencyMedicalData;
  onUpdate: (settings: UpdateEmergencyProfileSettings) => void;
  isPending: boolean;
}

interface ToggleItem {
  key: keyof UpdateEmergencyProfileSettings;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  preview: (data: EmergencyMedicalData) => string | null;
}

// --- Constants ---

const TOGGLE_ITEMS: ToggleItem[] = [
  {
    key: "share_blood_type",
    label: "Grupo sanguineo",
    icon: Droplets,
    iconColor: "text-red-500",
    preview: (d) => d.blood_type || "No configurado",
  },
  {
    key: "share_allergies",
    label: "Alergias",
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    preview: (d) =>
      d.allergies.length > 0
        ? d.allergies.slice(0, 3).join(", ") +
          (d.allergies.length > 3 ? ` +${d.allergies.length - 3}` : "")
        : "Sin alergias registradas",
  },
  {
    key: "share_medications",
    label: "Medicamentos actuales",
    icon: Pill,
    iconColor: "text-blue-500",
    preview: (d) =>
      d.medications.length > 0
        ? d.medications.slice(0, 2).join(", ") +
          (d.medications.length > 2
            ? ` +${d.medications.length - 2}`
            : "")
        : "Sin medicamentos registrados",
  },
  {
    key: "share_conditions",
    label: "Condiciones cronicas",
    icon: Activity,
    iconColor: "text-amber-500",
    preview: (d) =>
      d.conditions.length > 0
        ? d.conditions.slice(0, 3).join(", ") +
          (d.conditions.length > 3
            ? ` +${d.conditions.length - 3}`
            : "")
        : "Sin condiciones registradas",
  },
  {
    key: "share_emergency_contacts",
    label: "Contactos de emergencia",
    icon: Phone,
    iconColor: "text-emerald-500",
    preview: (d) =>
      d.emergency_contacts.length > 0
        ? d.emergency_contacts
            .map((c) => `${c.name} (${c.relationship || "Contacto"})`)
            .join(", ")
        : "Sin contactos registrados",
  },
  {
    key: "share_insurance",
    label: "Informacion de seguro",
    icon: Shield,
    iconColor: "text-indigo-500",
    preview: (d) =>
      d.insurance
        ? `${d.insurance.company} - ${d.insurance.policy_number}`
        : "Sin seguro registrado",
  },
];

// --- Component ---

export function ProfileConfig({
  config,
  medicalData,
  onUpdate,
  isPending,
}: ProfileConfigProps) {
  const [showPin, setShowPin] = useState(false);
  const [pinValue, setPinValue] = useState(config?.pin_code || "");

  const isActive = config?.is_active ?? false;

  const getToggleValue = (key: keyof UpdateEmergencyProfileSettings): boolean => {
    if (!config) return true; // Default to true for new profiles
    return (config[key as keyof EmergencyProfileConfig] as boolean) ?? true;
  };

  const handleToggle = (key: keyof UpdateEmergencyProfileSettings) => {
    onUpdate({ [key]: !getToggleValue(key) });
  };

  const handleMasterToggle = () => {
    onUpdate({ is_active: !isActive });
  };

  const handlePinSave = () => {
    const trimmed = pinValue.trim();
    onUpdate({ pin_code: trimmed || null });
  };

  return (
    <div className="space-y-6">
      {/* Master toggle */}
      <div
        className={`p-4 rounded-2xl border-2 transition-colors ${
          isActive
            ? "border-red-200 bg-red-50/50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isActive ? (
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                <ShieldOff className="h-5 w-5 text-gray-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Perfil de emergencia
              </p>
              <p className="text-xs text-gray-500">
                {isActive
                  ? "Activo — visible al escanear el QR"
                  : "Desactivado — no se mostrara al escanear"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={handleMasterToggle}
            disabled={isPending}
            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
              isActive ? "bg-red-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                isActive ? "translate-x-5" : ""
              }`}
            />
            {isPending && (
              <Loader2 className="absolute top-1.5 left-1/2 -translate-x-1/2 h-4 w-4 animate-spin text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Data toggles */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 px-1">
          Datos compartidos
        </h3>
        <p className="text-xs text-gray-500 px-1 mb-3">
          Selecciona que informacion sera visible al escanear tu QR de
          emergencia
        </p>

        <div className="space-y-1">
          {TOGGLE_ITEMS.map((item) => {
            const enabled = getToggleValue(item.key);
            const preview = item.preview(medicalData);

            return (
              <div
                key={item.key}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  enabled ? "bg-white border border-gray-100" : "bg-gray-50 opacity-60"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    enabled ? "bg-gray-100" : "bg-gray-200"
                  }`}
                >
                  <item.icon
                    className={`h-4.5 w-4.5 ${
                      enabled ? item.iconColor : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item.label}
                  </p>
                  {preview && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {enabled ? preview : "No se compartira"}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => handleToggle(item.key)}
                  disabled={isPending || !isActive}
                  className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                    enabled ? "bg-red-500" : "bg-gray-300"
                  } ${!isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      enabled ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PIN code (optional) */}
      <div className="p-4 bg-gray-50 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-500" />
          <p className="text-sm font-semibold text-gray-900">
            PIN de acceso (opcional)
          </p>
        </div>
        <p className="text-xs text-gray-500">
          Si configuras un PIN, el personal medico debera ingresarlo para ver tu
          perfil. Dejalo vacio para acceso directo.
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={showPin ? "text" : "password"}
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="4-6 digitos"
              maxLength={6}
              inputMode="numeric"
              disabled={!isActive}
              className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPin ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={handlePinSave}
            disabled={isPending || !isActive}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Guardar
          </button>
        </div>
        {config?.pin_code && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            PIN activo
          </p>
        )}
      </div>
    </div>
  );
}
