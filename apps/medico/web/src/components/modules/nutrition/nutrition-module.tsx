'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Apple, Scale } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import { useNutrition, type CreateNutritionAssessment } from './use-nutrition';
import { calculateBMI, getBMICategoryInfo } from './nutrition-reference-data';
import { BodyComposition } from './body-composition';
import { CaloricCalculator } from './caloric-calculator';

// ============================================================================
// COMPONENT
// ============================================================================

export default function NutritionModule({
  doctorId,
  patientId,
  config,
  themeColor = '#22c55e',
}: ModuleComponentProps) {
  // State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<'composition' | 'calculator'>('composition');

  // Form state
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [waistCm, setWaistCm] = useState<number | null>(null);
  const [hipCm, setHipCm] = useState<number | null>(null);
  const [skinfolds, setSkinfolds] = useState<{
    biceps: number; triceps: number; subscapular: number; suprailiac: number;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>((config?.patientSex as 'male' | 'female') ?? 'male');
  const [age, setAge] = useState<number | null>((config?.patientAge as number) ?? null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const [targetKcal, setTargetKcal] = useState<number | null>(null);

  // Data
  const { assessments, loading, error, create } = useNutrition(doctorId, {
    patientId,
    limit: 20,
  });

  // Weight history for trend
  const weightHistory = useMemo(() => {
    return assessments
      .filter((a) => a.weight_kg != null)
      .map((a) => ({ date: a.assessment_date, weight: a.weight_kg! }))
      .reverse();
  }, [assessments]);

  const handleCreate = useCallback(async () => {
    setIsSubmitting(true);

    const bmi = weightKg != null && heightCm != null ? calculateBMI(weightKg, heightCm) : null;
    const whr = waistCm != null && hipCm != null && hipCm > 0
      ? Math.round((waistCm / hipCm) * 100) / 100
      : null;

    const data: CreateNutritionAssessment = {
      patient_id: patientId,
      weight_kg: weightKg,
      height_cm: heightCm,
      bmi,
      waist_cm: waistCm,
      hip_cm: hipCm,
      waist_hip_ratio: whr,
      skinfolds,
      bmr,
      tdee,
      target_kcal: targetKcal,
      notes: notes || null,
    };

    await create(data);
    setIsSubmitting(false);
    setShowForm(false);
    resetForm();
  }, [weightKg, heightCm, waistCm, hipCm, skinfolds, bmr, tdee, targetKcal, notes, patientId, create]);

  const resetForm = useCallback(() => {
    setWeightKg(null);
    setHeightCm(null);
    setWaistCm(null);
    setHipCm(null);
    setSkinfolds(null);
    setNotes('');
    setBmr(null);
    setTdee(null);
    setTargetKcal(null);
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
        moduleKey="nutrition-assessment"
        title="Evaluación Nutricional"
        icon="Apple"
        themeColor={themeColor}
      >
        <div className="space-y-4">
          {/* Demographics for calculator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sexo</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Edad</label>
              <input
                type="number"
                min={1}
                max={120}
                value={age ?? ''}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setAge(Number.isNaN(v) ? null : v);
                }}
                placeholder="Años"
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            {([
              { key: 'composition' as const, label: 'Composición corporal' },
              { key: 'calculator' as const, label: 'Calculadora calórica' },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveView(tab.key)}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
                  activeView === tab.key
                    ? 'text-white'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
                )}
                style={
                  activeView === tab.key ? { backgroundColor: themeColor } : undefined
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body composition */}
          {activeView === 'composition' && (
            <BodyComposition
              weightKg={weightKg}
              heightCm={heightCm}
              waistCm={waistCm}
              hipCm={hipCm}
              skinfolds={skinfolds}
              age={age}
              sex={sex}
              onWeightChange={setWeightKg}
              onHeightChange={setHeightCm}
              onWaistChange={setWaistCm}
              onHipChange={setHipCm}
              onSkinfoldsChange={setSkinfolds}
              weightHistory={weightHistory}
              themeColor={themeColor}
            />
          )}

          {/* Caloric calculator */}
          {activeView === 'calculator' && (
            <CaloricCalculator
              weightKg={weightKg}
              heightCm={heightCm}
              age={age}
              sex={sex}
              onBmrChange={setBmr}
              onTdeeChange={setTdee}
              onTargetChange={setTargetKcal}
              themeColor={themeColor}
            />
          )}

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
      moduleKey="nutrition-assessment"
      title="Evaluación Nutricional"
      icon="Apple"
      description="Composición corporal y requerimientos calóricos"
      themeColor={themeColor}
      isEmpty={!loading && assessments.length === 0}
      emptyMessage="Sin evaluaciones nutricionales registradas"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* Latest BMI card */}
      {latest && latest.bmi != null && (
        <div className="mb-4 flex items-center gap-4 p-3 rounded-lg bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">IMC</p>
            <p
              className="text-2xl font-bold"
              style={{ color: getBMICategoryInfo(latest.bmi).color }}
            >
              {latest.bmi.toFixed(1)}
            </p>
            <p className="text-[10px]" style={{ color: getBMICategoryInfo(latest.bmi).color }}>
              {getBMICategoryInfo(latest.bmi).label}
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            {latest.weight_kg != null && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Peso</p>
                <p className="text-sm font-bold text-gray-700">{latest.weight_kg} kg</p>
              </div>
            )}
            {latest.height_cm != null && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Talla</p>
                <p className="text-sm font-bold text-gray-700">{latest.height_cm} cm</p>
              </div>
            )}
            {latest.tdee != null && (
              <div className="text-center">
                <p className="text-xs text-gray-500">TDEE</p>
                <p className="text-sm font-bold text-gray-700">{latest.tdee} kcal</p>
              </div>
            )}
            {latest.body_fat_percent != null && (
              <div className="text-center">
                <p className="text-xs text-gray-500">% Grasa</p>
                <p className="text-sm font-bold text-gray-700">{latest.body_fat_percent}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weight trend */}
      {weightHistory.length > 1 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Tendencia de peso</p>
          <svg viewBox="0 0 300 60" className="w-full h-12">
            {(() => {
              const maxW = Math.max(...weightHistory.map((d) => d.weight));
              const minW = Math.min(...weightHistory.map((d) => d.weight));
              const range = maxW - minW || 1;
              const pts = weightHistory.map((d, i) => {
                const x = 10 + (i / (weightHistory.length - 1)) * 280;
                const y = 55 - ((d.weight - minW) / range) * 50;
                return `${x},${y}`;
              });
              return (
                <polyline
                  points={pts.join(' ')}
                  fill="none"
                  stroke={themeColor}
                  strokeWidth={2}
                />
              );
            })()}
          </svg>
        </div>
      )}

      {/* Assessment history */}
      <div className="space-y-2">
        {assessments.map((assessment) => {
          const bmiInfo = assessment.bmi != null ? getBMICategoryInfo(assessment.bmi) : null;

          return (
            <div
              key={assessment.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeColor}10` }}
              >
                <Scale className="h-5 w-5" style={{ color: themeColor }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  {assessment.weight_kg != null ? `${assessment.weight_kg} kg` : '—'}
                  {' | '}
                  {assessment.bmi != null ? `IMC ${assessment.bmi.toFixed(1)}` : '—'}
                </p>
                {bmiInfo && (
                  <p className="text-xs" style={{ color: bmiInfo.color }}>
                    {bmiInfo.label}
                  </p>
                )}
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
