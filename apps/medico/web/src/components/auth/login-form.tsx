'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// SCHEMA
// ============================================================================

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electronico valido'),
  password: z.string().min(1, 'Ingresa tu contrasena'),
});

// ============================================================================
// COMPONENT
// ============================================================================

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      // Validate
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0] as string;
          if (!errors[path]) {
            errors[path] = issue.message;
          }
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
              'Tu correo aun no ha sido verificado. Revisa tu bandeja de entrada.'
            );
          } else {
            setError(authError.message);
          }
          setLoading(false);
          return;
        }

        // Redirect to dashboard on success
        window.location.href = '/dashboard';
      } catch {
        setError('Error de conexion. Verifica tu internet e intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    },
    [email, password]
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Red Salud — Consultorio Medico
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo electronico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
              Contrasena
            </label>
            <a
              href="/auth/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Olvide mi contrasena
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              className={`w-full pl-10 pr-12 py-2.5 rounded-xl border text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Recordarme
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
            text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700
            transition-colors shadow-sm disabled:bg-gray-300 disabled:text-gray-500"
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

      {/* Register link */}
      <div className="text-center mt-6 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          No tienes cuenta?{' '}
          <a
            href="/auth/register"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Registrate como medico
          </a>
        </p>
      </div>
    </div>
  );
}
