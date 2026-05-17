'use client';

/**
 * @file edit-clinical-fields-dialog.tsx
 * @description Inline edit dialog for the always-visible clinical fields:
 *  - Blood type (Select with the BloodType enum + "No especificado")
 *  - Weight (kg), height (cm)
 *  - Allergies, chronic conditions, current medications (tag inputs)
 *  - Doctor notes (textarea)
 *
 * Persists via `usePatientEditClinical()` which UPSERTS `patient_details`
 * and invalidates the overview + detail queries. The dialog owns:
 *  - Local form state (controlled inputs)
 *  - Client-side range validation for weight/height
 *  - Saving spinner + inline error
 *  - Success toast (sonner) + close
 *
 * Why a single dialog instead of separate per-field dialogs: doctors edit
 * these fields in batches (intake, follow-up). Round-trips are minimized by
 * sending one UPSERT with all dirty values at once.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  Plus,
  Save,
  X as XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@red-salud/design-system';

import { usePatientEditClinical } from '@/hooks/use-patient-edit-clinical';
import {
  CHRONIC_TAGS,
  softMatchTag,
  type ChronicTag,
} from '@/lib/chronic/canonical-tags';

interface EditClinicalFieldsDialogProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Initial values to pre-fill the form (typically from the overview hook). */
  initial?: {
    grupo_sanguineo?: string | null;
    alergias?: string[];
    enfermedades_cronicas?: string[];
    medicamentos_actuales?: string[];
    peso_kg?: number | null;
    altura_cm?: number | null;
    notas_medicas?: string | null;
  } | null;
}

const BLOOD_TYPE_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;

/**
 * Sentinel for the "no specified" Select option. Radix Select forbids empty
 * strings as values, so we round-trip through a sentinel and convert back to
 * `null` on submit.
 */
const NO_BLOOD_TYPE = '__none__';

interface FormState {
  grupo_sanguineo: string;
  alergias: string[];
  enfermedades_cronicas: string[];
  medicamentos_actuales: string[];
  peso_kg: string;
  altura_cm: string;
  notas_medicas: string;
}

function buildInitialState(
  initial: EditClinicalFieldsDialogProps['initial'],
): FormState {
  return {
    grupo_sanguineo: initial?.grupo_sanguineo ?? NO_BLOOD_TYPE,
    alergias: initial?.alergias ?? [],
    enfermedades_cronicas: initial?.enfermedades_cronicas ?? [],
    medicamentos_actuales: initial?.medicamentos_actuales ?? [],
    peso_kg:
      initial?.peso_kg != null && Number.isFinite(initial.peso_kg)
        ? String(initial.peso_kg)
        : '',
    altura_cm:
      initial?.altura_cm != null && Number.isFinite(initial.altura_cm)
        ? String(initial.altura_cm)
        : '',
    notas_medicas: initial?.notas_medicas ?? '',
  };
}

export function EditClinicalFieldsDialog({
  patientId,
  open,
  onOpenChange,
  initial,
}: EditClinicalFieldsDialogProps) {
  const { mutateAsync, isPending, error, reset } = usePatientEditClinical();

  const [form, setForm] = useState<FormState>(() => buildInitialState(initial));
  const [validation, setValidation] = useState<string | null>(null);

  // Re-seed the form each time the dialog opens so stale state from a
  // previous session never leaks into a fresh edit.
  useEffect(() => {
    if (open) {
      setForm(buildInitialState(initial));
      setValidation(null);
      reset();
    }
  }, [open, initial, reset]);

  function validate(): string | null {
    const peso = form.peso_kg.trim() === '' ? null : Number(form.peso_kg);
    const altura = form.altura_cm.trim() === '' ? null : Number(form.altura_cm);
    if (peso != null && (!Number.isFinite(peso) || peso <= 0 || peso >= 500)) {
      return 'El peso tiene que estar entre 0 y 500 kg.';
    }
    if (
      altura != null &&
      (!Number.isFinite(altura) || altura <= 0 || altura >= 300)
    ) {
      return 'La altura tiene que estar entre 0 y 300 cm.';
    }
    return null;
  }

  async function handleSubmit() {
    const validationMessage = validate();
    if (validationMessage) {
      setValidation(validationMessage);
      return;
    }
    setValidation(null);

    const peso = form.peso_kg.trim() === '' ? null : Number(form.peso_kg);
    const altura = form.altura_cm.trim() === '' ? null : Number(form.altura_cm);
    const notas = form.notas_medicas.trim() === '' ? null : form.notas_medicas;
    const grupo =
      form.grupo_sanguineo === NO_BLOOD_TYPE ? null : form.grupo_sanguineo;

    try {
      await mutateAsync({
        patient_id: patientId,
        grupo_sanguineo: grupo,
        alergias: form.alergias,
        enfermedades_cronicas: form.enfermedades_cronicas,
        medicamentos_actuales: form.medicamentos_actuales,
        peso_kg: peso,
        altura_cm: altura,
        notas_medicas: notas,
      });
      toast.success('Información clínica actualizada');
      onOpenChange(false);
    } catch {
      // The hook already exposes `error`; the inline message renders it.
      // We swallow here so the dialog stays open for the user to retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar información clínica</DialogTitle>
          <DialogDescription>
            Esta información se mantiene siempre visible en el banner clínico
            del paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Blood type + weight + height */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="grupo-sanguineo">Grupo sanguíneo</Label>
              <Select
                value={form.grupo_sanguineo}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, grupo_sanguineo: value }))
                }
                disabled={isPending}
              >
                <SelectTrigger id="grupo-sanguineo" className="w-full">
                  <SelectValue placeholder="No especificado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_BLOOD_TYPE}>No especificado</SelectItem>
                  {BLOOD_TYPE_OPTIONS.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="peso-kg">Peso (kg)</Label>
              <Input
                id="peso-kg"
                type="number"
                inputMode="decimal"
                step={0.1}
                min={0}
                placeholder="Ej. 72.5"
                value={form.peso_kg}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, peso_kg: e.target.value }))
                }
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="altura-cm">Altura (cm)</Label>
              <Input
                id="altura-cm"
                type="number"
                inputMode="numeric"
                step={1}
                min={0}
                placeholder="Ej. 170"
                value={form.altura_cm}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, altura_cm: e.target.value }))
                }
                disabled={isPending}
              />
            </div>
          </div>

          <TagsField
            id="alergias"
            label="Alergias"
            placeholder="Ej. penicilina, mariscos"
            helperText="Presioná Enter o el botón para agregar cada alergia."
            values={form.alergias}
            disabled={isPending}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, alergias: next }))
            }
          />

          <TagsField
            id="condiciones"
            label="Condiciones crónicas"
            placeholder="Ej. HTA, DM2"
            helperText="Sugerencias: HTA, DM2, DISLIPIDEMIA, OBESIDAD."
            values={form.enfermedades_cronicas}
            suggestions={[...CHRONIC_TAGS]}
            normalize={(raw) => softMatchTag(raw) ?? raw.trim().toUpperCase()}
            disabled={isPending}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, enfermedades_cronicas: next }))
            }
          />

          <TagsField
            id="medicamentos"
            label="Medicamentos actuales"
            placeholder="Ej. Losartán 50mg"
            helperText="Anotá los medicamentos que el paciente está tomando."
            values={form.medicamentos_actuales}
            disabled={isPending}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, medicamentos_actuales: next }))
            }
          />

          <div>
            <Label htmlFor="notas-medicas">Notas médicas</Label>
            <Textarea
              id="notas-medicas"
              rows={4}
              placeholder="Información adicional sobre el paciente"
              value={form.notas_medicas}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notas_medicas: e.target.value }))
              }
              disabled={isPending}
            />
          </div>

          {(validation || error) && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                {validation ?? error?.message}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// TagsField — inline tag input. Lives here because it's not generic enough
// yet to belong in the design-system; if a second consumer surfaces, lift it.
// ---------------------------------------------------------------------------

interface TagsFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  values: string[];
  /** Optional autocomplete hints rendered as quick-add chips. */
  suggestions?: string[];
  /**
   * Optional normalizer applied before adding a tag. Used to fold chronic
   * condition free text into canonical slugs (e.g. "Hipertensión" → "HTA").
   */
  normalize?: (raw: string) => string;
  disabled?: boolean;
  onChange: (next: string[]) => void;
}

function TagsField({
  id,
  label,
  placeholder,
  helperText,
  values,
  suggestions,
  normalize,
  disabled,
  onChange,
}: TagsFieldProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const normalized = normalize ? normalize(trimmed) : trimmed;
    if (!normalized) return;
    // Case-insensitive de-dupe so "HTA" and "hta" don't both stick.
    const exists = values.some(
      (v) => v.toLowerCase() === normalized.toLowerCase(),
    );
    if (exists) {
      setDraft('');
      return;
    }
    onChange([...values, normalized]);
    setDraft('');
  }

  function removeTag(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      // Quick-remove the last chip when the input is empty.
      onChange(values.slice(0, -1));
    }
  }

  const availableSuggestions = useMemo(() => {
    if (!suggestions) return [];
    const used = new Set(values.map((v) => v.toLowerCase()));
    return suggestions.filter((s) => !used.has(s.toLowerCase()));
  }, [suggestions, values]);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                aria-label={`Quitar ${tag}`}
                className="text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:text-destructive disabled:opacity-50 disabled:pointer-events-none"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          id={id}
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTag(draft)}
          disabled={disabled || draft.trim() === ''}
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              disabled={disabled}
              className="text-[11px] px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-muted-foreground/70 mt-1">{helperText}</p>
      )}
    </div>
  );
}
