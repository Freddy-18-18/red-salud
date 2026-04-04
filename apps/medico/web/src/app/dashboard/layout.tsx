import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from './dashboard-shell';

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

  // Fetch doctor profile for the sidebar
  const { data: doctorDetails } = await supabase
    .from('doctor_profiles')
    .select(`
      profile_id,
      specialty_id,
      specialty:specialties(id, name, slug, icon),
      profile:profiles!doctor_profiles_profile_id_fkey(
        full_name,
        avatar_url,
        sacs_especialidad
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
  const specialtySlug = specialty?.slug ?? null;
  const avatarUrl = profileData?.avatar_url ?? null;
  const sacsEspecialidad = profileData?.sacs_especialidad ?? null;

  return (
    <DashboardShell
      userId={user.id}
      doctorName={doctorName}
      specialtyName={specialtyName}
      specialtySlug={specialtySlug}
      avatarUrl={avatarUrl}
      sacsEspecialidad={sacsEspecialidad}
    >
      {children}
    </DashboardShell>
  );
}
