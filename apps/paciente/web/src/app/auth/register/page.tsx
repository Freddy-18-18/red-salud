"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  registerSchema,
  getPasswordStrength,
  type RegisterFormData,
} from "@/lib/validations/auth";
import { VENEZUELA_STATES, getCitiesForState } from "@/lib/data/venezuela";
import {
  Eye,
  EyeOff,
  Loader2,
  Heart,
  AlertCircle,
  UserPlus,
  Check,
  ChevronDown,
} from "lucide-react";

export default function RegisterPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    state: "",
    city: "",
    acceptTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string>>
  >({});

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const cities = useMemo(
    () => getCitiesForState(formData.state),
    [formData.state]
  );

  const updateField = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Reset city when state changes
      if (field === "state") {
        next.city = "";
      }
      return next;
    });
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<string, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      // Scroll to first error
      const firstErrorField = result.error.errors[0]?.path[0] as string;
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: "paciente",
            phone: formData.phone,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError(
            "Ya existe una cuenta con este email. Intenta iniciar sesion."
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data?.user) {
        // Create/update profile with location data
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            nombre_completo: formData.full_name,
            email: formData.email,
            telefono: formData.phone || null,
            fecha_nacimiento: formData.date_of_birth,
            genero: formData.gender || null,
            estado: formData.state,
            ciudad: formData.city,
            role: "paciente",
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't block — auth was successful, profile might be created by trigger
        }

        // Check if email confirmation is required
        if (data.user.confirmed_at) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setSuccess(true);
        }
      }
    } catch {
      setError("Ocurrio un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cuenta creada con exito
          </h1>
          <p className="text-gray-600 mb-6">
            Te enviamos un email a{" "}
            <span className="font-semibold text-gray-900">
              {formData.email}
            </span>{" "}
            para verificar tu cuenta. Revisa tu bandeja de entrada y haz clic
            en el enlace de confirmacion.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            No lo ves? Revisa la carpeta de spam.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
          >
            Ir a Iniciar Sesion
          </Link>
        </div>
      </main>
    );
  }

  const inputClasses = (field: string) =>
    `w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
      fieldErrors[field] ? "border-red-300" : "border-gray-200"
    }`;

  const selectClasses = (field: string) =>
    `w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none ${
      fieldErrors[field] ? "border-red-300" : "border-gray-200"
    }`;

  return (
    <main className="flex min-h-screen">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-10 w-10 fill-white" />
            <span className="text-3xl font-bold">Red Salud</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Crea tu cuenta gratuita
          </h2>
          <p className="text-lg text-emerald-100 leading-relaxed">
            Unete a miles de pacientes que ya gestionan su salud de forma
            digital.
          </p>
          <div className="mt-10 space-y-4 text-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span>Registro rapido y sencillo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span>100% gratuito para pacientes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span>Tus datos estan seguros y protegidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-xl mx-auto p-6 sm:p-8 py-8 sm:py-12">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <Heart className="h-8 w-8 text-emerald-600 fill-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">Red Salud</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Crear mi cuenta
              </h1>
              <p className="text-gray-500 mt-1">
                Completa tus datos para registrarte
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal info section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Informacion personal
                </h3>

                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Nombre completo *
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    className={inputClasses("full_name")}
                    placeholder="Maria Garcia"
                  />
                  {fieldErrors.full_name && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClasses("email")}
                    placeholder="maria@ejemplo.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={inputClasses("phone")}
                      placeholder="+58 412 123 4567"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="date_of_birth"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Fecha de nacimiento *
                    </label>
                    <input
                      id="date_of_birth"
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        updateField("date_of_birth", e.target.value)
                      }
                      className={inputClasses("date_of_birth")}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {fieldErrors.date_of_birth && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {fieldErrors.date_of_birth}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Genero
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      className={selectClasses("gender")}
                    >
                      <option value="">Selecciona tu genero</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {fieldErrors.gender && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Location section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Ubicacion
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Estado *
                    </label>
                    <div className="relative">
                      <select
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        className={selectClasses("state")}
                      >
                        <option value="">Selecciona un estado</option>
                        {VENEZUELA_STATES.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
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
                      Ciudad *
                    </label>
                    <div className="relative">
                      <select
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className={selectClasses("city")}
                        disabled={!formData.state}
                      >
                        <option value="">
                          {formData.state
                            ? "Selecciona una ciudad"
                            : "Primero selecciona un estado"}
                        </option>
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {fieldErrors.city && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {fieldErrors.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Seguridad
                </h3>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Contrasena *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className={`${inputClasses("password")} pr-12`}
                      placeholder="Minimo 8 caracteres"
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
                  {/* Password strength indicator */}
                  {formData.password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                            style={{
                              width: `${(passwordStrength.score / 6) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
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
                    Confirmar contrasena *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                      }
                      className={`${inputClasses("confirmPassword")} pr-12`}
                      placeholder="Repite tu contrasena"
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
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="mt-1.5 text-sm text-red-600">
                        Las contrasenas no coinciden
                      </p>
                    )}
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) =>
                      updateField("acceptTerms", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <span className="text-sm text-gray-600">
                    Acepto los{" "}
                    <a
                      href="/terminos"
                      target="_blank"
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      terminos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a
                      href="/privacidad"
                      target="_blank"
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      politica de privacidad
                    </a>
                  </span>
                </label>
                {fieldErrors.acceptTerms && (
                  <p className="mt-1.5 text-sm text-red-600 ml-7">
                    {fieldErrors.acceptTerms}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Crear mi cuenta
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
