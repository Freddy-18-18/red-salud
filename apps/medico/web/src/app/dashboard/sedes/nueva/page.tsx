import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { SedeWizard } from '@/components/sedes/wizard/sede-wizard';
import { createClient } from '@/lib/supabase/server';

/**
 * @file app/dashboard/sedes/nueva/page.tsx
 * @description Wizard entry point for creating a brand new sede.
 *
 * The page is a thin server-component shell — it validates the session,
 * counts existing sedes (used by the wizard to force-primary the first), and
 * mounts the client-side wizard. All form state, geocoding, and submit logic
 * lives inside `<SedeWizard>`.
 */

export const dynamic = 'force-dynamic';

export default async function NuevaSedePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { count } = await supabase
    .from('doctor_practice_locations')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .eq('active', true);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/sedes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a sedes
      </Link>

      <header className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Nueva sede</h1>
        <p className="text-sm text-muted-foreground">
          Configurá tu consultorio en 3 pasos: datos básicos, ubicación y
          horarios.
        </p>
      </header>

      <SedeWizard doctorId={user.id} existingSedeCount={count ?? 0} />
    </div>
  );
}
