"use client";

import {
  CalendarCheck,
  MessageCircle,
  FlaskConical,
  Pill,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Mail,
  Smartphone,
  Settings2,
} from "lucide-react";
import { useState, useCallback } from "react";

export interface NotificationPreference {
  key: string;
  label: string;
  description: string;
  icon: typeof CalendarCheck;
  color: string;
  iconBg: string;
  email: boolean;
  push: boolean;
  /** Some preferences are push-only (no email option) */
  emailDisabled?: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  {
    key: "appointments",
    label: "Recordatorios de citas",
    description: "Recordatorio antes de cada cita programada",
    icon: CalendarCheck,
    color: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    email: true,
    push: true,
  },
  {
    key: "messages",
    label: "Mensajes de doctores",
    description: "Cuando un doctor te envia un mensaje nuevo",
    icon: MessageCircle,
    color: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-50 dark:bg-green-950/40",
    email: true,
    push: true,
  },
  {
    key: "lab_results",
    label: "Resultados de laboratorio",
    description: "Cuando tus resultados estan disponibles",
    icon: FlaskConical,
    color: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    email: true,
    push: true,
  },
  {
    key: "medications",
    label: "Recordatorios de medicamentos",
    description: "Recordatorio para tomar tus medicamentos",
    icon: Pill,
    color: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-50 dark:bg-orange-950/40",
    email: false,
    push: true,
    emailDisabled: true,
  },
  {
    key: "news",
    label: "Novedades de Red Salud",
    description: "Noticias, mejoras y funciones nuevas",
    icon: Megaphone,
    color: "text-gray-600 dark:text-gray-400",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    email: true,
    push: false,
  },
];

function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
        disabled
          ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-40"
          : checked
            ? "bg-emerald-500 dark:bg-emerald-600"
            : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function NotificationPreferences() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>(DEFAULT_PREFERENCES);

  const updatePreference = useCallback(
    (key: string, field: "email" | "push", value: boolean) => {
      setPreferences((prev) =>
        prev.map((p) => (p.key === key ? { ...p, [field]: value } : p)),
      );
      // In a real implementation, this would save to Supabase
      // For now, it updates local state gracefully
    },
    [],
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Settings2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Preferencias de notificaciones
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Configura como y cuando recibis notificaciones
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {/* Preferences list */}
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-800 animate-fade-in">
          {/* Column headers */}
          <div className="flex items-center justify-end gap-6 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 w-12 justify-center">
              <Mail className="h-3 w-3" />
              Email
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 w-12 justify-center">
              <Smartphone className="h-3 w-3" />
              Push
            </div>
          </div>

          {preferences.map((pref) => {
            const Icon = pref.icon;
            return (
              <div
                key={pref.key}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${pref.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${pref.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {pref.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {pref.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0 ml-3">
                  <div className="w-12 flex justify-center">
                    <ToggleSwitch
                      checked={pref.email}
                      onChange={(v) => updatePreference(pref.key, "email", v)}
                      label={`${pref.label} por email`}
                      disabled={pref.emailDisabled}
                    />
                  </div>
                  <div className="w-12 flex justify-center">
                    <ToggleSwitch
                      checked={pref.push}
                      onChange={(v) => updatePreference(pref.key, "push", v)}
                      label={`${pref.label} push`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
