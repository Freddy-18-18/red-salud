'use client';

/**
 * @file visit-timeline.tsx
 * @description Timeline of consultations (`medical_records`) for a patient,
 * grouped by month. Used inside the Consultas tab of patient-detail.
 *
 * Why a thin direct-supabase query and not a new service function:
 * The patient-clinical-service already covers the heavy clinical reads. A
 * single SELECT against `medical_records` does not warrant another service
 * surface for now; if a second consumer appears, lift it.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, FileText, Stethoscope } from 'lucide-react';
import { EmptyState, Skeleton } from '@red-salud/design-system';

import { supabase } from '@/lib/supabase/client';

interface VisitTimelineProps {
  patientId: string;
}

interface MedicalRecordRow {
  id: string;
  created_at: string;
  diagnosis: string | null;
  observations: string | null;
}

interface MonthGroup {
  key: string;
  label: string;
  rows: MedicalRecordRow[];
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMonthLabel(iso: string): { key: string; label: string } {
  const parsed = new Date(iso);
  const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
  const formatter = new Intl.DateTimeFormat('es-VE', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Caracas',
  });
  return { key, label: capitalize(formatter.format(parsed)) };
}

function formatDayTime(iso: string): { day: string; time: string } {
  const parsed = new Date(iso);
  const day = parsed.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Caracas',
  });
  const time = parsed.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Caracas',
  });
  return { day, time };
}

export function VisitTimeline({ patientId }: VisitTimelineProps) {
  const query = useQuery<MedicalRecordRow[]>({
    queryKey: ['patients', 'medical-records', patientId],
    queryFn: async () => {
      const builder = supabase.from('medical_records') as unknown as {
        select: (cols: string) => unknown;
      };
      const selectChain = builder.select(
        'id, created_at, diagnosis, observations',
      ) as unknown as {
        eq: (col: string, val: string) => unknown;
      };
      const eqChain = selectChain.eq('patient_id', patientId) as unknown as {
        is: (col: string, val: null) => unknown;
      };
      const isChain = eqChain.is('deleted_at', null) as unknown as {
        order: (col: string, opt: { ascending: boolean }) => Promise<{
          data: MedicalRecordRow[] | null;
          error: { message: string } | null;
        }>;
      };
      const result = await isChain.order('created_at', { ascending: false });
      if (result.error) {
        throw new Error(
          result.error.message ||
            'No pudimos cargar las consultas. Reintentá en unos segundos.',
        );
      }
      return result.data ?? [];
    },
    enabled: Boolean(patientId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const groups = useMemo<MonthGroup[]>(() => {
    const rows = query.data ?? [];
    const map = new Map<string, MonthGroup>();
    for (const row of rows) {
      const { key, label } = formatMonthLabel(row.created_at);
      const existing = map.get(key);
      if (existing) {
        existing.rows.push(row);
      } else {
        map.set(key, { key, label, rows: [row] });
      }
    }
    return Array.from(map.values());
  }, [query.data]);

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <InlineError
        message={
          (query.error as Error | undefined)?.message ??
          'No pudimos cargar las consultas.'
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="Sin consultas registradas aún para este paciente"
        description="Cuando registres una consulta, vas a verla acá."
        size="compact"
        className="border-0 bg-transparent"
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h4>
          <div className="space-y-2 border-l-2 border-border/60 pl-4">
            {group.rows.map((row) => (
              <VisitRow key={row.id} row={row} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function VisitRow({ row }: { row: MedicalRecordRow }) {
  const { day, time } = formatDayTime(row.created_at);
  return (
    <article className="rounded-lg border border-border/50 bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mb-1.5">
        <Clock className="h-3 w-3" />
        <span>{day}</span>
        <span aria-hidden="true">·</span>
        <span>{time}</span>
        <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-info/10 text-info text-[10px] font-medium">
          <FileText className="h-3 w-3" />
          Consulta
        </span>
      </div>
      {row.diagnosis && (
        <p className="text-sm font-medium text-foreground">{row.diagnosis}</p>
      )}
      {row.observations && (
        <p className="text-sm text-muted-foreground mt-1">{row.observations}</p>
      )}
      {!row.diagnosis && !row.observations && (
        <p className="text-sm text-muted-foreground italic">
          Consulta sin diagnóstico ni observaciones registradas.
        </p>
      )}
    </article>
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
