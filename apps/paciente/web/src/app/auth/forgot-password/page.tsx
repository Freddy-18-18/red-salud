"use client";

import { Loader2, AlertCircle, Mail, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@red-salud/design-system";

import { supabase } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";

// =============================================================================
// /auth/forgot-password — Paciente.
// Logic untouched. Chrome moved to <AuthShell role="paciente" compact>.
// =============================================================================

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>>
  >({});

  const updateField = (
    field: keyof ForgotPasswordFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ForgotPasswordFormData;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
        }
      );

      if (resetError) {
        if (resetError.message.includes("Too many requests")) {
          setError(
            "Demasiados intentos. Esperá unos minutos antes de probar de nuevo."
          );
        } else {
          setError(resetError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        role="paciente"
        compact
        title="Revisá tu correo"
        subtitle="Te mandamos las instrucciones para restablecer tu contraseña."
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: "hsl(var(--accent-domain) / 0.12)",
              color: "hsl(var(--accent-domain))",
            }}
          >
            <Mail className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground mb-4">
            Si tu email está registrado, vas a recibir un enlace para
            restablecer tu contraseña en los próximos minutos.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            ¿No lo ves? Mirá tu carpeta de spam.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({ email: "" });
              }}
              className="w-full py-3 px-4 border border-border text-foreground font-medium rounded-xl hover:bg-muted transition"
            >
              Enviar a otro email
            </button>
            <Link
              href="/auth/login"
              className="block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-center"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      role="paciente"
      compact
      title="Recuperá tu contraseña"
      subtitle="Ingresá tu email y te mandamos un enlace para restablecerla."
      footer={
        <>
          ¿Te acordaste?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-foreground hover:text-[hsl(var(--accent-domain))] transition"
          >
            Volvé a iniciar sesión
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
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

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
            className={`w-full px-4 py-3 border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition ${
              fieldErrors.email ? "border-destructive" : "border-border"
            }`}
            placeholder="tu@email.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-sm text-destructive">
              {fieldErrors.email}
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
              <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" />
              Enviando…
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Enviar enlace de recuperación
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
