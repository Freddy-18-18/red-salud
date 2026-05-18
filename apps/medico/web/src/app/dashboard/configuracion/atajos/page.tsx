import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';

import { AtajosSettings } from './atajos-settings';

/**
 * @file /dashboard/configuracion/atajos
 * @description Doctor-facing page for customising the Cmd+K palette:
 * which groups and commands appear and in what order. Phase 2 will add
 * keyboard-shortcut capture and custom-URL commands.
 */

export const dynamic = 'force-dynamic';

export default async function AtajosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/configuracion"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a configuración
      </Link>

      <header className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Buscador y atajos</h1>
        <p className="text-sm text-muted-foreground">
          Personalizá qué comandos aparecen en el buscador
          <kbd className="mx-1 rounded border border-border bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
          y en qué orden.
        </p>
      </header>

      <AtajosSettings />
    </div>
  );
}
