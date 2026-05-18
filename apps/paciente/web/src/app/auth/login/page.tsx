"use client";

import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell, AuthDivider } from "@red-salud/design-system";

import { supabase } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

// =============================================================================
// /auth/login — Paciente.
// Authentication LOGIC unchanged from prior version. Chrome + tokens delegated
// to <AuthShell role="paciente">. Bespoke emerald gradient and hand-rolled
// two-column layout removed in favor of the unified Caribbean-Trust shell.
// =============================================================================

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
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
        setError("Error al iniciar sesión con Google. Intentá de nuevo.");
      }
    } catch {
      setError("Error al conectar con Google. Intentá de nuevo.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const updateField = (field: keyof LoginFormData, value: string) => {
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
          setError("Email o contraseña incorrectos");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Tu cuenta no fue verificada. Revisá tu email para confirmar."
          );
        } else if (signInError.message.includes("Too many requests")) {
          setError(
            "Demasiados intentos. Esperá unos minutos antes de probar de nuevo."
          );
        } else {
          setError(signInError.message);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      role="paciente"
      title="Iniciá sesión"
      subtitle="Ingresá a tu portal del paciente"
      footer={
        <>
          ¿No tenés cuenta?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-foreground hover:text-[hsl(var(--accent-domain))] transition"
          >
            Registrate acá
          </Link>
        </>
      }
    >
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-4 bg-destructive-soft border border-destructive/20 rounded-xl flex items-start gap-3"
        >
          <AlertCircle
            aria-hidden="true"
            className="h-5 w-5 text-destructive shrink-0 mt-0.5"
          />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full py-3 px-4 bg-card border border-border text-foreground font-medium rounded-xl hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {googleLoading ? (
          <Loader2
            aria-hidden="true"
            className="h-5 w-5 animate-spin motion-reduce:animate-none"
          />
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        Continuá con Google
      </button>

      <AuthDivider label="o con tu correo" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-1.5"
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
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={`w-full px-4 py-3 border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition ${
              fieldErrors.email ? "border-destructive" : "border-border"
            }`}
            placeholder="tu@email.com"
          />
          {fieldErrors.email && (
            <p
              id="email-error"
              role="alert"
              aria-live="polite"
              className="mt-1.5 text-sm text-destructive"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              className={`w-full px-4 py-3 pr-12 border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition ${
                fieldErrors.password ? "border-destructive" : "border-border"
              }`}
              placeholder="Tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Eye aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p
              id="password-error"
              role="alert"
              aria-live="polite"
              className="mt-1.5 text-sm text-destructive"
            >
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-[hsl(var(--accent-domain))] hover:underline"
          >
            Olvidé mi contraseña
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2
                aria-hidden="true"
                className="h-5 w-5 animate-spin motion-reduce:animate-none"
              />
              Iniciando sesión…
            </>
          ) : (
            <>
              <LogIn aria-hidden="true" className="h-5 w-5" />
              Iniciar sesión
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

// -----------------------------------------------------------------------------
// Inline Google icon — kept local so AuthShell stays brand-mark-only.
// -----------------------------------------------------------------------------
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
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
  );
}
