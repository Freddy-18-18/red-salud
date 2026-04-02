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
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { StepIndicator } from './step-indicator';
import { SpecialtySelector, type SpecialtyOption } from './specialty-selector';
import { LocationPicker, type LocationData } from './location-picker';

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = [
  { id: 1, label: 'Verificacion' },
  { id: 2, label: 'Consultorio' },
  { id: 3, label: 'Horarios' },
];

const DAYS_OF_WEEK = [
  { key: 'lun', label: 'Lun' },
  { key: 'mar', label: 'Mar' },
  { key: 'mie', label: 'Mie' },
  { key: 'jue', label: 'Jue' },
  { key: 'vie', label: 'Vie' },
  { key: 'sab', label: 'Sab' },
  { key: 'dom', label: 'Dom' },
];

const TIME_BLOCKS = [
  { key: 'morning', label: 'Manana', desc: '8:00 - 12:00' },
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
// HELPERS
// ============================================================================

const inputClass = (hasError = false) =>
  `w-full bg-zinc-800/50 border ${hasError ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-colors`;

const toggleBtnClass = (active: boolean) =>
  active
    ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
    : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:border-white/20';

function buildScheduleSummary(days: string[], blocks: string[]): string {
  if (days.length === 0 || blocks.length === 0) return '';

  // Summarize consecutive days
  const dayLabels = DAYS_OF_WEEK.filter((d) => days.includes(d.key)).map((d) => d.label);
  const dayStr =
    dayLabels.length === 7
      ? 'Todos los dias'
      : dayLabels.length >= 2 &&
        DAYS_OF_WEEK.findIndex((d) => d.key === days[0]) + days.length - 1 ===
          DAYS_OF_WEEK.findIndex((d) => d.key === days[days.length - 1])
        ? `${dayLabels[0]}-${dayLabels[dayLabels.length - 1]}`
        : dayLabels.join(', ');

  // Time range
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
// COMPONENT
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
    // Step 1
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
    // Step 2
    practiceName: '',
    location: null,
    addressOverride: '',
    // Step 3
    workingDays: ['lun', 'mar', 'mie', 'jue', 'vie'],
    timeBlocks: ['morning', 'afternoon'],
    consultationDuration: 30,
    profilePhoto: null,
    profilePhotoPreview: null,
  });

  // Derived display values
  const displayName = state.sacsVerified
    ? state.sacsResult?.data?.nombre_completo ?? ''
    : state.manualName;

  const displaySpecialty = state.sacsVerified
    ? state.sacsResult?.data?.especialidad_display ??
      state.sacsResult?.data?.postgrados?.[0]?.postgrado ??
      ''
    : state.manualSpecialtyOption?.name ?? '';

  // ── Check auth and prefill data ──
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      setUserId(user.id);

      // Check if profile already has onboarding completed
      const { data: profile } = await supabase
        .from('doctor_details')
        .select('especialidad_id, dashboard_config')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (profile?.especialidad_id) {
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

  // ── Field updater ──
  const update = useCallback(<K extends keyof WizardState>(field: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── SACS Verification ──
  const handleVerifySacs = useCallback(async () => {
    if (!state.cedula.trim()) return;

    setState((prev) => ({ ...prev, sacsVerifying: true, sacsResult: null, sacsVerified: false, manualMode: false }));
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
      setSacsError('Error de conexion. Intenta de nuevo.');
      setState((prev) => ({ ...prev, sacsVerifying: false }));
    }
  }, [state.cedula, state.docType]);

  // ── Enable manual mode after SACS fails ──
  const enableManualMode = useCallback(() => {
    setState((prev) => ({ ...prev, manualMode: true }));
  }, []);

  // ── Location handler ──
  const handleLocationChange = useCallback(
    (data: LocationData) => {
      setState((prev) => ({
        ...prev,
        location: data,
        addressOverride: data.formatted,
      }));
    },
    []
  );

  // ── Toggle helpers ──
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

  // ── Photo handler ──
  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old preview URL
    setState((prev) => {
      if (prev.profilePhotoPreview) URL.revokeObjectURL(prev.profilePhotoPreview);
      return {
        ...prev,
        profilePhoto: file,
        profilePhotoPreview: URL.createObjectURL(file),
      };
    });
  }, []);

  // ── Step validation ──
  const canAdvance = useMemo(() => {
    if (currentStep === 1) {
      if (state.sacsVerified) return true;
      if (state.manualMode && state.manualName.trim().length >= 3 && state.manualSpecialtyId) return true;
      return false;
    }

    if (currentStep === 2) {
      return state.practiceName.trim().length >= 2 && state.location !== null;
    }

    // Step 3 always has defaults
    return state.workingDays.length > 0 && state.timeBlocks.length > 0;
  }, [currentStep, state]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (!canAdvance) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, [canAdvance]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // ── Save and finish ──
  const handleFinish = useCallback(async () => {
    if (!userId || !canAdvance) return;

    setSaving(true);
    setGlobalError(null);

    try {
      const fullName = state.sacsVerified
        ? state.sacsResult?.data?.nombre_completo ?? ''
        : state.manualName;

      const specialtyId = state.sacsVerified
        ? state.manualSpecialtyId || null
        : state.manualSpecialtyId || null;

      const specialtySlug = state.sacsVerified
        ? state.manualSpecialtyOption?.slug ?? 'general'
        : state.manualSpecialtyOption?.slug ?? 'general';

      const cedulaFormatted = `${state.docType}-${state.cedula}`;

      const sacsSpecialty = state.sacsResult?.data?.especialidad_display
        || state.sacsResult?.data?.postgrados?.[0]?.postgrado
        || null;

      // 1. Update profiles table (personal data)
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          national_id: cedulaFormatted,
          state: state.location?.state ?? '',
          city: state.location?.city ?? '',
          address: state.addressOverride || state.location?.formatted || '',
          sacs_verificado: state.sacsVerified,
          sacs_name: state.sacsVerified ? fullName : null,
          sacs_matricula: state.sacsResult?.data?.matricula_principal || null,
          sacs_specialty: sacsSpecialty,
          sacs_verified_at: state.sacsVerified ? new Date().toISOString() : null,
          national_id_verified: state.sacsVerified,
        })
        .eq('id', userId);

      if (profilesError) {
        console.error('Error updating profiles:', profilesError);
        setGlobalError('Error al guardar tu perfil. Intenta de nuevo.');
        setSaving(false);
        return;
      }

      // 2. Upsert doctor_details table (professional data)
      const { error: doctorError } = await supabase.from('doctor_details').upsert(
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
        setGlobalError('Error al guardar los datos profesionales. Intenta de nuevo.');
        setSaving(false);
        return;
      }

      // 3. Update auth user metadata
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
      setGlobalError('Error inesperado. Intenta de nuevo.');
      setSaving(false);
    }
  }, [userId, canAdvance, state]);

  // ── Loading state ──
  if (initialLoading) {
    return (
      <main className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-teal-400 mx-auto" />
          <p className="text-sm text-zinc-500">Cargando tu perfil...</p>
        </div>
      </main>
    );
  }

  // ── Done state ──
  if (done) {
    return (
      <main className="h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="max-w-md text-center space-y-6 p-8 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 mx-auto rounded-full bg-teal-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Tu consultorio esta listo!</h2>
          <p className="text-zinc-400">
            {displayName && (
              <span className="block text-white font-medium mb-1">{displayName}</span>
            )}
            {displaySpecialty && (
              <span className="block text-teal-400 text-sm mb-3">{displaySpecialty}</span>
            )}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirigiendo al dashboard...
          </div>
        </div>
      </main>
    );
  }

  // ── Main wizard ──
  return (
    <main className="h-[calc(100vh-2rem)] max-w-6xl mx-auto p-4 flex flex-col bg-zinc-950">
      {/* Header: Branding + Step Indicator */}
      <div className="flex items-center gap-6 mb-4">
        <a href="/" className="inline-flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Plus className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <span className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
            Red Salud
          </span>
        </a>
        <div className="flex-1">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      {/* Global error */}
      {globalError && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/10 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{globalError}</p>
        </div>
      )}

      {/* Content area: flex-1 overflow-hidden */}
      <div className="flex-1 overflow-hidden">
        {/* ═══════════════════════ STEP 1: Verificacion ═══════════════════════ */}
        {currentStep === 1 && <StepVerification state={state} update={update} sacsError={sacsError} onVerify={handleVerifySacs} onEnableManual={enableManualMode} />}

        {/* ═══════════════════════ STEP 2: Consultorio ═══════════════════════ */}
        {currentStep === 2 && <StepPractice state={state} update={update} onLocationChange={handleLocationChange} />}

        {/* ═══════════════════════ STEP 3: Horarios ═══════════════════════ */}
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
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 1}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          Atras
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={!canAdvance || saving}
            className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Activar mi Consultorio'
            )}
          </button>
        )}
      </div>
    </main>
  );
}

// ============================================================================
// STEP 1: Verificacion Profesional
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
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Left column */}
      <div className="flex flex-col gap-5 overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Verifica tu identidad profesional</h2>
              <p className="text-sm text-zinc-400">Ingresa tu cedula para validar tu registro en el SACS</p>
            </div>
          </div>
        </div>

        {/* Document type + cedula row */}
        <div className="flex gap-3">
          <div className="flex rounded-xl border border-white/10 overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => update('docType', 'V')}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                state.docType === 'V'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
              }`}
            >
              V
            </button>
            <button
              type="button"
              onClick={() => update('docType', 'E')}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                state.docType === 'E'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
              }`}
            >
              E
            </button>
          </div>
          <input
            type="text"
            value={state.cedula}
            onChange={(e) => update('cedula', e.target.value.replace(/\D/g, ''))}
            placeholder="12345678"
            className={`${inputClass()} flex-1`}
          />
        </div>

        {/* Verify button */}
        <button
          type="button"
          onClick={onVerify}
          disabled={!state.cedula.trim() || state.sacsVerifying}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25
            hover:shadow-teal-500/40 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state.sacsVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Consultando el SACS... esto puede tomar hasta 2 minutos
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Verificar con SACS
            </>
          )}
        </button>

        {sacsError && <p className="text-xs text-red-400">{sacsError}</p>}

        {/* SACS NOT FOUND section */}
        {sacsNotFound && !state.manualMode && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <p className="text-sm font-medium text-amber-300">
              No encontramos tu registro en el SACS
            </p>
            <p className="text-xs text-zinc-400">
              Podes continuar con verificacion manual. Tu cuenta sera revisada por nuestro equipo.
            </p>
            <button
              type="button"
              onClick={onEnableManual}
              className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors underline underline-offset-2"
            >
              Continuar con verificacion manual
            </button>
          </div>
        )}

        {/* Manual mode inputs */}
        {state.manualMode && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Nombre completo *</label>
              <input
                type="text"
                value={state.manualName}
                onChange={(e) => update('manualName', e.target.value)}
                placeholder="Dr. Juan Carlos Perez"
                className={inputClass(!state.manualName.trim())}
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Profesion</label>
              <input
                type="text"
                value={state.manualProfession}
                onChange={(e) => update('manualProfession', e.target.value)}
                placeholder="Medico Cirujano"
                className={inputClass()}
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Especialidad *</label>
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

      {/* Right column: verification result card */}
      <div className="flex items-start">
        {hasAttempted && (
          <div className="w-full">
            {state.sacsVerified ? (
              // SACS VERIFIED card
              <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-6 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verificado por SACS
                </span>

                <div className="space-y-3">
                  <VerifiedField label="Nombre completo" value={state.sacsResult?.data?.nombre_completo} />
                  <VerifiedField label="Profesion" value={state.sacsResult?.data?.profesion_principal} />
                  <VerifiedField
                    label="Especialidad"
                    value={
                      state.sacsResult?.data?.especialidad_display ??
                      state.sacsResult?.data?.postgrados?.[0]?.postgrado
                    }
                  />
                  <VerifiedField label="Matricula" value={state.sacsResult?.data?.matricula_principal} />
                </div>
              </div>
            ) : state.manualMode ? (
              // MANUAL PENDING card
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  Verificacion pendiente
                </span>

                <div className="space-y-3">
                  <VerifiedField label="Nombre completo" value={state.manualName || undefined} />
                  <VerifiedField label="Profesion" value={state.manualProfession || undefined} />
                  <VerifiedField label="Especialidad" value={state.manualSpecialtyOption?.name ?? undefined} />
                </div>

                <p className="text-xs text-zinc-500">
                  Sera revisada por nuestro equipo en 24-48 horas
                </p>
              </div>
            ) : null}
          </div>
        )}

        {!hasAttempted && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-3 opacity-40">
              <ShieldCheck className="w-16 h-16 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-600">
                Ingresa tu cedula y verifica tu identidad profesional
              </p>
            </div>
          </div>
        )}
      </div>
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
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Left column */}
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configura tu consultorio</h2>
              <p className="text-sm text-zinc-400">Ubicacion y datos de tu espacio de trabajo</p>
            </div>
          </div>
        </div>

        {/* Practice name */}
        <div>
          <label className="block text-sm text-zinc-300 mb-1.5">Nombre del consultorio *</label>
          <input
            type="text"
            value={state.practiceName}
            onChange={(e) => update('practiceName', e.target.value)}
            placeholder="Ej: Consultorio Dr. Perez"
            className={inputClass()}
          />
        </div>

        {/* Address (auto-filled, editable) */}
        <div>
          <label className="block text-sm text-zinc-300 mb-1.5">Direccion</label>
          <textarea
            value={state.addressOverride}
            onChange={(e) => update('addressOverride', e.target.value)}
            placeholder="Se completa automaticamente al seleccionar ubicacion en el mapa"
            rows={2}
            className={`${inputClass()} resize-none`}
          />
        </div>

        {/* State and city info */}
        {state.location && (
          <div className="flex items-center gap-3 flex-wrap">
            {state.location.state && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800/80 border border-white/10 text-xs text-zinc-300">
                Estado: {state.location.state}
              </span>
            )}
            {state.location.city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800/80 border border-white/10 text-xs text-zinc-300">
                Ciudad: {state.location.city}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right column: Location picker with map */}
      <div className="flex flex-col h-full min-h-0">
        <LocationPicker onLocationChange={onLocationChange} />
      </div>
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
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Left column */}
      <div className="flex flex-col gap-5 overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configura tu disponibilidad</h2>
              <p className="text-sm text-zinc-400">Horarios y preferencias de consulta</p>
            </div>
          </div>
        </div>

        {/* Working days */}
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Dias de trabajo</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${toggleBtnClass(
                  state.workingDays.includes(day.key)
                )}`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time blocks */}
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Bloques horarios</label>
          <div className="flex gap-2 flex-wrap">
            {TIME_BLOCKS.map((block) => (
              <button
                key={block.key}
                type="button"
                onClick={() => toggleTimeBlock(block.key)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${toggleBtnClass(
                  state.timeBlocks.includes(block.key)
                )}`}
              >
                <span>{block.label}</span>
                <span className="text-[10px] opacity-60">{block.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Consultation duration */}
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Duracion de consulta</label>
          <div className="flex gap-2 flex-wrap">
            {CONSULTATION_DURATIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => update('consultationDuration', dur)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${toggleBtnClass(
                  state.consultationDuration === dur
                )}`}
              >
                {dur} min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right column: photo + preview */}
      <div className="flex flex-col gap-5">
        {/* Profile photo upload */}
        <div>
          <label className="block text-sm text-zinc-300 mb-2">Foto de perfil (opcional)</label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="profile-photo"
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-800/50 flex items-center justify-center cursor-pointer hover:border-teal-500/30 transition-colors overflow-hidden shrink-0"
            >
              {state.profilePhotoPreview ? (
                <img
                  src={state.profilePhotoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-zinc-600" />
              )}
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-zinc-500">
              Podes agregarla despues en Configuracion
            </p>
          </div>
        </div>

        {/* Preview card */}
        <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-6 space-y-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Vista previa</p>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
              {state.profilePhotoPreview ? (
                <img
                  src={state.profilePhotoPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-zinc-600">
                  {displayName ? displayName.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {displayName || 'Nombre del doctor'}
              </p>
              {displaySpecialty && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-medium truncate max-w-full">
                  {displaySpecialty}
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          {state.location && (
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {state.practiceName}
                {state.location.city && ` - ${state.location.city}`}
                {state.location.state && `, ${state.location.state}`}
              </span>
            </div>
          )}

          {/* Schedule summary */}
          {scheduleSummary && (
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{scheduleSummary}</span>
            </div>
          )}

          {/* Verification badge */}
          <div className="pt-2 border-t border-white/5">
            {state.sacsVerified ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400">
                <Check className="w-3.5 h-3.5" />
                Verificado por SACS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                Verificacion pendiente
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Shared: Read-only verified field
// ============================================================================

function VerifiedField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className="text-sm text-zinc-200 bg-zinc-800/30 rounded-lg px-3 py-2 border border-white/5">
        {value}
      </p>
    </div>
  );
}
