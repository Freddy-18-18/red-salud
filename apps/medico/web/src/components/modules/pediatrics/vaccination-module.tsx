'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Syringe,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useVaccinations,
  type VaccineScheduleStatus,
  type CreateVaccinationRecord,
} from './use-vaccinations';
import { VaccinationForm } from './vaccination-form';
import { VaccinationCard } from './vaccination-card';
import {
  getStatusColor,
  getStatusLabel,
  formatAge,
  type VaccineStatus,
} from './vaccination-schedule';

// ============================================================================
// STATUS FILTER CONFIG
// ============================================================================

const STATUS_FILTERS: Array<{
  key: VaccineStatus | 'all';
  label: string;
  icon: typeof CheckCircle;
}> = [
  { key: 'all', label: 'Todas', icon: Syringe },
  { key: 'overdue', label: 'Vencidas', icon: AlertTriangle },
  { key: 'pending', label: 'Pendientes', icon: Clock },
  { key: 'upcoming', label: 'Próximas', icon: Clock },
  { key: 'administered', label: 'Aplicadas', icon: CheckCircle },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function VaccinationModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#22c55e',
}: ModuleComponentProps) {
  // State
  const [showForm, setShowForm] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [filterStatus, setFilterStatus] = useState<VaccineStatus | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preselected, setPreselected] = useState<{
    vaccineId?: string;
    dose?: number;
  }>({});

  // Patient info from config
  const effectivePatientId = patientId ?? (config?.patientId as string | undefined);
  const patientDob = config?.patientDob as string | undefined;
  const patientSex = (config?.patientSex as 'male' | 'female') ?? 'male';
  const patientName = (config?.patientName as string) ?? 'Paciente';

  // Data
  const {
    records,
    scheduleStatus,
    loading,
    error,
    addRecord,
    stats,
    refresh,
  } = useVaccinations(doctorId, {
    patientId: effectivePatientId,
    patientDob,
    patientSex,
  });

  // ── Filtered schedule ───────────────────────────────────────────────────

  const filteredSchedule = useMemo(() => {
    if (filterStatus === 'all') return scheduleStatus;
    return scheduleStatus.filter((s) => s.status === filterStatus);
  }, [scheduleStatus, filterStatus]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAddVaccine = useCallback(
    async (data: CreateVaccinationRecord) => {
      setIsSubmitting(true);
      const result = await addRecord(data);
      setIsSubmitting(false);
      if (result) {
        setShowForm(false);
        setPreselected({});
      }
    },
    [addRecord],
  );

  const handleRecordDose = useCallback(
    (item: VaccineScheduleStatus) => {
      setPreselected({
        vaccineId: item.vaccineId,
        dose: item.doseNumber,
      });
      setShowForm(true);
    },
    [],
  );

  // ── Module actions ──────────────────────────────────────────────────────

  const moduleActions = [
    {
      label: 'Carnet',
      onClick: () => setShowCard(true),
      icon: CreditCard,
      variant: 'outline' as const,
    },
    {
      label: 'Registrar vacuna',
      onClick: () => {
        setPreselected({});
        setShowForm(true);
      },
      icon: Plus,
    },
  ];

  // ── Vaccination card view ───────────────────────────────────────────────

  if (showCard) {
    return (
      <ModuleWrapper
        moduleKey="pediatrics-vaccinations"
        title="Carnet de Vacunación"
        icon="Syringe"
        themeColor={themeColor}
      >
        <VaccinationCard
          patientName={patientName}
          patientDob={patientDob}
          patientSex={patientSex}
          records={records}
          themeColor={themeColor}
          onClose={() => setShowCard(false)}
        />
      </ModuleWrapper>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────

  if (showForm && effectivePatientId) {
    return (
      <ModuleWrapper
        moduleKey="pediatrics-vaccinations"
        title="Registrar Vacunación"
        icon="Syringe"
        themeColor={themeColor}
      >
        <VaccinationForm
          patientId={effectivePatientId}
          preselectedVaccineId={preselected.vaccineId}
          preselectedDose={preselected.dose}
          onSubmit={handleAddVaccine}
          onCancel={() => {
            setShowForm(false);
            setPreselected({});
          }}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Main schedule view ──────────────────────────────────────────────────

  return (
    <ModuleWrapper
      moduleKey="pediatrics-vaccinations"
      title="Vacunación"
      icon="Syringe"
      description="Esquema de vacunación PAI — Venezuela"
      themeColor={themeColor}
      isEmpty={!loading && scheduleStatus.length === 0}
      emptyMessage="Configure fecha de nacimiento y sexo del paciente para ver el esquema."
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Stats ───────────────────────────────────────────────────── */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          <StatCard
            label="Aplicadas"
            value={stats.administered}
            total={stats.total}
            color="#22c55e"
          />
          <StatCard
            label="Pendientes"
            value={stats.pending}
            total={stats.total}
            color="#eab308"
          />
          <StatCard
            label="Vencidas"
            value={stats.overdue}
            total={stats.total}
            color="#ef4444"
          />
          <StatCard
            label="Próximas"
            value={stats.upcoming}
            total={stats.total}
            color="#9ca3af"
          />
        </div>
      )}

      {/* ── Status filters ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilterStatus(f.key)}
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
              filterStatus === f.key
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              filterStatus === f.key ? { backgroundColor: themeColor } : undefined
            }
          >
            {f.label}
            {f.key !== 'all' && (
              <span className="ml-1 opacity-70">
                ({f.key === 'overdue'
                  ? stats.overdue
                  : f.key === 'pending'
                    ? stats.pending
                    : f.key === 'upcoming'
                      ? stats.upcoming
                      : stats.administered})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Vaccine schedule list ───────────────────────────────────── */}
      <div className="space-y-1.5">
        {filteredSchedule.map((item) => (
          <VaccineRow
            key={`${item.vaccineId}-${item.doseNumber}`}
            item={item}
            themeColor={themeColor}
            onRecord={() => handleRecordDose(item)}
          />
        ))}

        {filteredSchedule.length === 0 && !loading && (
          <p className="text-center text-sm text-gray-400 py-6">
            No hay vacunas con este estado
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="p-2.5 rounded-lg border border-gray-100">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-end gap-1 mt-1">
        <span className="text-lg font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-xs text-gray-300 mb-0.5">/{total}</span>
      </div>
      <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// VACCINE ROW
// ============================================================================

function VaccineRow({
  item,
  themeColor,
  onRecord,
}: {
  item: VaccineScheduleStatus;
  themeColor: string;
  onRecord: () => void;
}) {
  const statusColor = getStatusColor(item.status);
  const statusLabel = getStatusLabel(item.status);

  const StatusIcon =
    item.status === 'administered'
      ? CheckCircle
      : item.status === 'overdue'
        ? AlertTriangle
        : item.status === 'contraindicated'
          ? XCircle
          : Clock;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors">
      {/* Status indicator */}
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${statusColor}15` }}
      >
        <StatusIcon
          className="h-4 w-4"
          style={{ color: statusColor }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-700 truncate">
            {item.vaccineName}
          </p>
          <span className="text-xs text-gray-400 shrink-0">
            {item.doseLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">
            Edad rec.: {formatAge(item.recommendedAgeMonths)}
          </span>
          {item.dateAdministered && (
            <span className="text-xs text-gray-400">
              | {new Date(item.dateAdministered).toLocaleDateString('es-VE')}
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
        style={{
          backgroundColor: `${statusColor}15`,
          color: statusColor,
        }}
      >
        {statusLabel}
      </span>

      {/* Action */}
      {item.status !== 'administered' && item.status !== 'contraindicated' && (
        <button
          type="button"
          onClick={onRecord}
          className="text-xs font-medium px-2.5 py-1 rounded-lg text-white shrink-0 transition-colors hover:opacity-90"
          style={{ backgroundColor: themeColor }}
        >
          Registrar
        </button>
      )}
    </div>
  );
}
