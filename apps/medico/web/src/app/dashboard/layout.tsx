import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/shell/dashboard-shell';
import { createClient } from '@/lib/supabase/server';

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

  // Fetch doctor profile for the sidebar (specialty is informational only —
  // Phase 1 chrome is specialty-agnostic per FR-9; the new shell does not
  // compute themeColor or branch on slug).
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

  return (
    <DashboardShell
      doctorName={doctorName}
      email={user.email ?? ''}
      avatarUrl={avatarUrl}
      specialtyName={specialtyName}
    >
      {children}
    </DashboardShell>
  );
}
