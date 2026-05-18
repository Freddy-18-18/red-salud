'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@red-salud/design-system';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  createSede,
  updateSede,
} from '@/lib/sedes/service';
import { upsertWeeklyScheduleForSede } from '@/lib/sedes/schedule-service';

import {
  EMPTY_WIZARD_DRAFT,
  type SedeWizardDraft,
  type SedeWizardInitialData,
} from '../sede-wizard-types';
import { SedeBasicsStep } from './sede-basics-step';
import { SedeLocationStep } from './sede-location-step';
import { SedeScheduleStep, validateSchedule } from './sede-schedule-step';

/**
 * @file sede-wizard.tsx
 * @description Multi-step wizard for creating or editing a sede.
 *
 * Steps:
 *   1. Datos básicos — name, phone, notes, primary toggle
 *   2. Ubicación — address, city/state/postal, MapPicker (lat/lng)
 *   3. Horarios — per-day toggles + time slots, persisted into
 *      `weekly_schedule_template` rows tagged with the new sede id
 *
 * The submit step performs two writes in sequence — first the sede row, then
 * its schedule rows. If the schedule write fails we report it to the doctor
 * but DO NOT roll back the sede: a sede without schedule is recoverable, a
 * partial transaction-shaped failure is not (without an RPC we'd be racing).
 */

interface SedeWizardProps {
  doctorId: string;
  /** Provide `null` to create a new sede, or an existing sede to edit it. */
  initial?: SedeWizardInitialData | null;
  /** Total active sedes the doctor already has — used to force-primary the first. */
  existingSedeCount: number;
  /** Where to navigate after successful submit. Defaults to `/dashboard/sedes`. */
  successHref?: string;
  /** Optional cancel handler. Defaults to navigating to `/dashboard/sedes`. */
  onCancel?: () => void;
}

const STEPS = [
  { id: 'basics', label: 'Datos básicos' },
  { id: 'location', label: 'Ubicación' },
  { id: 'schedule', label: 'Horarios' },
] as const;
type StepId = (typeof STEPS)[number]['id'];

function draftFromInitial(initial: SedeWizardInitialData | undefined | null): SedeWizardDraft {
  if (!initial) return EMPTY_WIZARD_DRAFT;
  const { sede, schedule } = initial;
  return {
    name: sede.name,
    phone: sede.phone ?? '',
    notes: sede.notes ?? '',
    isPrimary: sede.is_primary,
    address: sede.address ?? '',
    city: sede.city ?? '',
    state: sede.state ?? '',
    postalCode: sede.postal_code ?? '',
    arrivalInstructions: sede.arrival_instructions ?? '',
    coordinates:
      sede.latitude !== null && sede.longitude !== null
        ? { lat: sede.latitude, lng: sede.longitude }
        : null,
    schedule: schedule ?? EMPTY_WIZARD_DRAFT.schedule,
  };
}

export function SedeWizard({
  doctorId,
  initial,
  existingSedeCount,
  successHref = '/dashboard/sedes',
  onCancel,
}: SedeWizardProps): React.ReactElement {
  const router = useRouter();
  const [draft, setDraft] = useState<SedeWizardDraft>(() => draftFromInitial(initial));
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Re-hydrate when `initial` changes (e.g. parent fetches async).
  useEffect(() => {
    if (initial) setDraft(draftFromInitial(initial));
  }, [initial]);

  const isEditing = Boolean(initial?.sede);
  const isFirstSede = !isEditing && existingSedeCount === 0;
  const currentStep: StepId = STEPS[stepIdx].id;
  const isLast = stepIdx === STEPS.length - 1;

  function patch(p: Partial<SedeWizardDraft>) {
    setDraft((prev) => ({ ...prev, ...p }));
  }

  function validateCurrentStep(): string[] {
    if (currentStep === 'basics') {
      const errors: string[] = [];
      if (!draft.name.trim()) errors.push('El nombre de la sede es obligatorio.');
      return errors;
    }
    if (currentStep === 'location') {
      const errors: string[] = [];
      if (!draft.coordinates) {
        errors.push('Tocá el mapa o buscá una dirección para fijar la ubicación.');
      }
      return errors;
    }
    if (currentStep === 'schedule') {
      return validateSchedule(draft.schedule);
    }
    return [];
  }

  function handleNext() {
    const errors = validateCurrentStep();
    if (errors.length > 0) {
      errors.forEach((msg) => toast.error(msg));
      return;
    }
    if (!isLast) {
      setStepIdx((i) => i + 1);
    } else {
      void handleSubmit();
    }
  }

  function handleBack() {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        name: draft.name.trim(),
        phone: draft.phone.trim() || null,
        notes: draft.notes.trim() || null,
        address: draft.address.trim() || null,
        city: draft.city.trim() || null,
        state: draft.state.trim() || null,
        postal_code: draft.postalCode.trim() || null,
        latitude: draft.coordinates?.lat ?? null,
        longitude: draft.coordinates?.lng ?? null,
        arrival_instructions: draft.arrivalInstructions.trim() || null,
        // The first sede the doctor creates is forced-primary so the agenda
        // always has somewhere to attach to. Subsequent sedes honor the toggle.
        is_primary: isFirstSede ? true : draft.isPrimary,
      };

      let sedeId: string;
      if (isEditing && initial?.sede) {
        const updated = await updateSede(initial.sede.id, payload);
        sedeId = updated.id;
      } else {
        const created = await createSede(doctorId, payload);
        sedeId = created.id;
      }

      try {
        await upsertWeeklyScheduleForSede(doctorId, sedeId, draft.schedule);
      } catch (scheduleErr) {
        // The sede is saved — schedule failure is recoverable from the
        // /configuracion/horarios page, so we surface it but don't roll back.
        const message =
          scheduleErr instanceof Error
            ? scheduleErr.message
            : 'No se pudieron guardar los horarios.';
        toast.error(
          `La sede se guardó pero hubo un problema con los horarios: ${message}`,
        );
      }

      toast.success(
        isEditing
          ? `Sede "${payload.name}" actualizada`
          : `Sede "${payload.name}" creada`,
      );
      router.push(successHref);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al guardar la sede.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const stepProgress = useMemo(
    () =>
      STEPS.map((step, idx) => ({
        ...step,
        index: idx,
        state:
          idx < stepIdx ? ('done' as const)
            : idx === stepIdx ? ('current' as const)
            : ('upcoming' as const),
      })),
    [stepIdx],
  );

  return (
    <div className="space-y-6">
      <ol
        className="flex items-center gap-2 overflow-x-auto"
        aria-label="Pasos del asistente de sede"
      >
        {stepProgress.map((step, idx) => (
          <li key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              data-testid={`sede-wizard-step-${step.id}`}
              data-state={step.state}
              onClick={() => {
                // Allow jumping back to completed steps; forward only via Next.
                if (step.state === 'done') setStepIdx(step.index);
              }}
              disabled={step.state === 'upcoming'}
              className={[
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                step.state === 'current'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : step.state === 'done'
                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                    : 'border-border bg-muted/40 text-muted-foreground',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                  step.state === 'current'
                    ? 'bg-primary-foreground/20'
                    : step.state === 'done'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted',
                ].join(' ')}
                aria-hidden="true"
              >
                {step.state === 'done' ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              {step.label}
            </button>
            {idx < STEPS.length - 1 && (
              <span aria-hidden="true" className="h-px w-6 bg-border" />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-border bg-background p-6">
        {currentStep === 'basics' && (
          <SedeBasicsStep draft={draft} onPatch={patch} isFirstSede={isFirstSede} />
        )}
        {currentStep === 'location' && (
          <SedeLocationStep draft={draft} onPatch={patch} />
        )}
        {currentStep === 'schedule' && (
          <SedeScheduleStep draft={draft} onPatch={patch} />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onCancel) onCancel();
            else router.push(successHref);
          }}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={stepIdx === 0 || submitting}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Atrás
          </Button>
          <Button type="button" onClick={handleNext} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Guardando...
              </>
            ) : isLast ? (
              <>
                <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {isEditing ? 'Guardar cambios' : 'Crear sede'}
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
