'use client';

/**
 * @file computed-alerts-panel.tsx
 * @description Panel that surfaces client-derived alerts (vitals out of
 * range, prescriptions expiring/expired, allergy-medication conflicts,
 * abnormal lab results pending). Renders nothing when there are no alerts —
 * the panel only appears when the doctor actually needs to see it.
 *
 * Alert engine is purely derivative via `usePatientComputedAlerts` (no
 * Supabase calls). This component is the visual layer for that engine.
 *
 * Loading semantics: we wait for the three underlying queries (overview,
 * vitals, prescriptions) before showing anything. While any of them is
 * loading, we render a small skeleton so the doctor knows alerts are still
 * being computed.
 */

import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Bell,
} from 'lucide-react';
import { Skeleton } from '@red-salud/design-system';

import { usePatientActiveRx } from '@/hooks/use-patient-active-rx';
import { usePatientClinicalOverview } from '@/hooks/use-patient-clinical-overview';
import { usePatientComputedAlerts } from '@/hooks/use-patient-computed-alerts';
import { usePatientVitalsTrend } from '@/hooks/use-patient-vitals-trend';
import type { ComputedAlert, ComputedAlertSeverity } from '@red-salud/types';

interface ComputedAlertsPanelProps {
  patientId: string;
}

interface SeverityVisuals {
  container: string;
  iconClass: string;
  Icon: typeof AlertOctagon;
  label: string;
}

const SEVERITY_VISUALS: Record<ComputedAlertSeverity, SeverityVisuals> = {
  critical: {
    container: 'bg-destructive/10 border-destructive/30',
    iconClass: 'text-destructive',
    Icon: AlertOctagon,
    label: 'Crítico',
  },
  warning: {
    container: 'bg-warning/10 border-warning/30',
    iconClass: 'text-warning',
    Icon: AlertTriangle,
    label: 'Atención',
  },
  info: {
    container: 'bg-info/10 border-info/30',
    iconClass: 'text-info',
    Icon: Info,
    label: 'Información',
  },
};

export function ComputedAlertsPanel({ patientId }: ComputedAlertsPanelProps) {
  const overviewQuery = usePatientClinicalOverview({ patientId });
  const vitalsQuery = usePatientVitalsTrend({ patientId, days: 30 });
  const rxQuery = usePatientActiveRx({ patientId });

  const alerts = usePatientComputedAlerts({
    overview: overviewQuery.overview,
    vitals: vitalsQuery.vitals,
    prescriptions: rxQuery.prescriptions,
  });

  const isLoading =
    overviewQuery.isLoading || vitalsQuery.isLoading || rxQuery.isLoading;

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    );
  }

  // When there are no alerts the panel hides entirely — the doctor only
  // sees clutter when something actually needs attention.
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Alertas clínicas
          </h3>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {alerts.length}
        </span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, idx) => (
          <AlertRow key={alertKey(alert, idx)} alert={alert} />
        ))}
      </div>
    </div>
  );
}

function alertKey(alert: ComputedAlert, idx: number): string {
  switch (alert.kind) {
    case 'vital_out_of_range':
      return `${alert.kind}-${alert.metric_name}-${alert.measured_at}`;
    case 'rx_expiring':
    case 'rx_expired':
      return `${alert.kind}-${alert.prescription_id}`;
    case 'lab_abnormal_pending':
      return `${alert.kind}-${alert.result_id}-${alert.parametro}`;
    case 'allergy_med_conflict':
      return `${alert.kind}-${alert.allergy_term}-${alert.medication_term}`;
    default:
      return `alert-${idx}`;
  }
}

function AlertRow({ alert }: { alert: ComputedAlert }) {
  const visuals = SEVERITY_VISUALS[alert.severity];
  const Icon = visuals.Icon;
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${visuals.container}`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${visuals.iconClass}`} />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground">{alert.message}</p>
        <AlertMeta alert={alert} />
      </div>
    </div>
  );
}

function AlertMeta({ alert }: { alert: ComputedAlert }) {
  switch (alert.kind) {
    case 'vital_out_of_range':
      return (
        <p className="text-xs text-muted-foreground">
          {alert.metric_name}: {alert.metric_value}{' '}
          {alert.metric_unit && (
            <span className="text-muted-foreground/70">{alert.metric_unit}</span>
          )}
          {(alert.rango_minimo != null || alert.rango_maximo != null) && (
            <>
              {' · Rango '}
              {alert.rango_minimo ?? '--'} - {alert.rango_maximo ?? '--'}
            </>
          )}
        </p>
      );
    case 'rx_expiring':
      return (
        <p className="text-xs text-muted-foreground">
          {alert.diagnosis ?? 'Receta sin diagnóstico'} · vence en{' '}
          {alert.days_until_expiration}{' '}
          {alert.days_until_expiration === 1 ? 'día' : 'días'}
        </p>
      );
    case 'rx_expired':
      return (
        <p className="text-xs text-muted-foreground">
          {alert.diagnosis ?? 'Receta sin diagnóstico'} · venció el{' '}
          {new Date(alert.expires_at).toLocaleDateString('es-VE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'America/Caracas',
          })}
        </p>
      );
    case 'allergy_med_conflict':
      return (
        <p className="text-xs text-muted-foreground">
          Alergia a <span className="font-medium">{alert.allergy_term}</span> ·
          medicación con{' '}
          <span className="font-medium">{alert.medication_term}</span>
        </p>
      );
    case 'lab_abnormal_pending':
      return (
        <p className="text-xs text-muted-foreground">
          {alert.parametro}
          {alert.valor && (
            <>
              {': '}
              <span className="font-medium text-foreground/90">
                {alert.valor}
              </span>
            </>
          )}
          {alert.rango_referencia && (
            <span className="text-muted-foreground/70">
              {' · Ref '}
              {alert.rango_referencia}
            </span>
          )}
        </p>
      );
    default:
      return null;
  }
}
