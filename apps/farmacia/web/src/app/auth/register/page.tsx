'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Pill,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  Building2,
  User,
  MapPin,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─────────────── Types ─────────────── */

interface Step1Data {
  email: string;
  password: string;
  confirmPassword: string;
}

interface Step2Data {
  businessName: string;
  rif: string;
  pharmacyType: string;
  licenseNumber: string;
}

interface Step3Data {
  fullName: string;
  cedula: string;
  phone: string;
  cargo: string;
}

interface Step4Data {
  state: string;
  city: string;
  address: string;
}

type FieldErrors = Record<string, string | undefined>;

/* ─────────────── Constants ─────────────── */

const VENEZUELA_STATES = [
  'Amazonas',
  'Anzoategui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolivar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Distrito Capital',
  'Falcon',
  'Guarico',
  'Lara',
  'Merida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Tachira',
  'Trujillo',
  'Vargas',
  'Yaracuy',
  'Zulia',
];

const PHARMACY_TYPES = [
  { value: 'farmacia', label: 'Farmacia' },
  { value: 'drogueria', label: 'Drogueria' },
  { value: 'perfumeria', label: 'Perfumeria' },
];

const STEPS = [
  { number: 1, label: 'Acceso', icon: Lock },
  { number: 2, label: 'Farmacia', icon: Building2 },
  { number: 3, label: 'Representante', icon: User },
  { number: 4, label: 'Ubicacion', icon: MapPin },
];

/* ─────────────── Validation ─────────────── */

function validateStep1(data: Step1Data): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Ingresa un email valido';
  }
  if (!data.password) {
    errors.password = 'La contrasena es requerida';
  } else if (data.password.length < 6) {
    errors.password = 'La contrasena debe tener al menos 6 caracteres';
  }
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contrasena';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Las contrasenas no coinciden';
  }
  return errors;
}

function validateStep2(data: Step2Data): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.businessName.trim()) {
    errors.businessName = 'La razon social es requerida';
  }
  if (!data.rif.trim()) {
    errors.rif = 'El RIF es requerido';
  } else if (!/^[JGVEPjgvep]-\d{8}-\d$/.test(data.rif)) {
    errors.rif = 'Formato invalido. Ejemplo: J-12345678-9';
  }
  if (!data.pharmacyType) {
    errors.pharmacyType = 'Selecciona el tipo de establecimiento';
  }
  if (!data.licenseNumber.trim()) {
    errors.licenseNumber = 'El numero de permiso es requerido';
  }
  return errors;
}

function validateStep3(data: Step3Data): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.fullName.trim()) {
    errors.fullName = 'El nombre es requerido';
  }
  if (!data.cedula.trim()) {
    errors.cedula = 'La cedula es requerida';
  } else if (!/^[VEve]-\d{6,8}$/.test(data.cedula)) {
    errors.cedula = 'Formato invalido. Ejemplo: V-12345678';
  }
  if (!data.phone.trim()) {
    errors.phone = 'El telefono es requerido';
  } else if (!/^\+58\d{10}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Formato invalido. Ejemplo: +58 412 1234567';
  }
  if (!data.cargo.trim()) {
    errors.cargo = 'El cargo es requerido';
  }
  return errors;
}

function validateStep4(data: Step4Data): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.state) {
    errors.state = 'Selecciona un estado';
  }
  if (!data.city.trim()) {
    errors.city = 'La ciudad es requerida';
  }
  if (!data.address.trim()) {
    errors.address = 'La direccion es requerida';
  }
  return errors;
}

/* ─────────────── Step Indicator ─────────────── */

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium ${
                  isActive
                    ? 'text-blue-600'
                    : isCompleted
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 -mt-5 ${
                  currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────── Main Component ─────────────── */

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Access data
  const [step1, setStep1] = useState<Step1Data>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Step 2: Pharmacy data
  const [step2, setStep2] = useState<Step2Data>({
    businessName: '',
    rif: '',
    pharmacyType: '',
    licenseNumber: '',
  });

  // Step 3: Representative data
  const [step3, setStep3] = useState<Step3Data>({
    fullName: '',
    cedula: '',
    phone: '+58 ',
    cargo: '',
  });

  // Step 4: Location data
  const [step4, setStep4] = useState<Step4Data>({
    state: '',
    city: '',
    address: '',
  });

  const updateStep1 = (field: keyof Step1Data, value: string) => {
    setStep1((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const updateStep2 = (field: keyof Step2Data, value: string) => {
    setStep2((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const updateStep3 = (field: keyof Step3Data, value: string) => {
    setStep3((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const updateStep4 = (field: keyof Step4Data, value: string) => {
    setStep4((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const handleNext = () => {
    setFieldErrors({});
    setError(null);

    let errors: FieldErrors = {};
    switch (currentStep) {
      case 1:
        errors = validateStep1(step1);
        break;
      case 2:
        errors = validateStep2(step2);
        break;
      case 3:
        errors = validateStep3(step3);
        break;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setFieldErrors({});
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    setError(null);

    const errors = validateStep4(step4);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email: step1.email,
        password: step1.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: 'farmacia',
            full_name: step3.fullName,
            cedula: step3.cedula,
            phone: step3.phone.replace(/\s/g, ''),
            cargo: step3.cargo,
            pharmacy_name: step2.businessName,
            pharmacy_rif: step2.rif,
            pharmacy_type: step2.pharmacyType,
            pharmacy_license: step2.licenseNumber,
            state: step4.state,
            city: step4.city,
            address: step4.address,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Este email ya esta registrado. Intenta iniciar sesion.');
        } else if (signUpError.message.includes('Too many requests')) {
          setError(
            'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.'
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError('Ocurrio un error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Success screen ─── */
  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Registro exitoso
          </h1>
          <p className="text-gray-500 mb-6">
            Revisa tu correo en{' '}
            <span className="font-semibold text-gray-900">{step1.email}</span>{' '}
            para confirmar tu cuenta.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            No lo ves? Revisa tu carpeta de spam.
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-center"
          >
            Ir a Iniciar Sesion
          </Link>
        </div>
      </main>
    );
  }

  /* ─── Form ─── */
  return (
    <main className="flex min-h-screen">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Pill className="h-8 w-8" />
            </div>
            <div>
              <span className="text-3xl font-bold">Red Salud</span>
              <span className="block text-blue-200 text-sm font-medium">
                Farmacia
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Unite a la red de farmacias mas grande de Venezuela
          </h2>
          <p className="text-lg text-blue-100 leading-relaxed max-w-md">
            Digitaliza tu farmacia, conectate con medicos y pacientes,
            y gestiona tu negocio de forma eficiente.
          </p>
          <div className="mt-10 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
            <p className="text-blue-100 text-sm font-medium mb-3">
              Que obtenes al registrarte:
            </p>
            <ul className="space-y-3 text-sm text-blue-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                Control de inventario con alertas de vencimiento
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                Punto de venta integrado con tasa BCV
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                Recepcion de recetas digitales verificadas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                Gestion de entregas a domicilio
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">
                Red Salud
              </span>
              <span className="block text-blue-600 text-xs font-medium -mt-0.5">
                Farmacia
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Registra tu farmacia
              </h1>
              <p className="text-gray-500 mt-1">
                Paso {currentStep} de 4 —{' '}
                {STEPS[currentStep - 1].label}
              </p>
            </div>

            <StepIndicator currentStep={currentStep} />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Step 1: Datos de acceso */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={step1.email}
                    onChange={(e) => updateStep1('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="tu@farmacia.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Contrasena
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={step1.password}
                      onChange={(e) => updateStep1('password', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        fieldErrors.password
                          ? 'border-red-400'
                          : 'border-gray-300'
                      }`}
                      placeholder="Minimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Confirmar contrasena
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={step1.confirmPassword}
                      onChange={(e) =>
                        updateStep1('confirmPassword', e.target.value)
                      }
                      className={`w-full px-4 py-3 pr-12 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        fieldErrors.confirmPassword
                          ? 'border-red-400'
                          : 'border-gray-300'
                      }`}
                      placeholder="Repeti tu contrasena"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Datos de la farmacia */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Razon social
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={step2.businessName}
                    onChange={(e) =>
                      updateStep2('businessName', e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.businessName
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                    placeholder="Farmacia Salud Total C.A."
                  />
                  {fieldErrors.businessName && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="rif"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    RIF
                  </label>
                  <input
                    id="rif"
                    type="text"
                    value={step2.rif}
                    onChange={(e) =>
                      updateStep2('rif', e.target.value.toUpperCase())
                    }
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.rif ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="J-12345678-9"
                  />
                  {fieldErrors.rif && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.rif}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pharmacyType"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Tipo de establecimiento
                  </label>
                  <select
                    id="pharmacyType"
                    value={step2.pharmacyType}
                    onChange={(e) =>
                      updateStep2('pharmacyType', e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none ${
                      fieldErrors.pharmacyType
                        ? 'border-red-400'
                        : 'border-gray-300'
                    } ${!step2.pharmacyType ? 'text-gray-400' : ''}`}
                  >
                    <option value="" disabled>
                      Selecciona un tipo
                    </option>
                    {PHARMACY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.pharmacyType && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.pharmacyType}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Numero de permiso sanitario
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    value={step2.licenseNumber}
                    onChange={(e) =>
                      updateStep2('licenseNumber', e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.licenseNumber
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                    placeholder="Numero de permiso"
                  />
                  {fieldErrors.licenseNumber && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.licenseNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Datos del representante */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={step3.fullName}
                    onChange={(e) => updateStep3('fullName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.fullName
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                    placeholder="Juan Perez"
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="cedula"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Cedula de identidad
                  </label>
                  <input
                    id="cedula"
                    type="text"
                    value={step3.cedula}
                    onChange={(e) =>
                      updateStep3('cedula', e.target.value.toUpperCase())
                    }
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.cedula ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="V-12345678"
                  />
                  {fieldErrors.cedula && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.cedula}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Telefono
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={step3.phone}
                    onChange={(e) => updateStep3('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.phone ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="+58 412 1234567"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="cargo"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Cargo
                  </label>
                  <input
                    id="cargo"
                    type="text"
                    value={step3.cargo}
                    onChange={(e) => updateStep3('cargo', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.cargo ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Propietario, Regente, Gerente..."
                  />
                  {fieldErrors.cargo && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.cargo}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Ubicacion */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Estado
                  </label>
                  <select
                    id="state"
                    value={step4.state}
                    onChange={(e) => updateStep4('state', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none ${
                      fieldErrors.state ? 'border-red-400' : 'border-gray-300'
                    } ${!step4.state ? 'text-gray-400' : ''}`}
                  >
                    <option value="" disabled>
                      Selecciona un estado
                    </option>
                    {VENEZUELA_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.state && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Ciudad
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={step4.city}
                    onChange={(e) => updateStep4('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      fieldErrors.city ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Caracas, Valencia, Maracaibo..."
                  />
                  {fieldErrors.city && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Direccion
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={step4.address}
                    onChange={(e) => updateStep4('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
                      fieldErrors.address
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                    placeholder="Av. Principal, Centro Comercial, Local 5..."
                  />
                  {fieldErrors.address && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Atras
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center gap-2 ${
                    currentStep === 1 ? 'w-full' : ''
                  }`}
                >
                  Siguiente
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Completar Registro
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Ya tenes cuenta?{' '}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
