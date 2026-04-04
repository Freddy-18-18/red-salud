'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  ChevronRight,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Badge, Progress } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useTreatmentPlans,
  type TreatmentPlan,
  type CreateTreatmentPlan,
  type TreatmentPlanStatus,
} from './use-treatment-plans';
import { TreatmentPlanEditor } from './treatment-plan-editor';
import { TreatmentPlanTimeline } from './treatment-plan-timeline';

// ============================================================================
// STATUS MAP
// ============================================================================

const STATUS_CONFIG: Record<TreatmentPlanStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  proposed: { label: 'Propuesto', variant: 'default' },
  accepted: { label: 'Aceptado', variant: 'outline' },
  in_progress: { label: 'En progreso', variant: 'default' },
  completed: { label: 'Completado', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlansModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  // State
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<TreatmentPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Whether to show tooth field (dental specialties)
  const showToothField = (config?.showToothField as boolean) ??
    (specialtySlug.includes('odontologia') ||
    specialtySlug.includes('dental'));

  // Data
  const { plans, loading, error, createPlan, refresh } = useTreatmentPlans(
    doctorId,
    {
      patientId,
      status: filterStatus === 'all' ? undefined : filterStatus,
      limit: 50,
    },
  );

  // Filtered plans
  const filteredPlans = useMemo(() => {
    if (filterStatus === 'all') return plans;
    return plans.filter((p) => p.status === filterStatus);
  }, [plans, filterStatus]);

  // Handlers
  const handleCreate = useCallback(
    async (data: CreateTreatmentPlan) => {
      setIsSubmitting(true);
      const result = await createPlan(data);
      setIsSubmitting(false);
      if (result) {
        setShowEditor(false);
      }
    },
    [createPlan],
  );

  // Module actions
  const moduleActions = [
    {
      label: 'Nuevo plan',
      onClick: () => setShowEditor(true),
      icon: Plus,
    },
  ];

  // If viewing plan timeline
  if (viewingPlan) {
    return (
      <ModuleWrapper
        moduleKey="treatment-plans"
        title={viewingPlan.title}
        icon="FileText"
        themeColor={themeColor}
        actions={[
          {
            label: 'Volver',
            onClick: () => setViewingPlan(null),
            variant: 'outline',
          },
        ]}
      >
        <TreatmentPlanTimeline
          plan={viewingPlan}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // If showing editor
  if (showEditor) {
    return (
      <ModuleWrapper
        moduleKey="treatment-plans"
        title="Nuevo Plan de Tratamiento"
        icon="FileText"
        themeColor={themeColor}
      >
        <TreatmentPlanEditor
          onSubmit={handleCreate}
          onCancel={() => setShowEditor(false)}
          isSubmitting={isSubmitting}
          showToothField={showToothField}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  return (
    <ModuleWrapper
      moduleKey="treatment-plans"
      title="Planes de Tratamiento"
      icon="FileText"
      description="Planificación y seguimiento de tratamientos"
      themeColor={themeColor}
      isEmpty={!loading && filteredPlans.length === 0}
      emptyMessage="Sin planes de tratamiento"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Status filters ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
            filterStatus === 'all'
              ? 'text-white'
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
          )}
          style={filterStatus === 'all' ? { backgroundColor: themeColor } : undefined}
        >
          Todos
        </button>
        {(Object.entries(STATUS_CONFIG) as [TreatmentPlanStatus, typeof STATUS_CONFIG.draft][]).map(
          ([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterStatus(key)}
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
                filterStatus === key
                  ? 'text-white'
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
              )}
              style={filterStatus === key ? { backgroundColor: themeColor } : undefined}
            >
              {cfg.label}
            </button>
          ),
        )}
      </div>

      {/* ── Plan list ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        {filteredPlans.map((plan) => {
          const statusCfg = STATUS_CONFIG[plan.status] ?? STATUS_CONFIG.draft;
          const totalItems = plan.items.length;
          const completedItems = plan.items.filter(
            (i) => i.status === 'completed',
          ).length;
          const progress = totalItems > 0
            ? Math.round((completedItems / totalItems) * 100)
            : 0;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setViewingPlan(plan)}
              className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Icon */}
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeColor}10` }}
              >
                <FileText className="h-5 w-5" style={{ color: themeColor }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {plan.title}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {plan.patient_name && (
                    <p className="text-xs text-gray-400 truncate">
                      {plan.patient_name}
                    </p>
                  )}
                  <span className="text-xs text-gray-300">
                    {completedItems}/{totalItems}
                  </span>
                  {/* Mini progress bar */}
                  <div className="flex-1 max-w-[80px] h-1 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: themeColor,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Cost */}
              {plan.estimated_cost != null && plan.estimated_cost > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-gray-500 shrink-0 hidden sm:flex">
                  <DollarSign className="h-3 w-3" />
                  {plan.estimated_cost.toFixed(0)}
                </div>
              )}

              {/* Status */}
              <Badge variant={statusCfg.variant} className="shrink-0 text-xs">
                {statusCfg.label}
              </Badge>

              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            </button>
          );
        })}
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
