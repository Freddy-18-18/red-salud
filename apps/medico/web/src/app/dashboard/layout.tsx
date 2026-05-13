import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/shell/dashboard-shell';
import { buildSupabaseResolverDeps } from '@/lib/capabilities/supabase-deps';
import { resolveDoctorModules } from '@/lib/capabilities/resolver';
import type { ResolverResult } from '@/lib/capabilities/types';
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

  return (
    <DashboardShell
      doctorName={doctorName}
      email={user.email ?? ''}
      avatarUrl={avatarUrl}
      specialtyName={specialtyName}
      navGroups={resolverResult?.navGroups}
      pinnedModules={resolverResult?.pinnedModules}
      verificationPending={resolverResult?.verificationPending ?? false}
    >
      {children}
    </DashboardShell>
  );
}
