import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/shell/dashboard-shell';
import { resolveModuleLabel } from '@/components/shell/resolve-module-label';
import type { ShellSedeOption } from '@/components/shell/types';
import { buildSupabaseResolverDeps } from '@/lib/capabilities/supabase-deps';
import { resolveDoctorModules } from '@/lib/capabilities/resolver';
import type { ResolverResult } from '@/lib/capabilities/types';
import { firstNameOf, toTitleCaseName } from '@/lib/format/name';
import { OfflineQueryProvider } from '@/lib/offline/offline-query-provider';
import type { DoctorPracticeLocation } from '@/lib/sedes/types';
import { createClient } from '@/lib/supabase/server';

const FEATURE_CAPABILITY_ENGINE =
  process.env.FEATURE_CAPABILITY_ENGINE === 'true' ||
  process.env.NEXT_PUBLIC_FEATURE_CAPABILITY_ENGINE === 'true';

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
      dashboard_config,
      sacs_data,
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
  // SACS persists names in ALL CAPS. Normalize at the presentation boundary
  // (we never mutate the source) so the breadcrumb, greeting, and user menu
  // render "Marianella Suárez Crespo" instead of shouting at the doctor.
  const rawDoctorName = profileData?.full_name ?? user.email ?? 'Doctor';
  const doctorName = toTitleCaseName(rawDoctorName) || rawDoctorName;
  // Extracted server-side so the GlobalHeader's greeting doesn't re-derive it
  // on every render. Falls back to "Doctor" when the name is missing/garbled.
  const doctorFirstName = firstNameOf(doctorName, 'Doctor');
  const specialtyName = specialty?.name ?? 'Medicina General';
  const avatarUrl = profileData?.avatar_url ?? null;

  // Pull additional postgrados from `sacs_data.data.postgrados[*].postgrado`
  // for the specialty chip. Empty / malformed payloads degrade to no extras —
  // the chip renders as a single static pill. The capability resolver does the
  // same extraction for module gating; this branch is only for the chip label.
  const postgrados: string[] = (() => {
    const sacsData = doctorDetails?.sacs_data as
      | { data?: { postgrados?: Array<{ postgrado?: string }> } }
      | null
      | undefined;
    const list = sacsData?.data?.postgrados;
    if (!Array.isArray(list)) return [];
    return list
      .map((row) => (typeof row?.postgrado === 'string' ? row.postgrado.trim() : ''))
      .filter((s) => s.length > 0);
  })();

  // Fallback name for the active sede when `doctor_practice_locations` is empty:
  // the practice_name captured during onboarding lives at
  // `dashboard_config.practice_name`. Used below when there are no sede rows yet.
  const onboardingPracticeName = (() => {
    const config = doctorDetails?.dashboard_config as
      | { practice_name?: string }
      | null
      | undefined;
    return typeof config?.practice_name === 'string' && config.practice_name.trim().length > 0
      ? config.practice_name
      : undefined;
  })();

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

  // Phase 3: fetch the doctor's active sedes for the global header
  // breadcrumb. RLS pins doctor_id = auth.uid(), so the query returns only
  // the caller's own rows. Active sede is resolved via the `active_sede_id`
  // cookie with a fallback to the row marked `is_primary`. Failures degrade
  // gracefully — the breadcrumb falls back to "Sin sede" + no options.
  let sedeOptions: ShellSedeOption[] | undefined;
  let activeSedeName: string | undefined;
  let activeSedeId: string | null = null;
  try {
    const { data: sedeRows } = await supabase
      .from('doctor_practice_locations')
      .select('id,name,is_primary,active')
      .eq('doctor_id', user.id)
      .eq('active', true)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    const sedes = (sedeRows ?? []) as Array<
      Pick<DoctorPracticeLocation, 'id' | 'name' | 'is_primary' | 'active'>
    >;

    if (sedes.length > 0) {
      sedeOptions = sedes.map((s) => ({
        id: s.id,
        label: s.name,
        isPrimary: s.is_primary,
      }));
      const cookieStore = await cookies();
      const cookieActive = cookieStore.get('active_sede_id')?.value;
      const matchByCookie = cookieActive
        ? sedes.find((s) => s.id === cookieActive)
        : undefined;
      const matchByPrimary = sedes.find((s) => s.is_primary);
      const resolved = matchByCookie ?? matchByPrimary ?? sedes[0];
      activeSedeName = resolved?.name;
      activeSedeId = resolved?.id ?? null;
    } else if (onboardingPracticeName) {
      // Bridge until Fase H (multi-sede CRUD) creates a real row in
      // doctor_practice_locations for the onboarding practice.
      activeSedeName = onboardingPracticeName;
    }
  } catch (err) {
    // Non-fatal: the breadcrumb degrades gracefully when the table is missing
    // or RLS rejects (which it shouldn't for the caller's own rows).
    // eslint-disable-next-line no-console
    console.error('[medico/dashboard/layout] sedes prefetch failed', err);
  }

  return (
    <OfflineQueryProvider>
      <DashboardShell
        doctorId={user.id}
        doctorName={doctorName}
        doctorFirstName={doctorFirstName}
        email={user.email ?? ''}
        avatarUrl={avatarUrl}
        specialtyName={specialtyName}
        postgrados={postgrados}
        navGroups={resolverResult?.navGroups}
        pinnedModules={resolverResult?.pinnedModules}
        verificationPending={resolverResult?.verificationPending ?? false}
        sedeName={activeSedeName}
        sedeOptions={sedeOptions}
        activeSedeId={activeSedeId}
        moduleLabel={moduleLabel}
        attention={resolverResult?.attention}
      >
        {children}
      </DashboardShell>
    </OfflineQueryProvider>
  );
}
