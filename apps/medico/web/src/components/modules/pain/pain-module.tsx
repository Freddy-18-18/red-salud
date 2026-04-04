'use client';

import { useState, useCallback } from 'react';
import { Plus, Activity, TrendingUp } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  usePainAssessment,
  type CreatePainAssessment,
} from './use-pain-assessment';
import {
  NRS_LABELS,
  getNRSSeverity,
  PAIN_TYPE_LABELS,
  type PainPoint,
  type PainType,
} from './pain-scales-data';
import { PainScaleVisual } from './pain-scale-visual';
import { PainBodyMap } from './pain-body-map';

// ============================================================================
// COMPONENT
// ============================================================================

export default function PainModule({
  doctorId,
  patientId,
  config,
  themeColor = '#EF4444',
}: ModuleComponentProps) {
  // State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [nrsScore, setNrsScore] = useState(0);
  const [vasScore, setVasScore] = useState(0);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedType, setSelectedType] = useState<PainType>('aching');
  const [selectedIntensity, setSelectedIntensity] = useState(5);
  const [notes, setNotes] = useState('');

  // Data
  const { assessments, loading, error, create, trend } = usePainAssessment(
    doctorId,
    {
      patientId,
      limit: 20,
    },
  );

  const handleCreate = useCallback(async () => {
    setIsSubmitting(true);

    const data: CreatePainAssessment = {
      patient_id: patientId,
      nrs_score: nrsScore,
      vas_score: vasScore,
      scale_type: 'nrs',
      pain_points: painPoints,
      notes: notes || null,
    };

    await create(data);
    setIsSubmitting(false);
    setShowForm(false);
    resetForm();
  }, [nrsScore, vasScore, painPoints, notes, patientId, create]);

  const resetForm = useCallback(() => {
    setNrsScore(0);
    setVasScore(0);
    setPainPoints([]);
    setNotes('');
  }, []);

  const moduleActions = [
    {
      label: 'Nueva evaluación',
      onClick: () => setShowForm(true),
      icon: Plus,
    },
  ];

  // ── New assessment form ──────────────────────────────────
  if (showForm) {
    return (
      <ModuleWrapper
        moduleKey="pain-assessment"
        title="Evaluación de Dolor"
        icon="Activity"
        themeColor={themeColor}
      >
        <div className="space-y-4">
          {/* Pain scale */}
          <PainScaleVisual
            nrsValue={nrsScore}
            onNrsChange={setNrsScore}
            vasValue={vasScore}
            onVasChange={setVasScore}
            themeColor={themeColor}
          />

          {/* Pain type and intensity for body map */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo de dolor</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as PainType)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {(Object.entries(PAIN_TYPE_LABELS) as Array<[PainType, string]>).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Intensidad</label>
              <select
                value={selectedIntensity}
                onChange={(e) => setSelectedIntensity(parseInt(e.target.value, 10))}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i}>
                    {i} — {NRS_LABELS[i].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Body map */}
          <PainBodyMap
            points={painPoints}
            onChange={setPainPoints}
            selectedType={selectedType}
            selectedIntensity={selectedIntensity}
            themeColor={themeColor}
          />

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Observaciones
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Factores agravantes, atenuantes, cronología..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-xs font-medium px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="text-xs font-medium px-4 py-2 text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar evaluación'}
            </button>
          </div>
        </div>
      </ModuleWrapper>
    );
  }

  // ── Main view ────────────────────────────────────────────
  const latest = assessments[0];

  return (
    <ModuleWrapper
      moduleKey="pain-assessment"
      title="Evaluación de Dolor"
      icon="Activity"
      description="Escalas de dolor y mapa corporal"
      themeColor={themeColor}
      isEmpty={!loading && assessments.length === 0}
      emptyMessage="Sin evaluaciones de dolor registradas"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* Quick NRS display */}
      {latest && latest.nrs_score != null && (
        <div className="mb-4 flex items-center gap-4 p-3 rounded-lg bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Último NRS</p>
            <p
              className="text-3xl font-bold"
              style={{ color: NRS_LABELS[Math.min(latest.nrs_score, 10)].color }}
            >
              {latest.nrs_score}
            </p>
            <p
              className="text-xs"
              style={{ color: getNRSSeverity(latest.nrs_score).color }}
            >
              {getNRSSeverity(latest.nrs_score).label}
            </p>
          </div>

          {/* Mini body map of latest */}
          {latest.pain_points.length > 0 && (
            <div className="flex-1">
              <PainBodyMap
                points={latest.pain_points}
                onChange={() => {}}
                selectedType="aching"
                selectedIntensity={0}
                readOnly
                themeColor={themeColor}
              />
            </div>
          )}
        </div>
      )}

      {/* Pain trend */}
      {trend.length > 1 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Tendencia NRS
          </p>
          <svg viewBox="0 0 300 80" className="w-full h-16">
            {(() => {
              const pts = trend.map((p, i) => {
                const x = 10 + (i / (trend.length - 1)) * 280;
                const y = 70 - (p.score / 10) * 60;
                return { x, y, ...p };
              });

              return (
                <>
                  {/* Area */}
                  <path
                    d={`M ${pts[0].x} ${pts[0].y} ${pts.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${pts[pts.length - 1].x} 70 L ${pts[0].x} 70 Z`}
                    fill={themeColor}
                    opacity={0.08}
                  />
                  {/* Line */}
                  <polyline
                    points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={themeColor}
                    strokeWidth={2}
                  />
                  {/* Dots */}
                  {pts.map((p) => (
                    <circle
                      key={p.date}
                      cx={p.x}
                      cy={p.y}
                      r={3}
                      fill="white"
                      stroke={NRS_LABELS[Math.min(p.score, 10)].color}
                      strokeWidth={2}
                    />
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Assessment history */}
      <div className="space-y-2">
        {assessments.map((assessment) => {
          const severity = assessment.nrs_score != null
            ? getNRSSeverity(assessment.nrs_score)
            : null;

          return (
            <div
              key={assessment.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold"
                style={{
                  backgroundColor: severity ? `${severity.color}15` : `${themeColor}10`,
                  color: severity?.color ?? themeColor,
                }}
              >
                {assessment.nrs_score ?? '—'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  {severity?.label ?? 'Evaluación de dolor'}
                </p>
                <p className="text-xs text-gray-400">
                  {assessment.pain_points.length > 0
                    ? `${assessment.pain_points.length} punto${assessment.pain_points.length > 1 ? 's' : ''} marcado${assessment.pain_points.length > 1 ? 's' : ''}`
                    : 'Sin mapa corporal'}
                </p>
              </div>

              <p className="text-xs text-gray-400 shrink-0">
                {new Date(assessment.created_at).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
