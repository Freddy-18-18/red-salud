import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { isBootstrapAvailable } from '@/lib/bootstrap/actions';
import { BootstrapButton } from './bootstrap-button';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const metadata = { title: 'Acceso denegado — Red Salud Admin' };

export default async function UnauthorizedPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const canBootstrap = user ? await isBootstrapAvailable() : false;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
          <ShieldAlert className="h-8 w-8 text-red-400" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Acceso denegado</h1>
        <p className="text-zinc-400 mb-6">
          Tu cuenta no tiene permisos para acceder al panel interno de Red Salud.
        </p>

        {canBootstrap && user && (
          <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/5 p-4 text-left">
            <p className="text-sm text-amber-200 font-medium mb-1">Sistema sin admins</p>
            <p className="text-xs text-amber-100/80 mb-3">
              No hay ningún super admin todavía. Si tu email está autorizado en
              <code className="mx-1 px-1 rounded bg-amber-950/60">ADMIN_BOOTSTRAP_EMAILS</code>,
              podés convertirte en el primer super admin ahora.
            </p>
            <BootstrapButton />
          </div>
        )}

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition"
        >
          Volver al login
        </Link>
      </div>
    </main>
  );
}
