'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { useDoctorProfile } from '@/hooks/use-doctor-profile';
import { ScheduleManager } from '@/components/settings/schedule-manager';
import { ConfigSection } from '@/components/configuracion/config-section';

/**
 * /dashboard/configuracion/horarios
 *
 * Schedule management. Reuses the existing <ScheduleManager> component which
 * handles weekday selection, time blocks, exceptions, and consultation
 * duration. When the doctor changes duration, we persist immediately so the
 * agenda picks it up without a separate save click.
 */
export default function HorariosPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { profile, updateProfile } = useDoctorProfile(userId ?? undefined);

  if (!userId) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
    );
  }

  return (
    <ConfigSection
      icon={Clock}
      title="Horarios de atención"
      description="Definí cuándo estás disponible y cuánto dura cada consulta."
    >
      <ScheduleManager
        doctorId={userId}
        consultationDuration={profile?.consultation_duration ?? 30}
        onDurationChange={(duration) => {
          updateProfile({
            consultation_duration: duration,
          } as Record<string, unknown>);
        }}
      />
    </ConfigSection>
  );
}
