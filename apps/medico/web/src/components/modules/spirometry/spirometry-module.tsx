'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Wind, TrendingUp } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useSpirometry,
  type CreateSpirometryRecord,
} from './use-spirometry';
import {
  calculatePredicted,
  percentPredicted,
  interpretSpirometry,
  PATTERN_LABELS,
  type SpirometryValues,
  type PatientDemographics,
} from './spirometry-reference-data';
import { FlowVolumeCurve } from './flow-volume-curve';
import { SpirometryForm } from './spirometry-form';

// ============================================================================
// EMPTY VALUES
// ============================================================================

const EMPTY: SpirometryValues = {
  fvc: null,
  fev1: null,
  fev1Fvc: null,
  pef: null,
  fef2575: null,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function SpirometryModule({
  doctorId,
  patientId,
  config,
  themeColor = '#0EA5E9',
}: ModuleComponentProps) {
  // State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [preValues, setPreValues] = useState<SpirometryValues>({ ...EMPTY });
  const [postValues, setPostValues] = useState<SpirometryValues>({ ...EMPTY });
  const [demographics, setDemographics] = useState<PatientDemographics | null>(null);
  const [notes, setNotes] = useState('');

  // Data
  const { records, loading, error, create } = useSpirometry(doctorId, {
    patientId,
    limit: 20,
  });

  const predicted = useMemo(() => {
    if (!demographics) return null;
    return calculatePredicted(demographics);
  }, [demographics]);

  const handleCreate = useCallback(async () => {
    setIsSubmitting(true);

    let interpretation: string | null = null;
    if (predicted && preValues.fev1 != null && preValues.fvc != null) {
      const result = interpretSpirometry({ pre: preValues, post: postValues }, predicted);
      interpretation = result.summary;
    }

    const data: CreateSpirometryRecord = {
      patient_id: patientId,
      pre_values: preValues,
      post_values: postValues,
      demographics,
      notes: notes || null,
      interpretation,
    };

    await create(data);
    setIsSubmitting(false);
    setShowForm(false);
    resetForm();
  }, [preValues, postValues, demographics, notes, predicted, patientId, create]);

  const resetForm = useCallback(() => {
    setPreValues({ ...EMPTY });
    setPostValues({ ...EMPTY });
    setDemographics(null);
    setNotes('');
  }, []);

  const moduleActions = [
    {
      label: 'Nueva espirometría',
      onClick: () => setShowForm(true),
      icon: Plus,
    },
  ];

  // ── New test form ────────────────────────────────────────
  if (showForm) {
    return (
      <ModuleWrapper
        moduleKey="spirometry-test"
        title="Nueva Espirometría"
        icon="Wind"
        themeColor={themeColor}
      >
        <div className="space-y-4">
          {/* Flow-volume curve preview */}
          {preValues.fvc != null && preValues.pef != null && (
            <FlowVolumeCurve
              preValues={preValues}
              postValues={postValues.fvc != null ? postValues : undefined}
              predicted={predicted ?? undefined}
              themeColor={themeColor}
            />
          )}

          {/* Form */}
          <SpirometryForm
            preValues={preValues}
            onPreChange={setPreValues}
            postValues={postValues}
            onPostChange={setPostValues}
            demographics={demographics}
            onDemographicsChange={setDemographics}
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
              placeholder="Notas adicionales..."
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
              disabled={isSubmitting || preValues.fev1 == null}
              className="text-xs font-medium px-4 py-2 text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar espirometría'}
            </button>
          </div>
        </div>
      </ModuleWrapper>
    );
  }

  // ── Main view ────────────────────────────────────────────
  const latestRecord = records[0];

  // FEV1 trend for chart
  const fev1Trend = records
    .filter((r) => r.pre_values.fev1 != null)
    .map((r) => ({
      date: r.test_date,
      value: r.pre_values.fev1!,
    }))
    .reverse();

  return (
    <ModuleWrapper
      moduleKey="spirometry-test"
      title="Espirometría"
      icon="Wind"
      description="Pruebas de función pulmonar"
      themeColor={themeColor}
      isEmpty={!loading && records.length === 0}
      emptyMessage="Sin espirometrías registradas"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* Latest flow-volume curve */}
      {latestRecord && latestRecord.pre_values.fvc != null && (
        <div className="mb-4">
          <FlowVolumeCurve
            preValues={latestRecord.pre_values}
            postValues={latestRecord.post_values.fvc != null ? latestRecord.post_values : undefined}
            predicted={latestRecord.demographics ? calculatePredicted(latestRecord.demographics) : undefined}
            themeColor={themeColor}
          />
        </div>
      )}

      {/* Results summary of latest */}
      {latestRecord && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {([
            { label: 'FVC', val: latestRecord.pre_values.fvc, unit: 'L' },
            { label: 'FEV1', val: latestRecord.pre_values.fev1, unit: 'L' },
            { label: 'FEV1/FVC', val: latestRecord.pre_values.fev1Fvc, unit: '' },
          ]).map(({ label, val, unit }) => (
            <div
              key={label}
              className="text-center p-2 rounded-lg bg-gray-50"
            >
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-bold text-gray-700">
                {val != null ? `${val.toFixed(2)} ${unit}` : '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* FEV1 trend mini chart */}
      {fev1Trend.length > 1 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Tendencia FEV1
          </p>
          <svg viewBox={`0 0 ${300} ${80}`} className="w-full h-16">
            {(() => {
              const maxVal = Math.max(...fev1Trend.map((p) => p.value));
              const minVal = Math.min(...fev1Trend.map((p) => p.value));
              const range = maxVal - minVal || 1;

              const pts = fev1Trend.map((p, i) => {
                const x = 10 + (i / (fev1Trend.length - 1)) * 280;
                const y = 70 - ((p.value - minVal) / range) * 60;
                return `${x},${y}`;
              });

              return (
                <>
                  <polyline
                    points={pts.join(' ')}
                    fill="none"
                    stroke={themeColor}
                    strokeWidth={2}
                  />
                  {fev1Trend.map((p, i) => {
                    const x = 10 + (i / (fev1Trend.length - 1)) * 280;
                    const y = 70 - ((p.value - minVal) / range) * 60;
                    return (
                      <circle
                        key={p.date}
                        cx={x}
                        cy={y}
                        r={3}
                        fill="white"
                        stroke={themeColor}
                        strokeWidth={1.5}
                      />
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Record history */}
      <div className="space-y-2">
        {records.map((record) => {
          const interp = record.demographics && record.pre_values.fev1 != null
            ? interpretSpirometry(
                { pre: record.pre_values, post: record.post_values },
                calculatePredicted(record.demographics),
              )
            : null;

          return (
            <div
              key={record.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeColor}10` }}
              >
                <Wind className="h-5 w-5" style={{ color: themeColor }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  FEV1: {record.pre_values.fev1?.toFixed(2) ?? '—'} L
                  {' | FVC: '}
                  {record.pre_values.fvc?.toFixed(2) ?? '—'} L
                </p>
                {interp && (
                  <p className="text-xs text-gray-400 truncate">
                    {PATTERN_LABELS[interp.pattern]}
                    {interp.bronchodilatorResponse ? ' | BD+' : ''}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400 shrink-0">
                {new Date(record.created_at).toLocaleDateString('es-VE', {
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
