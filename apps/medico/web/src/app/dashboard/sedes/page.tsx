import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';

import { SedeCard } from '@/components/sedes/sede-card';
import type { DoctorPracticeLocation } from '@/lib/sedes/types';
import { createClient } from '@/lib/supabase/server';

/**
 * @file app/dashboard/sedes/page.tsx
 * @description Sedes management surface — card grid with map previews.
 *
 * Routes the doctor through the multi-step wizard for create/edit, and shows
 * each existing sede as a rich card with a Leaflet thumbnail. Empty state
 * doubles as a CTA that opens the wizard with the "first sede" path.
 */

export const dynamic = 'force-dynamic';

const SELECT_COLUMNS =
  'id,doctor_id,name,address,city,state,postal_code,phone,latitude,longitude,notes,amenities,arrival_instructions,is_primary,active,created_at,updated_at';

export default async function SedesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: rows } = await supabase
    .from('doctor_practice_locations')
    .select(SELECT_COLUMNS)
    .eq('doctor_id', user.id)
    .eq('active', true)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  const sedes = (rows ?? []) as DoctorPracticeLocation[];
  const hasSedes = sedes.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Sedes</h1>
          <p className="text-sm text-muted-foreground">
            Gestioná tus consultorios — ubicación, datos de contacto y horarios
            de atención.
          </p>
        </div>
        <Link
          href="/dashboard/sedes/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nueva sede
        </Link>
      </header>

      {hasSedes ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sedes.map((sede) => (
            <SedeCard key={sede.id} sede={sede} totalActive={sedes.length} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Building2 className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Aún no tenés sedes registradas</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Configurá tu primer consultorio con su ubicación, datos de contacto y
        horarios de atención. Tus pacientes lo verán al reservar una cita.
      </p>
      <Link
        href="/dashboard/sedes/nueva"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Crear mi primera sede
      </Link>
    </div>
  );
}
