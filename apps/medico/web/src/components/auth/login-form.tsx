'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { Plus, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// SCHEMA
// ============================================================================

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo valido'),
  password: z.string().min(1, 'Ingresa tu contrasena'),
});

// ============================================================================
// GOOGLE ICON
// ============================================================================

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
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

// ============================================================================
// COMPONENT
// ============================================================================

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Email/Password Login ─────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0] as string;
          if (!errors[path]) errors[path] = issue.message;
        }
        setFieldErrors(errors);
        return;
      }

      setLoading(true);

      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
            setError('Correo o contrasena incorrectos');
          } else if (authError.message.includes('Email not confirmed')) {
            setError(
              'Tu correo aun no ha sido verificado. Revisa tu bandeja de entrada.',
            );
          } else {
            setError(authError.message);
          }
          setLoading(false);
          return;
        }

        window.location.href = '/dashboard';
      } catch {
        setError('Error de conexion. Verifica tu internet e intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    },
    [email, password],
  );

  // ── Google OAuth ─────────────────────────────────────────────────────
  const handleGoogleSignIn = useCallback(async () => {
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
        setError('Error al conectar con Google. Intenta de nuevo.');
        setGoogleLoading(false);
      }
    } catch {
      setError('Error de conexion. Verifica tu internet e intenta de nuevo.');
      setGoogleLoading(false);
    }
  }, []);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Branding */}
      <a href="/" className="flex items-center justify-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
          <Plus className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        <span className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
          Red Salud
        </span>
      </a>

      {/* Card */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Bienvenido de vuelta</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Ingresa a tu consultorio digital
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/10 mb-6">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
            bg-white text-gray-900 font-medium text-sm
            hover:bg-zinc-100 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GoogleIcon className="w-5 h-5" />
          )}
          Continuar con Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider">o</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm text-zinc-300 mb-1.5">
              Correo electronico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="doctor@ejemplo.com"
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-white
                  bg-zinc-900 placeholder:text-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  ${fieldErrors.email ? 'border-red-500/50' : 'border-zinc-700'}`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-sm text-zinc-300">
                Contrasena
              </label>
              <a
                href="/auth/forgot-password"
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Olvidaste tu contrasena?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Tu contrasena"
                autoComplete="current-password"
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl border text-sm text-white
                  bg-zinc-900 placeholder:text-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  ${fieldErrors.password ? 'border-red-500/50' : 'border-zinc-700'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              text-sm font-semibold text-white
              bg-gradient-to-r from-teal-500 to-cyan-500
              hover:from-teal-400 hover:to-cyan-400
              transition-all shadow-lg shadow-teal-500/25
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Iniciar Sesion'
            )}
          </button>
        </form>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-zinc-500 mt-6">
        No tenes cuenta?{' '}
        <a
          href="/auth/register"
          className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
        >
          Registrate gratis
        </a>
      </p>
    </div>
  );
}
