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
    .from('doctor_details')
    .select(`
      profile_id,
      especialidad_id,
      especialidad:specialties(id, name, slug, icon),
      profile:profiles!doctor_details_profile_id_fkey(
        nombre_completo,
        avatar_url,
        sacs_especialidad
      )
    `)
    .eq('profile_id', user.id)
    .maybeSingle();

  const especialidad = Array.isArray(doctorDetails?.especialidad)
    ? doctorDetails.especialidad[0]
    : doctorDetails?.especialidad;
  const profileData = Array.isArray(doctorDetails?.profile)
    ? doctorDetails.profile[0]
    : doctorDetails?.profile;
  const doctorName = profileData?.nombre_completo ?? user.email ?? 'Doctor';
  const specialtyName = especialidad?.name ?? 'Medicina General';
  const specialtySlug = especialidad?.slug ?? null;
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
