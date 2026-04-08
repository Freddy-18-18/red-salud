"use client";

import {
  AlertTriangle,
  Info,
  AlertCircle,
  Pencil,
  CalendarPlus,
  Eye,
  X,
} from "lucide-react";
import { useState } from "react";

import { type ChronicAlert } from "@/lib/services/chronic-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface AlertsPanelProps {
  alerts: ChronicAlert[];
  loading?: boolean;
  onLogReading?: (conditionId: string) => void;
  onScheduleAppointment?: () => void;
  onViewCondition?: (conditionId: string) => void;
  compact?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Alert config                                                       */
/* ------------------------------------------------------------------ */

const SEVERITY_CONFIG = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertCircle,
    iconColor: "text-red-500",
    titleColor: "text-red-800",
    descColor: "text-red-600",
    badgeColor: "bg-red-100 text-red-700",
    badgeLabel: "Critico",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    titleColor: "text-amber-800",
    descColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700",
    badgeLabel: "Atencion",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-500",
    titleColor: "text-blue-800",
    descColor: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700",
    badgeLabel: "Info",
  },
};

const ACTION_CONFIG = {
  log_reading: {
    label: "Registrar lectura",
    icon: Pencil,
  },
  schedule_appointment: {
    label: "Agendar cita",
    icon: CalendarPlus,
  },
  view_condition: {
    label: "Ver condicion",
    icon: Eye,
  },
  none: null,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AlertsPanel({
  alerts,
  loading = false,
  onLogReading,
  onScheduleAppointment,
  onViewCondition,
  compact = false,
}: AlertsPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  const handleAction = (alert: ChronicAlert) => {
    switch (alert.action_type) {
      case "log_reading":
        if (alert.condition_id && onLogReading) {
          onLogReading(alert.condition_id);
        }
        break;
      case "schedule_appointment":
        if (onScheduleAppointment) {
          onScheduleAppointment();
        }
        break;
      case "view_condition":
        if (alert.condition_id && onViewCondition) {
          onViewCondition(alert.condition_id);
        }
        break;
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissed((prev) => new Set(prev).add(alertId));
  };

  return (
    <div className={`space-y-2 ${compact ? "" : "space-y-3"}`}>
      {visibleAlerts.map((alert) => {
        const config = SEVERITY_CONFIG[alert.severity];
        const action = ACTION_CONFIG[alert.action_type];
        const SeverityIcon = config.icon;

        return (
          <div
            key={alert.id}
            className={`relative rounded-xl border ${config.bg} ${config.border} ${
              compact ? "px-3 py-2.5" : "px-4 py-3"
            } transition-all duration-200`}
          >
            <div className="flex items-start gap-3">
              <SeverityIcon
                className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconColor}`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className={`text-sm font-semibold ${config.titleColor} ${
                      compact ? "truncate" : ""
                    }`}
                  >
                    {alert.title}
                  </p>
                  {!compact && (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.badgeColor}`}
                    >
                      {config.badgeLabel}
                    </span>
                  )}
                </div>

                {!compact && (
                  <p className={`text-xs ${config.descColor} leading-relaxed`}>
                    {alert.description}
                  </p>
                )}

                {action && (
                  <button
                    type="button"
                    onClick={() => handleAction(alert)}
                    className={`inline-flex items-center gap-1 mt-1.5 text-xs font-medium ${config.titleColor} hover:underline min-h-[32px]`}
                  >
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                )}
              </div>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => handleDismiss(alert.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
                title="Descartar"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Critical Alert Banner                                              */
/* ------------------------------------------------------------------ */

interface CriticalBannerProps {
  alerts: ChronicAlert[];
}

export function CriticalAlertBanner({ alerts }: CriticalBannerProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const [visible, setVisible] = useState(true);

  if (criticalAlerts.length === 0 || !visible) return null;

  return (
    <div className="bg-red-600 text-white rounded-xl px-4 py-3 flex items-center gap-3">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          {criticalAlerts.length === 1
            ? criticalAlerts[0].title
            : `${criticalAlerts.length} alertas criticas requieren tu atencion`}
        </p>
        {criticalAlerts.length === 1 && (
          <p className="text-xs text-red-100 mt-0.5">
            {criticalAlerts[0].description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
