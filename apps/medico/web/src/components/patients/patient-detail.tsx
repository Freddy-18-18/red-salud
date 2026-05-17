'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { usePatientAppointments } from '@red-salud/core';
import { EmptyState as DSEmptyState } from '@red-salud/design-system';
import type { PatientFull } from '@red-salud/types';
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
  AlertCircle,
} from 'lucide-react';

interface PatientDetailProps {
  patientId: string;
  specialtyCategory?: string;
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
  scheduled_at: string;
  reason: string | null;
  status: string;
}

type TabId = 'info' | 'history' | 'appointments' | 'prescriptions';

const TABS: Array<{ id: TabId; label: string; icon: typeof User }> = [
  { id: 'info', label: 'Información', icon: User },
  { id: 'history', label: 'Historia', icon: FileText },
  { id: 'appointments', label: 'Citas', icon: Calendar },
  { id: 'prescriptions', label: 'Recetas', icon: Pill },
];

export function PatientDetail({ patientId }: PatientDetailProps) {
  const router = useRouter();

  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [consultationsError, setConsultationsError] = useState<string | null>(
    null,
  );
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [prescriptionsError, setPrescriptionsError] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [loading, setLoading] = useState(true);

  const {
    appointments: rawPatientAppointments,
    loading: appointmentsLoading,
  } = usePatientAppointments(supabase, patientId);

  const appointments = useMemo<AppointmentRecord[]>(
    () =>
      rawPatientAppointments.slice(0, 20).map((apt) => ({
        id: apt.id,
        scheduled_at: apt.scheduled_at,
        reason: apt.reason ?? null,
        status: apt.status,
      })),
    [rawPatientAppointments],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPatientData() {
      setLoading(true);
      setConsultationsError(null);
      setPrescriptionsError(null);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();

      if (cancelled) return;
      setPatient(profileData ? (profileData as unknown as PatientFull) : null);

      const consultResult = await supabase
        .from('medical_records')
        .select('id, created_at, diagnosis, observations')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (cancelled) return;
      if (consultResult.error) {
        setConsultations([]);
        setConsultationsError(
          'No pudimos cargar las consultas. Reintentá en unos segundos.',
        );
      } else {
        setConsultations(
          (consultResult.data as unknown as ConsultationRecord[]) ?? [],
        );
      }

      const rxResult = await supabase
        .from('prescriptions')
        .select('id, prescribed_at, diagnosis, status')
        .eq('patient_id', patientId)
        .order('prescribed_at', { ascending: false })
        .limit(20);

      if (cancelled) return;
      if (rxResult.error) {
        setPrescriptions([]);
        setPrescriptionsError(
          'No pudimos cargar las recetas. Reintentá en unos segundos.',
        );
      } else {
        setPrescriptions(
          (rxResult.data as unknown as PrescriptionRecord[]) ?? [],
        );
      }

      setLoading(false);
    }

    loadPatientData();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (loading || appointmentsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div
          data-testid="patient-detail-skeleton"
          className="h-8 w-48 bg-muted rounded"
        />
        <div
          data-testid="patient-detail-skeleton"
          className="h-24 bg-muted rounded-xl"
        />
        <div
          data-testid="patient-detail-skeleton"
          className="h-64 bg-muted rounded-xl"
        />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Paciente no encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-3 text-sm text-primary hover:underline"
        >
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
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pacientes
      </button>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-xl font-bold flex-shrink-0">
            {patient.avatar_url ? (
              <img
                src={patient.avatar_url}
                alt={patient.full_name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              patient.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {patient.full_name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              {patient.national_id && <span>CI: {patient.national_id}</span>}
              <span>{calculateAge(patient.date_of_birth)}</span>
              {patient.gender && (
                <span className="capitalize">{patient.gender}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground/70">
              {patient.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {patient.phone}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {patient.email}
                </span>
              )}
              {(patient.city || patient.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[patient.city, patient.state].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground/70">
            <p>{consultations.length} consultas</p>
            <p>{appointments.length} citas</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Nombre completo" value={patient.full_name} />
            <InfoField label="Cédula" value={patient.national_id} />
            <InfoField
              label="Fecha de nacimiento"
              value={
                patient.date_of_birth
                  ? new Date(patient.date_of_birth).toLocaleDateString(
                      'es-VE',
                      { timeZone: 'America/Caracas' },
                    )
                  : null
              }
            />
            <InfoField
              label="Edad"
              value={calculateAge(patient.date_of_birth)}
            />
            <InfoField label="Teléfono" value={patient.phone} />
            <InfoField label="Email" value={patient.email} />
            <InfoField label="Ciudad" value={patient.city} />
            <InfoField label="Estado" value={patient.state} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {consultationsError ? (
              <InlineError
                message={consultationsError}
                onRetry={() => router.refresh()}
              />
            ) : consultations.length === 0 ? (
              <EmptyState message="Sin registros de consultas" />
            ) : (
              consultations.map((c) => (
                <div
                  key={c.id}
                  className="p-3 border border-border/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mb-1.5">
                    <Clock className="h-3 w-3" />
                    {new Date(c.created_at).toLocaleDateString('es-VE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'America/Caracas',
                    })}
                  </div>
                  {c.diagnosis && (
                    <p className="text-sm font-medium text-foreground">
                      {c.diagnosis}
                    </p>
                  )}
                  {c.observations && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {c.observations}
                    </p>
                  )}
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
                <div
                  key={a.id}
                  className="flex items-center gap-4 p-3 border border-border/50 rounded-lg"
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-bold text-foreground">
                      {new Date(a.scheduled_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: 'short',
                        timeZone: 'America/Caracas',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {new Date(a.scheduled_at).toLocaleTimeString('es-VE', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Caracas',
                      })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/90">
                      {a.reason ?? 'Sin motivo especificado'}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-3">
            {prescriptionsError ? (
              <InlineError
                message={prescriptionsError}
                onRetry={() => router.refresh()}
              />
            ) : prescriptions.length === 0 ? (
              <EmptyState message="Sin recetas registradas" />
            ) : (
              prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center gap-4 p-3 border border-border/50 rounded-lg"
                >
                  <Pill className="h-5 w-5 text-muted-foreground/70" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {rx.diagnosis ?? 'Receta sin diagnóstico'}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {new Date(rx.prescribed_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'America/Caracas',
                      })}
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

function InfoField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground/70 mb-0.5">
        {label}
      </p>
      <p className="text-sm text-foreground">{value ?? '--'}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <DSEmptyState
      icon={Activity}
      title={message}
      size="compact"
      className="border-0 bg-transparent"
    />
  );
}

function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-destructive">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center text-xs font-medium text-destructive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-success/10 text-success',
    confirmed: 'bg-info/10 text-info',
    scheduled: 'bg-info/10 text-info',
    pending: 'bg-warning/10 text-warning',
    active: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
    expired: 'bg-muted text-muted-foreground',
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
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
        styles[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
