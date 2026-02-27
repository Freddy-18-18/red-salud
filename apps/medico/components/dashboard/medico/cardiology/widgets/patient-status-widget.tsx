// ============================================
// CARDIOLOGY WIDGETS - Patient Status Widget
// Overview of cardiology patient status metrics
// ============================================

"use client";

import { Users, TrendingUp, AlertCircle, Heart } from "lucide-react";

interface PatientStatusWidgetProps {
  doctorId?: string;
}

interface PatientMetrics {
  active: number;
  activeTrend: number;
  followUp: number;
  highPriority: number;
  newThisMonth: number;
  avgAge: number;
  malePercentage: number;
}

/**
 * Patient Status Widget for Cardiology
 *
 * Shows overview of cardiology patient population metrics
 */
export function PatientStatusWidget({ doctorId }: PatientStatusWidgetProps) {
  // Mock data for patient status
  const metrics: PatientMetrics = {
    active: 156,
    activeTrend: 5,
    followUp: 42,
    highPriority: 8,
    newThisMonth: 18,
    avgAge: 58,
    malePercentage: 52,
  };

  const getStatusColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return "text-red-600";
    if (value >= thresholds.warning) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {/* Status Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Estado de Pacientes</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <p className="text-xs text-muted-foreground">Pacientes Activos</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xl font-semibold">{metrics.active}</p>
              <span className={`text-xs ${getStatusColor(metrics.activeTrend, { warning: 10, danger: 20 })}`}>
                {metrics.activeTrend > 0 ? "+" : ""}{metrics.activeTrend}%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <p className="text-xs text-muted-foreground">En Seguimiento</p>
            <p className="text-xl font-semibold mt-1">{metrics.followUp}</p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <p className="text-xs text-muted-foreground">Alta Prioridad</p>
            <p
              className={`text-xl font-semibold mt-1 ${
                metrics.highPriority > 5
                  ? "text-red-600"
                  : metrics.highPriority > 0
                    ? "text-yellow-600"
                    : "text-muted-foreground"
              }`}
            >
              {metrics.highPriority}
            </p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <p className="text-xs text-muted-foreground">Nuevos (Mes)</p>
            <p className="text-xl font-semibold mt-1">{metrics.newThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Demografía</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <p className="text-xs text-muted-foreground">Edad Promedio</p>
            <p className="text-xl font-semibold mt-1">{metrics.avgAge} años</p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <p className="text-xs text-muted-foreground">Hombres</p>
            <p className="text-xl font-semibold mt-1">{metrics.malePercentage}%</p>
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <h4 className="font-semibold text-sm">Por Prioridad</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Alta</span>
            <span className="font-medium">8</span>
            <div className="h-2 w-24 bg-muted rounded-full ml-2">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${(8 / 8) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Media</span>
            <span className="font-medium">24</span>
            <div className="h-2 w-24 bg-muted rounded-full ml-2">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${(24 / 32) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Baja</span>
            <span className="font-medium">124</span>
            <div className="h-2 w-24 bg-muted rounded-full ml-2">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(124 / 156) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
