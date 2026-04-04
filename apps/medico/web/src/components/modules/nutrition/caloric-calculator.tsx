'use client';

import { useState, useMemo } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  harrisBenedictBMR,
  mifflinStJeorBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroGrams,
  ACTIVITY_LEVELS,
  NUTRITION_GOALS,
  MACRO_PRESETS,
  type ActivityLevel,
  type NutritionGoal,
  type MacroSplit,
} from './nutrition-reference-data';

// ============================================================================
// TYPES
// ============================================================================

interface CaloricCalculatorProps {
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  sex: 'male' | 'female';
  onBmrChange?: (bmr: number) => void;
  onTdeeChange?: (tdee: number) => void;
  onTargetChange?: (target: number) => void;
  themeColor?: string;
}

type BmrFormula = 'harris_benedict' | 'mifflin_st_jeor';

// ============================================================================
// PIE CHART
// ============================================================================

function MacroPieChart({
  split,
  totalKcal,
  themeColor,
}: {
  split: MacroSplit;
  totalKcal: number;
  themeColor: string;
}) {
  const macros = calculateMacroGrams(totalKcal, split);
  const cx = 60;
  const cy = 60;
  const r = 50;

  const segments = [
    { label: 'Proteína', pct: split.protein, grams: macros.proteinG, color: '#ef4444' },
    { label: 'Carbohidratos', pct: split.carbs, grams: macros.carbsG, color: '#3b82f6' },
    { label: 'Grasas', pct: split.fat, grams: macros.fatG, color: '#eab308' },
  ];

  let currentAngle = -90; // Start at top

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
        {segments.map((seg) => {
          const startAngle = currentAngle;
          const sweepAngle = (seg.pct / 100) * 360;
          currentAngle += sweepAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = ((startAngle + sweepAngle) * Math.PI) / 180;

          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);

          const largeArc = sweepAngle > 180 ? 1 : 0;

          return (
            <path
              key={seg.label}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={seg.color}
              opacity={0.7}
              stroke="white"
              strokeWidth={2}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={25} fill="white" />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          fill="#374151"
          className="select-none"
        >
          {totalKcal}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize={8}
          fill="#9ca3af"
          className="select-none"
        >
          kcal
        </text>
      </svg>

      <div className="space-y-2 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <div className="flex-1">
              <p className="text-xs text-gray-700 font-medium">{seg.label}</p>
              <p className="text-[10px] text-gray-400">
                {seg.grams}g ({seg.pct}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CaloricCalculator({
  weightKg,
  heightCm,
  age,
  sex,
  onBmrChange,
  onTdeeChange,
  onTargetChange,
  themeColor = '#22c55e',
}: CaloricCalculatorProps) {
  const [formula, setFormula] = useState<BmrFormula>('mifflin_st_jeor');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentary');
  const [goal, setGoal] = useState<NutritionGoal>('maintain');
  const [macroPresetIdx, setMacroPresetIdx] = useState(0);

  const canCalculate = weightKg != null && heightCm != null && age != null;

  const bmr = useMemo(() => {
    if (!canCalculate) return null;
    const val =
      formula === 'harris_benedict'
        ? harrisBenedictBMR(weightKg!, heightCm!, age!, sex)
        : mifflinStJeorBMR(weightKg!, heightCm!, age!, sex);
    const rounded = Math.round(val);
    onBmrChange?.(rounded);
    return rounded;
  }, [weightKg, heightCm, age, sex, formula, canCalculate, onBmrChange]);

  const tdee = useMemo(() => {
    if (bmr == null) return null;
    const val = calculateTDEE(bmr, activityLevel);
    onTdeeChange?.(val);
    return val;
  }, [bmr, activityLevel, onTdeeChange]);

  const targetKcal = useMemo(() => {
    if (tdee == null) return null;
    const val = calculateTargetCalories(tdee, goal);
    onTargetChange?.(val);
    return val;
  }, [tdee, goal, onTargetChange]);

  const macroSplit = MACRO_PRESETS[macroPresetIdx].split;

  if (!canCalculate) {
    return (
      <div className="text-center py-6 text-sm text-gray-400">
        Complete peso, talla y edad para calcular requerimientos calóricos.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* BMR Formula */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fórmula de TMB</label>
        <div className="flex gap-2">
          {([
            { key: 'mifflin_st_jeor' as BmrFormula, label: 'Mifflin-St Jeor' },
            { key: 'harris_benedict' as BmrFormula, label: 'Harris-Benedict' },
          ]).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFormula(f.key)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
                formula === f.key
                  ? 'text-white'
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
              )}
              style={
                formula === f.key ? { backgroundColor: themeColor } : undefined
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* BMR result */}
      {bmr != null && (
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Tasa Metabólica Basal (TMB)</p>
          <p className="text-xl font-bold text-gray-700">{bmr} kcal/día</p>
        </div>
      )}

      {/* Activity level */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nivel de actividad</label>
        <div className="space-y-1">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.key}
              type="button"
              onClick={() => setActivityLevel(level.key)}
              className={cn(
                'w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors',
                activityLevel === level.key
                  ? 'border-transparent text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
              style={
                activityLevel === level.key ? { backgroundColor: themeColor } : undefined
              }
            >
              <span className="font-medium">{level.label}</span>
              <span className={cn('ml-2', activityLevel === level.key ? 'text-white/80' : 'text-gray-400')}>
                — {level.description} (x{level.factor})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TDEE */}
      {tdee != null && (
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Gasto Energético Total (TDEE)</p>
          <p className="text-xl font-bold text-gray-700">{tdee} kcal/día</p>
        </div>
      )}

      {/* Goal */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Objetivo nutricional</label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value as NutritionGoal)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {NUTRITION_GOALS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target kcal */}
      {targetKcal != null && (
        <div className="text-center p-3 rounded-lg border-2" style={{ borderColor: themeColor }}>
          <p className="text-xs text-gray-500">Calorías objetivo</p>
          <p className="text-2xl font-bold" style={{ color: themeColor }}>
            {targetKcal} kcal/día
          </p>
        </div>
      )}

      {/* Macronutrient split */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Distribución de macronutrientes</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {MACRO_PRESETS.map((preset, i) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setMacroPresetIdx(i)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
                macroPresetIdx === i
                  ? 'text-white'
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
              )}
              style={
                macroPresetIdx === i ? { backgroundColor: themeColor } : undefined
              }
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {targetKcal != null && (
          <MacroPieChart
            split={macroSplit}
            totalKcal={targetKcal}
            themeColor={themeColor}
          />
        )}
      </div>
    </div>
  );
}
