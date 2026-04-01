"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  Heart,
  AlertCircle,
  UserPlus,
  Check,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { supabase } from "@/lib/supabase/client";
import {
  simpleRegisterSchema,
  getPasswordStrength,
  type SimpleRegisterFormData,
} from "@/lib/validations/auth";

export default function RegisterPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SimpleRegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string>>
  >({});

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (oauthError) {
        setError("Error al registrarse con Google. Intenta de nuevo.");
      }
    } catch {
      setError("Error al conectar con Google. Intenta de nuevo.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const updateField = (
    field: keyof SimpleRegisterFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = simpleRegisterSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<string, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
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
            role: "paciente",
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
      <main className="flex min-h-screen items-center justify-center p-6 bg-[hsl(var(--background))]">
        <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
            Cuenta creada con exito
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
            Te enviamos un email a{" "}
            <span className="font-semibold text-[hsl(var(--foreground))]">
              {formData.email}
            </span>{" "}
            para verificar tu cuenta. Revisa tu bandeja de entrada y haz clic en
            el enlace de confirmacion.
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
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
    `w-full px-3 py-2 border rounded-xl text-sm bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
      fieldErrors[field]
        ? "border-red-400 dark:border-red-500"
        : "border-[hsl(var(--border))]"
    }`;

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-10 w-10 fill-white" />
            <span className="text-3xl font-bold">Red-Salud</span>
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
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto bg-[hsl(var(--background))]">
        <div className="w-full max-w-md px-4 py-4 sm:px-6">
          {/* Back to landing link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-3">
            <Heart className="h-8 w-8 text-emerald-600 fill-emerald-600" />
            <span className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Red-Salud
            </span>
          </div>

          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
                Crear mi cuenta
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                Solo necesitas un email y una contrasena
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm font-medium rounded-xl hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Registrarse con Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--border))]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[hsl(var(--card))] px-4 text-[hsl(var(--muted-foreground))]">
                  o registrate con email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Email
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
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Contrasena
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                          style={{
                            width: `${(passwordStrength.score / 6) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Confirmar contrasena
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
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
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                      Las contrasenas no coinciden
                    </p>
                  )}
                {fieldErrors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) =>
                      updateField("acceptTerms", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-[hsl(var(--border))] text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    Acepto los{" "}
                    <a
                      href="/seguridad#terminos"
                      target="_blank"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      terminos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a
                      href="/seguridad"
                      target="_blank"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      politica de privacidad
                    </a>
                  </span>
                </label>
                {fieldErrors.acceptTerms && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 ml-7">
                    {fieldErrors.acceptTerms}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-3">
            Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
