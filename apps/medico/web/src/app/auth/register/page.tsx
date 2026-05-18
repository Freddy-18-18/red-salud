'use client';

import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  UserPlus,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { AuthShell, AuthDivider } from '@red-salud/design-system';

import { supabase } from '@/lib/supabase/client';
import { CURRENT_TERMS_VERSION } from '@/lib/legal/terms';

// =============================================================================
// /auth/register — Médico.
// Refactored for sibling parity with paciente. Auth logic preserved
// (signUp + role: 'medico' metadata), chrome moved to <AuthShell role="medico">.
// =============================================================================

const registerSchema = z.object({
  email: z.string().email('Ingresá un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, 'Debés aceptar los Términos y la Política de Privacidad'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterMedicoPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [success, setSuccess] = useState(false);

  const updateField = <K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      const result = registerSchema.safeParse(formData);
      if (!result.success) {
        const errors: Partial<Record<keyof RegisterFormData, string>> = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0] as keyof RegisterFormData;
          if (!errors[path]) errors[path] = issue.message;
        }
        setFieldErrors(errors);
        return;
      }

      setLoading(true);
      try {
        const { error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: 'medico',
              terms_accepted_at: new Date().toISOString(),
              terms_version: CURRENT_TERMS_VERSION,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) {
          if (authError.message.includes('already registered')) {
            setError(
              'Este correo ya está registrado. Probá iniciar sesión.',
            );
          } else {
            setError(authError.message);
          }
          return;
        }

        setSuccess(true);
      } catch {
        setError('Error de conexión. Revisá tu internet y probá de nuevo.');
      } finally {
        setLoading(false);
      }
    },
    [formData],
  );

  const handleGoogleSignUp = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (oauthError) {
        setError('Error al conectar con Google. Probá de nuevo.');
      }
    } catch {
      setError('Error de conexión. Revisá tu internet y probá de nuevo.');
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  if (success) {
    return (
      <AuthShell
        role="medico"
        compact
        title="Revisá tu correo"
        subtitle="Te mandamos un enlace para activar tu cuenta."
        selectRoleHref={null}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: 'hsl(var(--accent-domain) / 0.12)',
              color: 'hsl(var(--accent-domain))',
            }}
          >
            <Mail className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground mb-6">
            Mandamos un enlace de verificación a{' '}
            <span className="font-semibold text-foreground">
              {formData.email}
            </span>
            . Hacé clic en el enlace para activar tu consultorio digital.
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

  return (
    <AuthShell
      role="medico"
      title="Creá tu consultorio digital"
      subtitle="Empezá gratis, sin tarjeta de crédito."
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
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
        onClick={handleGoogleSignUp}
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
        Registrate con Google
      </button>

      <AuthDivider label="o con tu correo" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className={`w-full px-4 py-3 border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition ${
              fieldErrors.email ? 'border-destructive' : 'border-border'
            }`}
            placeholder="doctor@ejemplo.com"
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
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? 'password-error' : undefined
              }
              className={`w-full px-4 py-3 pr-12 border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition ${
                fieldErrors.password ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
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

        <div className="space-y-1.5">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => updateField('termsAccepted', e.target.checked)}
              aria-invalid={!!fieldErrors.termsAccepted}
              aria-describedby={
                fieldErrors.termsAccepted ? 'terms-error' : undefined
              }
              className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0 cursor-pointer shrink-0"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              Acepto los{' '}
              <Link
                href="/legal/terminos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-medium underline-offset-2 hover:underline"
              >
                Términos de Servicio
              </Link>{' '}
              y la{' '}
              <Link
                href="/legal/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-medium underline-offset-2 hover:underline"
              >
                Política de Privacidad
              </Link>{' '}
              de Red-Salud.
            </span>
          </label>
          {fieldErrors.termsAccepted && (
            <p
              id="terms-error"
              role="alert"
              aria-live="polite"
              className="text-sm text-destructive ml-6"
            >
              {fieldErrors.termsAccepted}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
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
              Crear cuenta
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
