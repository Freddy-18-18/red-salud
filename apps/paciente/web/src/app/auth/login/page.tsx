"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  Heart,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
            <span className="text-3xl font-bold">Red Salud</span>
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Heart className="h-8 w-8 text-emerald-600 fill-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">Red Salud</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido de vuelta
              </h1>
              <p className="text-gray-500 mt-1">
                Ingresa a tu portal del paciente
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  required
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                    fieldErrors.email ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="tu@email.com"
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                      fieldErrors.password
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                    placeholder="Tu contrasena"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      updateField("rememberMe", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-600">Recordarme</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
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

          <p className="text-center text-sm text-gray-500 mt-6">
            No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Registrate aqui
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
