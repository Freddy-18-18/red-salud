'use client';

import { useMemo } from 'react';

import { ModuleWrapper } from '../module-wrapper';
import type { ModuleComponentProps } from '../module-registry';

import { ChronicPatientDetail } from './chronic-patient-detail';
import { ChronicPatientList } from './chronic-patient-list';
import { makeSupabaseChronicDeps } from './supabase-deps';
import { useChronicData, type UseChronicDataDeps } from './use-chronic-data';

interface ChronicMgmtConfig {
  /** Optional dependency override for unit/integration tests. */
  deps?: UseChronicDataDeps;
}

export default function ChronicMgmtModule({
  doctorId,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  const deps = useMemo<UseChronicDataDeps>(
    () => (config as ChronicMgmtConfig | undefined)?.deps ?? makeSupabaseChronicDeps(),
    [config],
  );

  const {
    patients,
    selectedPatient,
    setSelectedPatientId,
    patientDetail,
    loading,
    detailLoading,
    error,
    createGoal,
    updateGoalStatus,
  } = useChronicData(doctorId, deps);

  return (
    <ModuleWrapper
      moduleKey="chronic-mgmt"
      title="Gestión de Crónicos"
      icon="Activity"
      description="Seguimiento longitudinal de pacientes con condiciones crónicas"
      themeColor={themeColor}
      isLoading={loading}
    >
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
        {/* Left panel: patient list */}
        <div className="md:border-r md:border-gray-100 md:pr-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Pacientes ({patients.length})
          </p>
          <ChronicPatientList
            patients={patients}
            selectedPatientId={selectedPatient?.patient_id ?? null}
            onSelect={setSelectedPatientId}
          />
        </div>

        {/* Right panel: detail or empty state */}
        <div>
          {selectedPatient ? (
            <ChronicPatientDetail
              patient={selectedPatient}
              detail={patientDetail}
              detailLoading={detailLoading}
              onCreateGoal={createGoal}
              onUpdateGoalStatus={updateGoalStatus}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-gray-500">
                Seleccioná un paciente crónico para ver su seguimiento
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Métricas, metas y alertas aparecen al elegir un paciente
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </ModuleWrapper>
  );
}
