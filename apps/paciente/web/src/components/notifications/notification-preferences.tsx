"use client";

import {
  CalendarCheck,
  MessageCircle,
  FlaskConical,
  Pill,
  HeartPulse,
  Tag,
  ClipboardCheck,
  Trophy,
  Info,
  Mail,
  Smartphone,
  Loader2,
  type LucideIcon,
} from "lucide-react";

import {
  useNotificationPreferences,
  useUpdatePreferences,
} from "@/hooks/use-notifications";

// ─── Category config ─────────────────────────────────────────────────────────

interface CategoryConfig {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  /** Some categories don't support email (e.g., push-only alerts) */
  emailDisabled?: boolean;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "appointments",
    label: "Recordatorios de citas",
    description: "Recordatorio antes de cada cita programada",
    icon: CalendarCheck,
    color: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    key: "messages",
    label: "Mensajes de doctores",
    description: "Cuando un doctor te envia un mensaje nuevo",
    icon: MessageCircle,
    color: "text-green-600",
    iconBg: "bg-green-50",
  },
  {
    key: "lab_results",
    label: "Resultados de laboratorio",
    description: "Cuando tus resultados estan disponibles",
    icon: FlaskConical,
    color: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    key: "prescriptions",
    label: "Recetas y medicamentos",
    description: "Vencimiento de recetas y recordatorios de medicacion",
    icon: Pill,
    color: "text-orange-600",
    iconBg: "bg-orange-50",
    emailDisabled: true,
  },
  {
    key: "chronic_alerts",
    label: "Alertas cronicas",
    description: "Alertas de condiciones cronicas y lecturas pendientes",
    icon: HeartPulse,
    color: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    key: "price_alerts",
    label: "Alertas de precios",
    description: "Cuando baja el precio de medicamentos que buscas",
    icon: Tag,
    color: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    key: "follow_ups",
    label: "Seguimientos pendientes",
    description: "Recordatorios de seguimiento post-consulta",
    icon: ClipboardCheck,
    color: "text-teal-600",
    iconBg: "bg-teal-50",
  },
  {
    key: "rewards",
    label: "Recompensas",
    description: "Logros, niveles y puntos ganados",
    icon: Trophy,
    color: "text-amber-500",
    iconBg: "bg-amber-50",
    emailDisabled: true,
  },
  {
    key: "system",
    label: "Novedades de Red Salud",
    description: "Noticias, mejoras y funciones nuevas",
    icon: Info,
    color: "text-gray-600",
    iconBg: "bg-gray-100",
  },
];

// ─── Toggle switch ───────────────────────────────────────────────────────────

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
      className={`
        group relative inline-flex h-5 w-9 items-center rounded-full
        transition-[background-color,box-shadow,transform] duration-300 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
        active:scale-[0.92]
        ${
          disabled
            ? "bg-gray-200 cursor-not-allowed opacity-40"
            : checked
              ? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.10)] hover:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"
              : "bg-gray-200 hover:bg-gray-300 cursor-pointer hover:shadow-[0_0_0_4px_rgba(0,0,0,0.05)]"
        }
      `}
    >
      {/* Track shimmer on hover (only when enabled, animates the gradient
          left-to-right so the user perceives the toggle as live). */}
      {!disabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        >
          <span
            className={`absolute inset-y-0 -inset-x-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
              checked
                ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                : "bg-gradient-to-r from-transparent via-black/5 to-transparent"
            }`}
          />
        </span>
      )}

      {/* Thumb. The width briefly stretches while the user is pressing
          the button (group-active:w-[18px]) for a tactile "squish" cue,
          then snaps back when released. */}
      <span
        className={`
          pointer-events-none relative z-10 inline-block h-3.5 rounded-full bg-white
          shadow-[0_1px_2px_rgba(0,0,0,0.18),0_2px_4px_rgba(0,0,0,0.06)]
          transition-[transform,width] duration-300 ease-out
          group-active:w-[18px]
          ${checked ? "w-3.5 translate-x-[18px] group-active:translate-x-[14px]" : "w-3.5 translate-x-0.5"}
        `}
      />
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NotificationPreferences() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdatePreferences();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!preferences) return null;

  const handleGlobalToggle = (field: "email_enabled" | "push_enabled", value: boolean) => {
    updatePrefs.mutate({
      ...preferences,
      [field]: value,
    });
  };

  const handleCategoryToggle = (
    categoryKey: string,
    channel: "email" | "push",
    value: boolean,
  ) => {
    const updatedCategories = {
      ...preferences.categories,
      [categoryKey]: {
        ...preferences.categories[categoryKey],
        [channel]: value,
      },
    };

    updatePrefs.mutate({
      ...preferences,
      categories: updatedCategories,
    });
  };

  return (
    <div className="space-y-6">
      {/* Global toggles */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Canales de notificacion
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Activa o desactiva canales globalmente
          </p>
        </div>

        <div className="divide-y divide-gray-50">
          {/* Email global */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Notificaciones por email
                </p>
                <p className="text-xs text-gray-400">
                  Recibe un correo para cada notificacion habilitada
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={preferences.email_enabled}
              onChange={(v) => handleGlobalToggle("email_enabled", v)}
              label="Notificaciones por email"
            />
          </div>

          {/* Push global */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Notificaciones push
                </p>
                <p className="text-xs text-gray-400">
                  Alertas instantaneas en tu navegador o dispositivo
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={preferences.push_enabled}
              onChange={(v) => handleGlobalToggle("push_enabled", v)}
              label="Notificaciones push"
            />
          </div>
        </div>
      </div>

      {/* Per-category toggles */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Categorias
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configura que tipo de notificaciones recibis por cada canal
          </p>
        </div>

        {/* Column headers */}
        <div className="flex items-center justify-end gap-6 px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 w-12 justify-center">
            <Mail className="h-3 w-3" />
            Email
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 w-12 justify-center">
            <Smartphone className="h-3 w-3" />
            Push
          </div>
        </div>

        {/* Category rows */}
        <div className="divide-y divide-gray-50">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const catPrefs = preferences.categories[cat.key] ?? {
              email: true,
              push: true,
            };

            return (
              <div
                key={cat.key}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg ${cat.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`h-4 w-4 ${cat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {cat.label}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0 ml-3">
                  <div className="w-12 flex justify-center">
                    <ToggleSwitch
                      checked={catPrefs.email}
                      onChange={(v) =>
                        handleCategoryToggle(cat.key, "email", v)
                      }
                      label={`${cat.label} por email`}
                      disabled={
                        cat.emailDisabled || !preferences.email_enabled
                      }
                    />
                  </div>
                  <div className="w-12 flex justify-center">
                    <ToggleSwitch
                      checked={catPrefs.push}
                      onChange={(v) =>
                        handleCategoryToggle(cat.key, "push", v)
                      }
                      label={`${cat.label} push`}
                      disabled={!preferences.push_enabled}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saving indicator */}
      {updatePrefs.isPending && (
        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <Loader2 className="h-3 w-3 animate-spin" />
          Guardando...
        </div>
      )}
    </div>
  );
}
