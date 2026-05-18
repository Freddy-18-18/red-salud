"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  UserPlus,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { AuthShell, AuthDivider } from "@red-salud/design-system";

import { supabase } from "@/lib/supabase/client";
import {
  simpleRegisterSchema,
  getPasswordStrength,
  type SimpleRegisterFormData,
} from "@/lib/validations/auth";

// =============================================================================
// /auth/register — Paciente.
// Auth logic preserved as-is. Chrome moved to <AuthShell>. Bespoke emerald
// gradient + 2-col layout removed; success state now uses the compact shell.
// =============================================================================

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
        setError("Error al registrarte con Google. Intentá de nuevo.");
      }
    } catch {
      setError("Error al conectar con Google. Intentá de nuevo.");
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
            "Ya existe una cuenta con este email. Probá iniciar sesión."
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
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthShell
        role="paciente"
        compact
        title="¡Cuenta creada!"
        subtitle="Te enviamos un correo de verificación."
        selectRoleHref={null}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: "hsl(var(--accent-domain) / 0.12)",
              color: "hsl(var(--accent-domain))",
            }}
          >
            <Check aria-hidden="true" className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground mb-4">
            Te mandamos un email a{" "}
            <span className="font-semibold text-foreground">
              {formData.email}
            </span>{" "}
            para verificar tu cuenta. Revisá tu bandeja y hacé clic en el enlace
            de confirmación.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            ¿No lo ves? Mirá la carpeta de spam.
          </p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </AuthShell>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────
  const inputClasses = (field: string) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition ${
      fieldErrors[field] ? "border-destructive" : "border-border"
    }`;

  return (
    <AuthShell
      role="paciente"
      title="Creá tu cuenta"
      subtitle="Solo necesitás un email y una contraseña."
      footer={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-foreground hover:text-[hsl(var(--accent-domain))] transition"
          >
            Iniciá sesión
          </Link>
        </>
      }
    >
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-3 bg-destructive-soft border border-destructive/20 rounded-xl flex items-start gap-2"
        >
          <AlertCircle
            aria-hidden="true"
            className="h-4 w-4 text-destructive shrink-0 mt-0.5"
          />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full py-2.5 px-4 bg-card border border-border text-foreground text-sm font-medium rounded-xl hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {googleLoading ? (
          <Loader2
            aria-hidden="true"
            className="h-5 w-5 animate-spin motion-reduce:animate-none"
          />
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        Registrate con Google
      </button>

      <AuthDivider label="o registrate con tu correo" />

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email */}
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
            className={inputClasses("email")}
            placeholder="maria@ejemplo.com"
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

        {/* Password */}
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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              className={`${inputClasses("password")} pr-12`}
              placeholder="Mínimo 12 caracteres con un símbolo"
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
          {formData.password.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                    style={{
                      width: `${(passwordStrength.score / 6) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
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

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              aria-invalid={
                !!fieldErrors.confirmPassword ||
                (!!formData.confirmPassword &&
                  formData.password !== formData.confirmPassword)
              }
              aria-describedby={
                fieldErrors.confirmPassword ||
                (formData.confirmPassword &&
                  formData.password !== formData.confirmPassword)
                  ? "confirmPassword-error"
                  : undefined
              }
              className={`${inputClasses("confirmPassword")} pr-12`}
              placeholder="Repetí tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? "Ocultar confirmación de contraseña"
                  : "Mostrar confirmación de contraseña"
              }
              aria-pressed={showConfirmPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              {showConfirmPassword ? (
                <EyeOff aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Eye aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <p
                id="confirmPassword-error"
                role="alert"
                aria-live="polite"
                className="mt-1.5 text-sm text-destructive"
              >
                Las contraseñas no coinciden
              </p>
            )}
          {fieldErrors.confirmPassword && (
            <p
              id="confirmPassword-error"
              role="alert"
              aria-live="polite"
              className="mt-1.5 text-sm text-destructive"
            >
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
              onChange={(e) => updateField("acceptTerms", e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-ring mt-0.5"
            />
            <span className="text-sm text-muted-foreground">
              Acepto los{" "}
              <a
                href="/seguridad#terminos"
                target="_blank"
                className="font-medium text-foreground hover:text-[hsl(var(--accent-domain))] underline"
              >
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a
                href="/seguridad"
                target="_blank"
                className="font-medium text-foreground hover:text-[hsl(var(--accent-domain))] underline"
              >
                política de privacidad
              </a>
            </span>
          </label>
          {fieldErrors.acceptTerms && (
            <p
              role="alert"
              aria-live="polite"
              className="mt-1.5 text-sm text-destructive ml-7"
            >
              {fieldErrors.acceptTerms}
            </p>
          )}
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
              Creando cuenta…
            </>
          ) : (
            <>
              <UserPlus aria-hidden="true" className="h-5 w-5" />
              Crear mi cuenta
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

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
