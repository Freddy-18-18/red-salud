'use client';

/**
 * @file vaccinations-panel.tsx
 * @description Patient vaccinations list for the Vacunas tab. Sorted
 * newest-first by `administered_date`. Surfaces a badge when the next dose
 * is already overdue (red) or coming up within 30 days (yellow).
 *
 * "Overdue / coming soon" math runs in America/Caracas day-precision via a
 * helper that compares calendar dates only (no intra-day rounding).
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Syringe } from 'lucide-react';
import { EmptyState, Skeleton } from '@red-salud/design-system';

import { supabase } from '@/lib/supabase/client';
import {
  listVaccinations,
  type ServiceError,
} from '@/lib/supabase/services/patient-clinical-service';
import type { PatientVaccinationRow } from '@red-salud/types';

interface VaccinationsPanelProps {
  patientId: string;
}

interface NextDoseStatus {
  kind: 'overdue' | 'soon' | 'ok';
  days: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Caracas',
  });
}

/**
 * Day-precision delta. Treats `next` as midnight Caracas (UTC-4) by parsing
 * the YYYY-MM-DD date string; this keeps the "vencida" boundary at midnight
 * local time without dragging in a TZ library.
 */
function daysUntil(nextDateIso: string): number {
  const next = new Date(`${nextDateIso}T00:00:00-04:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((next.getTime() - today.getTime()) / MS_PER_DAY);
}

function nextDoseStatus(iso: string | null): NextDoseStatus | null {
  if (!iso) return null;
  const days = daysUntil(iso);
  if (days < 0) return { kind: 'overdue', days };
  if (days < 30) return { kind: 'soon', days };
  return { kind: 'ok', days };
}

export function VaccinationsPanel({ patientId }: VaccinationsPanelProps) {
  const query = useQuery({
    queryKey: ['patients', 'vaccinations', patientId],
    queryFn: async () => {
      const result = await listVaccinations(supabase, patientId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(patientId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  const vaccinations = useMemo(() => query.data ?? [], [query.data]);

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (query.isError) {
    const err = query.error as unknown as ServiceError | undefined;
    return (
      <InlineError
        message={err?.message ?? 'No pudimos cargar las vacunas.'}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (vaccinations.length === 0) {
    return (
      <EmptyState
        icon={Syringe}
        title="Sin vacunas registradas"
        description="El historial de vacunación del paciente va a aparecer acá."
        size="compact"
        className="border-0 bg-transparent"
      />
    );
  }

  return (
    <div className="space-y-3">
      {vaccinations.map((vaccine) => (
        <VaccineCard key={vaccine.id} vaccine={vaccine} />
      ))}
    </div>
  );
}

function VaccineCard({ vaccine }: { vaccine: PatientVaccinationRow }) {
  const nextStatus = nextDoseStatus(vaccine.next_dose_date);
  return (
    <article className="rounded-lg border border-border/60 bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <Syringe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {vaccine.vaccine_name}
            </p>
            {vaccine.dose_number != null && (
              <p className="text-[11px] text-muted-foreground">
                Dosis {vaccine.dose_number}
              </p>
            )}
          </div>
        </div>
        {nextStatus && nextStatus.kind !== 'ok' && (
          <NextDoseBadge status={nextStatus} />
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
        {vaccine.administered_date && (
          <Field
            label="Administrada"
            value={formatDate(vaccine.administered_date)}
          />
        )}
        {vaccine.administered_by && (
          <Field label="Aplicada por" value={vaccine.administered_by} />
        )}
        {vaccine.location && (
          <Field label="Lugar" value={vaccine.location} />
        )}
        {vaccine.lot_number && (
          <Field label="Lote" value={vaccine.lot_number} />
        )}
        {vaccine.next_dose_date && (
          <Field
            label="Próxima dosis"
            value={formatDate(vaccine.next_dose_date)}
          />
        )}
      </dl>

      {vaccine.notes && (
        <p className="text-xs text-muted-foreground mt-2 italic">
          {vaccine.notes}
        </p>
      )}
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-muted-foreground/80">{label}:</dt>
      <dd className="text-foreground/90">{value}</dd>
    </div>
  );
}

function NextDoseBadge({ status }: { status: NextDoseStatus }) {
  if (status.kind === 'overdue') {
    const days = Math.abs(status.days);
    const copy =
      days === 0
        ? 'Vencida hoy'
        : days === 1
        ? 'Vencida hace 1 día'
        : `Vencida hace ${days} días`;
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
        {copy}
      </span>
    );
  }
  const copy =
    status.days === 0
      ? 'Próxima dosis hoy'
      : status.days === 1
      ? 'Próxima dosis mañana'
      : `Próxima dosis en ${status.days} días`;
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30">
      {copy}
    </span>
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
