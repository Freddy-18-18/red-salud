'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Save,
  X,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { Badge, Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useNeurologyScales,
  type NeurologyAssessment,
  type CreateNeurologyAssessment,
  calculateGcsTotal,
  buildGcsString,
} from './use-neurology-scales';
import {
  NEUROLOGY_SCALES,
  classifyGcs,
  classifyNihss,
  classifyMmse,
  RANKIN_LEVELS,
  type NeurologyScaleType,
} from './neurology-scales-data';
import { GlasgowScale } from './glasgow-scale';
import { NihssForm } from './nihss-form';

// ============================================================================
// VIEW STATE
// ============================================================================

type ViewState = 'list' | 'new' | 'viewing';

// ============================================================================
// SCALE CLASSIFIER
// ============================================================================

function classifyScore(scaleType: NeurologyScaleType, total: number): { label: string; color: string } {
  switch (scaleType) {
    case 'glasgow':
      return classifyGcs(total);
    case 'nihss':
      return classifyNihss(total);
    case 'rankin': {
      const level = RANKIN_LEVELS.find((l) => l.value === total);
      return level ? { label: level.label.split(' — ')[1] ?? level.label, color: level.color } : { label: '—', color: '#6B7280' };
    }
    case 'mmse':
      return classifyMmse(total);
    default:
      return { label: '—', color: '#6B7280' };
  }
}

// ============================================================================
// RANKIN FORM (simple)
// ============================================================================

function RankinForm({
  value,
  onChange,
  readOnly,
  themeColor,
}: {
  value: number;
  onChange: (value: number) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        Escala de Rankin Modificada
      </p>
      {RANKIN_LEVELS.map((level) => (
        <button
          key={level.value}
          type="button"
          disabled={readOnly}
          onClick={() => onChange(level.value)}
          className={cn(
            'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors',
            value === level.value
              ? 'text-white border-transparent'
              : 'text-gray-600 border-gray-200 hover:bg-gray-50',
            readOnly && 'cursor-not-allowed opacity-70',
          )}
          style={value === level.value ? { backgroundColor: level.color } : undefined}
        >
          <span
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
              value === level.value ? 'bg-white/20' : 'bg-gray-100',
            )}
            style={value === level.value ? undefined : { color: level.color }}
          >
            {level.value}
          </span>
          <div>
            <p className="text-sm font-medium">{level.label}</p>
            <p className={cn('text-xs mt-0.5', value === level.value ? 'text-white/80' : 'text-gray-400')}>
              {level.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MMSE FORM (simple)
// ============================================================================

function MmseForm({
  scores,
  onChange,
  readOnly,
  themeColor,
}: {
  scores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  // Inline import to avoid circular — items are from data file
  const {
    MMSE_ITEMS,
    MMSE_MAX,
    MMSE_DOMAINS,
    classifyMmse: classify,
  } = require('./neurology-scales-data');

  const total = useMemo(
    () => Object.values(scores).reduce((s: number, v) => s + (v as number), 0),
    [scores],
  );
  const classification = classify(total);

  return (
    <div className="space-y-4">
      {/* Total */}
      <div
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ backgroundColor: `${classification.color}10` }}
      >
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            MMSE Total
          </p>
          <p className="text-xs mt-0.5" style={{ color: classification.color }}>
            {classification.label}
          </p>
        </div>
        <p className="text-3xl font-bold tabular-nums" style={{ color: classification.color }}>
          {total}<span className="text-sm text-gray-400">/{MMSE_MAX}</span>
        </p>
      </div>

      {/* Items by domain */}
      {MMSE_DOMAINS.map((domain: string) => {
        const domainItems = MMSE_ITEMS.filter((i: any) => i.domain === domain);
        return (
          <div key={domain} className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
              {domain}
            </p>
            {domainItems.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700">{item.label}</p>
                  <p className="text-[10px] text-gray-400">{item.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: item.maxScore + 1 }, (_, i) => i).map((v: number) => (
                    <button
                      key={v}
                      type="button"
                      disabled={readOnly}
                      onClick={() => onChange({ ...scores, [item.id]: v })}
                      className={cn(
                        'h-7 w-7 rounded-full text-xs font-bold transition-colors',
                        (scores[item.id] ?? 0) === v
                          ? 'text-white'
                          : 'text-gray-400 bg-gray-100 hover:bg-gray-200',
                      )}
                      style={
                        (scores[item.id] ?? 0) === v
                          ? { backgroundColor: themeColor }
                          : undefined
                      }
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// NEW ASSESSMENT FORM
// ============================================================================

function NewAssessmentForm({
  onSubmit,
  onCancel,
  isSubmitting,
  themeColor,
}: {
  onSubmit: (data: CreateNeurologyAssessment) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  themeColor: string;
}) {
  const [scaleType, setScaleType] = useState<NeurologyScaleType>('glasgow');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  const total = useMemo(() => {
    if (scaleType === 'glasgow') return calculateGcsTotal(scores);
    if (scaleType === 'rankin') return scores['rankin'] ?? 0;
    return Object.values(scores).reduce((s, v) => s + v, 0);
  }, [scaleType, scores]);

  const handleSubmit = () => {
    const gcsString = scaleType === 'glasgow' ? buildGcsString(scores) : null;
    onSubmit({
      scale_type: scaleType,
      scores,
      total,
      gcs_string: gcsString,
      notes: notes || null,
    });
  };

  const handleScaleChange = (newScale: NeurologyScaleType) => {
    setScaleType(newScale);
    setScores({});
  };

  return (
    <div className="space-y-4">
      {/* Scale selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {NEUROLOGY_SCALES.map((scale) => (
          <button
            key={scale.id}
            type="button"
            onClick={() => handleScaleChange(scale.id)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap',
              scaleType === scale.id
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              scaleType === scale.id ? { backgroundColor: themeColor } : undefined
            }
          >
            {scale.label}
          </button>
        ))}
      </div>

      {/* Scale form */}
      {scaleType === 'glasgow' && (
        <GlasgowScale
          scores={scores}
          onChange={setScores}
          themeColor={themeColor}
        />
      )}
      {scaleType === 'nihss' && (
        <NihssForm
          scores={scores}
          onChange={setScores}
          themeColor={themeColor}
        />
      )}
      {scaleType === 'rankin' && (
        <RankinForm
          value={scores['rankin'] ?? 0}
          onChange={(v) => setScores({ rankin: v })}
          readOnly={false}
          themeColor={themeColor}
        />
      )}
      {scaleType === 'mmse' && (
        <MmseForm
          scores={scores}
          onChange={setScores}
          readOnly={false}
          themeColor={themeColor}
        />
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">
          Notas clinicas
        </label>
        <textarea
          placeholder="Observaciones adicionales..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[50px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="mr-1.5 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ backgroundColor: themeColor }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Guardando...
            </span>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              Guardar Evaluacion
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function NeurologyModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [filterScale, setFilterScale] = useState<NeurologyScaleType | 'all'>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<NeurologyAssessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { assessments, loading, error, createAssessment, refresh } = useNeurologyScales(
    doctorId,
    {
      patientId,
      scaleType: filterScale === 'all' ? undefined : filterScale,
      limit: 50,
    },
  );

  const filteredAssessments = useMemo(() => {
    if (filterScale === 'all') return assessments;
    return assessments.filter((a) => a.scale_type === filterScale);
  }, [assessments, filterScale]);

  const handleCreate = useCallback(
    async (data: CreateNeurologyAssessment) => {
      setIsSubmitting(true);
      const result = await createAssessment({
        ...data,
        patient_id: patientId,
      });
      setIsSubmitting(false);
      if (result) {
        setViewState('list');
      }
    },
    [createAssessment, patientId],
  );

  const handleView = useCallback((assessment: NeurologyAssessment) => {
    setSelectedAssessment(assessment);
    setViewState('viewing');
  }, []);

  const moduleActions = [
    {
      label: 'Nueva evaluacion',
      onClick: () => setViewState('new'),
      icon: Plus,
    },
  ];

  // ── New assessment form ─────────────────────────────────────
  if (viewState === 'new') {
    return (
      <ModuleWrapper
        moduleKey="neurology-scales"
        title="Nueva Evaluacion Neurologica"
        icon="Brain"
        themeColor={themeColor}
      >
        <NewAssessmentForm
          onSubmit={handleCreate}
          onCancel={() => setViewState('list')}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Assessment viewer ───────────────────────────────────────
  if (viewState === 'viewing' && selectedAssessment) {
    const classification = classifyScore(selectedAssessment.scale_type, selectedAssessment.total);

    return (
      <ModuleWrapper
        moduleKey="neurology-scales"
        title="Evaluacion Neurologica"
        icon="Brain"
        themeColor={themeColor}
      >
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setViewState('list');
              setSelectedAssessment(null);
              refresh();
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            &larr; Volver a lista
          </button>

          {/* Header */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: `${classification.color}10` }}
          >
            <div>
              <p className="text-sm font-bold text-gray-700">
                {NEUROLOGY_SCALES.find((s) => s.id === selectedAssessment.scale_type)?.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(selectedAssessment.created_at).toLocaleDateString('es-VE', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs mt-1" style={{ color: classification.color }}>
                {classification.label}
              </p>
            </div>
            <p className="text-3xl font-bold tabular-nums" style={{ color: classification.color }}>
              {selectedAssessment.total}
            </p>
          </div>

          {/* GCS string */}
          {selectedAssessment.gcs_string && (
            <div className="flex items-center justify-center p-2 rounded-lg bg-gray-50">
              <code className="text-xs font-mono font-bold text-gray-600">
                {selectedAssessment.gcs_string}
              </code>
            </div>
          )}

          {/* Scale read-only */}
          {selectedAssessment.scale_type === 'glasgow' && (
            <GlasgowScale
              scores={selectedAssessment.scores}
              onChange={() => {}}
              readOnly
              themeColor={themeColor}
            />
          )}
          {selectedAssessment.scale_type === 'nihss' && (
            <NihssForm
              scores={selectedAssessment.scores}
              onChange={() => {}}
              readOnly
              themeColor={themeColor}
            />
          )}
          {selectedAssessment.scale_type === 'rankin' && (
            <RankinForm
              value={selectedAssessment.scores['rankin'] ?? 0}
              onChange={() => {}}
              readOnly
              themeColor={themeColor}
            />
          )}
          {selectedAssessment.scale_type === 'mmse' && (
            <MmseForm
              scores={selectedAssessment.scores}
              onChange={() => {}}
              readOnly
              themeColor={themeColor}
            />
          )}

          {/* Notes */}
          {selectedAssessment.notes && (
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs font-medium text-gray-500 mb-1">Notas:</p>
              <p className="text-sm text-gray-600">{selectedAssessment.notes}</p>
            </div>
          )}
        </div>
      </ModuleWrapper>
    );
  }

  // ── List view (default) ─────────────────────────────────────
  return (
    <ModuleWrapper
      moduleKey="neurology-scales"
      title="Escalas Neurologicas"
      icon="Brain"
      description="Glasgow, NIHSS, Rankin, MMSE"
      themeColor={themeColor}
      isEmpty={!loading && filteredAssessments.length === 0}
      emptyMessage="Sin evaluaciones neurologicas registradas"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Scale filter ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterScale('all')}
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
            filterScale === 'all'
              ? 'text-white'
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
          )}
          style={filterScale === 'all' ? { backgroundColor: themeColor } : undefined}
        >
          Todas
        </button>
        {NEUROLOGY_SCALES.map((scale) => {
          const count = assessments.filter((a) => a.scale_type === scale.id).length;
          return (
            <button
              key={scale.id}
              type="button"
              onClick={() => setFilterScale(scale.id)}
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
                filterScale === scale.id
                  ? 'text-white'
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
              )}
              style={
                filterScale === scale.id ? { backgroundColor: themeColor } : undefined
              }
            >
              {scale.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Assessment list ───────────────────────────────────── */}
      <div className="space-y-2">
        {filteredAssessments.map((assessment) => {
          const classification = classifyScore(assessment.scale_type, assessment.total);
          const scaleMeta = NEUROLOGY_SCALES.find((s) => s.id === assessment.scale_type);

          return (
            <button
              key={assessment.id}
              type="button"
              onClick={() => handleView(assessment)}
              className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Icon */}
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${classification.color}15` }}
              >
                <Brain className="h-5 w-5" style={{ color: classification.color }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700">
                    {scaleMeta?.label ?? assessment.scale_type}
                  </p>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: classification.color }}
                  >
                    {assessment.total} pts
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {assessment.patient_name && (
                    <span className="text-xs text-gray-400 truncate">
                      {assessment.patient_name}
                    </span>
                  )}
                  {assessment.gcs_string && (
                    <code className="text-[10px] font-mono text-gray-400">
                      {assessment.gcs_string}
                    </code>
                  )}
                </div>
              </div>

              {/* Classification */}
              <Badge
                variant="outline"
                className="shrink-0 text-xs border-current"
                style={{ color: classification.color }}
              >
                {classification.label}
              </Badge>

              {/* Date */}
              <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                {new Date(assessment.created_at).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                })}
              </p>

              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
