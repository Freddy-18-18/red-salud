'use client';

/**
 * @file vitals-trend-card.tsx
 * @description Compact card that surfaces the most recent measurement per
 * vital metric. NOT a chart yet — Phase 2 ships with a "latest snapshot"
 * grid; the time-series chart lands in Phase 3 (Vitales tab) so the Resumen
 * tab stays scannable.
 *
 * Deduplication happens here: the hook returns ascending-by-time, so a later
 * iteration overwrites the previous entry per `metric_type_id`. This mirrors
 * how `getClinicalOverview()` builds `last_vitals`, but we do it client-side
 * to support a custom `days` window.
 */

import { Activity, AlertCircle } from 'lucide-react';
import { EmptyState as DSEmptyState, Skeleton } from '@red-salud/design-system';

import { usePatientVitalsTrend } from '@/hooks/use-patient-vitals-trend';
import type { PatientVitalsTrendPoint } from '@red-salud/types';

interface VitalsTrendCardProps {
  patientId: string;
  /** Days back. Allowed by the hook: 30 | 90 | 365. Defaults to 30. */
  days?: 30 | 90 | 365;
}

function latestByMetric(
  points: PatientVitalsTrendPoint[],
): PatientVitalsTrendPoint[] {
  const map = new Map<string, PatientVitalsTrendPoint>();
  for (const point of points) {
    map.set(point.metric_type_id, point);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.metric_name.localeCompare(b.metric_name, 'es'),
  );
}

function formatMeasuredAt(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  const now = new Date();
  const sameDay =
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate();
  if (sameDay) {
    return `Hoy a las ${parsed.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Caracas',
    })}`;
  }
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.max(
    1,
    Math.floor((now.getTime() - parsed.getTime()) / msPerDay),
  );
  if (diffDays === 1) return 'Hace 1 día';
  return `Hace ${diffDays} días`;
}

function formatValue(point: PatientVitalsTrendPoint): string {
  if (point.valor_secundario != null) {
    return `${point.valor}/${point.valor_secundario}`;
  }
  return String(point.valor);
}

export function VitalsTrendCard({ patientId, days = 30 }: VitalsTrendCardProps) {
  const { vitals, isLoading, error, refetch } = usePatientVitalsTrend({
    patientId,
    days,
  });

  const latest = latestByMetric(vitals);

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Signos vitales recientes
          </h3>
        </div>
        {!isLoading && !error && latest.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Últimos {days} días
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : error ? (
        <InlineError message={error.message} onRetry={() => void refetch()} />
      ) : latest.length === 0 ? (
        <DSEmptyState
          icon={Activity}
          title="Sin mediciones recientes"
          description={`No tenés signos vitales registrados en los últimos ${days} días.`}
          size="compact"
          className="border-0 bg-transparent"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {latest.map((point) => (
            <VitalCard key={point.id} point={point} />
          ))}
        </div>
      )}
    </div>
  );
}

function VitalCard({ point }: { point: PatientVitalsTrendPoint }) {
  const isOut = point.is_out_of_range;
  return (
    <div
      className={`rounded-lg border p-3 ${
        isOut ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-xs font-medium text-muted-foreground line-clamp-2">
          {point.metric_name}
        </p>
        {isOut && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30 flex-shrink-0">
            Fuera de rango
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {formatValue(point)}
        </span>
        {point.metric_unit && (
          <span className="text-xs text-muted-foreground">
            {point.metric_unit}
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/70 mt-1">
        {formatMeasuredAt(point.measured_at)}
      </p>
      {(point.rango_minimo != null || point.rango_maximo != null) && (
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          Rango {point.rango_minimo ?? '--'} - {point.rango_maximo ?? '--'}{' '}
          {point.metric_unit}
        </p>
      )}
    </div>
  );
}

function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-destructive">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center text-xs font-medium text-destructive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Reintentá
          </button>
        )}
      </div>
    </div>
  );
}
