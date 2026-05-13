import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/shell/dashboard-shell';
import { buildSupabaseResolverDeps } from '@/lib/capabilities/supabase-deps';
import { lookupModule } from '@/lib/capabilities/module-catalog';
import { resolveDoctorModules } from '@/lib/capabilities/resolver';
import type { ResolverResult } from '@/lib/capabilities/types';
import { createClient } from '@/lib/supabase/server';

const FEATURE_CAPABILITY_ENGINE =
  process.env.FEATURE_CAPABILITY_ENGINE === 'true' ||
  process.env.NEXT_PUBLIC_FEATURE_CAPABILITY_ENGINE === 'true';

/**
 * Maps the first pathname segment under `/dashboard/*` to a Spanish-language
 * module label. Used by the GlobalHeader's third breadcrumb level. Falls back
 * to "Inicio" when the path is exactly `/dashboard` and to the segment name
 * (with a `Configuración` fallback for unknown deep routes) otherwise.
 */
const PATHNAME_MODULE_LABELS: Record<string, string> = {
  '': 'Inicio',
  agenda: 'Agenda',
  pacientes: 'Pacientes',
  consulta: 'Consulta',
  recetas: 'Recetas',
  mensajes: 'Mensajes',
  estadisticas: 'Estadísticas',
  verificacion: 'Verificación',
  configuracion: 'Configuración',
  sedes: 'Sedes',
};

function resolveModuleLabel(pathname: string | null): string {
  if (!pathname) return 'Inicio';
  // Strip `/dashboard` prefix and any trailing slash.
  const stripped = pathname.replace(/^\/dashboard\/?/, '').replace(/\/$/, '');
  if (!stripped) return 'Inicio';
  const [first, second] = stripped.split('/');
  if (first === 'modulos' && second) {
    // Resolve module keys via the capability catalogue (rich label).
    return lookupModule(second).label;
  }
  return PATHNAME_MODULE_LABELS[first] ?? 'Configuración';
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Identity fetch (used by the user-menu & header — always required).
  const { data: doctorDetails } = await supabase
    .from('doctor_profiles')
    .select(`
      profile_id,
      specialty_id,
      specialty:specialties(id, name, slug, icon),
      profile:profiles!doctor_details_profile_id_fkey(
        full_name,
        avatar_url,
        sacs_specialty
      )
    `)
    .eq('profile_id', user.id)
    .maybeSingle();

  const specialty = Array.isArray(doctorDetails?.specialty)
    ? doctorDetails.specialty[0]
    : doctorDetails?.specialty;
  const profileData = Array.isArray(doctorDetails?.profile)
    ? doctorDetails.profile[0]
    : doctorDetails?.profile;
  const doctorName = profileData?.full_name ?? user.email ?? 'Doctor';
  const specialtyName = specialty?.name ?? 'Medicina General';
  const avatarUrl = profileData?.avatar_url ?? null;

  // Capability resolution (Phase 2 — behind feature flag).
  let resolverResult: ResolverResult | null = null;
  if (FEATURE_CAPABILITY_ENGINE) {
    try {
      const deps = buildSupabaseResolverDeps(supabase);
      resolverResult = await resolveDoctorModules(deps, user.id);
    } catch (err) {
      // Resolver failure is non-fatal — shell falls back to STATIC_NAV_GROUPS.
      // eslint-disable-next-line no-console
      console.error('[capability-engine] resolver failed:', err);
    }
  }

  // Resolve the current pathname server-side via headers (App Router doesn't
  // expose `usePathname` in layouts). Next sets `x-invoke-path` (Pages router
  // legacy) and `x-nextjs-url` / `next-url` in middleware; `next-url` is the
  // safest cross-version source. Falls back to "/dashboard" when missing.
  const requestHeaders = await headers();
  const nextUrl =
    requestHeaders.get('next-url') ??
    requestHeaders.get('x-nextjs-url') ??
    requestHeaders.get('x-invoke-path') ??
    '/dashboard';
  const moduleLabel = resolveModuleLabel(nextUrl);

  return (
    <DashboardShell
      doctorName={doctorName}
      email={user.email ?? ''}
      avatarUrl={avatarUrl}
      specialtyName={specialtyName}
      navGroups={resolverResult?.navGroups}
      pinnedModules={resolverResult?.pinnedModules}
      verificationPending={resolverResult?.verificationPending ?? false}
      moduleLabel={moduleLabel}
      attention={resolverResult?.attention}
    >
      {children}
    </DashboardShell>
  );
}
