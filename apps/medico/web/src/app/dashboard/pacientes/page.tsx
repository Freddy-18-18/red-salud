'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useDoctorAppointments } from '@red-salud/core';
import { PatientList, type PatientSummary } from '@/components/patients/patient-list';
import { PatientDetail } from '@/components/patients/patient-detail';
import { Users, Plus } from 'lucide-react';

// ============================================================================
// COMPONENT
// ============================================================================

export default function PacientesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Fetch all appointments for this doctor via core hook
  const {
    appointments: rawAppointments,
    loading,
    error,
  } = useDoctorAppointments(supabase, userId);

  // Derive unique patients from appointments
  const patients = useMemo<PatientSummary[]>(() => {
    const patientMap = new Map<string, PatientSummary>();
    const now = new Date().toISOString();

    for (const apt of rawAppointments) {
      if (!apt.patient_id || !apt.patient) continue;

      const profile = apt.patient;
      const existing = patientMap.get(apt.patient_id);

      if (existing) {
        existing.total_consultas++;
        // Update last visit
        if (!existing.ultima_visita || apt.scheduled_at > existing.ultima_visita) {
          if (apt.status === 'completed') {
            existing.ultima_visita = apt.scheduled_at;
          }
        }
        // Update next appointment
        if (apt.scheduled_at > now && apt.status !== 'cancelled') {
          if (!existing.proxima_cita || apt.scheduled_at < existing.proxima_cita) {
            existing.proxima_cita = apt.scheduled_at;
          }
        }
      } else {
        patientMap.set(apt.patient_id, {
          id: profile.id,
          nombre_completo: profile.full_name ?? 'Sin nombre',
          cedula: profile.cedula ?? null,
          telefono: profile.telefono ?? null,
          fecha_nacimiento: profile.fecha_nacimiento ?? null,
          avatar_url: profile.avatar_url ?? null,
          ultima_visita: apt.status === 'completed' ? apt.scheduled_at : null,
          proxima_cita:
            apt.scheduled_at > now && apt.status !== 'cancelled'
              ? apt.scheduled_at
              : null,
          total_consultas: 1,
        });
      }
    }

    return Array.from(patientMap.values());
  }, [rawAppointments]);

  // Render detail view
  if (selectedPatientId) {
    return (
      <PatientDetail
        patientId={selectedPatientId}
        onBack={() => setSelectedPatientId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} en tu registro
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Patient list */}
      <PatientList
        patients={patients}
        isLoading={loading}
        onSelect={setSelectedPatientId}
      />
    </div>
  );
}
