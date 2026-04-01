'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Pill,
  AlertCircle,
  Mail,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

  const updateEmail = (value: string) => {
    setEmail(value);
    setEmailError(undefined);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(undefined);

    if (!email.trim()) {
      setEmailError('El email es requerido');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Ingresa un email valido');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        }
      );

      if (resetError) {
        if (resetError.message.includes('Too many requests')) {
          setError(
            'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.'
          );
        } else {
          setError(resetError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError('Ocurrio un error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Revisa tu email
          </h1>
          <p className="text-gray-500 mb-6">
            Si existe una cuenta con{' '}
            <span className="font-semibold text-gray-900">{email}</span>,
            recibiras un enlace para restablecer tu contrasena.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            No lo ves? Revisa tu carpeta de spam.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Enviar a otro email
            </button>
            <Link
              href="/auth/login"
              className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-center"
            >
              Volver a Iniciar Sesion
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">Red Salud</span>
            <span className="block text-blue-600 text-xs font-medium -mt-0.5">
              Farmacia
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al login
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Recuperar contrasena
            </h1>
            <p className="text-gray-500 mt-1">
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contrasena.
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
                value={email}
                onChange={(e) => updateEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  emailError ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="tu@farmacia.com"
              />
              {emailError && (
                <p className="mt-1.5 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Enviar enlace de recuperacion
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
