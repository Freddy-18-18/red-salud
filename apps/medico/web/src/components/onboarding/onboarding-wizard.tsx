'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Building2,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Camera,
  Plus,
  Check,
  Info,
  Stethoscope,
  CalendarClock,
  MapPin,
} from 'lucide-react';
import { ThemeToggle } from '@red-salud/design-system';
import { supabase } from '@/lib/supabase/client';
import { StepIndicator } from './step-indicator';
import { SpecialtySelector, type SpecialtyOption } from './specialty-selector';
import { LocationPicker, type LocationData } from './location-picker';

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = [
  { id: 1, label: 'Verificación' },
  { id: 2, label: 'Consultorio' },
  { id: 3, label: 'Horarios' },
];

const DAYS_OF_WEEK = [
  { key: 'lun', label: 'Lun' },
  { key: 'mar', label: 'Mar' },
  { key: 'mie', label: 'Mié' },
  { key: 'jue', label: 'Jue' },
  { key: 'vie', label: 'Vie' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
];

const TIME_BLOCKS = [
  { key: 'morning', label: 'Mañana', desc: '8:00 - 12:00' },
  { key: 'afternoon', label: 'Tarde', desc: '13:00 - 17:00' },
  { key: 'evening', label: 'Noche', desc: '17:00 - 21:00' },
];

const CONSULTATION_DURATIONS = [15, 20, 30, 45, 60] as const;

// ============================================================================
// TYPES
// ============================================================================

interface SacsResultData {
  nombre_completo?: string;
  profesion_principal?: string;
  especialidad_display?: string;
  matricula_principal?: string;
  postgrados?: Array<{ postgrado?: string }>;
  [key: string]: unknown;
}

interface SacsResult {
  success: boolean;
  verified: boolean;
  data?: SacsResultData;
  razon_rechazo?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

interface WizardState {
  // Step 1
  docType: 'V' | 'E';
  cedula: string;
  sacsVerifying: boolean;
  sacsResult: SacsResult | null;
  sacsVerified: boolean;
  manualMode: boolean;
  manualName: string;
  manualProfession: string;
  manualSpecialtyId: string;
  manualSpecialtyOption: SpecialtyOption | null;
  // Step 2
  practiceName: string;
  location: LocationData | null;
  addressOverride: string;
  // Step 3
  workingDays: string[];
  timeBlocks: string[];
  consultationDuration: number;
  profilePhoto: File | null;
  profilePhotoPreview: string | null;
}

// ============================================================================
// SHARED STYLING HELPERS — semantic tokens, theme-aware
// ============================================================================

const inputClass = (hasError = false) =>
  [
    'w-full rounded-lg px-3.5 py-2.5 text-sm',
    'bg-background border',
    hasError ? 'border-destructive/60' : 'border-border',
    'text-foreground placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
    'transition-colors motion-reduce:transition-none',
  ].join(' ');

const toggleBtnClass = (active: boolean) =>
  active
    ? 'bg-primary/10 border-primary/40 text-primary'
    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-border-strong';

const sectionIconClass =
  'w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0';

function buildScheduleSummary(days: string[], blocks: string[]): string {
  if (days.length === 0 || blocks.length === 0) return '';

  const dayLabels = DAYS_OF_WEEK.filter((d) => days.includes(d.key)).map((d) => d.label);
  const dayStr =
    dayLabels.length === 7
      ? 'Todos los días'
      : dayLabels.length >= 2 &&
        DAYS_OF_WEEK.findIndex((d) => d.key === days[0]) + days.length - 1 ===
          DAYS_OF_WEEK.findIndex((d) => d.key === days[days.length - 1])
        ? `${dayLabels[0]}-${dayLabels[dayLabels.length - 1]}`
        : dayLabels.join(', ');

  const timeMap: Record<string, [number, number]> = {
    morning: [8, 12],
    afternoon: [13, 17],
    evening: [17, 21],
  };
  let minHour = 24;
  let maxHour = 0;
  for (const b of blocks) {
    const range = timeMap[b];
    if (range) {
      if (range[0] < minHour) minHour = range[0];
      if (range[1] > maxHour) maxHour = range[1];
    }
  }

  return `${dayStr}, ${String(minHour).padStart(2, '0')}:00-${String(maxHour).padStart(2, '0')}:00`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sacsError, setSacsError] = useState<string | null>(null);

  const [state, setState] = useState<WizardState>({
    docType: 'V',
    cedula: '',
    sacsVerifying: false,
    sacsResult: null,
    sacsVerified: false,
    manualMode: false,
    manualName: '',
    manualProfession: '',
    manualSpecialtyId: '',
    manualSpecialtyOption: null,
    practiceName: '',
    location: null,
    addressOverride: '',
    workingDays: ['lun', 'mar', 'mie', 'jue', 'vie'],
    timeBlocks: ['morning', 'afternoon'],
    consultationDuration: 30,
    profilePhoto: null,
    profilePhotoPreview: null,
  });

  const displayName = state.sacsVerified
    ? state.sacsResult?.data?.nombre_completo ?? ''
    : state.manualName;

  const displaySpecialty = state.sacsVerified
    ? state.sacsResult?.data?.especialidad_display ??
      state.sacsResult?.data?.postgrados?.[0]?.postgrado ??
      ''
    : state.manualSpecialtyOption?.name ?? '';

  // ── Auth + prefill ──────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      // UI preview mode (no auth) — for visual QA. Submits still require a real user.
      if (typeof window !== 'undefined' && window.location.search.includes('preview=1')) {
        const params = new URLSearchParams(window.location.search);
        const step = Number.parseInt(params.get('step') ?? '1', 10);
        if (step >= 1 && step <= 3) setCurrentStep(step);
        setUserId('preview-user');
        setInitialLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from('doctor_profiles')
        .select('specialty_id, dashboard_config')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (profile?.specialty_id) {
        const config = profile.dashboard_config as Record<string, unknown> | null;
        if (config?.onboarding_completed === true) {
          window.location.href = '/dashboard';
          return;
        }
      }

      setInitialLoading(false);
    }

    init();
  }, []);

  const update = useCallback(<K extends keyof WizardState>(field: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── SACS verification ───────────────────────────────────────────────
  const handleVerifySacs = useCallback(async () => {
    if (!state.cedula.trim()) return;

    setState((prev) => ({
      ...prev,
      sacsVerifying: true,
      sacsResult: null,
      sacsVerified: false,
      manualMode: false,
    }));
    setSacsError(null);

    try {
      const response = await fetch('/api/sacs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: state.cedula.trim(),
          tipo_documento: state.docType,
        }),
      });

      const result: SacsResult = await response.json();

      if (result.success && result.verified && result.data) {
        setState((prev) => ({
          ...prev,
          sacsVerifying: false,
          sacsResult: result,
          sacsVerified: true,
          manualMode: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          sacsVerifying: false,
          sacsResult: result,
          sacsVerified: false,
          manualMode: false,
        }));
      }
    } catch {
      setSacsError('Error de conexión. Intentá de nuevo.');
      setState((prev) => ({ ...prev, sacsVerifying: false }));
    }
  }, [state.cedula, state.docType]);

  const enableManualMode = useCallback(() => {
    setState((prev) => ({ ...prev, manualMode: true }));
  }, []);

  const handleLocationChange = useCallback((data: LocationData) => {
    setState((prev) => ({
      ...prev,
      location: data,
      addressOverride: data.formatted,
    }));
  }, []);

  const toggleDay = useCallback((day: string) => {
    setState((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  }, []);

  const toggleTimeBlock = useCallback((block: string) => {
    setState((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.includes(block)
        ? prev.timeBlocks.filter((b) => b !== block)
        : [...prev.timeBlocks, block],
    }));
  }, []);

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState((prev) => {
      if (prev.profilePhotoPreview) URL.revokeObjectURL(prev.profilePhotoPreview);
      return {
        ...prev,
        profilePhoto: file,
        profilePhotoPreview: URL.createObjectURL(file),
      };
    });
  }, []);

  const canAdvance = useMemo(() => {
    if (currentStep === 1) {
      if (state.sacsVerified) return true;
      if (
        state.manualMode &&
        state.manualName.trim().length >= 3 &&
        state.manualSpecialtyId
      )
        return true;
      return false;
    }

    if (currentStep === 2) {
      return state.practiceName.trim().length >= 2 && state.location !== null;
    }

    return state.workingDays.length > 0 && state.timeBlocks.length > 0;
  }, [currentStep, state]);

  const goNext = useCallback(() => {
    if (!canAdvance) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, [canAdvance]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // ── Save + finish ───────────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    if (!userId || !canAdvance) return;

    setSaving(true);
    setGlobalError(null);

    try {
      const fullName = state.sacsVerified
        ? state.sacsResult?.data?.nombre_completo ?? ''
        : state.manualName;

      const specialtyId = state.manualSpecialtyId || null;
      const specialtySlug = state.manualSpecialtyOption?.slug ?? 'general';
      const cedulaFormatted = `${state.docType}-${state.cedula}`;

      const sacsSpecialty =
        state.sacsResult?.data?.especialidad_display ||
        state.sacsResult?.data?.postgrados?.[0]?.postgrado ||
        null;

      const { error: profilesError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          national_id: cedulaFormatted,
          state: state.location?.state ?? '',
          city: state.location?.city ?? '',
          address: state.addressOverride || state.location?.formatted || '',
          sacs_verified: state.sacsVerified,
          sacs_name: state.sacsVerified ? fullName : null,
          sacs_license: state.sacsResult?.data?.matricula_principal || null,
          sacs_specialty: sacsSpecialty,
          sacs_verified_at: state.sacsVerified ? new Date().toISOString() : null,
          national_id_verified: state.sacsVerified,
        })
        .eq('id', userId);

      if (profilesError) {
        console.error('Error updating profiles:', profilesError);
        setGlobalError('Error al guardar tu perfil. Intentá de nuevo.');
        setSaving(false);
        return;
      }

      const { error: doctorError } = await supabase.from('doctor_profiles').upsert(
        {
          profile_id: userId,
          specialty_id: specialtyId,
          medical_license: state.sacsResult?.data?.matricula_principal || cedulaFormatted,
          clinic_address: state.addressOverride || state.location?.formatted || '',
          consultation_duration: state.consultationDuration,
          sacs_verified: state.sacsVerified,
          verified: state.sacsVerified,
          sacs_data: state.sacsVerified ? state.sacsResult : null,
          schedule: {
            workingDays: state.workingDays,
            timeBlocks: state.timeBlocks,
          },
          dashboard_config: {
            onboarding_completed: true,
            theme: specialtySlug,
            practice_name: state.practiceName,
            schedule: {
              workingDays: state.workingDays,
              timeBlocks: state.timeBlocks,
              consultationDuration: state.consultationDuration,
            },
            location: state.location
              ? { lat: state.location.lat, lng: state.location.lng }
              : null,
          },
        },
        { onConflict: 'profile_id' }
      );

      if (doctorError) {
        console.error('Error saving doctor details:', doctorError);
        setGlobalError('Error al guardar los datos profesionales. Intentá de nuevo.');
        setSaving(false);
        return;
      }

      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          national_id: cedulaFormatted,
        },
      });

      setDone(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch {
      setGlobalError('Error inesperado. Intentá de nuevo.');
      setSaving(false);
    }
  }, [userId, canAdvance, state]);

  // ── Loading state ───────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2
            className="w-10 h-10 animate-spin motion-reduce:animate-none text-primary mx-auto"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">Cargando tu perfil…</p>
        </div>
      </main>
    );
  }

  // ── Done state ──────────────────────────────────────────────────────
  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-6 p-8 animate-in fade-in zoom-in duration-500 motion-reduce:animate-none">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">¡Tu consultorio está listo!</h2>
            {displayName && (
              <p className="text-base font-medium text-foreground">{displayName}</p>
            )}
            {displaySpecialty && (
              <p className="text-sm text-primary">{displaySpecialty}</p>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Redirigiendo al dashboard…
          </div>
        </div>
      </main>
    );
  }

  // ── Main wizard ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ═══════════════════════ Sticky Header ═══════════════════════ */}
      <header
        className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border"
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              aria-label="Volver a Red Salud"
            >
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <Plus className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <span className="text-base font-semibold text-foreground hidden sm:inline">
                Red Salud
              </span>
            </a>

            <div className="flex-1 max-w-md hidden md:block">
              <StepIndicator steps={STEPS} currentStep={currentStep} />
            </div>

            <ThemeToggle variant="single" />
          </div>

          {/* Mobile step indicator (visible < md) */}
          <div className="md:hidden pb-3">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </div>
        </div>
      </header>

      {/* ═══════════════════════ Main Content ═══════════════════════ */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Global error */}
        {globalError && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 mb-6"
          >
            <AlertCircle
              aria-hidden="true"
              className="w-5 h-5 text-destructive shrink-0 mt-0.5"
            />
            <p className="text-sm text-destructive">{globalError}</p>
          </div>
        )}

        {currentStep === 1 && (
          <StepVerification
            state={state}
            update={update}
            sacsError={sacsError}
            onVerify={handleVerifySacs}
            onEnableManual={enableManualMode}
          />
        )}

        {currentStep === 2 && (
          <StepPractice state={state} update={update} onLocationChange={handleLocationChange} />
        )}

        {currentStep === 3 && (
          <StepSchedule
            state={state}
            displayName={displayName}
            displaySpecialty={displaySpecialty}
            toggleDay={toggleDay}
            toggleTimeBlock={toggleTimeBlock}
            update={update}
            onPhotoChange={handlePhotoChange}
          />
        )}
      </main>

      {/* ═══════════════════════ Sticky Footer ═══════════════════════ */}
      <footer
        className="sticky bottom-0 z-30 bg-background/85 backdrop-blur-md border-t border-border"
        role="contentinfo"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === 1}
              className={[
                'px-5 py-2.5 rounded-lg text-sm font-medium',
                'text-muted-foreground hover:text-foreground',
                'transition-colors motion-reduce:transition-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:opacity-0 disabled:pointer-events-none',
              ].join(' ')}
            >
              ← Atrás
            </button>

            <div className="text-xs text-muted-foreground hidden sm:block">
              Paso <span className="font-semibold text-foreground">{currentStep}</span> de{' '}
              <span className="font-semibold text-foreground">{STEPS.length}</span>
            </div>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
                className={[
                  'px-6 py-2.5 rounded-lg text-sm font-semibold',
                  'bg-primary text-primary-foreground shadow-sm',
                  'hover:bg-primary/90 transition-colors motion-reduce:transition-none',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary',
                ].join(' ')}
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canAdvance || saving}
                className={[
                  'px-6 py-3 rounded-lg text-sm font-semibold',
                  'bg-primary text-primary-foreground shadow-sm',
                  'hover:bg-primary/90 transition-colors motion-reduce:transition-none',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary',
                  'inline-flex items-center gap-2',
                ].join(' ')}
              >
                {saving ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    Guardando…
                  </>
                ) : (
                  'Activar mi Consultorio'
                )}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// STEP 1: Verificación Profesional
// ============================================================================

function StepVerification({
  state,
  update,
  sacsError,
  onVerify,
  onEnableManual,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void;
  sacsError: string | null;
  onVerify: () => void;
  onEnableManual: () => void;
}) {
  const hasAttempted = state.sacsResult !== null;
  const sacsNotFound = hasAttempted && !state.sacsVerified;

  return (
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
      {/* Left: Form (3/5 width on large screens) */}
      <section className="lg:col-span-3 space-y-6">
        <header className="flex items-start gap-3">
          <div className={sectionIconClass}>
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Verificá tu identidad profesional
            </h1>
            <p className="text-sm text-muted-foreground">
              Validamos tu registro en el SACS para activar tu consultorio digital.
            </p>
          </div>
        </header>

        <div className="space-y-5">
          {/* Document type + cedula row */}
          <div className="space-y-2">
            <label
              htmlFor="cedula-input"
              className="block text-sm font-medium text-foreground"
            >
              Cédula profesional
            </label>
            <div className="flex gap-2">
              <div
                role="radiogroup"
                aria-label="Tipo de documento"
                className="flex rounded-lg border border-border overflow-hidden shrink-0"
              >
                <button
                  type="button"
                  onClick={() => update('docType', 'V')}
                  role="radio"
                  aria-checked={state.docType === 'V'}
                  className={[
                    'px-4 py-2.5 text-sm font-semibold transition-colors',
                    'motion-reduce:transition-none',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10',
                    state.docType === 'V'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  V
                </button>
                <button
                  type="button"
                  onClick={() => update('docType', 'E')}
                  role="radio"
                  aria-checked={state.docType === 'E'}
                  className={[
                    'px-4 py-2.5 text-sm font-semibold transition-colors',
                    'motion-reduce:transition-none border-l border-border',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10',
                    state.docType === 'E'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  E
                </button>
              </div>
              <input
                id="cedula-input"
                type="text"
                inputMode="numeric"
                value={state.cedula}
                onChange={(e) => update('cedula', e.target.value.replace(/\D/g, ''))}
                placeholder="12345678"
                className={`${inputClass()} flex-1`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onVerify}
            disabled={!state.cedula.trim() || state.sacsVerifying}
            className={[
              'w-full inline-flex items-center justify-center gap-2',
              'px-5 py-3 rounded-lg text-sm font-semibold',
              'bg-primary text-primary-foreground shadow-sm',
              'hover:bg-primary/90 transition-colors motion-reduce:transition-none',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary',
            ].join(' ')}
          >
            {state.sacsVerifying ? (
              <>
                <Loader2
                  className="w-4 h-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Consultando el SACS… puede tardar hasta 2 minutos
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Verificar con SACS
              </>
            )}
          </button>

          {sacsError && (
            <p
              role="alert"
              aria-live="polite"
              className="text-sm text-destructive flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {sacsError}
            </p>
          )}

          {/* SACS NOT FOUND */}
          {sacsNotFound && !state.manualMode && (
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle
                  className="w-5 h-5 text-warning shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    No encontramos tu registro en SACS
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Podés continuar con verificación manual. Tu cuenta será revisada por
                    nuestro equipo en 24-48 horas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onEnableManual}
                className={[
                  'text-sm font-medium text-primary hover:text-primary/80',
                  'transition-colors motion-reduce:transition-none',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
                  'underline underline-offset-4',
                ].join(' ')}
              >
                Continuar con verificación manual →
              </button>
            </div>
          )}

          {/* Manual mode inputs */}
          {state.manualMode && (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Datos manuales
              </p>

              <div className="space-y-1.5">
                <label
                  htmlFor="manual-name"
                  className="block text-sm font-medium text-foreground"
                >
                  Nombre completo <span className="text-destructive">*</span>
                </label>
                <input
                  id="manual-name"
                  type="text"
                  value={state.manualName}
                  onChange={(e) => update('manualName', e.target.value)}
                  placeholder="Dr. Juan Carlos Pérez"
                  className={inputClass(!state.manualName.trim())}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="manual-profession"
                  className="block text-sm font-medium text-foreground"
                >
                  Profesión
                </label>
                <input
                  id="manual-profession"
                  type="text"
                  value={state.manualProfession}
                  onChange={(e) => update('manualProfession', e.target.value)}
                  placeholder="Médico Cirujano"
                  className={inputClass()}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Especialidad <span className="text-destructive">*</span>
                </label>
                <SpecialtySelector
                  value={state.manualSpecialtyId || null}
                  onChange={(opt) => {
                    update('manualSpecialtyId', opt?.id ?? '');
                    update('manualSpecialtyOption', opt);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Right: Result / Info card (2/5 width) */}
      <aside className="lg:col-span-2">
        <div className="lg:sticky lg:top-32">
          {state.sacsVerified ? (
            <VerifiedSacsCard data={state.sacsResult?.data} />
          ) : state.manualMode ? (
            <ManualPendingCard
              name={state.manualName}
              profession={state.manualProfession}
              specialty={state.manualSpecialtyOption?.name}
            />
          ) : (
            <InfoCard />
          )}
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// STEP 1 helpers
// ============================================================================

function InfoCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">¿Qué es SACS?</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            El Sistema Autónomo de Contraloría Sanitaria valida el registro oficial de
            profesionales de la salud en Venezuela.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <InfoRow
          icon={<ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />}
          title="Verificación instantánea"
          text="Consultamos tu cédula directamente en SACS — sin papeles, sin trámites."
        />
        <InfoRow
          icon={<Stethoscope className="w-4 h-4 text-primary" aria-hidden="true" />}
          title="Especialidad automática"
          text="Tu postgrado define los módulos clínicos disponibles en tu dashboard."
        />
        <InfoRow
          icon={<Clock className="w-4 h-4 text-primary" aria-hidden="true" />}
          title="Hasta 2 minutos"
          text="El SACS puede demorar en responder. Si no aparecés, podés continuar manualmente."
        />
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Tus datos están protegidos. Cumplimos con normativas de privacidad y seguridad
          de datos clínicos.
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function VerifiedSacsCard({ data }: { data?: SacsResultData }) {
  return (
    <div className="rounded-2xl border border-success/30 bg-success/5 p-6 space-y-4">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        Verificado por SACS
      </span>

      <div className="space-y-3">
        <VerifiedField label="Nombre completo" value={data?.nombre_completo} />
        <VerifiedField label="Profesión" value={data?.profesion_principal} />
        <VerifiedField
          label="Especialidad"
          value={data?.especialidad_display ?? data?.postgrados?.[0]?.postgrado}
        />
        <VerifiedField label="Matrícula" value={data?.matricula_principal} />
      </div>
    </div>
  );
}

function ManualPendingCard({
  name,
  profession,
  specialty,
}: {
  name?: string;
  profession?: string;
  specialty?: string;
}) {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6 space-y-4">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-semibold">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        Verificación pendiente
      </span>

      <div className="space-y-3">
        <VerifiedField label="Nombre completo" value={name || undefined} />
        <VerifiedField label="Profesión" value={profession || undefined} />
        <VerifiedField label="Especialidad" value={specialty} />
      </div>

      <p className="text-xs text-muted-foreground pt-2 border-t border-border/60">
        Será revisada por nuestro equipo en 24-48 horas.
      </p>
    </div>
  );
}

// ============================================================================
// STEP 2: Tu Consultorio
// ============================================================================

function StepPractice({
  state,
  update,
  onLocationChange,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void;
  onLocationChange: (data: LocationData) => void;
}) {
  return (
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
      <section className="lg:col-span-2 space-y-6">
        <header className="flex items-start gap-3">
          <div className={sectionIconClass}>
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Configurá tu consultorio
            </h1>
            <p className="text-sm text-muted-foreground">
              Ubicación y datos de tu espacio de trabajo.
            </p>
          </div>
        </header>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="practice-name"
              className="block text-sm font-medium text-foreground"
            >
              Nombre del consultorio <span className="text-destructive">*</span>
            </label>
            <input
              id="practice-name"
              type="text"
              value={state.practiceName}
              onChange={(e) => update('practiceName', e.target.value)}
              placeholder="Ej: Consultorio Dr. Pérez"
              className={inputClass()}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="practice-address"
              className="block text-sm font-medium text-foreground"
            >
              Dirección
            </label>
            <textarea
              id="practice-address"
              value={state.addressOverride}
              onChange={(e) => update('addressOverride', e.target.value)}
              placeholder="Se completa al seleccionar ubicación en el mapa"
              rows={2}
              className={`${inputClass()} resize-none`}
            />
          </div>

          {state.location && (
            <div className="flex items-center gap-2 flex-wrap">
              {state.location.state && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs text-foreground">
                  <MapPin className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                  {state.location.state}
                </span>
              )}
              {state.location.city && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs text-foreground">
                  {state.location.city}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <aside className="lg:col-span-3">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <LocationPicker onLocationChange={onLocationChange} />
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// STEP 3: Horarios y Preferencias
// ============================================================================

function StepSchedule({
  state,
  displayName,
  displaySpecialty,
  toggleDay,
  toggleTimeBlock,
  update,
  onPhotoChange,
}: {
  state: WizardState;
  displayName: string;
  displaySpecialty: string;
  toggleDay: (day: string) => void;
  toggleTimeBlock: (block: string) => void;
  update: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const scheduleSummary = buildScheduleSummary(state.workingDays, state.timeBlocks);

  return (
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
      <section className="lg:col-span-3 space-y-6">
        <header className="flex items-start gap-3">
          <div className={sectionIconClass}>
            <CalendarClock className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Configurá tu disponibilidad
            </h1>
            <p className="text-sm text-muted-foreground">
              Horarios y preferencias de consulta.
            </p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Working days */}
          <div role="group" aria-labelledby="onboarding-working-days-label">
            <label
              id="onboarding-working-days-label"
              className="block text-sm font-medium text-foreground mb-2.5"
            >
              Días de trabajo
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAYS_OF_WEEK.map((day) => {
                const isActive = state.workingDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    aria-pressed={isActive}
                    className={[
                      'px-3.5 py-2 rounded-lg border text-xs font-semibold min-w-[52px]',
                      'transition-colors motion-reduce:transition-none',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      toggleBtnClass(isActive),
                    ].join(' ')}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time blocks */}
          <div role="group" aria-labelledby="onboarding-time-blocks-label">
            <label
              id="onboarding-time-blocks-label"
              className="block text-sm font-medium text-foreground mb-2.5"
            >
              Bloques horarios
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_BLOCKS.map((block) => {
                const isActive = state.timeBlocks.includes(block.key);
                return (
                  <button
                    key={block.key}
                    type="button"
                    onClick={() => toggleTimeBlock(block.key)}
                    aria-pressed={isActive}
                    className={[
                      'px-3 py-2.5 rounded-lg border text-xs font-semibold',
                      'transition-colors motion-reduce:transition-none',
                      'flex flex-col items-center gap-0.5',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      toggleBtnClass(isActive),
                    ].join(' ')}
                  >
                    <span>{block.label}</span>
                    <span className="text-[10px] opacity-70 font-normal">{block.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consultation duration */}
          <div role="group" aria-labelledby="onboarding-duration-label">
            <label
              id="onboarding-duration-label"
              className="block text-sm font-medium text-foreground mb-2.5"
            >
              Duración de consulta
            </label>
            <div className="flex gap-2 flex-wrap">
              {CONSULTATION_DURATIONS.map((dur) => {
                const isActive = state.consultationDuration === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => update('consultationDuration', dur)}
                    aria-pressed={isActive}
                    className={[
                      'px-4 py-2 rounded-lg border text-xs font-semibold',
                      'transition-colors motion-reduce:transition-none',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      toggleBtnClass(isActive),
                    ].join(' ')}
                  >
                    {dur} min
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile photo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2.5">
              Foto de perfil <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="profile-photo"
                className={[
                  'w-20 h-20 rounded-xl border-2 border-dashed shrink-0',
                  'flex items-center justify-center cursor-pointer overflow-hidden',
                  'border-border hover:border-primary/50 hover:bg-muted',
                  'transition-colors motion-reduce:transition-none',
                  'focus-within:ring-2 focus-within:ring-ring',
                ].join(' ')}
              >
                {state.profilePhotoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={state.profilePhotoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                )}
                <input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Podés agregarla después en{' '}
                <span className="font-medium text-foreground">Configuración</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview card */}
      <aside className="lg:col-span-2">
        <div className="lg:sticky lg:top-32">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vista previa
            </p>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                {state.profilePhotoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={state.profilePhotoPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">
                    {displayName ? displayName.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {displayName || 'Nombre del doctor'}
                </p>
                {displaySpecialty && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium truncate max-w-full">
                    {displaySpecialty}
                  </span>
                )}
              </div>
            </div>

            {state.location && (
              <div className="text-xs text-muted-foreground flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-relaxed">
                  {state.practiceName}
                  {state.location.city && ` • ${state.location.city}`}
                  {state.location.state && `, ${state.location.state}`}
                </span>
              </div>
            )}

            {scheduleSummary && (
              <div className="text-xs text-muted-foreground flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-relaxed">{scheduleSummary}</span>
              </div>
            )}

            <div className="pt-3 border-t border-border">
              {state.sacsVerified ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Verificado por SACS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  Verificación pendiente
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// Shared: Read-only verified field
// ============================================================================

function VerifiedField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground bg-background border border-border rounded-md px-3 py-2">
        {value}
      </p>
    </div>
  );
}
