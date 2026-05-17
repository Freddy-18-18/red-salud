'use client';

/**
 * @file family-history-panel.tsx
 * @description Patient family medical history list (`patient_family_history`)
 * for the Familia tab. Each row surfaces the relative's relationship, the
 * recorded condition, the age at diagnosis (when known), the patient-reported
 * alive/deceased status, and any free-text notes from the doctor.
 *
 * No filtering or grouping yet — the table is short by design (typically <
 * 10 rows per patient). When that assumption breaks we group by relacion in
 * Phase 3.
 */

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Users } from 'lucide-react';
import { EmptyState, Skeleton } from '@red-salud/design-system';

import { supabase } from '@/lib/supabase/client';
import {
  listFamilyHistory,
  type ServiceError,
} from '@/lib/supabase/services/patient-clinical-service';
import type { PatientFamilyHistoryRow } from '@red-salud/types';

interface FamilyHistoryPanelProps {
  patientId: string;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function FamilyHistoryPanel({ patientId }: FamilyHistoryPanelProps) {
  const query = useQuery({
    queryKey: ['patients', 'family-history', patientId],
    queryFn: async () => {
      const result = await listFamilyHistory(supabase, patientId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(patientId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

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
        message={err?.message ?? 'No pudimos cargar la historia familiar.'}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const rows = query.data ?? [];
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sin historia familiar registrada"
        description="Los antecedentes familiares relevantes del paciente van a aparecer acá."
        size="compact"
        className="border-0 bg-transparent"
      />
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <FamilyRow key={row.id} row={row} />
      ))}
    </div>
  );
}

function FamilyRow({ row }: { row: PatientFamilyHistoryRow }) {
  return (
    <article className="rounded-lg border border-border/60 bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium text-foreground">
            {capitalize(row.relacion)}
          </p>
          <span className="text-muted-foreground/70">·</span>
          <p className="text-sm text-foreground">{row.condicion}</p>
        </div>
        <AliveBadge vivo={row.vivo} />
      </div>

      {row.edad_diagnostico != null && (
        <p className="text-xs text-muted-foreground">
          Diagnosticado a los {row.edad_diagnostico}{' '}
          {row.edad_diagnostico === 1 ? 'año' : 'años'}
        </p>
      )}

      {row.notas && (
        <p className="text-xs text-muted-foreground mt-2">{row.notas}</p>
      )}
    </article>
  );
}

function AliveBadge({ vivo }: { vivo: boolean | null }) {
  if (vivo == null) {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        Estado desconocido
      </span>
    );
  }
  if (vivo) {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
        Vivo
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
      Fallecido
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
