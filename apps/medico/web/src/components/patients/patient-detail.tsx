'use client';

/**
 * @file patient-detail.tsx
 * @description Full-page patient detail view at /dashboard/pacientes/[patientId].
 *
 * Phase 2 rewrite (sdd/medico-pacientes-profesional):
 * - Header from `usePatientFull` (React Query) — no useEffect/setState.
 * - Always-visible `<ClinicalSafetyBanner />` between header and tabs.
 * - 8 tabs: Resumen | Vitales | Consultas | Recetas | Labs | Vacunas | Familia | Info.
 *   Each tab is a self-contained panel that owns its own data lifecycle, so the
 *   parent stays small and tabs can fail independently without taking down the
 *   whole view.
 * - Inline `<EditClinicalFieldsDialog />` driven by `editOpen` state and seeded
 *   from the overview hook (single round-trip, no duplicate fetch).
 *
 * Why tabs as buttons + state instead of a router-driven tab layout:
 *   Tab switching is purely visual — there is no need to deep-link individual
 *   tabs yet. State-based tabs keep the URL stable for the patient and avoid
 *   spurious history entries. If deep-linking lands in Phase 3 we promote to
 *   nested routes.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  FileText,
  FlaskConical,
  Heart,
  Mail,
  MapPin,
  Phone,
  Pill,
  Stethoscope,
  Syringe,
  User,
  Users,
} from 'lucide-react';
import {
  EmptyState as DSEmptyState,
  Skeleton,
} from '@red-salud/design-system';

import { usePatientClinicalOverview } from '@/hooks/use-patient-clinical-overview';
import { usePatientFull } from '@/hooks/use-patient-full';
import { usePatientVitalsTrend } from '@/hooks/use-patient-vitals-trend';

import { ActiveMedicationsCard } from './active-medications-card';
import { ActivePrescriptionsPanel } from './active-prescriptions-panel';
import { ClinicalSafetyBanner } from './clinical-safety-banner';
import { ComputedAlertsPanel } from './computed-alerts-panel';
import { EditClinicalFieldsDialog } from './edit-clinical-fields-dialog';
import { FamilyHistoryPanel } from './family-history-panel';
import { InfoPanel } from './info-panel';
import { LabResultsPanel } from './lab-results-panel';
import { VaccinationsPanel } from './vaccinations-panel';
import { VisitTimeline } from './visit-timeline';
import { VitalsTrendCard } from './vitals-trend-card';

import type { PatientFull, PatientVitalsTrendPoint } from '@red-salud/types';

interface PatientDetailProps {
  patientId: string;
  specialtyCategory?: string;
}

type TabId =
  | 'summary'
  | 'vitals'
  | 'visits'
  | 'rx'
  | 'labs'
  | 'vaccines'
  | 'family'
  | 'info';

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof User;
}

const TABS: TabDef[] = [
  { id: 'summary', label: 'Resumen', icon: Heart },
  { id: 'vitals', label: 'Vitales', icon: Stethoscope },
  { id: 'visits', label: 'Consultas', icon: FileText },
  { id: 'rx', label: 'Recetas', icon: Pill },
  { id: 'labs', label: 'Laboratorios', icon: FlaskConical },
  { id: 'vaccines', label: 'Vacunas', icon: Syringe },
  { id: 'family', label: 'Familia', icon: Users },
  { id: 'info', label: 'Información', icon: User },
];

export function PatientDetail({ patientId }: PatientDetailProps) {
  const router = useRouter();
  const { patient, isLoading, error, refetch } = usePatientFull({ patientId });
  const overviewQuery = usePatientClinicalOverview({ patientId });

  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pacientes
      </button>

      {isLoading ? (
        <HeaderSkeleton />
      ) : error ? (
        <InlineError
          message={
            error.message ?? 'No pudimos cargar al paciente.'
          }
          onRetry={() => void refetch()}
        />
      ) : !patient ? (
        <DSEmptyState
          icon={User}
          title="Paciente no encontrado"
          description="El paciente que estás buscando no existe o no tenés acceso."
          action={{
            label: 'Volver a pacientes',
            onClick: () => router.back(),
          }}
        />
      ) : (
        <>
          <PatientHeader patient={patient} />

          <ClinicalSafetyBanner
            patientId={patientId}
            onEditClick={() => setEditOpen(true)}
          />

          <nav
            aria-label="Secciones del paciente"
            className="flex gap-1 border-b border-border overflow-x-auto"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
          </nav>

          <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            {activeTab === 'summary' && (
              <SummaryTab
                patientId={patientId}
                nextAppointmentAt={
                  overviewQuery.overview?.next_appointment_at ?? null
                }
              />
            )}
            {activeTab === 'vitals' && <VitalsHistoryTab patientId={patientId} />}
            {activeTab === 'visits' && <VisitTimeline patientId={patientId} />}
            {activeTab === 'rx' && (
              <ActivePrescriptionsPanel patientId={patientId} />
            )}
            {activeTab === 'labs' && <LabResultsPanel patientId={patientId} />}
            {activeTab === 'vaccines' && (
              <VaccinationsPanel patientId={patientId} />
            )}
            {activeTab === 'family' && (
              <FamilyHistoryPanel patientId={patientId} />
            )}
            {activeTab === 'info' && <InfoPanel patient={patient} />}
          </div>

          <EditClinicalFieldsDialog
            patientId={patientId}
            open={editOpen}
            onOpenChange={setEditOpen}
            initial={
              overviewQuery.overview
                ? {
                    grupo_sanguineo: overviewQuery.overview.grupo_sanguineo,
                    alergias: overviewQuery.overview.alergias,
                    enfermedades_cronicas:
                      overviewQuery.overview.enfermedades_cronicas,
                    medicamentos_actuales:
                      overviewQuery.overview.medicamentos_actuales,
                    peso_kg: overviewQuery.overview.peso_kg,
                    altura_cm: overviewQuery.overview.altura_cm,
                    notas_medicas: overviewQuery.overview.notas_medicas,
                  }
                : null
            }
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function calculateAge(dob: string | null): string {
  if (!dob) return '--';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '--';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} años`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function PatientHeader({ patient }: { patient: PatientFull }) {
  return (
    <header className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-xl font-bold flex-shrink-0 overflow-hidden">
          {patient.avatar_url ? (
            <img
              src={patient.avatar_url}
              alt={patient.full_name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            initials(patient.full_name)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground truncate">
            {patient.full_name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
            <span>{calculateAge(patient.date_of_birth)}</span>
            {patient.gender && (
              <span className="capitalize">{patient.gender}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground/80">
            {patient.national_id && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> CI {patient.national_id}
              </span>
            )}
            {patient.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {patient.phone}
              </span>
            )}
            {patient.email && (
              <span className="flex items-center gap-1 truncate max-w-xs">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{patient.email}</span>
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
      </div>
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div
        data-testid="patient-detail-skeleton"
        className="bg-card rounded-xl border border-border p-5"
      >
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <Skeleton data-testid="patient-detail-skeleton" className="h-32" />
      <Skeleton data-testid="patient-detail-skeleton" className="h-64" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary tab — composed of alerts + vitals card + active meds + next appt.
// ---------------------------------------------------------------------------

function SummaryTab({
  patientId,
  nextAppointmentAt,
}: {
  patientId: string;
  nextAppointmentAt: string | null;
}) {
  return (
    <div className="space-y-4">
      <ComputedAlertsPanel patientId={patientId} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VitalsTrendCard patientId={patientId} />
        <ActiveMedicationsCard patientId={patientId} />
      </div>
      <NextAppointmentCard nextAppointmentAt={nextAppointmentAt} />
    </div>
  );
}

function NextAppointmentCard({
  nextAppointmentAt,
}: {
  nextAppointmentAt: string | null;
}) {
  return (
    <section className="bg-card rounded-xl border border-border p-5 space-y-2">
      <header className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Próxima cita</h3>
      </header>
      {nextAppointmentAt ? (
        <p className="text-sm text-foreground">
          {new Date(nextAppointmentAt).toLocaleDateString('es-VE', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'America/Caracas',
          })}{' '}
          a las{' '}
          {new Date(nextAppointmentAt).toLocaleTimeString('es-VE', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Caracas',
          })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Este paciente no tiene próximas citas agendadas.
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Vitals history tab — same trend data, plotted as a table with a window
// selector (30 / 90 / 365 days). Phase 3 swaps the table for a recharts plot.
// ---------------------------------------------------------------------------

type VitalsWindow = 30 | 90 | 365;

const VITALS_WINDOWS: Array<{ value: VitalsWindow; label: string }> = [
  { value: 30, label: '30 días' },
  { value: 90, label: '90 días' },
  { value: 365, label: '1 año' },
];

function VitalsHistoryTab({ patientId }: { patientId: string }) {
  const [days, setDays] = useState<VitalsWindow>(30);
  const { vitals, isLoading, error, refetch } = usePatientVitalsTrend({
    patientId,
    days,
  });

  return (
    <div className="space-y-4">
      <VitalsTrendCard patientId={patientId} days={days} />

      <section className="bg-card rounded-xl border border-border p-5 space-y-3">
        <header className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Histórico de mediciones
          </h3>
          <div className="flex gap-1">
            {VITALS_WINDOWS.map((opt) => {
              const isActive = days === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDays(opt.value)}
                  aria-pressed={isActive}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                    isActive
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : error ? (
          <InlineError
            message={error.message ?? 'No pudimos cargar el histórico de vitales.'}
            onRetry={() => void refetch()}
          />
        ) : vitals.length === 0 ? (
          <DSEmptyState
            icon={Stethoscope}
            title="Sin mediciones en este período"
            description={`No tenés signos vitales registrados en los últimos ${days} días.`}
            size="compact"
            className="border-0 bg-transparent"
          />
        ) : (
          <VitalsHistoryTable points={vitals} />
        )}
      </section>
    </div>
  );
}

function VitalsHistoryTable({ points }: { points: PatientVitalsTrendPoint[] }) {
  // Descending by measured_at — most recent first. The hook returns ascending.
  const ordered = [...points].sort(
    (a, b) => Date.parse(b.measured_at) - Date.parse(a.measured_at),
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="text-left font-medium px-3 py-1.5">Fecha</th>
            <th className="text-left font-medium px-3 py-1.5">Métrica</th>
            <th className="text-left font-medium px-3 py-1.5">Valor</th>
            <th className="text-left font-medium px-3 py-1.5">Rango</th>
            <th className="text-left font-medium px-3 py-1.5">Estado</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((point) => {
            const display =
              point.valor_secundario != null
                ? `${point.valor}/${point.valor_secundario}`
                : String(point.valor);
            const rangeLabel =
              point.rango_minimo != null || point.rango_maximo != null
                ? `${point.rango_minimo ?? '--'} - ${point.rango_maximo ?? '--'}`
                : '--';
            const fecha = new Date(point.measured_at).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              timeZone: 'America/Caracas',
            });
            const hora = new Date(point.measured_at).toLocaleTimeString(
              'es-VE',
              {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Caracas',
              },
            );
            const rowCls = point.is_out_of_range
              ? 'bg-destructive/5 text-foreground'
              : 'text-foreground';
            return (
              <tr key={point.id} className={`border-t border-border/30 ${rowCls}`}>
                <td className="px-3 py-1.5 whitespace-nowrap">
                  <span className="block">{fecha}</span>
                  <span className="text-muted-foreground/70">{hora}</span>
                </td>
                <td className="px-3 py-1.5">{point.metric_name}</td>
                <td className="px-3 py-1.5 tabular-nums">
                  {display}{' '}
                  {point.metric_unit && (
                    <span className="text-muted-foreground/70">
                      {point.metric_unit}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {rangeLabel}
                </td>
                <td className="px-3 py-1.5">
                  {point.is_out_of_range ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
                      Fuera de rango
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
                      Normal
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared error block
// ---------------------------------------------------------------------------

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
            Reintentá
          </button>
        )}
      </div>
    </div>
  );
}

