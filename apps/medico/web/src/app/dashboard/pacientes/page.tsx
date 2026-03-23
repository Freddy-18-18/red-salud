'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PatientList, type PatientSummary } from '@/components/patients/patient-list';
import { PatientDetail } from '@/components/patients/patient-detail';
import { Users, Plus } from 'lucide-react';

// ============================================================================
// COMPONENT
// ============================================================================

export default function PacientesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      // Get all unique patients from appointments
      const { data: appointmentData, error: aptError } = await supabase
        .from('appointments')
        .select(`
          paciente_id,
          fecha_hora,
          status,
          paciente:profiles!appointments_paciente_id_fkey(
            id,
            nombre_completo,
            cedula,
            telefono,
            fecha_nacimiento,
            avatar_url
          )
        `)
        .eq('medico_id', userId)
        .order('fecha_hora', { ascending: false });

      if (aptError) {
        if (aptError.code === '42P01' || aptError.message?.includes('does not exist')) {
          setPatients([]);
          setLoading(false);
          return;
        }
        throw aptError;
      }

      // Aggregate patient data
      const patientMap = new Map<string, PatientSummary>();

      for (const apt of appointmentData ?? []) {
        if (!apt.paciente_id || !apt.paciente) continue;

        const profile = apt.paciente as unknown as {
          id: string;
          nombre_completo: string;
          cedula: string | null;
          telefono: string | null;
          fecha_nacimiento: string | null;
          avatar_url: string | null;
        };

        const existing = patientMap.get(apt.paciente_id);

        if (existing) {
          existing.total_consultas++;
          // Update last visit
          if (!existing.ultima_visita || apt.fecha_hora > existing.ultima_visita) {
            if (apt.status === 'completed') {
              existing.ultima_visita = apt.fecha_hora;
            }
          }
          // Update next appointment
          const now = new Date().toISOString();
          if (apt.fecha_hora > now && apt.status !== 'cancelled') {
            if (!existing.proxima_cita || apt.fecha_hora < existing.proxima_cita) {
              existing.proxima_cita = apt.fecha_hora;
            }
          }
        } else {
          const now = new Date().toISOString();
          patientMap.set(apt.paciente_id, {
            id: profile.id,
            nombre_completo: profile.nombre_completo,
            cedula: profile.cedula,
            telefono: profile.telefono,
            fecha_nacimiento: profile.fecha_nacimiento,
            avatar_url: profile.avatar_url,
            ultima_visita: apt.status === 'completed' ? apt.fecha_hora : null,
            proxima_cita: apt.fecha_hora > now && apt.status !== 'cancelled' ? apt.fecha_hora : null,
            total_consultas: 1,
          });
        }
      }

      setPatients(Array.from(patientMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

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
