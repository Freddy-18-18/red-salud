"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// TODO: Replace with shared RegisterForm from @red-salud/auth-sdk once available
export default function RegisterPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre_completo: "",
    telefono: "",
    cedula: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.nombre_completo,
            telefono: formData.telefono,
            cedula: formData.cedula,
            role: "paciente",
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Crear Cuenta</h1>
          <p className="text-gray-500 mt-1">Red Salud - Portal del Paciente</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium">
              Nombre Completo *
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="telefono" className="text-sm font-medium">
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+58 412..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cedula" className="text-sm font-medium">
                Cédula
              </label>
              <input
                id="cedula"
                type="text"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="V-12345678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña *
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Contraseña *
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repite tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Inicia Sesión
          </a>
        </p>
      </div>
    </main>
  );
}
