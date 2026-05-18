import { Suspense } from 'react';
import { LoginForm } from './login-form';

export const metadata = { title: 'Ingresar — Red Salud Admin' };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
            Red Salud · Acceso interno
          </p>
          <h1 className="text-2xl font-semibold">Centro de Control</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Solo para personal autorizado. Toda actividad se registra.
          </p>
        </div>
        <Suspense fallback={<div className="text-zinc-500 text-sm">Cargando…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
