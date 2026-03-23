'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Pill,
  Activity,
  User,
  Clock,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface PatientDetailProps {
  patientId: string;
  onBack: () => void;
  themeColor?: string;
  specialtyCategory?: string;
}

interface PatientFull {
  id: string;
  nombre_completo: string;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  cedula: string | null;
  ciudad: string | null;
  estado: string | null;
  avatar_url: string | null;
  genero: string | null;
}

interface ConsultationRecord {
  id: string;
  created_at: string;
  diagnosis: string | null;
  observations: string | null;
}

interface PrescriptionRecord {
  id: string;
  prescribed_at: string;
  diagnosis: string | null;
  status: string;
}

interface AppointmentRecord {
  id: string;
  fecha_hora: string;
  motivo: string | null;
  status: string;
}

// ============================================================================
// TABS DEFINITION
// ============================================================================

type TabId = 'info' | 'history' | 'appointments' | 'prescriptions';

const TABS: Array<{ id: TabId; label: string; icon: typeof User }> = [
  { id: 'info', label: 'Información', icon: User },
  { id: 'history', label: 'Historia', icon: FileText },
  { id: 'appointments', label: 'Citas', icon: Calendar },
  { id: 'prescriptions', label: 'Recetas', icon: Pill },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function PatientDetail({
  patientId,
  onBack,
  themeColor = '#3B82F6',
}: PatientDetailProps) {
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatientData() {
      setLoading(true);

      // Load patient profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();

      if (profileData) {
        setPatient(profileData as unknown as PatientFull);
      }

      // Load consultations
      try {
        const { data: consultData } = await supabase
          .from('medical_records')
          .select('id, created_at, diagnosis, observations')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(20);

        setConsultations((consultData as unknown as ConsultationRecord[]) ?? []);
      } catch {
        // Table might not exist
      }

      // Load prescriptions
      try {
        const { data: rxData } = await supabase
          .from('prescriptions')
          .select('id, prescribed_at, diagnosis, status')
          .eq('patient_id', patientId)
          .order('prescribed_at', { ascending: false })
          .limit(20);

        setPrescriptions((rxData as unknown as PrescriptionRecord[]) ?? []);
      } catch {
        // Table might not exist
      }

      // Load appointments
      try {
        const { data: apptData } = await supabase
          .from('appointments')
          .select('id, fecha_hora, motivo, status')
          .eq('paciente_id', patientId)
          .order('fecha_hora', { ascending: false })
          .limit(20);

        setAppointments((apptData as unknown as AppointmentRecord[]) ?? []);
      } catch {
        // Table might not exist
      }

      setLoading(false);
    }

    loadPatientData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado</p>
        <button onClick={onBack} className="mt-3 text-sm text-blue-600 hover:underline">
          Volver a la lista
        </button>
      </div>
    );
  }

  function calculateAge(dob: string | null): string {
    if (!dob) return '--';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} años`;
  }

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pacientes
      </button>

      {/* Patient header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            {patient.avatar_url ? (
              <img src={patient.avatar_url} alt={patient.nombre_completo} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              patient.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{patient.nombre_completo}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              {patient.cedula && <span>CI: {patient.cedula}</span>}
              <span>{calculateAge(patient.fecha_nacimiento)}</span>
              {patient.genero && <span className="capitalize">{patient.genero}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-400">
              {patient.telefono && (
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {patient.telefono}</span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {patient.email}</span>
              )}
              {(patient.ciudad || patient.estado) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[patient.ciudad, patient.estado].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-gray-400">
            <p>{consultations.length} consultas</p>
            <p>{appointments.length} citas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                ${isActive
                  ? 'border-current text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              style={isActive ? { color: themeColor } : undefined}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Nombre completo" value={patient.nombre_completo} />
            <InfoField label="Cédula" value={patient.cedula} />
            <InfoField label="Fecha de nacimiento" value={patient.fecha_nacimiento ? new Date(patient.fecha_nacimiento).toLocaleDateString('es-VE') : null} />
            <InfoField label="Edad" value={calculateAge(patient.fecha_nacimiento)} />
            <InfoField label="Teléfono" value={patient.telefono} />
            <InfoField label="Email" value={patient.email} />
            <InfoField label="Ciudad" value={patient.ciudad} />
            <InfoField label="Estado" value={patient.estado} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {consultations.length === 0 ? (
              <EmptyState message="Sin registros de consultas" />
            ) : (
              consultations.map((c) => (
                <div key={c.id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                    <Clock className="h-3 w-3" />
                    {new Date(c.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  {c.diagnosis && <p className="text-sm font-medium text-gray-800">{c.diagnosis}</p>}
                  {c.observations && <p className="text-sm text-gray-500 mt-1">{c.observations}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <EmptyState message="Sin citas registradas" />
            ) : (
              appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(a.fecha_hora).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(a.fecha_hora).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{a.motivo ?? 'Sin motivo especificado'}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-3">
            {prescriptions.length === 0 ? (
              <EmptyState message="Sin recetas registradas" />
            ) : (
              prescriptions.map((rx) => (
                <div key={rx.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                  <Pill className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {rx.diagnosis ?? 'Receta sin diagnóstico'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(rx.prescribed_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <StatusBadge status={rx.status} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function InfoField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value ?? '--'}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center">
      <Activity className="h-10 w-10 mx-auto text-gray-300 mb-2" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    confirmed: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    active: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
    expired: 'bg-gray-100 text-gray-500',
  };

  const labels: Record<string, string> = {
    completed: 'Completada',
    confirmed: 'Confirmada',
    scheduled: 'Programada',
    pending: 'Pendiente',
    active: 'Activa',
    cancelled: 'Cancelada',
    expired: 'Expirada',
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {labels[status] ?? status}
    </span>
  );
}
