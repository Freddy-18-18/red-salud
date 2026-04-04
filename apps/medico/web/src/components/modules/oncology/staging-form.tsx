'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  T_CATEGORIES,
  N_CATEGORIES,
  M_CATEGORIES,
  HISTOLOGIC_GRADES,
  ECOG_SCALE,
  KARNOFSKY_SCALE,
  CANCER_TYPES,
  STAGE_COLORS,
  calculateOverallStage,
  ecogToKarnofsky,
  type TCategory,
  type NCategory,
  type MCategory,
  type HistologicGrade,
  type ECOGScore,
  type KarnofskyScore,
  type OverallStage,
} from './oncology-staging-data';

// ============================================================================
// TYPES
// ============================================================================

interface StagingFormProps {
  cancerType: string;
  onCancerTypeChange: (v: string) => void;
  diagnosisDate: string | null;
  onDiagnosisDateChange: (v: string | null) => void;
  tCategory: TCategory;
  onTChange: (v: TCategory) => void;
  nCategory: NCategory;
  onNChange: (v: NCategory) => void;
  mCategory: MCategory;
  onMChange: (v: MCategory) => void;
  overallStage: OverallStage;
  onStageChange: (v: OverallStage) => void;
  histologicGrade: HistologicGrade;
  onGradeChange: (v: HistologicGrade) => void;
  biomarkers: Record<string, string>;
  onBiomarkersChange: (v: Record<string, string>) => void;
  ecog: ECOGScore;
  onEcogChange: (v: ECOGScore) => void;
  karnofsky: KarnofskyScore;
  onKarnofskyChange: (v: KarnofskyScore) => void;
  themeColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StagingForm({
  cancerType,
  onCancerTypeChange,
  diagnosisDate,
  onDiagnosisDateChange,
  tCategory,
  onTChange,
  nCategory,
  onNChange,
  mCategory,
  onMChange,
  overallStage,
  onStageChange,
  histologicGrade,
  onGradeChange,
  biomarkers,
  onBiomarkersChange,
  ecog,
  onEcogChange,
  karnofsky,
  onKarnofskyChange,
  themeColor = '#8B5CF6',
}: StagingFormProps) {
  const [newBiomarkerKey, setNewBiomarkerKey] = useState('');
  const [newBiomarkerValue, setNewBiomarkerValue] = useState('');

  // Auto-calculate stage when TNM changes
  const autoStage = useMemo(
    () => calculateOverallStage(tCategory, nCategory, mCategory),
    [tCategory, nCategory, mCategory],
  );

  const handleTNMChange = useCallback(
    (setter: (v: any) => void, value: any) => {
      setter(value);
      // Recalculate stage after a tick to allow state to update
      setTimeout(() => {
        const newStage = calculateOverallStage(
          setter === onTChange ? value : tCategory,
          setter === onNChange ? value : nCategory,
          setter === onMChange ? value : mCategory,
        );
        onStageChange(newStage);
      }, 0);
    },
    [tCategory, nCategory, mCategory, onTChange, onNChange, onMChange, onStageChange],
  );

  const addBiomarker = useCallback(() => {
    if (!newBiomarkerKey.trim()) return;
    onBiomarkersChange({
      ...biomarkers,
      [newBiomarkerKey.trim()]: newBiomarkerValue.trim(),
    });
    setNewBiomarkerKey('');
    setNewBiomarkerValue('');
  }, [biomarkers, newBiomarkerKey, newBiomarkerValue, onBiomarkersChange]);

  const removeBiomarker = useCallback(
    (key: string) => {
      const updated = { ...biomarkers };
      delete updated[key];
      onBiomarkersChange(updated);
    },
    [biomarkers, onBiomarkersChange],
  );

  const stageColor = STAGE_COLORS[overallStage] ?? STAGE_COLORS['II'];

  return (
    <div className="space-y-4">
      {/* Cancer type & diagnosis date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo de cáncer</label>
          <select
            value={cancerType}
            onChange={(e) => onCancerTypeChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {CANCER_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha de diagnóstico</label>
          <input
            type="date"
            value={diagnosisDate ?? ''}
            onChange={(e) => onDiagnosisDateChange(e.target.value || null)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* TNM Classification */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Clasificación TNM</p>
        <div className="grid grid-cols-3 gap-3">
          {/* T */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Tumor (T)</label>
            <select
              value={tCategory}
              onChange={(e) => handleTNMChange(onTChange, e.target.value as TCategory)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {T_CATEGORIES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.description}
                </option>
              ))}
            </select>
          </div>
          {/* N */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Ganglios (N)</label>
            <select
              value={nCategory}
              onChange={(e) => handleTNMChange(onNChange, e.target.value as NCategory)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {N_CATEGORIES.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label} — {n.description}
                </option>
              ))}
            </select>
          </div>
          {/* M */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Metástasis (M)</label>
            <select
              value={mCategory}
              onChange={(e) => handleTNMChange(onMChange, e.target.value as MCategory)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {M_CATEGORIES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label} — {m.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall stage (auto-calculated) */}
      <div className="text-center p-3 rounded-lg border-2" style={{ borderColor: stageColor }}>
        <p className="text-xs text-gray-500">Estadio general</p>
        <p className="text-3xl font-bold" style={{ color: stageColor }}>
          Estadio {overallStage}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {tCategory}{nCategory}{mCategory}
        </p>
      </div>

      {/* Histologic grade */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Grado histológico</label>
        <div className="flex gap-2">
          {HISTOLOGIC_GRADES.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => onGradeChange(g.value)}
              className={cn(
                'flex-1 text-xs font-medium px-2 py-2 rounded-lg border transition-colors text-center',
                histologicGrade === g.value
                  ? 'border-transparent text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
              style={
                histologicGrade === g.value ? { backgroundColor: themeColor } : undefined
              }
              title={g.description}
            >
              {g.value}
            </button>
          ))}
        </div>
      </div>

      {/* Biomarkers */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Biomarcadores</p>
        {Object.entries(biomarkers).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(biomarkers).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
              >
                <span className="font-medium">{key}:</span> {value}
                <button
                  type="button"
                  onClick={() => removeBiomarker(key)}
                  className="text-gray-400 hover:text-red-500 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newBiomarkerKey}
            onChange={(e) => setNewBiomarkerKey(e.target.value)}
            placeholder="Marcador (ej: HER2)"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <input
            type="text"
            value={newBiomarkerValue}
            onChange={(e) => setNewBiomarkerValue(e.target.value)}
            placeholder="Valor (ej: +)"
            className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={addBiomarker}
            disabled={!newBiomarkerKey.trim()}
            className="text-xs font-medium px-3 py-1.5 text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: themeColor }}
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Performance status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ECOG</label>
          <select
            value={ecog}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10) as ECOGScore;
              onEcogChange(v);
              onKarnofskyChange(ecogToKarnofsky(v));
            }}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {ECOG_SCALE.filter((s) => s.score < 5).map((s) => (
              <option key={s.score} value={s.score}>
                {s.label} — {s.description}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Karnofsky</label>
          <select
            value={karnofsky}
            onChange={(e) => onKarnofskyChange(parseInt(e.target.value, 10) as KarnofskyScore)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {KARNOFSKY_SCALE.filter((s) => s.score > 0).map((s) => (
              <option key={s.score} value={s.score}>
                {s.score}% — {s.description}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
