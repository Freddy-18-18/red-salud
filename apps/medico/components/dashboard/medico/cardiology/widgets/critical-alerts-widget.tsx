// ============================================
// CARDIOLOGY WIDGETS - Critical Alerts Widget
// Shows critical cardiac patient alerts
// ============================================

"use client";

import { AlertTriangle, Heart, Activity } from "lucide-react";

interface CriticalAlertsWidgetProps {
  doctorId?: string;
  maxAlerts?: number;
}

interface CardiacAlert {
  id: string;
  patientName: string;
  condition: string;
  priority: "high" | "medium" | "low";
  timeSince: string;
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    oxygenSat?: number;
  };
}

/**
 * Critical Alerts Widget
 *
 * Shows high-priority cardiac patient alerts
 */
export function CriticalAlertsWidget({ doctorId, maxAlerts = 5 }: CriticalAlertsWidgetProps) {
  // Mock data for critical alerts
  const alerts: CardiacAlert[] = [
    {
      id: "alert1",
      patientName: "Jorge Fernández",
      condition: "Arritmia ventricular detectada",
      priority: "high",
      timeSince: "Hace 1 hora",
      vitals: { heartRate: 110, bloodPressure: "150/95", oxygenSat: 94 },
    },
    {
      id: "alert2",
      patientName: "Lucía Ramírez",
      condition: "Troponinas elevadas post-operatorio",
      priority: "high",
      timeSince: "Hace 3 horas",
      vitals: { heartRate: 88, bloodPressure: "110/70", oxygenSat: 98 },
    },
    {
      id: "alert3",
      patientName: "Miguel Ángel",
      condition: "Presión arterial alta no controlada",
      priority: "medium",
      timeSince: "Hace 5 horas",
      vitals: { heartRate: 92, bloodPressure: "165/100", oxygenSat: 97 },
    },
    {
      id: "alert4",
      patientName: "Carmen López",
      condition: "Disnea de esfuerzo progresiva",
      priority: "medium",
      timeSince: "Hace 6 horas",
    },
    {
      id: "alert5",
      patientName: "Roberto Díaz",
      condition: "Palpitaciones reportadas",
      priority: "low",
      timeSince: "Hace 8 horas",
    },
  ];

  const displayAlerts = alerts.slice(0, maxAlerts);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <h4 className="font-semibold text-sm">
          Alertas Críticas ({alerts.length})
        </h4>
      </div>

      {displayAlerts.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Activity className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No alertas críticas activas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-2 p-2 rounded-lg border ${
                alert.priority === "high"
                  ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                  : alert.priority === "medium"
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
                    : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                  alert.priority === "high"
                    ? "text-red-600"
                    : alert.priority === "medium"
                      ? "text-orange-600"
                      : "text-yellow-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.patientName}</p>
                <p className="text-xs text-muted-foreground">{alert.condition}</p>
                {alert.vitals && (
                  <div className="mt-1 text-xs text-muted-foreground space-x-2">
                    {alert.vitals.heartRate && (
                      <span>FC: {alert.vitals.heartRate} lpm</span>
                    )}
                    {alert.vitals.bloodPressure && (
                      <span>TA: {alert.vitals.bloodPressure}</span>
                    )}
                    {alert.vitals.oxygenSat && (
                      <span>SpO2: {alert.vitals.oxygenSat}%</span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {alert.timeSince}
              </div>
            </div>
          ))}
        </div>
      )}

      {alerts.length > maxAlerts && (
        <div className="text-center">
          <button className="text-xs text-primary hover:underline">
            +{alerts.length - maxAlerts} más alertas
          </button>
        </div>
      )}
    </div>
  );
}
