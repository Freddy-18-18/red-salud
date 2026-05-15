'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useDoctorAppointments } from '@red-salud/core';
import { PatientList } from '@/components/patients/patient-list';
import type { PatientSummary } from '@red-salud/types';
import { PageHeader } from '@/components/shell';
import { useActiveSede } from '@/hooks/use-active-sede';

export default function PacientesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { activeSedeId } = useActiveSede();

  const {
    appointments: rawAppointments,
    loading,
    error,
  } = useDoctorAppointments(supabase, userId, { locationId: activeSedeId });

  const patients = useMemo<PatientSummary[]>(() => {
    const patientMap = new Map<string, PatientSummary>();
    const now = new Date().toISOString();

    for (const apt of rawAppointments) {
      if (!apt.patient_id || !apt.patient) continue;

      const profile = apt.patient;
      const existing = patientMap.get(apt.patient_id);

      if (existing) {
        existing.total_visits++;
        if (
          apt.status === 'completed' &&
          (!existing.last_visit_at || apt.scheduled_at > existing.last_visit_at)
        ) {
          existing.last_visit_at = apt.scheduled_at;
        }
        if (apt.scheduled_at > now && apt.status !== 'cancelled') {
          if (
            !existing.next_appointment_at ||
            apt.scheduled_at < existing.next_appointment_at
          ) {
            existing.next_appointment_at = apt.scheduled_at;
          }
        }
      } else {
        patientMap.set(apt.patient_id, {
          id: profile.id,
          full_name: profile.full_name ?? 'Sin nombre',
          national_id: profile.cedula ?? null,
          phone: profile.telefono ?? null,
          date_of_birth: profile.fecha_nacimiento ?? null,
          avatar_url: profile.avatar_url ?? null,
          last_visit_at: apt.status === 'completed' ? apt.scheduled_at : null,
          next_appointment_at:
            apt.scheduled_at > now && apt.status !== 'cancelled'
              ? apt.scheduled_at
              : null,
          total_visits: 1,
        });
      }
    }

    return Array.from(patientMap.values());
  }, [rawAppointments]);

  return (
    <div className="space-y-4">
      <PageHeader>
        <PageHeader.Title>Pacientes</PageHeader.Title>
        <PageHeader.Meta>
          {patients.length} paciente{patients.length !== 1 ? 's' : ''} en tu registro
        </PageHeader.Meta>
      </PageHeader>

      {error && patients.length > 0 && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning">
          <p className="font-medium">No pudimos actualizar la lista</p>
          <p className="mt-0.5 text-xs text-warning/80">
            Mostramos la última versión disponible. Reintentá en unos segundos.
          </p>
        </div>
      )}

      <PatientList
        patients={patients}
        isLoading={loading}
        onSelect={(id) => router.push(`/dashboard/pacientes/${id}`)}
      />
    </div>
  );
}
