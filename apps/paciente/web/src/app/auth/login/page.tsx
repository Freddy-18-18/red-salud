"use client";

import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  Heart,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
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
        setError("Error al iniciar sesion con Google. Intenta de nuevo.");
      }
    } catch {
      setError("Error al conectar con Google. Intenta de nuevo.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const updateField = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email o contrasena incorrectos");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Tu cuenta no ha sido verificada. Revisa tu email para confirmar tu cuenta."
          );
        } else if (signInError.message.includes("Too many requests")) {
          setError(
            "Demasiados intentos. Espera unos minutos antes de intentar de nuevo."
          );
        } else {
          setError(signInError.message);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ocurrio un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-10 w-10 fill-white" />
            <span className="text-3xl font-bold">Red-Salud</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Tu salud, en un solo lugar
          </h2>
          <p className="text-lg text-emerald-100 leading-relaxed max-w-md">
            Agenda citas con los mejores especialistas, consulta tu historial
            medico y comunicate con tu doctor desde la comodidad de tu hogar.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-emerald-100">
              <div className="w-2 h-2 bg-emerald-300 rounded-full" />
              <span>Agenda citas en segundos</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-100">
              <div className="w-2 h-2 bg-emerald-300 rounded-full" />
              <span>Historial medico digital</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-100">
              <div className="w-2 h-2 bg-emerald-300 rounded-full" />
              <span>Telemedicina desde tu celular</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[hsl(var(--background))]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Heart className="h-8 w-8 text-emerald-600 fill-emerald-600" />
            <span className="text-2xl font-bold text-[hsl(var(--foreground))]">Red-Salud</span>
          </div>

          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Bienvenido de vuelta
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">
                Ingresa a tu portal del paciente
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-3 px-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium rounded-xl hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
              Iniciar sesion con Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--border))]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[hsl(var(--card))] px-4 text-[hsl(var(--muted-foreground))]">o</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className={`w-full px-4 py-3 border rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                    fieldErrors.email ? "border-red-400 dark:border-red-500" : "border-[hsl(var(--border))]"
                  }`}
                  placeholder="tu@email.com"
                />
                {fieldErrors.email && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

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
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                      fieldErrors.password
                        ? "border-red-400 dark:border-red-500"
                        : "border-[hsl(var(--border))]"
                    }`}
                    placeholder="Tu contrasena"
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
                {fieldErrors.password && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      updateField("rememberMe", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-[hsl(var(--border))] text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">Recordarme</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                >
                  Olvide mi contrasena
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Iniciando sesion...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Iniciar Sesion
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
            No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
            >
              Registrate aqui
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
