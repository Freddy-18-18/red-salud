'use client';

import { useState } from 'react';
import { Activity, AlertTriangle, Target } from 'lucide-react';
import { cn } from '@red-salud/core/utils';

import type { ChronicPatientSummary } from '@/lib/chronic/patient-resolver';

import { AlertasTab } from './alertas-tab';
import { MetasTab } from './metas-tab';
import { MetricasTab } from './metricas-tab';
import type {
  CreateGoalInput,
  HealthGoalRow,
  PatientDetailState,
} from './use-chronic-data';

type TabKey = 'metricas' | 'metas' | 'alertas';

export interface ChronicPatientDetailProps {
  patient: ChronicPatientSummary;
  detail: PatientDetailState | null;
  detailLoading: boolean;
  onCreateGoal: (input: CreateGoalInput) => Promise<void>;
  onUpdateGoalStatus: (id: string, status: HealthGoalRow['status']) => Promise<void>;
}

const TABS: Array<{ key: TabKey; label: string; icon: typeof Activity }> = [
  { key: 'metricas', label: 'Métricas', icon: Activity },
  { key: 'metas', label: 'Metas', icon: Target },
  { key: 'alertas', label: 'Alertas', icon: AlertTriangle },
];

export function ChronicPatientDetail({
  patient,
  detail,
  detailLoading,
  onCreateGoal,
  onUpdateGoalStatus,
}: ChronicPatientDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('metricas');
  const alertCount = detail?.alerts.length ?? 0;

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            {patient.full_name}
          </h2>
          <p className="text-xs text-gray-500">
            {patient.cedula ? `CI ${patient.cedula} · ` : ''}
            {patient.tags.join(' · ') || 'Sin tags'}
          </p>
        </div>
        {alertCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            <AlertTriangle className="h-3 w-3" />
            {alertCount} alerta{alertCount !== 1 ? 's' : ''}
          </span>
        )}
      </header>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          const isAlerts = t.key === 'alertas';
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                isActive
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {isAlerts && alertCount > 0 && (
                <span className="text-[10px] text-red-600 ml-0.5">{alertCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {detailLoading || !detail ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Cargando…
        </div>
      ) : (
        <div role="tabpanel">
          {activeTab === 'metricas' && (
            <MetricasTab metrics={detail.metrics} metricTypes={detail.metricTypes} />
          )}
          {activeTab === 'metas' && (
            <MetasTab
              patientId={patient.patient_id}
              goals={detail.goals}
              metricTypes={detail.metricTypes}
              onCreateGoal={onCreateGoal}
              onUpdateStatus={onUpdateGoalStatus}
            />
          )}
          {activeTab === 'alertas' && <AlertasTab alerts={detail.alerts} />}
        </div>
      )}
    </div>
  );
}
