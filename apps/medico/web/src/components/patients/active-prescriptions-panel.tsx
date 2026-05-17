'use client';

/**
 * @file active-prescriptions-panel.tsx
 * @description Full Recetas tab content: two sections — currently active
 * prescriptions (with medication detail expanded) and the recent history
 * (latest 50 rows that are NOT active or that are expired, compact display).
 *
 * The active section reuses `usePatientActiveRx` (already cached by other
 * surfaces). The historical section uses a thin direct-supabase query so we
 * don't pollute the service layer with a one-off query — same approach taken
 * by `visit-timeline.tsx`.
 */

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Pill } from 'lucide-react';
import { EmptyState, Skeleton } from '@red-salud/design-system';

import { usePatientActiveRx } from '@/hooks/use-patient-active-rx';
import { supabase } from '@/lib/supabase/client';
import type {
  PatientActivePrescription,
  PatientPrescriptionMedication,
} from '@red-salud/types';

interface ActivePrescriptionsPanelProps {
  patientId: string;
}

interface HistoricalPrescriptionRow {
  id: string;
  prescribed_at: string;
  expires_at: string | null;
  diagnosis: string | null;
  status: string;
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

function formatDoseLine(med: PatientPrescriptionMedication): string {
  const parts: string[] = [];
  if (med.dosis) parts.push(med.dosis);
  if (med.frecuencia) parts.push(med.frecuencia);
  if (med.via_administracion) parts.push(med.via_administracion);
  if (med.duration_days != null) parts.push(`${med.duration_days} días`);
  return parts.join(' · ');
}

export function ActivePrescriptionsPanel({
  patientId,
}: ActivePrescriptionsPanelProps) {
  const activeQuery = usePatientActiveRx({ patientId });

  // Historical = anything NOT currently active OR already expired. We pull
  // up to 50 most recent rows so the doctor can scroll back several months
  // without paging UI (Phase 3 if real demand emerges).
  const historyQuery = useQuery<HistoricalPrescriptionRow[]>({
    queryKey: ['patients', 'rx-history', patientId],
    queryFn: async () => {
      const builder = supabase.from('prescriptions') as unknown as {
        select: (cols: string) => unknown;
      };
      const selectChain = builder.select(
        'id, prescribed_at, expires_at, diagnosis, status',
      ) as unknown as {
        eq: (col: string, val: string) => unknown;
      };
      const eqPatient = selectChain.eq('patient_id', patientId) as unknown as {
        neq: (col: string, val: string) => unknown;
      };
      const neqActive = eqPatient.neq('status', 'activa') as unknown as {
        is: (col: string, val: null) => unknown;
      };
      const isChain = neqActive.is('deleted_at', null) as unknown as {
        order: (col: string, opt: { ascending: boolean }) => unknown;
      };
      const ordered = isChain.order('prescribed_at', {
        ascending: false,
      }) as unknown as {
        limit: (n: number) => Promise<{
          data: HistoricalPrescriptionRow[] | null;
          error: { message: string } | null;
        }>;
      };
      const result = await ordered.limit(50);
      if (result.error) {
        throw new Error(
          result.error.message ||
            'No pudimos cargar el histórico de recetas. Reintentá.',
        );
      }
      return result.data ?? [];
    },
    enabled: Boolean(patientId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  return (
    <div className="space-y-6">
      <Section
        title="Recetas activas"
        count={activeQuery.prescriptions.length}
        loading={activeQuery.isLoading}
        error={activeQuery.error?.message ?? null}
        onRetry={() => void activeQuery.refetch()}
        empty={
          <EmptyState
            icon={Pill}
            title="Sin recetas activas"
            description="Las recetas vigentes del paciente van a aparecer acá."
            size="compact"
            className="border-0 bg-transparent"
          />
        }
        isEmpty={activeQuery.prescriptions.length === 0}
      >
        <div className="space-y-3">
          {activeQuery.prescriptions.map((rx) => (
            <ActiveRxCard key={rx.id} rx={rx} />
          ))}
        </div>
      </Section>

      <Section
        title="Histórico"
        count={historyQuery.data?.length ?? 0}
        loading={historyQuery.isLoading}
        error={
          historyQuery.isError
            ? (historyQuery.error as Error | undefined)?.message ??
              'No pudimos cargar el histórico.'
            : null
        }
        onRetry={() => void historyQuery.refetch()}
        empty={
          <EmptyState
            icon={Pill}
            title="Sin recetas históricas"
            description="Las recetas finalizadas o anuladas van a aparecer acá."
            size="compact"
            className="border-0 bg-transparent"
          />
        }
        isEmpty={(historyQuery.data?.length ?? 0) === 0}
      >
        <div className="space-y-2">
          {(historyQuery.data ?? []).map((row) => (
            <HistoryRxRow key={row.id} row={row} />
          ))}
        </div>
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  count: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  isEmpty: boolean;
  empty: React.ReactNode;
  children: React.ReactNode;
}

function Section({
  title,
  count,
  loading,
  error,
  onRetry,
  isEmpty,
  empty,
  children,
}: SectionProps) {
  return (
    <section className="bg-card rounded-xl border border-border p-5 space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {!loading && !error && count > 0 && (
          <span className="text-xs text-muted-foreground">
            {count} {count === 1 ? 'receta' : 'recetas'}
          </span>
        )}
      </header>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : error ? (
        <InlineError message={error} onRetry={onRetry} />
      ) : isEmpty ? (
        empty
      ) : (
        children
      )}
    </section>
  );
}

function ActiveRxCard({ rx }: { rx: PatientActivePrescription }) {
  return (
    <article className="rounded-lg border border-border/60 bg-card p-3">
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <p className="text-sm font-medium text-foreground">
          {rx.diagnosis ?? 'Receta sin diagnóstico'}
        </p>
        <ExpirationBadge rx={rx} />
      </div>
      <p className="text-[11px] text-muted-foreground/80">
        Prescrita el {formatDate(rx.prescribed_at)}
        {rx.expires_at && <> · vence el {formatDate(rx.expires_at)}</>}
      </p>

      {rx.general_instructions && (
        <p className="text-xs text-muted-foreground mt-2">
          {rx.general_instructions}
        </p>
      )}

      {rx.medications.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {rx.medications.map((med) => (
            <li
              key={med.id}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <Pill className="h-3.5 w-3.5 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-foreground/90 font-medium">
                  {med.medication_name}
                </p>
                {formatDoseLine(med) && (
                  <p className="text-muted-foreground">
                    {formatDoseLine(med)}
                  </p>
                )}
                {med.special_instructions && (
                  <p className="text-muted-foreground/70 mt-0.5">
                    {med.special_instructions}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function ExpirationBadge({ rx }: { rx: PatientActivePrescription }) {
  if (rx.is_expired) {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
        Vencida
      </span>
    );
  }
  if (rx.is_expiring_soon && rx.days_until_expiration != null) {
    const days = rx.days_until_expiration;
    const copy =
      days === 0
        ? 'Vence hoy'
        : days === 1
        ? 'Vence mañana'
        : `Vence en ${days} días`;
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30">
        {copy}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
      Activa
    </span>
  );
}

function HistoryRxRow({ row }: { row: HistoricalPrescriptionRow }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-card">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <Pill className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {row.diagnosis ?? 'Receta sin diagnóstico'}
        </p>
        <p className="text-[11px] text-muted-foreground/80">
          Prescrita el {formatDate(row.prescribed_at)}
          {row.expires_at && <> · venció el {formatDate(row.expires_at)}</>}
        </p>
      </div>
      <StatusChip status={row.status} />
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completada: 'bg-success/10 text-success',
    cancelada: 'bg-destructive/10 text-destructive',
    expirada: 'bg-muted text-muted-foreground',
    suspendida: 'bg-warning/10 text-warning',
  };
  const labels: Record<string, string> = {
    completada: 'Completada',
    cancelada: 'Cancelada',
    expirada: 'Expirada',
    suspendida: 'Suspendida',
  };
  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
        styles[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {labels[status] ?? status}
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
