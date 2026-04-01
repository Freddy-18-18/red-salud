'use client';

import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import {
  Plus,
  User,
  Stethoscope,
  Building2,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Timer,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { StepIndicator } from './step-indicator';
import { SpecialtySelector, type SpecialtyOption } from './specialty-selector';

// ============================================================================
// SCHEMAS
// ============================================================================

const personalInfoSchema = z.object({
  fullName: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  cedula: z
    .string()
    .regex(/^[VvEe]-?\d{6,10}$/, 'Formato: V-12345678 o E-12345678'),
  phone: z
    .string()
    .regex(
      /^(\+?58)?[\s-]?(4\d{2})[\s-]?\d{3}[\s-]?\d{4}$/,
      'Formato: 0412-1234567 o +58 412-123-4567'
    )
    .or(z.string().length(0))
    .optional(),
  state: z.string().min(1, 'Selecciona un estado'),
  city: z.string().min(2, 'Ingresa la ciudad'),
});

const practiceInfoSchema = z.object({
  practiceName: z.string().min(2, 'Ingresa el nombre del consultorio'),
  practiceAddress: z.string().min(5, 'Ingresa la direccion del consultorio'),
  consultationDuration: z.number().min(10).max(120),
});

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = [
  { id: 1, label: 'Datos' },
  { id: 2, label: 'Especialidad' },
  { id: 3, label: 'Consultorio' },
  { id: 4, label: 'Verificacion' },
];

const VENEZUELAN_STATES = [
  'Amazonas', 'Anzoategui', 'Apure', 'Aragua', 'Barinas',
  'Bolivar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital',
  'Falcon', 'Guarico', 'Lara', 'Merida', 'Miranda',
  'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Tachira',
  'Trujillo', 'Vargas', 'Yaracuy', 'Zulia',
];

const CONSULTATION_DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
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

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  // Step 1: Personal info
  fullName: string;
  cedula: string;
  phone: string;
  state: string;
  city: string;
  // Step 2: Specialty
  specialtyId: string;
  specialtyOption: SpecialtyOption | null;
  // Step 3: Practice
  practiceName: string;
  practiceAddress: string;
  workingDays: string[];
  timeBlocks: string[];
  consultationDuration: number;
  // Step 4: SACS
  sacsNumber: string;
  sacsVerified: boolean;
}

type FieldErrors = Record<string, string>;

// ============================================================================
// COMPONENT
// ============================================================================

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    cedula: '',
    phone: '',
    state: '',
    city: '',
    specialtyId: '',
    specialtyOption: null,
    practiceName: '',
    practiceAddress: '',
    workingDays: ['lun', 'mar', 'mie', 'jue', 'vie'],
    timeBlocks: ['morning', 'afternoon'],
    consultationDuration: 30,
    sacsNumber: '',
    sacsVerified: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ── Check auth and prefill data ──
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      setUserId(user.id);

      // Pre-fill from user metadata if available
      const meta = user.user_metadata;
      if (meta) {
        setFormData((prev) => ({
          ...prev,
          fullName: meta.nombre_completo || meta.full_name || prev.fullName,
          cedula: meta.cedula || prev.cedula,
          phone: meta.telefono || prev.phone,
        }));
      }

      // Check if profile already has onboarding completed
      const { data: profile } = await supabase
        .from('doctor_details')
        .select('especialidad_id, dashboard_config')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (profile?.especialidad_id) {
        const config = profile.dashboard_config as Record<string, unknown> | null;
        const hasModules = config?.onboarding_completed === true;
        if (hasModules) {
          window.location.href = '/dashboard';
          return;
        }
      }

      setInitialLoading(false);
    }

    init();
  }, []);

  // ── Field updater ──
  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  // ── Toggle helpers ──
  const toggleDay = useCallback((day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  }, []);

  const toggleTimeBlock = useCallback((block: string) => {
    setFormData((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.includes(block)
        ? prev.timeBlocks.filter((b) => b !== block)
        : [...prev.timeBlocks, block],
    }));
  }, []);

  // ── Validation per step ──
  const validateStep = useCallback(
    (step: number): boolean => {
      setErrors({});

      if (step === 1) {
        const result = personalInfoSchema.safeParse({
          fullName: formData.fullName,
          cedula: formData.cedula,
          phone: formData.phone,
          state: formData.state,
          city: formData.city,
        });
        if (!result.success) {
          const fieldErrors: FieldErrors = {};
          for (const issue of result.error.issues) {
            const path = issue.path[0] as string;
            if (!fieldErrors[path]) fieldErrors[path] = issue.message;
          }
          setErrors(fieldErrors);
          return false;
        }
        return true;
      }

      if (step === 2) {
        if (!formData.specialtyId) {
          setErrors({ specialtyId: 'Selecciona una especialidad' });
          return false;
        }
        return true;
      }

      if (step === 3) {
        const result = practiceInfoSchema.safeParse({
          practiceName: formData.practiceName,
          practiceAddress: formData.practiceAddress,
          consultationDuration: formData.consultationDuration,
        });
        if (!result.success) {
          const fieldErrors: FieldErrors = {};
          for (const issue of result.error.issues) {
            const path = issue.path[0] as string;
            if (!fieldErrors[path]) fieldErrors[path] = issue.message;
          }
          setErrors(fieldErrors);
          return false;
        }
        if (formData.workingDays.length === 0) {
          setErrors({ workingDays: 'Selecciona al menos un dia' });
          return false;
        }
        if (formData.timeBlocks.length === 0) {
          setErrors({ timeBlocks: 'Selecciona al menos un horario' });
          return false;
        }
        return true;
      }

      // Step 4 — SACS is optional
      return true;
    },
    [formData]
  );

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, [currentStep, validateStep]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // ── Save and finish ──
  const handleFinish = useCallback(async () => {
    if (!userId) return;

    setSaving(true);
    setGlobalError(null);

    try {
      // Update the doctor_details record
      const { error: profileError } = await supabase
        .from('doctor_details')
        .upsert(
          {
            profile_id: userId,
            especialidad_id: formData.specialtyId || null,
            nombre_completo: formData.fullName,
            cedula: formData.cedula,
            telefono: formData.phone || null,
            estado: formData.state,
            ciudad: formData.city,
            nombre_consultorio: formData.practiceName,
            direccion_consultorio: formData.practiceAddress,
            sacs_number: formData.sacsNumber || null,
            sacs_verified: formData.sacsVerified,
            dashboard_config: {
              onboarding_completed: true,
              theme: formData.specialtyOption?.slug ?? 'default',
              schedule: {
                workingDays: formData.workingDays,
                timeBlocks: formData.timeBlocks,
                consultationDuration: formData.consultationDuration,
              },
            },
          },
          { onConflict: 'profile_id' }
        );

      if (profileError) {
        console.error('Error saving doctor profile:', profileError);
        setGlobalError('Error al guardar tu perfil. Intenta de nuevo.');
        setSaving(false);
        return;
      }

      // Also update the user metadata for display name
      await supabase.auth.updateUser({
        data: {
          nombre_completo: formData.fullName,
          cedula: formData.cedula,
          telefono: formData.phone,
        },
      });

      setDone(true);

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2500);
    } catch {
      setGlobalError('Error inesperado. Intenta de nuevo.');
      setSaving(false);
    }
  }, [userId, formData]);

  // ── Skip SACS and finish ──
  const handleSkipSACS = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  // ── Loading state ──
  if (initialLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
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
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="max-w-md text-center space-y-6 p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-teal-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Tu consultorio esta listo</h2>
          <p className="text-zinc-400">
            Hemos configurado tu espacio de trabajo de{' '}
            <strong className="text-teal-400">
              {formData.specialtyOption?.name ?? 'Medicina'}
            </strong>
            . Todo esta preparado para que empieces a atender pacientes.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redireccionando al dashboard...
          </div>
        </div>
      </main>
    );
  }

  // ── Saving overlay ──
  if (saving) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-teal-400 mx-auto" />
          <p className="text-sm text-zinc-400">Guardando tu perfil...</p>
        </div>
      </main>
    );
  }

  // ── Main wizard ──
  return (
    <main className="min-h-screen bg-zinc-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Branding */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Plus className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
              Red Salud
            </span>
          </a>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            Configura tu consultorio
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Paso {currentStep} de {STEPS.length}
          </p>
        </div>

        {/* Global error */}
        {globalError && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{globalError}</p>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8">

          {/* ═══════════════ STEP 1: Personal Info ═══════════════ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Datos Personales</h2>
                  <p className="text-sm text-zinc-400">Informacion basica de tu perfil medico</p>
                </div>
              </div>

              {/* Full name */}
              <div>
                <label htmlFor="fullName" className="block text-sm text-zinc-300 mb-1.5">
                  Nombre completo *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Dr. Juan Carlos Perez"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-white
                    bg-zinc-900 placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    ${errors.fullName ? 'border-red-500/50' : 'border-zinc-700'}`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Cedula */}
              <div>
                <label htmlFor="cedula" className="block text-sm text-zinc-300 mb-1.5">
                  Cedula de Identidad *
                </label>
                <input
                  id="cedula"
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => updateField('cedula', e.target.value)}
                  placeholder="V-12345678"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-white
                    bg-zinc-900 placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    ${errors.cedula ? 'border-red-500/50' : 'border-zinc-700'}`}
                />
                {errors.cedula && (
                  <p className="text-xs text-red-400 mt-1">{errors.cedula}</p>
                )}
                <p className="text-xs text-zinc-500 mt-1">
                  Formato: V-12345678 (venezolana) o E-12345678 (extranjera)
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm text-zinc-300 mb-1.5">
                  Telefono{' '}
                  <span className="text-zinc-500 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="0412-1234567"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white
                      bg-zinc-900 placeholder:text-zinc-500
                      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                      ${errors.phone ? 'border-red-500/50' : 'border-zinc-700'}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* State and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm text-zinc-300 mb-1.5">
                    Estado *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white
                        bg-zinc-900 appearance-none
                        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                        ${errors.state ? 'border-red-500/50' : 'border-zinc-700'}
                        ${!formData.state ? 'text-zinc-500' : ''}`}
                    >
                      <option value="" className="text-zinc-500">Seleccionar estado</option>
                      {VENEZUELAN_STATES.map((state) => (
                        <option key={state} value={state} className="text-white bg-zinc-900">
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.state && (
                    <p className="text-xs text-red-400 mt-1">{errors.state}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm text-zinc-300 mb-1.5">
                    Ciudad *
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Caracas"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-white
                      bg-zinc-900 placeholder:text-zinc-500
                      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                      ${errors.city ? 'border-red-500/50' : 'border-zinc-700'}`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-400 mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              {/* Profile photo placeholder */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30 border-2 border-dashed border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-teal-400">
                    {formData.fullName
                      ? formData.fullName
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-zinc-300">Foto de perfil</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Podras subir tu foto despues desde la configuracion
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 2: Specialty ═══════════════ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Tu Especialidad</h2>
                  <p className="text-sm text-zinc-400">
                    Tu dashboard se personalizara segun tu especialidad
                  </p>
                </div>
              </div>

              <SpecialtySelector
                value={formData.specialtyId}
                onChange={(specialty) => {
                  updateField('specialtyId', specialty?.id ?? '');
                  updateField('specialtyOption', specialty);
                }}
                error={errors.specialtyId}
              />

              {/* Specialty description */}
              {formData.specialtyOption && (
                <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 space-y-2">
                  <p className="text-sm font-medium text-teal-400">
                    {formData.specialtyOption.name}
                  </p>
                  {formData.specialtyOption.description && (
                    <p className="text-xs text-zinc-400">
                      {formData.specialtyOption.description}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500">
                    Tu consultorio incluira herramientas especializadas, formularios clinicos
                    y modulos adaptados a tu area de practica.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ STEP 3: Practice ═══════════════ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Tu Consultorio</h2>
                  <p className="text-sm text-zinc-400">Configura tu espacio de trabajo</p>
                </div>
              </div>

              {/* Practice name */}
              <div>
                <label htmlFor="practiceName" className="block text-sm text-zinc-300 mb-1.5">
                  Nombre del consultorio / clinica *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    id="practiceName"
                    type="text"
                    value={formData.practiceName}
                    onChange={(e) => updateField('practiceName', e.target.value)}
                    placeholder="Consultorio Dr. Perez / Clinica Santa Maria"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white
                      bg-zinc-900 placeholder:text-zinc-500
                      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                      ${errors.practiceName ? 'border-red-500/50' : 'border-zinc-700'}`}
                  />
                </div>
                {errors.practiceName && (
                  <p className="text-xs text-red-400 mt-1">{errors.practiceName}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="practiceAddress" className="block text-sm text-zinc-300 mb-1.5">
                  Direccion *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <textarea
                    id="practiceAddress"
                    value={formData.practiceAddress}
                    onChange={(e) => updateField('practiceAddress', e.target.value)}
                    placeholder="Av. Principal, Centro Medico, Piso 3, Consultorio 5"
                    rows={2}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white
                      bg-zinc-900 placeholder:text-zinc-500 resize-none
                      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                      ${errors.practiceAddress ? 'border-red-500/50' : 'border-zinc-700'}`}
                  />
                </div>
                {errors.practiceAddress && (
                  <p className="text-xs text-red-400 mt-1">{errors.practiceAddress}</p>
                )}
              </div>

              {/* Working days */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <label className="block text-sm text-zinc-300">
                    Dias de atencion *
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isActive = formData.workingDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${
                            isActive
                              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                              : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {errors.workingDays && (
                  <p className="text-xs text-red-400 mt-1">{errors.workingDays}</p>
                )}
              </div>

              {/* Time blocks */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <label className="block text-sm text-zinc-300">
                    Horarios de atencion *
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TIME_BLOCKS.map((block) => {
                    const isActive = formData.timeBlocks.includes(block.key);
                    return (
                      <button
                        key={block.key}
                        type="button"
                        onClick={() => toggleTimeBlock(block.key)}
                        className={`
                          px-4 py-3 rounded-xl text-left transition-all
                          ${
                            isActive
                              ? 'bg-teal-500/20 border border-teal-500/30'
                              : 'bg-white/5 border border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        <p className={`text-sm font-medium ${isActive ? 'text-teal-400' : 'text-zinc-300'}`}>
                          {block.label}
                        </p>
                        <p className="text-xs text-zinc-500">{block.desc}</p>
                      </button>
                    );
                  })}
                </div>
                {errors.timeBlocks && (
                  <p className="text-xs text-red-400 mt-1">{errors.timeBlocks}</p>
                )}
              </div>

              {/* Consultation duration */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-zinc-400" />
                  <label className="block text-sm text-zinc-300">
                    Duracion de consulta
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CONSULTATION_DURATIONS.map((d) => {
                    const isActive = formData.consultationDuration === d.value;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => updateField('consultationDuration', d.value)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${
                            isActive
                              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                              : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 4: SACS Verification ═══════════════ */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Verificacion SACS</h2>
                  <p className="text-sm text-zinc-400">Opcional - verifica tu registro profesional</p>
                </div>
              </div>

              {/* SACS explanation */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Que es la verificacion SACS?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  El <strong className="text-zinc-300">Sistema Autonomo de Control en Salud (SACS)</strong>{' '}
                  es el registro venezolano de profesionales de salud. Al verificar tu numero SACS,
                  tu perfil aparecera como <span className="text-teal-400">verificado</span> para
                  los pacientes, generando mayor confianza.
                </p>
                <div className="flex items-start gap-2 text-xs text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  <span>Los medicos verificados aparecen primero en las busquedas de pacientes</span>
                </div>
              </div>

              {/* SACS number input */}
              <div>
                <label htmlFor="sacsNumber" className="block text-sm text-zinc-300 mb-1.5">
                  Numero de registro SACS
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    id="sacsNumber"
                    type="text"
                    value={formData.sacsNumber}
                    onChange={(e) => updateField('sacsNumber', e.target.value)}
                    placeholder="Ingresa tu numero SACS"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900
                      text-sm text-white placeholder:text-zinc-500
                      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Si no lo tienes a mano, podes agregarlo despues desde tu perfil
                </p>
              </div>

              {/* Skip notice */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs text-amber-400/80 leading-relaxed">
                  La verificacion SACS es <strong>opcional</strong>. Si omitis este paso,
                  tu cuenta funcionara normalmente pero sin la insignia de verificado.
                  Podras verificarte en cualquier momento desde la configuracion de tu perfil.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                text-zinc-300 border border-white/20 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                text-white bg-gradient-to-r from-teal-500 to-cyan-500
                hover:from-teal-400 hover:to-cyan-400
                transition-all shadow-lg shadow-teal-500/25
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkipSACS}
                className="px-5 py-2.5 rounded-xl text-sm font-medium
                  text-zinc-400 border border-white/10 hover:bg-white/5 transition-colors"
              >
                Omitir por ahora
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                  text-white bg-gradient-to-r from-teal-500 to-cyan-500
                  hover:from-teal-400 hover:to-cyan-400
                  transition-all shadow-lg shadow-teal-500/25
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Activar mi Consultorio
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Skip link */}
        <div className="text-center pb-8">
          <a
            href="/dashboard"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Saltar configuracion (puedo hacerlo despues)
          </a>
        </div>
      </div>
    </main>
  );
}
