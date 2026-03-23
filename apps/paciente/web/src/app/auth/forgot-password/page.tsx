"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import {
  ArrowLeft,
  Loader2,
  Heart,
  AlertCircle,
  Mail,
  Check,
} from "lucide-react";

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
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        }
      );

      if (resetError) {
        if (resetError.message.includes("Too many requests")) {
          setError(
            "Demasiados intentos. Espera unos minutos antes de intentar de nuevo."
          );
        } else {
          setError(resetError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ocurrio un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Revisa tu email
          </h1>
          <p className="text-gray-600 mb-6">
            Si existe una cuenta con{" "}
            <span className="font-semibold text-gray-900">
              {formData.email}
            </span>
            , recibiras un enlace para restablecer tu contrasena.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            No lo ves? Revisa tu carpeta de spam.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({ email: "" });
              }}
              className="w-full py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Enviar a otro email
            </button>
            <Link
              href="/auth/login"
              className="block w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition text-center"
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
          <Heart className="h-8 w-8 text-emerald-600 fill-emerald-600" />
          <span className="text-2xl font-bold text-gray-900">Red Salud</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
