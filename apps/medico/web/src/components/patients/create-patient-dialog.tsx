'use client';

/**
 * @file create-patient-dialog.tsx
 * @description Two-step "Crear paciente" dialog (T-3-04 + T-3-05 UI surface).
 *
 * Step 1 — choose the creation flow:
 *   - Offline  → `useCreateOfflinePatient` (no email captured; server generates
 *                placeholder); the patient can claim the profile later via cedula.
 *   - Invited  → `useCreateInvitedPatient` (email required; server returns a
 *                URL-safe `invite_token` rendered as a copyable link).
 *
 * Step 2 — single form covering demographics + optional clinical seed data.
 *   - Email field is conditionally required only for the invited flow.
 *   - Clinical section is collapsible (closed by default) to keep the visual
 *     weight low when the doctor only needs to capture name+cedula.
 *
 * Post-success affordances:
 *   - Offline → toast + close + bubble `onCreated({ patient_id })`.
 *   - Invited → mini success screen with the share link + "Copiar enlace"; the
 *     parent receives `onCreated({ patient_id, invite_token })` after the
 *     doctor clicks "Cerrar".
 *
 * Hooks own no UX side-effects (per the hook-purity rule in
 * `use-create-offline-patient.ts`); this component owns toasts, navigation
 * payload, and the success affordance.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Loader2,
  Mail,
  Plus,
  UserPlus,
  UserX,
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

import { useCreateOfflinePatient } from '@/hooks/use-create-offline-patient';
import { useCreateInvitedPatient } from '@/hooks/use-create-invited-patient';
import {
  CHRONIC_TAGS,
  softMatchTag,
} from '@/lib/chronic/canonical-tags';
import type {
  InvitedPatientCreateInput,
  OfflinePatientCreateInput,
} from '@red-salud/types';

export interface CreatePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful create. invite_token is only present for invited mode. */
  onCreated?: (result: { patient_id: string; invite_token?: string }) => void;
}

type Mode = 'offline' | 'invited';

const NO_BLOOD_TYPE = '__none__';
const NO_GENDER = '__none__';
const NO_NATIONALITY = '__none__';

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

const GENDER_OPTIONS = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
  { value: 'O', label: 'Otro' },
  { value: 'N', label: 'Prefiero no decir' },
] as const;

const NATIONALITY_OPTIONS = [
  { value: 'V', label: 'V — Venezolano/a' },
  { value: 'E', label: 'E — Extranjero/a' },
] as const;

interface FormState {
  email: string;
  full_name: string;
  national_id: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  city: string;
  state: string;
  grupo_sanguineo: string;
  peso_kg: string;
  altura_cm: string;
  alergias: string[];
  enfermedades_cronicas: string[];
  medicamentos_actuales: string[];
  notas_medicas: string;
}

const EMPTY_FORM: FormState = {
  email: '',
  full_name: '',
  national_id: '',
  phone: '',
  date_of_birth: '',
  gender: NO_GENDER,
  nationality: NO_NATIONALITY,
  city: '',
  state: '',
  grupo_sanguineo: NO_BLOOD_TYPE,
  peso_kg: '',
  altura_cm: '',
  alergias: [],
  enfermedades_cronicas: [],
  medicamentos_actuales: [],
  notas_medicas: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildPayload(
  form: FormState,
): OfflinePatientCreateInput {
  const peso = form.peso_kg.trim() === '' ? null : Number(form.peso_kg);
  const altura = form.altura_cm.trim() === '' ? null : Number(form.altura_cm);
  const notas =
    form.notas_medicas.trim() === '' ? null : form.notas_medicas.trim();
  const grupo =
    form.grupo_sanguineo === NO_BLOOD_TYPE ? null : form.grupo_sanguineo;
  const gender = form.gender === NO_GENDER ? null : form.gender;
  const nationality =
    form.nationality === NO_NATIONALITY ? null : form.nationality;

  return {
    full_name: form.full_name.trim(),
    national_id: form.national_id.trim() === '' ? null : form.national_id.trim(),
    phone: form.phone.trim() === '' ? null : form.phone.trim(),
    date_of_birth:
      form.date_of_birth.trim() === '' ? null : form.date_of_birth,
    gender,
    city: form.city.trim() === '' ? null : form.city.trim(),
    state: form.state.trim() === '' ? null : form.state.trim(),
    nationality,
    grupo_sanguineo: grupo,
    alergias: form.alergias,
    enfermedades_cronicas: form.enfermedades_cronicas,
    medicamentos_actuales: form.medicamentos_actuales,
    peso_kg: peso != null && Number.isFinite(peso) ? peso : null,
    altura_cm: altura != null && Number.isFinite(altura) ? altura : null,
    notas_medicas: notas,
  };
}

export function CreatePatientDialog({
  open,
  onOpenChange,
  onCreated,
}: CreatePatientDialogProps) {
  const offline = useCreateOfflinePatient();
  const invited = useCreateInvitedPatient();

  const [step, setStep] = useState<'select' | 'form' | 'invite-success'>(
    'select',
  );
  const [mode, setMode] = useState<Mode>('offline');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [clinicalOpen, setClinicalOpen] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);

  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
  const [createdInviteToken, setCreatedInviteToken] = useState<string | null>(
    null,
  );

  const isPending = offline.isPending || invited.isPending;
  const activeError = mode === 'offline' ? offline.error : invited.error;

  useEffect(() => {
    if (open) {
      setStep('select');
      setMode('offline');
      setForm(EMPTY_FORM);
      setClinicalOpen(false);
      setValidation(null);
      setCreatedPatientId(null);
      setCreatedInviteToken(null);
      offline.reset();
      invited.reset();
    }
  }, [open, offline, invited]);

  function validate(): string | null {
    if (form.full_name.trim().length < 2) {
      return 'Ingresá el nombre completo del paciente.';
    }
    if (mode === 'invited') {
      const email = form.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        return 'Necesitamos un email válido para enviar la invitación.';
      }
    }
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
    const v = validate();
    if (v) {
      setValidation(v);
      return;
    }
    setValidation(null);

    const payload = buildPayload(form);

    try {
      if (mode === 'offline') {
        const result = await offline.mutateAsync(payload);
        toast.success('Paciente creado correctamente');
        onOpenChange(false);
        onCreated?.({ patient_id: result.patient_id });
      } else {
        const invitedPayload: InvitedPatientCreateInput = {
          ...payload,
          email: form.email.trim().toLowerCase(),
        };
        const result = await invited.mutateAsync(invitedPayload);
        setCreatedPatientId(result.patient_id);
        setCreatedInviteToken(result.invite_token);
        setStep('invite-success');
      }
    } catch {
      // Hook surfaces error inline; keep dialog open for retry.
    }
  }

  function handleCloseInviteSuccess() {
    const patientId = createdPatientId;
    const token = createdInviteToken ?? undefined;
    onOpenChange(false);
    if (patientId) {
      onCreated?.({ patient_id: patientId, invite_token: token });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'select' && (
          <SelectStep
            onPick={(next) => {
              setMode(next);
              setStep('form');
            }}
          />
        )}

        {step === 'form' && (
          <FormStep
            mode={mode}
            form={form}
            setForm={setForm}
            clinicalOpen={clinicalOpen}
            setClinicalOpen={setClinicalOpen}
            isPending={isPending}
            validation={validation}
            errorMessage={activeError?.message ?? null}
            onBack={() => setStep('select')}
            onSubmit={handleSubmit}
          />
        )}

        {step === 'invite-success' && createdInviteToken && (
          <InviteSuccessStep
            inviteToken={createdInviteToken}
            onClose={handleCloseInviteSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — choose between offline and invited modes.
// ---------------------------------------------------------------------------

interface SelectStepProps {
  onPick: (mode: Mode) => void;
}

function SelectStep({ onPick }: SelectStepProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Nuevo paciente</DialogTitle>
        <DialogDescription>
          ¿Tenés el email del paciente? Elegí cómo querés crear el perfil.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        <button
          type="button"
          onClick={() => onPick('offline')}
          className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-muted p-2">
              <UserX className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Sin email (offline)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Creás el perfil con cédula y nombre. El paciente puede registrarse
            después con su cédula y queda vinculado automáticamente.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onPick('invited')}
          className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Con email (invitar)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generamos un enlace de invitación que podés compartirle. Cuando se
            registre, su perfil queda vinculado automáticamente.
          </p>
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — single form for both modes; email field flips visibility.
// ---------------------------------------------------------------------------

interface FormStepProps {
  mode: Mode;
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
  clinicalOpen: boolean;
  setClinicalOpen: (open: boolean) => void;
  isPending: boolean;
  validation: string | null;
  errorMessage: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

function FormStep({
  mode,
  form,
  setForm,
  clinicalOpen,
  setClinicalOpen,
  isPending,
  validation,
  errorMessage,
  onBack,
  onSubmit,
}: FormStepProps) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isPending}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DialogTitle>
            {mode === 'offline'
              ? 'Crear paciente sin email'
              : 'Invitar paciente por email'}
          </DialogTitle>
        </div>
        <DialogDescription>
          {mode === 'offline'
            ? 'Completá los datos básicos. Podés agregar información clínica ahora o más tarde.'
            : 'Vas a generar un enlace de invitación al final. El paciente lo usa para registrarse.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 mt-2">
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Datos personales
          </h4>

          {mode === 'invited' && (
            <div>
              <Label htmlFor="patient-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patient-email"
                type="email"
                required
                placeholder="paciente@ejemplo.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                disabled={isPending}
              />
            </div>
          )}

          <div>
            <Label htmlFor="patient-full-name">
              Nombre completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="patient-full-name"
              required
              placeholder="Ej. María Fernanda González"
              value={form.full_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, full_name: e.target.value }))
              }
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="patient-national-id">Cédula</Label>
              <Input
                id="patient-national-id"
                placeholder="V-12345678"
                value={form.national_id}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, national_id: e.target.value }))
                }
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="patient-phone">Teléfono</Label>
              <Input
                id="patient-phone"
                type="tel"
                inputMode="tel"
                placeholder="+58 412-1234567"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="patient-dob">Fecha de nacimiento</Label>
              <Input
                id="patient-dob"
                type="date"
                value={form.date_of_birth}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    date_of_birth: e.target.value,
                  }))
                }
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="patient-gender">Género</Label>
              <Select
                value={form.gender}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, gender: value }))
                }
                disabled={isPending}
              >
                <SelectTrigger id="patient-gender" className="w-full">
                  <SelectValue placeholder="No especificado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GENDER}>No especificado</SelectItem>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="patient-nationality">Nacionalidad</Label>
              <Select
                value={form.nationality}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, nationality: value }))
                }
                disabled={isPending}
              >
                <SelectTrigger id="patient-nationality" className="w-full">
                  <SelectValue placeholder="No especificada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_NATIONALITY}>
                    No especificada
                  </SelectItem>
                  {NATIONALITY_OPTIONS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="patient-city">Ciudad</Label>
              <Input
                id="patient-city"
                placeholder="Caracas"
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="patient-state">Estado</Label>
              <Input
                id="patient-state"
                placeholder="Distrito Capital"
                value={form.state}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, state: e.target.value }))
                }
                disabled={isPending}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-muted/30">
          <button
            type="button"
            onClick={() => setClinicalOpen(!clinicalOpen)}
            disabled={isPending}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                Datos clínicos iniciales
              </p>
              <p className="text-xs text-muted-foreground">
                Opcional. Podés capturarlos ahora o desde el detalle del
                paciente.
              </p>
            </div>
            {clinicalOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {clinicalOpen && (
            <div className="px-4 pb-4 space-y-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div>
                  <Label htmlFor="patient-blood">Grupo sanguíneo</Label>
                  <Select
                    value={form.grupo_sanguineo}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        grupo_sanguineo: value,
                      }))
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger id="patient-blood" className="w-full">
                      <SelectValue placeholder="No especificado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_BLOOD_TYPE}>
                        No especificado
                      </SelectItem>
                      {BLOOD_TYPE_OPTIONS.map((bt) => (
                        <SelectItem key={bt} value={bt}>
                          {bt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="patient-weight">Peso (kg)</Label>
                  <Input
                    id="patient-weight"
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
                  <Label htmlFor="patient-height">Altura (cm)</Label>
                  <Input
                    id="patient-height"
                    type="number"
                    inputMode="numeric"
                    step={1}
                    min={0}
                    placeholder="Ej. 170"
                    value={form.altura_cm}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        altura_cm: e.target.value,
                      }))
                    }
                    disabled={isPending}
                  />
                </div>
              </div>

              <TagsField
                id="create-alergias"
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
                id="create-cronicas"
                label="Condiciones crónicas"
                placeholder="Ej. HTA, DM2"
                helperText="Sugerencias: HTA, DM2, DISLIPIDEMIA, OBESIDAD."
                values={form.enfermedades_cronicas}
                suggestions={[...CHRONIC_TAGS]}
                normalize={(raw) => softMatchTag(raw) ?? raw.trim().toUpperCase()}
                disabled={isPending}
                onChange={(next) =>
                  setForm((prev) => ({
                    ...prev,
                    enfermedades_cronicas: next,
                  }))
                }
              />

              <TagsField
                id="create-medicamentos"
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
                <Label htmlFor="create-notas">Notas médicas</Label>
                <Textarea
                  id="create-notas"
                  rows={3}
                  placeholder="Información adicional sobre el paciente"
                  value={form.notas_medicas}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      notas_medicas: e.target.value,
                    }))
                  }
                  disabled={isPending}
                />
              </div>
            </div>
          )}
        </section>

        {(validation || errorMessage) && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              {validation ?? errorMessage}
            </p>
          </div>
        )}
      </div>

      <DialogFooter className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isPending}
        >
          Volver
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              {mode === 'offline' ? 'Crear paciente' : 'Crear y generar enlace'}
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — invite success surface (only for invited mode).
// ---------------------------------------------------------------------------

interface InviteSuccessStepProps {
  inviteToken: string;
  onClose: () => void;
}

function InviteSuccessStep({ inviteToken, onClose }: InviteSuccessStepProps) {
  const inviteUrl = `https://red-salud.app/registro?invite=${inviteToken}`;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No pudimos copiar. Seleccioná el texto y copialo manualmente.');
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Paciente creado e invitación lista</DialogTitle>
        <DialogDescription>
          Compartile este enlace al paciente para que complete su registro. El
          perfil queda vinculado automáticamente cuando se loguee.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-2 space-y-3">
        <div>
          <Label htmlFor="invite-url">Enlace de invitación</Label>
          <div className="flex gap-2">
            <Input
              id="invite-url"
              readOnly
              value={inviteUrl}
              className="font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              aria-label="Copiar enlace de invitación"
            >
              <ClipboardCopy className="h-4 w-4" />
              {copied ? 'Copiado' : 'Copiar enlace'}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          El enlace incluye un token de un solo uso. Si el paciente lo pierde,
          podés regenerarlo desde su perfil.
        </p>
      </div>

      <DialogFooter className="mt-4">
        <Button type="button" onClick={onClose}>
          Cerrar
        </Button>
      </DialogFooter>
    </>
  );
}

// ---------------------------------------------------------------------------
// Local TagsField — same UX pattern as edit-clinical-fields-dialog. Kept
// inline because it's not yet generic enough for the design-system; if a third
// consumer surfaces, lift it to a shared module.
// ---------------------------------------------------------------------------

interface TagsFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  values: string[];
  suggestions?: string[];
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
        <p className="text-[11px] text-muted-foreground/70 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
