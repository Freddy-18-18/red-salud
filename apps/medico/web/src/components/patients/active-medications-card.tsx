'use client';

/**
 * @file active-medications-card.tsx
 * @description Card listing the patient's currently active prescriptions
 * with derived expiration metadata (expiring soon, expired). Each row links
 * to the prescription detail page when available.
 *
 * The hook (`usePatientActiveRx`) already pre-computes `is_expiring_soon` /
 * `is_expired` / `days_until_expiration` server-side via the clinical
 * service, so this component only renders.
 */

import { useRouter } from 'next/navigation';
import { AlertCircle, Pill } from 'lucide-react';
import { EmptyState as DSEmptyState, Skeleton } from '@red-salud/design-system';

import { usePatientActiveRx } from '@/hooks/use-patient-active-rx';
import type {
  PatientActivePrescription,
  PatientPrescriptionMedication,
} from '@red-salud/types';

interface ActiveMedicationsCardProps {
  patientId: string;
}

function formatDate(iso: string): string {
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

export function ActiveMedicationsCard({ patientId }: ActiveMedicationsCardProps) {
  const router = useRouter();
  const { prescriptions, isLoading, error, refetch } = usePatientActiveRx({
    patientId,
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Medicación activa
          </h3>
        </div>
        {!isLoading && !error && prescriptions.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {prescriptions.length}{' '}
            {prescriptions.length === 1 ? 'receta' : 'recetas'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : error ? (
        <InlineError message={error.message} onRetry={() => void refetch()} />
      ) : prescriptions.length === 0 ? (
        <DSEmptyState
          icon={Pill}
          title="Sin medicación activa registrada"
          description="Las recetas activas del paciente van a aparecer acá."
          size="compact"
          className="border-0 bg-transparent"
        />
      ) : (
        <div className="space-y-2">
          {prescriptions.map((rx) => (
            <PrescriptionRow
              key={rx.id}
              rx={rx}
              onClick={() => {
                // TODO route: detalle de receta
                router.push(`/dashboard/recetas/${rx.id}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PrescriptionRow({
  rx,
  onClick,
}: {
  rx: PatientActivePrescription;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 p-3 border border-border/50 rounded-lg hover:bg-muted/40 transition-colors"
    >
      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <Pill className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-medium text-foreground truncate">
            {rx.diagnosis ?? 'Receta sin diagnóstico'}
          </p>
          <ExpirationBadge rx={rx} />
        </div>
        {rx.medications.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {rx.medications.slice(0, 3).map((med) => (
              <li key={med.id} className="truncate">
                <span className="font-medium text-foreground/90">
                  {med.medication_name}
                </span>
                {formatDoseLine(med) && (
                  <span className="text-muted-foreground">
                    {' · '}
                    {formatDoseLine(med)}
                  </span>
                )}
              </li>
            ))}
            {rx.medications.length > 3 && (
              <li className="text-muted-foreground/70">
                + {rx.medications.length - 3} medicamento(s) más
              </li>
            )}
          </ul>
        )}
        <p className="text-[11px] text-muted-foreground/70 mt-1.5">
          Prescrito el {formatDate(rx.prescribed_at)}
        </p>
      </div>
    </button>
  );
}

function formatDoseLine(med: PatientPrescriptionMedication): string {
  const parts: string[] = [];
  if (med.dosis) parts.push(med.dosis);
  if (med.frecuencia) parts.push(med.frecuencia);
  return parts.join(' · ');
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
      days === 0 ? 'Vence hoy' : days === 1 ? 'Vence mañana' : `Vence en ${days} días`;
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30">
        {copy}
      </span>
    );
  }
  return null;
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
