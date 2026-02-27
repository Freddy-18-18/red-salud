// ============================================
// PEDIATRICS WIDGETS - Growth Alerts
// Alerts for growth and development issues
// ============================================

"use client";

import { AlertTriangle, TrendingDown } from "lucide-react";

interface GrowthAlertsWidgetProps {
  doctorId?: string;
  maxAlerts?: number;
}

interface GrowthAlert {
  id: string;
  patientName: string;
  age: string;
  alert: string;
  severity: "high" | "medium" | "low";
}

/**
 * Growth Alerts Widget
 *
 * Shows patients with growth or development concerns
 */
export function GrowthAlertsWidget({ doctorId, maxAlerts = 5 }: GrowthAlertsWidgetProps) {
  // Mock data for growth alerts
  const alerts: GrowthAlert[] = [
    {
      id: "1",
      patientName: "Valentina González",
      age: "8 meses",
      alert: "Peso por debajo del percentil 5",
      severity: "high",
    },
    {
      id: "2",
      patientName: "Mateo Rodríguez",
      age: "18 meses",
      alert: "Talla por debajo del percentil 10",
      severity: "high",
    },
    {
      id: "3",
      patientName: "Sofía Martínez",
      age: "3 años",
      alert: "Retraso en lenguaje (detecta 3 palabras)",
      severity: "medium",
    },
    {
      id: "4",
      patientName: "Daniel López",
      age: "4 meses",
      alert: "No ha ganado peso en última visita",
      severity: "medium",
    },
  ];

  const displayAlerts = alerts.slice(0, maxAlerts);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-orange-500" />
        <h4 className="font-semibold text-sm">
          Alertas de Crecimiento ({displayAlerts.length})
        </h4>
      </div>

      {displayAlerts.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <AlertTriangle className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No alertas pendientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-2 p-2 rounded-lg border ${
                alert.severity === "high"
                  ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                  : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                  alert.severity === "high"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.patientName}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.age} • {alert.alert}
                </p>
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
