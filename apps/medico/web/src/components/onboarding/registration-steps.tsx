'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import {
  User,
  Briefcase,
  ShieldCheck,
  Palette,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { verifySACSDoctor } from '@/lib/services/doctor-verification-service';
import { StepIndicator } from './step-indicator';
import { SpecialtySelector, type SpecialtyOption } from './specialty-selector';
import { ModuleConfigurator } from './module-configurator';
import { getSpecialtyTheme } from '@/lib/specialty-theme';

// ============================================================================
// SCHEMAS
// ============================================================================

const personalInfoSchema = z.object({
  fullName: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .email('Ingresa un correo electronico valido'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe incluir mayuscula, minuscula y numero'
    ),
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
});

const professionalInfoSchema = z.object({
  licenseNumber: z
    .string()
    .min(3, 'Ingresa un numero de licencia valido'),
  specialtyId: z
    .string()
    .min(1, 'Selecciona una especialidad'),
  subSpecialties: z.array(z.string()).optional(),
  yearsExperience: z
    .number()
    .min(0, 'Los anos de experiencia no pueden ser negativos')
    .max(60, 'Valor maximo: 60'),
  languages: z
    .array(z.string())
    .min(1, 'Selecciona al menos un idioma'),
});

const verificationSchema = z.object({
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los terminos y condiciones' }),
  }),
});

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  // Step 1
  fullName: string;
  email: string;
  password: string;
  cedula: string;
  phone: string;
  // Step 2
  licenseNumber: string;
  specialtyId: string;
  specialtyOption: SpecialtyOption | null;
  subSpecialties: string[];
  yearsExperience: number;
  languages: string[];
  // Step 3
  licenseDocument: File | null;
  sacsVerified: boolean;
  sacsData: Record<string, unknown> | null;
  termsAccepted: boolean;
  // Step 4
  selectedModules: string[];
}

type FieldErrors = Record<string, string>;

const STEPS = [
  { id: 1, label: 'Datos Personales' },
  { id: 2, label: 'Info Profesional' },
  { id: 3, label: 'Verificacion' },
  { id: 4, label: 'Tu Experiencia' },
];

const AVAILABLE_LANGUAGES = [
  { code: 'es', label: 'Espanol' },
  { code: 'en', label: 'Ingles' },
  { code: 'pt', label: 'Portugues' },
  { code: 'fr', label: 'Frances' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Aleman' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function RegistrationSteps() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    cedula: '',
    phone: '',
    licenseNumber: '',
    specialtyId: '',
    specialtyOption: null,
    subSpecialties: [],
    yearsExperience: 0,
    languages: ['es'],
    licenseDocument: null,
    sacsVerified: false,
    sacsData: null,
    termsAccepted: false,
    selectedModules: [],
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verifyingCedula, setVerifyingCedula] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // ── Field updater ──
  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error on change
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  // ── Validation per step ──
  const validateStep = useCallback(
    (step: number): boolean => {
      setErrors({});

      if (step === 1) {
        const result = personalInfoSchema.safeParse({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          cedula: formData.cedula,
          phone: formData.phone,
        });
        if (!result.success) {
          const fieldErrors: FieldErrors = {};
          for (const issue of result.error.issues) {
            const path = issue.path[0] as string;
            if (!fieldErrors[path]) {
              fieldErrors[path] = issue.message;
            }
          }
          setErrors(fieldErrors);
          return false;
        }
        return true;
      }

      if (step === 2) {
        const result = professionalInfoSchema.safeParse({
          licenseNumber: formData.licenseNumber,
          specialtyId: formData.specialtyId,
          subSpecialties: formData.subSpecialties,
          yearsExperience: formData.yearsExperience,
          languages: formData.languages,
        });
        if (!result.success) {
          const fieldErrors: FieldErrors = {};
          for (const issue of result.error.issues) {
            const path = issue.path[0] as string;
            if (!fieldErrors[path]) {
              fieldErrors[path] = issue.message;
            }
          }
          setErrors(fieldErrors);
          return false;
        }
        return true;
      }

      if (step === 3) {
        const result = verificationSchema.safeParse({
          termsAccepted: formData.termsAccepted,
        });
        if (!result.success) {
          const fieldErrors: FieldErrors = {};
          for (const issue of result.error.issues) {
            const path = issue.path[0] as string;
            if (!fieldErrors[path]) {
              fieldErrors[path] = issue.message;
            }
          }
          setErrors(fieldErrors);
          return false;
        }
        return true;
      }

      // Step 4 — no validation required (modules are optional config)
      return true;
    },
    [formData]
  );

  // ── SACS Verification ──
  const handleSACSVerification = useCallback(async () => {
    if (!formData.cedula) return;

    setVerifyingCedula(true);
    setGlobalError(null);

    try {
      // Extract just the number from cedula (remove V- or E- prefix)
      const cedulaNumber = formData.cedula.replace(/^[VvEe]-?/, '');
      const result = await verifySACSDoctor(cedulaNumber);

      if (result.success && result.data) {
        updateField('sacsVerified', result.data.verified);
        updateField('sacsData', result.data as unknown as Record<string, unknown>);

        // Auto-fill name if SACS returns it
        if (result.data.nombre && result.data.apellido && !formData.fullName) {
          updateField('fullName', `${result.data.nombre} ${result.data.apellido}`);
        }
      }
    } catch {
      // SACS is optional — if it fails, allow manual flow
      updateField('sacsVerified', false);
    } finally {
      setVerifyingCedula(false);
    }
  }, [formData.cedula, formData.fullName, updateField]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, [currentStep, validateStep]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // ── Final submission ──
  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    setGlobalError(null);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.fullName,
            role: 'medico',
            cedula: formData.cedula,
            telefono: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setGlobalError('Este correo ya esta registrado. Intenta iniciar sesion.');
        } else {
          setGlobalError(authError.message);
        }
        setSubmitting(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setGlobalError('Error al crear la cuenta. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }

      // 2. Create doctor_details profile
      const { error: profileError } = await supabase
        .from('doctor_details')
        .upsert(
          {
            profile_id: userId,
            especialidad_id: formData.specialtyId,
            licencia_medica: formData.licenseNumber,
            anos_experiencia: formData.yearsExperience,
            idiomas: formData.languages,
            subespecialidades: formData.subSpecialties,
            sacs_verified: formData.sacsVerified,
            sacs_data: formData.sacsData,
            dashboard_config: {
              modules: formData.selectedModules,
              theme: formData.specialtyOption?.slug ?? 'default',
            },
          },
          { onConflict: 'profile_id' }
        );

      if (profileError) {
        console.error('Error creating doctor profile:', profileError);
        // Non-blocking — the profile can be completed later
      }

      // 3. Save module preferences
      if (formData.selectedModules.length > 0) {
        const { error: modulesError } = await supabase
          .from('doctor_module_preferences')
          .upsert(
            {
              doctor_id: userId,
              specialty_id: formData.specialtyId,
              enabled_modules: formData.selectedModules,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'doctor_id' }
          );

        if (modulesError) {
          console.error('Error saving module preferences:', modulesError);
          // Non-blocking
        }
      }

      // 4. Upload license document if provided
      if (formData.licenseDocument) {
        const ext = formData.licenseDocument.name.split('.').pop() ?? 'pdf';
        const path = `doctor-licenses/${userId}/license.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, formData.licenseDocument, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading license:', uploadError);
          // Non-blocking
        }
      }

      setRegistrationComplete(true);
    } catch (err) {
      console.error('Registration error:', err);
      setGlobalError('Error inesperado durante el registro. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }, [formData, currentStep, validateStep]);

  // ── Success screen ──
  if (registrationComplete) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Registro exitoso</h2>
        <p className="text-gray-600">
          Hemos enviado un correo de verificacion a{' '}
          <strong>{formData.email}</strong>. Revisa tu bandeja de entrada y
          confirma tu cuenta para acceder a tu consultorio.
        </p>
        <div className="pt-4">
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Ir a Iniciar Sesion
          </a>
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Step indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Global error */}
      {globalError && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{globalError}</p>
        </div>
      )}

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        {/* ═══════════════ STEP 1: Personal Info ═══════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Datos Personales</h2>
                <p className="text-sm text-gray-500">Informacion basica de tu cuenta</p>
              </div>
            </div>

            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo *
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Dr. Juan Carlos Perez"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electronico *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="doctor@ejemplo.com"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Contrasena *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Minimo 8 caracteres"
                  className={`w-full px-4 py-2.5 pr-12 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Debe incluir mayuscula, minuscula y numero
              </p>
            </div>

            {/* Cedula */}
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1.5">
                Cedula de Identidad *
              </label>
              <input
                id="cedula"
                type="text"
                value={formData.cedula}
                onChange={(e) => updateField('cedula', e.target.value)}
                placeholder="V-12345678"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.cedula ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              {errors.cedula && (
                <p className="text-xs text-red-500 mt-1">{errors.cedula}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Formato: V-12345678 (venezolana) o E-12345678 (extranjera)
              </p>
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Telefono <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="0412-1234567"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 2: Professional Info ═══════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Informacion Profesional</h2>
                <p className="text-sm text-gray-500">Tu especialidad y experiencia medica</p>
              </div>
            </div>

            {/* License number */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                Numero de Licencia Medica / MPPS *
              </label>
              <input
                id="licenseNumber"
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => updateField('licenseNumber', e.target.value)}
                placeholder="Numero MPPS o licencia medica"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.licenseNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              {errors.licenseNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.licenseNumber}</p>
              )}
            </div>

            {/* Specialty selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Especialidad Principal *
              </label>
              <SpecialtySelector
                value={formData.specialtyId}
                onChange={(specialty) => {
                  updateField('specialtyId', specialty?.id ?? '');
                  updateField('specialtyOption', specialty);
                }}
                error={errors.specialtyId}
              />
            </div>

            {/* Sub-specialties */}
            <div>
              <label htmlFor="subSpecialties" className="block text-sm font-medium text-gray-700 mb-1.5">
                Subespecialidades <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="subSpecialties"
                type="text"
                value={formData.subSpecialties.join(', ')}
                onChange={(e) => {
                  const subs = e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  updateField('subSpecialties', subs);
                }}
                placeholder="Ej: Ortodoncia, Implantologia (separadas por coma)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Separa multiples subespecialidades con coma</p>
            </div>

            {/* Years experience */}
            <div>
              <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-1.5">
                Anos de Experiencia *
              </label>
              <input
                id="yearsExperience"
                type="number"
                min={0}
                max={60}
                value={formData.yearsExperience}
                onChange={(e) => updateField('yearsExperience', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.yearsExperience ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              {errors.yearsExperience && (
                <p className="text-xs text-red-500 mt-1">{errors.yearsExperience}</p>
              )}
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Idiomas de Atencion *
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = formData.languages.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateField(
                            'languages',
                            formData.languages.filter((l) => l !== lang.code)
                          );
                        } else {
                          updateField('languages', [...formData.languages, lang.code]);
                        }
                      }}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${
                          isSelected
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
              {errors.languages && (
                <p className="text-xs text-red-500 mt-1">{errors.languages}</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 3: Verification ═══════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Verificacion</h2>
                <p className="text-sm text-gray-500">Verifica tu identidad como profesional de salud</p>
              </div>
            </div>

            {/* SACS Verification */}
            <div className="rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Verificacion SACS
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verificacion automatica contra el registro venezolano de profesionales de salud
                  </p>
                </div>
                {formData.sacsVerified && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verificado
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSACSVerification}
                disabled={verifyingCedula || !formData.cedula}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                  text-sm font-medium transition-colors
                  ${
                    formData.sacsVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500'
                  }
                `}
              >
                {verifyingCedula ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando en SACS...
                  </>
                ) : formData.sacsVerified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verificacion SACS exitosa
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verificar con cedula {formData.cedula || '(completa tus datos)'}
                  </>
                )}
              </button>

              {!formData.sacsVerified && !verifyingCedula && (
                <p className="text-xs text-gray-400">
                  La verificacion SACS es opcional. Si no apareces en el registro,
                  aun puedes continuar y tu cuenta sera verificada manualmente.
                </p>
              )}
            </div>

            {/* License document upload */}
            <div className="rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Documento de Licencia Medica
              </h3>
              <p className="text-xs text-gray-500">
                Sube una foto o escaneado de tu licencia medica para agilizar la verificacion.
              </p>

              <label
                htmlFor="licenseUpload"
                className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl
                  cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
              >
                {formData.licenseDocument ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm text-gray-700 font-medium">
                      {formData.licenseDocument.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(formData.licenseDocument.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Arrastra o haz clic para subir
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, JPG o PNG (max 10MB)
                    </p>
                  </>
                )}
                <input
                  id="licenseUpload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file && file.size > 10 * 1024 * 1024) {
                      setGlobalError('El archivo es demasiado grande (max 10MB)');
                      return;
                    }
                    updateField('licenseDocument', file);
                  }}
                />
              </label>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => updateField('termsAccepted', e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Acepto los{' '}
                <a href="/terminos" className="text-blue-600 hover:underline" target="_blank">
                  Terminos y Condiciones
                </a>{' '}
                y la{' '}
                <a href="/privacidad" className="text-blue-600 hover:underline" target="_blank">
                  Politica de Privacidad
                </a>{' '}
                de Red Salud. Certifico que la informacion proporcionada es veridica.
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="text-xs text-red-500">{errors.termsAccepted}</p>
            )}
          </div>
        )}

        {/* ═══════════════ STEP 4: Customize Experience ═══════════════ */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor:
                    getSpecialtyTheme(formData.specialtyOption?.slug).bgLight,
                }}
              >
                <Palette
                  className="w-5 h-5"
                  style={{
                    color: getSpecialtyTheme(formData.specialtyOption?.slug).primary,
                  }}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Personaliza Tu Experiencia</h2>
                <p className="text-sm text-gray-500">
                  Elige los modulos que deseas en tu consultorio
                </p>
              </div>
            </div>

            <ModuleConfigurator
              specialty={formData.specialtyOption}
              selectedModules={formData.selectedModules}
              onModulesChange={(modules) => updateField('selectedModules', modules)}
            />

            {/* Dashboard preview hint */}
            {formData.specialtyOption && (
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor:
                    getSpecialtyTheme(formData.specialtyOption.slug).primary + '30',
                  backgroundColor:
                    getSpecialtyTheme(formData.specialtyOption.slug).bgLight,
                }}
              >
                <p className="text-sm text-gray-700">
                  Tu dashboard de{' '}
                  <strong style={{ color: getSpecialtyTheme(formData.specialtyOption.slug).primary }}>
                    {formData.specialtyOption.name}
                  </strong>{' '}
                  tendra {formData.selectedModules.length} modulos activos.
                  Podras personalizar esto en cualquier momento desde Configuracion.
                </p>
              </div>
            )}
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
              text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Atras
          </button>
        ) : (
          <a
            href="/auth/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
              text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Ya tengo cuenta
          </a>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
              text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
              text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm
              disabled:bg-gray-300 disabled:text-gray-500"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Crear Mi Consultorio
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
