"use client";

import {
  AlertCircle,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";
import {
  getPasswordStrength,
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";

type Status = "checking" | "ready" | "submitting" | "done" | "no_session";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({});

  // The recovery flow lands here AFTER /auth/confirm exchanged the token
  // for a session. If there is no session we cannot let the user reset
  // anything — kick them back to forgot-password.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setStatus(session ? "ready" : "no_session");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = <K extends keyof ResetPasswordFormData>(
    field: K,
    value: ResetPasswordFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ResetPasswordFormData;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setStatus("submitting");
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) {
        setError(updateError.message);
        setStatus("ready");
        return;
      }

      setStatus("done");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch {
      setError("Ocurrio un error inesperado. Intenta de nuevo.");
      setStatus("ready");
    }
  };

  const strength = getPasswordStrength(formData.password);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-[hsl(var(--background))]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))]">Verificando enlace...</p>
        </div>
      </main>
    );
  }

  if (status === "no_session") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-[hsl(var(--background))]">
        <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
            Enlace invalido o expirado
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
            Solicita un nuevo enlace de recuperacion para restablecer tu
            contrasena.
          </p>
          <Link
            href="/auth/forgot-password"
            className="block w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition text-center"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </main>
    );
  }

  if (status === "done") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-[hsl(var(--background))]">
        <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
            Contrasena actualizada
          </h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Redirigiendo a tu dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-[hsl(var(--background))]">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="h-8 w-8 text-emerald-600 fill-emerald-600" />
          <span className="text-2xl font-bold text-[hsl(var(--foreground))]">Red-Salud</span>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Nueva contrasena
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Elegi una contrasena fuerte. Minimo 12 caracteres con mayusculas,
              minusculas, numeros y simbolos.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
              >
                Nueva contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                    fieldErrors.password ? "border-red-400 dark:border-red-500" : "border-[hsl(var(--border))]"
                  }`}
                  placeholder="Minimo 12 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.password}
                </p>
              )}
              {formData.password.length > 0 && !fieldErrors.password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.score / 6) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Fortaleza: {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
              >
                Confirmar contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                    fieldErrors.confirmPassword ? "border-red-400 dark:border-red-500" : "border-[hsl(var(--border))]"
                  }`}
                  placeholder="Repeti la contrasena"
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Actualizar contrasena
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
