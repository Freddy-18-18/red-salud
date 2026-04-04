'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  calculatePredicted,
  percentPredicted,
  interpretSpirometry,
  SEVERITY_CLASSIFICATION,
  PATTERN_LABELS,
  type SpirometryValues,
  type PatientDemographics,
  type PredictedValues,
} from './spirometry-reference-data';

// ============================================================================
// TYPES
// ============================================================================

interface SpirometryFormProps {
  preValues: SpirometryValues;
  onPreChange: (values: SpirometryValues) => void;
  postValues: SpirometryValues;
  onPostChange: (values: SpirometryValues) => void;
  demographics: PatientDemographics | null;
  onDemographicsChange: (d: PatientDemographics) => void;
  themeColor?: string;
}

type ValuesPhase = 'pre' | 'post';

const VALUE_FIELDS: Array<{
  key: keyof SpirometryValues;
  label: string;
  unit: string;
  step: number;
  min: number;
  max: number;
}> = [
  { key: 'fvc', label: 'FVC', unit: 'L', step: 0.01, min: 0, max: 10 },
  { key: 'fev1', label: 'FEV1', unit: 'L', step: 0.01, min: 0, max: 10 },
  { key: 'fev1Fvc', label: 'FEV1/FVC', unit: '', step: 0.01, min: 0, max: 1 },
  { key: 'pef', label: 'PEF', unit: 'L/s', step: 0.1, min: 0, max: 20 },
  { key: 'fef2575', label: 'FEF25-75', unit: 'L/s', step: 0.01, min: 0, max: 15 },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function SpirometryForm({
  preValues,
  onPreChange,
  postValues,
  onPostChange,
  demographics,
  onDemographicsChange,
  themeColor = '#3B82F6',
}: SpirometryFormProps) {
  const [activePhase, setActivePhase] = useState<ValuesPhase>('pre');

  // Predicted values
  const predicted = useMemo<PredictedValues | null>(() => {
    if (!demographics) return null;
    return calculatePredicted(demographics);
  }, [demographics]);

  // Auto-calculate FEV1/FVC when both values change
  const updateValue = useCallback(
    (phase: ValuesPhase, key: keyof SpirometryValues, rawValue: number | null) => {
      const setter = phase === 'pre' ? onPreChange : onPostChange;
      const current = phase === 'pre' ? preValues : postValues;

      const updated = { ...current, [key]: rawValue };

      // Auto-calc FEV1/FVC
      if ((key === 'fev1' || key === 'fvc') && updated.fev1 != null && updated.fvc != null && updated.fvc > 0) {
        updated.fev1Fvc = Math.round((updated.fev1 / updated.fvc) * 100) / 100;
      }

      setter(updated);
    },
    [preValues, postValues, onPreChange, onPostChange],
  );

  // Interpretation
  const interpretation = useMemo(() => {
    if (!predicted || preValues.fev1 == null || preValues.fvc == null) return null;
    return interpretSpirometry({ pre: preValues, post: postValues }, predicted);
  }, [preValues, postValues, predicted]);

  const currentValues = activePhase === 'pre' ? preValues : postValues;

  return (
    <div className="space-y-4">
      {/* ── Demographics ───────────────────────────────── */}
      <div className="p-3 rounded-lg border border-gray-200">
        <p className="text-xs font-medium text-gray-500 mb-2">Datos del paciente (para valores predichos)</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Edad</label>
            <input
              type="number"
              min={5}
              max={95}
              value={demographics?.age ?? ''}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                onDemographicsChange({
                  age: Number.isNaN(v) ? 30 : v,
                  sex: demographics?.sex ?? 'male',
                  heightCm: demographics?.heightCm ?? 170,
                });
              }}
              placeholder="Años"
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sexo</label>
            <select
              value={demographics?.sex ?? 'male'}
              onChange={(e) =>
                onDemographicsChange({
                  age: demographics?.age ?? 30,
                  sex: e.target.value as 'male' | 'female',
                  heightCm: demographics?.heightCm ?? 170,
                })
              }
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Talla (cm)</label>
            <input
              type="number"
              min={100}
              max={220}
              value={demographics?.heightCm ?? ''}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                onDemographicsChange({
                  age: demographics?.age ?? 30,
                  sex: demographics?.sex ?? 'male',
                  heightCm: Number.isNaN(v) ? 170 : v,
                });
              }}
              placeholder="cm"
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      {/* ── Phase tabs ─────────────────────────────────── */}
      <div className="flex gap-2">
        {([
          { key: 'pre' as ValuesPhase, label: 'Pre-broncodilatador' },
          { key: 'post' as ValuesPhase, label: 'Post-broncodilatador' },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActivePhase(tab.key)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
              activePhase === tab.key
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              activePhase === tab.key
                ? { backgroundColor: tab.key === 'pre' ? themeColor : '#22c55e' }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Values grid ────────────────────────────────── */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_90px_90px_70px] gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b">
          <span>Parámetro</span>
          <span className="text-center">Medido</span>
          <span className="text-center">Predicho</span>
          <span className="text-center">% Pred</span>
        </div>

        <div className="divide-y divide-gray-100">
          {VALUE_FIELDS.map((field) => {
            const actual = currentValues[field.key];
            const pred = predicted?.[field.key] ?? null;
            const pct = actual != null && pred != null ? percentPredicted(actual, pred) : null;

            let pctColor = '#6b7280';
            if (pct != null) {
              if (pct >= 80) pctColor = '#22c55e';
              else if (pct >= 60) pctColor = '#eab308';
              else pctColor = '#ef4444';
            }

            return (
              <div
                key={field.key}
                className="grid grid-cols-[1fr_90px_90px_70px] gap-2 px-4 py-2 items-center"
              >
                <span className="text-sm text-gray-700">
                  {field.label}
                  {field.unit && (
                    <span className="text-xs text-gray-400 ml-1">({field.unit})</span>
                  )}
                </span>

                <div className="flex justify-center">
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={actual ?? ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      updateValue(activePhase, field.key, Number.isNaN(v) ? null : v);
                    }}
                    placeholder="—"
                    className="w-20 text-center text-sm border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>

                <p className="text-sm text-center text-gray-400">
                  {pred != null
                    ? field.key === 'fev1Fvc'
                      ? pred.toFixed(2)
                      : pred.toFixed(1)
                    : '—'}
                </p>

                <p
                  className="text-sm text-center font-medium"
                  style={{ color: pctColor }}
                >
                  {pct != null ? `${pct}%` : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Interpretation ─────────────────────────────── */}
      {interpretation && (
        <div
          className={cn(
            'p-3 rounded-lg border',
            interpretation.pattern === 'normal'
              ? 'bg-green-50 border-green-100'
              : 'bg-orange-50 border-orange-100',
          )}
        >
          <p
            className={cn(
              'text-sm font-medium mb-1',
              interpretation.pattern === 'normal' ? 'text-green-700' : 'text-orange-700',
            )}
          >
            Interpretación automática
          </p>
          <p
            className={cn(
              'text-xs',
              interpretation.pattern === 'normal' ? 'text-green-600' : 'text-orange-600',
            )}
          >
            {interpretation.summary}
          </p>
          <div className="flex gap-3 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-gray-600">
              Patrón: {PATTERN_LABELS[interpretation.pattern]}
            </span>
            {interpretation.severity !== 'normal' && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  color: SEVERITY_CLASSIFICATION.find((s) => s.level === interpretation.severity)?.color,
                  backgroundColor: `${SEVERITY_CLASSIFICATION.find((s) => s.level === interpretation.severity)?.color}15`,
                }}
              >
                {SEVERITY_CLASSIFICATION.find((s) => s.level === interpretation.severity)?.label}
              </span>
            )}
            {interpretation.bronchodilatorResponse && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                BD +
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
