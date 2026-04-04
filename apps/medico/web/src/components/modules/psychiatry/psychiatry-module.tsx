'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Eye,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Trash2,
} from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  usePsychiatricAssessment,
  type PsychiatricAssessment,
  type CreateAssessment,
} from './use-psychiatric-assessment';
import {
  PSYCHIATRIC_SCALES,
  SCALE_LIST,
  type ScaleDefinition,
} from './psychiatric-scales-data';
import { ScaleQuestionnaire } from './scale-questionnaire';
import { ScoreTrendChart } from './score-trend-chart';

// ============================================================================
// TYPES
// ============================================================================

type ViewState = 'list' | 'new-select-scale' | 'new-questionnaire' | 'trend';

// ============================================================================
// SCALE SELECTOR
// ============================================================================

function ScaleSelector({
  onSelect,
  onCancel,
  themeColor,
}: {
  onSelect: (scale: ScaleDefinition) => void;
  onCancel: () => void;
  themeColor: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">
            Seleccionar Escala
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Elija el instrumento de evaluación
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancelar
        </button>
      </div>

      <div className="space-y-2">
        {SCALE_LIST.map((scale) => (
          <button
            key={scale.id}
            type="button"
            onClick={() => onSelect(scale)}
            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
            >
              {scale.abbreviation.slice(0, 3)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">
                {scale.abbreviation}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {scale.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {scale.type === 'self-report' ? 'Auto-reporte' : 'Evaluación clínica'}
                {' · '}
                {scale.questions.length} ítems
                {' · '}
                Puntaje máximo: {scale.maxScore}
              </p>
              {/* Suicide risk warning */}
              {scale.questions.some((q) => q.isSuicideRisk) && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-medium">
                  <ShieldAlert className="h-3 w-3" />
                  Incluye tamizaje de riesgo suicida
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SUICIDE RISK BANNER
// ============================================================================

function SuicideRiskBanner() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
      <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-red-700">
          Riesgo Suicida Detectado
        </p>
        <p className="text-xs text-red-600 mt-0.5">
          Una o más evaluaciones recientes tienen indicadores positivos de riesgo suicida.
          Requiere evaluación clínica inmediata y plan de seguridad.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// ASSESSMENT HISTORY ITEM
// ============================================================================

function AssessmentItem({
  assessment,
  onView,
  onDelete,
  themeColor,
}: {
  assessment: PsychiatricAssessment;
  onView: () => void;
  onDelete: () => void;
  themeColor: string;
}) {
  const scale = PSYCHIATRIC_SCALES[assessment.scale_id];
  const band = assessment.severity_band;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Score circle */}
      <div
        className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${band?.color ?? '#6B7280'}15`,
          border: `2px solid ${band?.color ?? '#6B7280'}`,
        }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: band?.color ?? '#6B7280' }}
        >
          {assessment.total_score}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-700">
            {scale?.abbreviation ?? assessment.scale_id}
          </p>
          {band && (
            <span
              className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', band.badgeClass)}
            >
              {band.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {assessment.patient_name && (
            <p className="text-xs text-gray-400 truncate">
              {assessment.patient_name}
            </p>
          )}
          <p className="text-xs text-gray-400">
            {new Date(assessment.assessment_date).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Suicide risk indicator */}
      {assessment.suicide_risk_flagged && (
        <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase">Riesgo</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onView}
          className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Ver detalle"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-7 w-7 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PsychiatryModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#7C3AED',
}: ModuleComponentProps) {
  // State
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedScale, setSelectedScale] = useState<ScaleDefinition | null>(null);
  const [filterScaleId, setFilterScaleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trendScaleId, setTrendScaleId] = useState<string | null>(null);

  // Data
  const { assessments, loading, error, create, remove, refresh } =
    usePsychiatricAssessment(doctorId, {
      patientId,
      scaleId: filterScaleId ?? undefined,
      limit: 100,
    });

  // Check for any recent suicide risk
  const hasSuicideRiskFlag = useMemo(
    () => assessments.some((a) => a.suicide_risk_flagged),
    [assessments],
  );

  // Trend data for selected scale
  const trendData = useMemo(() => {
    const scaleId = trendScaleId ?? filterScaleId;
    if (!scaleId) return null;

    const scale = PSYCHIATRIC_SCALES[scaleId];
    if (!scale) return null;

    const points = assessments
      .filter((a) => a.scale_id === scaleId)
      .sort(
        (a, b) =>
          new Date(a.assessment_date).getTime() -
          new Date(b.assessment_date).getTime(),
      )
      .map((a) => ({
        date: a.assessment_date,
        score: a.total_score,
        label: a.severity,
      }));

    return { scale, points };
  }, [assessments, trendScaleId, filterScaleId]);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleSelectScale = useCallback((scale: ScaleDefinition) => {
    setSelectedScale(scale);
    setViewState('new-questionnaire');
  }, []);

  const handleSubmitQuestionnaire = useCallback(
    async (responses: Record<string, number>) => {
      if (!selectedScale) return;
      setIsSubmitting(true);

      const data: CreateAssessment = {
        patient_id: patientId ?? undefined,
        scale_id: selectedScale.id,
        responses,
        assessment_date: new Date().toISOString(),
      };

      const result = await create(data);
      setIsSubmitting(false);

      if (result) {
        setViewState('list');
        setSelectedScale(null);
      }
    },
    [selectedScale, patientId, create],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove],
  );

  const handleViewTrend = useCallback((scaleId: string) => {
    setTrendScaleId(scaleId);
    setViewState('trend');
  }, []);

  // Module actions
  const moduleActions = [
    {
      label: 'Nueva Evaluación',
      onClick: () => setViewState('new-select-scale'),
      icon: Plus,
    },
  ];

  // ── Scale selector view ───────────────────────────────────────────────

  if (viewState === 'new-select-scale') {
    return (
      <ModuleWrapper
        moduleKey="psychiatry-scales"
        title="Escalas Psiquiátricas"
        icon="Brain"
        themeColor={themeColor}
      >
        <ScaleSelector
          onSelect={handleSelectScale}
          onCancel={() => setViewState('list')}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Questionnaire view ────────────────────────────────────────────────

  if (viewState === 'new-questionnaire' && selectedScale) {
    return (
      <ModuleWrapper
        moduleKey="psychiatry-scales"
        title={`${selectedScale.abbreviation} — Evaluación`}
        icon="Brain"
        themeColor={themeColor}
      >
        <ScaleQuestionnaire
          scale={selectedScale}
          onSubmit={handleSubmitQuestionnaire}
          onCancel={() => {
            setViewState('list');
            setSelectedScale(null);
          }}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Trend chart view ──────────────────────────────────────────────────

  if (viewState === 'trend' && trendData) {
    return (
      <ModuleWrapper
        moduleKey="psychiatry-scales"
        title={`Tendencia — ${trendData.scale.abbreviation}`}
        icon="Brain"
        themeColor={themeColor}
        actions={[
          {
            label: 'Volver',
            onClick: () => {
              setViewState('list');
              setTrendScaleId(null);
            },
            variant: 'ghost',
          },
        ]}
      >
        {trendData.points.length < 2 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            Se necesitan al menos 2 evaluaciones para mostrar la tendencia
          </div>
        ) : (
          <ScoreTrendChart
            dataPoints={trendData.points}
            severityBands={trendData.scale.severityBands}
            maxScore={trendData.scale.maxScore}
            themeColor={themeColor}
          />
        )}
      </ModuleWrapper>
    );
  }

  // ── Main list view ────────────────────────────────────────────────────

  return (
    <ModuleWrapper
      moduleKey="psychiatry-scales"
      title="Escalas Psiquiátricas"
      icon="Brain"
      description="Evaluaciones estandarizadas de salud mental"
      themeColor={themeColor}
      isEmpty={!loading && assessments.length === 0}
      emptyMessage="Sin evaluaciones registradas"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── CRITICAL: Suicide risk alert ───────────────────────── */}
      {hasSuicideRiskFlag && (
        <div className="mb-4">
          <SuicideRiskBanner />
        </div>
      )}

      {/* ── Scale filter pills ─────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <button
          type="button"
          onClick={() => setFilterScaleId(null)}
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full transition-colors',
            filterScaleId === null
              ? 'text-white'
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
          )}
          style={filterScaleId === null ? { backgroundColor: themeColor } : undefined}
        >
          Todas
        </button>
        {SCALE_LIST.map((scale) => (
          <button
            key={scale.id}
            type="button"
            onClick={() => setFilterScaleId(scale.id)}
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full transition-colors',
              filterScaleId === scale.id
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              filterScaleId === scale.id ? { backgroundColor: themeColor } : undefined
            }
          >
            {scale.abbreviation}
          </button>
        ))}

        {/* Trend button (visible when a scale is filtered) */}
        {filterScaleId && (
          <button
            type="button"
            onClick={() => handleViewTrend(filterScaleId)}
            className="text-xs font-medium px-2.5 py-1 rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1 ml-auto"
          >
            <TrendingUp className="h-3 w-3" />
            Ver tendencia
          </button>
        )}
      </div>

      {/* ── Assessment history ─────────────────────────────────── */}
      <div className="space-y-2">
        {assessments.map((assessment) => (
          <AssessmentItem
            key={assessment.id}
            assessment={assessment}
            onView={() => handleViewTrend(assessment.scale_id)}
            onDelete={() => handleDelete(assessment.id)}
            themeColor={themeColor}
          />
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
