'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Eye, Activity, AlertCircle } from 'lucide-react';
import { Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useWoundCare,
  type WoundRecord,
  type CreateWoundRecord,
  type CreateWoundAssessment,
  WOUND_TYPE_OPTIONS,
  WOUND_STATUS_OPTIONS,
} from './use-wound-care';
import { WoundForm } from './wound-form';
import { WoundTimeline } from './wound-timeline';

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Activa', color: '#EF4444', variant: 'destructive' },
  healing: { label: 'Cicatrizando', color: '#3B82F6', variant: 'default' },
  healed: { label: 'Cicatrizada', color: '#22C55E', variant: 'outline' },
  chronic: { label: 'Cronica', color: '#F97316', variant: 'secondary' },
  infected: { label: 'Infectada', color: '#DC2626', variant: 'destructive' },
};

// ============================================================================
// VIEW STATE
// ============================================================================

type ViewState = 'list' | 'new-wound' | 'assessment' | 'timeline';

// ============================================================================
// HEALING INDICATOR
// ============================================================================

function HealingIndicator({ wound }: { wound: WoundRecord }) {
  if (wound.assessments.length < 2) return null;

  const sorted = [...wound.assessments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const prev = sorted[sorted.length - 2];
  const last = sorted[sorted.length - 1];

  const areaChange = prev.measurement.area_cm2 - last.measurement.area_cm2;
  const improving = areaChange > 0;

  return (
    <span
      className={cn(
        'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
        improving
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-red-50 text-red-500',
      )}
    >
      {improving ? '\u2193' : '\u2191'}{' '}
      {Math.abs(Math.round((areaChange / (prev.measurement.area_cm2 || 1)) * 100))}%
    </span>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function WoundCareModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedWound, setSelectedWound] = useState<WoundRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { wounds, loading, error, createWound, addAssessment, refresh } =
    useWoundCare(doctorId, { patientId, limit: 50 });

  // ── Handlers ──────────────────────────────────────────────────
  const handleCreateWound = useCallback(
    async (data: CreateWoundRecord) => {
      setIsSubmitting(true);
      const result = await createWound({ ...data, patient_id: patientId });
      setIsSubmitting(false);
      if (result) {
        setViewState('list');
      }
    },
    [createWound, patientId],
  );

  const handleAddAssessment = useCallback(
    async (data: CreateWoundAssessment) => {
      setIsSubmitting(true);
      const result = await addAssessment(data);
      setIsSubmitting(false);
      if (result) {
        setViewState('list');
        setSelectedWound(null);
      }
    },
    [addAssessment],
  );

  const handleViewTimeline = useCallback((wound: WoundRecord) => {
    setSelectedWound(wound);
    setViewState('timeline');
  }, []);

  const handleNewAssessment = useCallback((wound: WoundRecord) => {
    setSelectedWound(wound);
    setViewState('assessment');
  }, []);

  // Module actions
  const moduleActions = [
    {
      label: 'Nueva herida',
      onClick: () => setViewState('new-wound'),
      icon: Plus,
    },
  ];

  // Active vs healed
  const activeWounds = wounds.filter((w) => w.status !== 'healed');
  const healedWounds = wounds.filter((w) => w.status === 'healed');

  // ── New wound form ────────────────────────────────────────────
  if (viewState === 'new-wound') {
    return (
      <ModuleWrapper
        moduleKey="wound-care"
        title="Nueva Herida"
        icon="Bandage"
        themeColor={themeColor}
      >
        <WoundForm
          mode="new-wound"
          onSubmitWound={handleCreateWound}
          onCancel={() => setViewState('list')}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Assessment form ──────────────────────────────────────────
  if (viewState === 'assessment' && selectedWound) {
    return (
      <ModuleWrapper
        moduleKey="wound-care"
        title="Nueva Evaluacion"
        icon="Bandage"
        description={selectedWound.location_text}
        themeColor={themeColor}
      >
        <WoundForm
          mode="assessment"
          woundId={selectedWound.id}
          onSubmitAssessment={handleAddAssessment}
          onCancel={() => {
            setViewState('list');
            setSelectedWound(null);
          }}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Timeline view ────────────────────────────────────────────
  if (viewState === 'timeline' && selectedWound) {
    return (
      <ModuleWrapper
        moduleKey="wound-care"
        title="Evolucion de Herida"
        icon="Bandage"
        themeColor={themeColor}
      >
        <WoundTimeline
          wound={selectedWound}
          onBack={() => {
            setViewState('list');
            setSelectedWound(null);
            refresh();
          }}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── List view (default) ───────────────────────────────────────
  return (
    <ModuleWrapper
      moduleKey="wound-care"
      title="Cuidado de Heridas"
      icon="Bandage"
      description="Seguimiento y evolucion de heridas"
      themeColor={themeColor}
      isEmpty={!loading && wounds.length === 0}
      emptyMessage="Sin heridas registradas"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Active wounds ──────────────────────────────────────── */}
      {activeWounds.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Heridas activas ({activeWounds.length})
          </p>
          {activeWounds.map((wound) => {
            const typeLabel = WOUND_TYPE_OPTIONS.find((t) => t.value === wound.wound_type)?.label ?? wound.wound_type;
            const statusCfg = STATUS_CONFIG[wound.status] ?? STATUS_CONFIG.active;
            const lastAssessment = wound.assessments.length > 0
              ? wound.assessments[wound.assessments.length - 1]
              : null;

            return (
              <div
                key={wound.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {/* Thumbnail */}
                <div
                  className="h-12 w-12 rounded-lg shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center"
                >
                  {wound.photo_urls.length > 0 ? (
                    <img
                      src={wound.photo_urls[wound.photo_urls.length - 1]}
                      alt="Herida"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Activity className="h-5 w-5 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {wound.location_text}
                    </p>
                    <HealingIndicator wound={wound} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{typeLabel}</span>
                    {lastAssessment && (
                      <span className="text-xs text-gray-300">
                        {lastAssessment.measurement.area_cm2} cm&sup2;
                      </span>
                    )}
                    <span className="text-xs text-gray-300">
                      {wound.assessments.length} eval.
                    </span>
                  </div>
                </div>

                {/* Status */}
                <Badge variant={statusCfg.variant} className="text-xs shrink-0">
                  {statusCfg.label}
                </Badge>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleNewAssessment(wound)}
                    className="h-8 px-2 text-xs font-medium rounded-lg text-white transition-colors"
                    style={{ backgroundColor: themeColor }}
                  >
                    Evaluar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewTimeline(wound)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Healed wounds ──────────────────────────────────────── */}
      {healedWounds.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Cicatrizadas ({healedWounds.length})
          </p>
          {healedWounds.map((wound) => (
            <button
              key={wound.id}
              type="button"
              onClick={() => handleViewTimeline(wound)}
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span className="text-sm text-gray-500 truncate flex-1">
                {wound.location_text}
              </span>
              <span className="text-xs text-emerald-500 font-medium shrink-0">
                Cicatrizada
              </span>
              <Eye className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
