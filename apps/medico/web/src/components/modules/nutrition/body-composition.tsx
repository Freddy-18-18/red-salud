'use client';

import { useMemo } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  calculateBMI,
  getBMICategoryInfo,
  waistHipRatio,
  estimateBodyFat,
  BMI_CATEGORIES,
} from './nutrition-reference-data';

// ============================================================================
// TYPES
// ============================================================================

interface BodyCompositionProps {
  weightKg: number | null;
  heightCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  skinfolds: { biceps: number; triceps: number; subscapular: number; suprailiac: number } | null;
  age: number | null;
  sex: 'male' | 'female';
  onWeightChange: (v: number | null) => void;
  onHeightChange: (v: number | null) => void;
  onWaistChange: (v: number | null) => void;
  onHipChange: (v: number | null) => void;
  onSkinfoldsChange: (v: { biceps: number; triceps: number; subscapular: number; suprailiac: number } | null) => void;
  /** Weight history for trend chart */
  weightHistory?: Array<{ date: string; weight: number }>;
  themeColor?: string;
  readOnly?: boolean;
}

// ============================================================================
// BMI GAUGE
// ============================================================================

function BmiGauge({ bmi, themeColor }: { bmi: number; themeColor: string }) {
  const info = getBMICategoryInfo(bmi);

  // Gauge arc: maps BMI 12-45 to 0-180 degrees
  const minBmi = 12;
  const maxBmi = 45;
  const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi));
  const angle = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 180;

  const cx = 100;
  const cy = 90;
  const r = 70;

  // Arc segments for BMI bands
  const segments = BMI_CATEGORIES.map((cat) => {
    const startAngle = ((Math.max(cat.min, minBmi) - minBmi) / (maxBmi - minBmi)) * 180;
    const endAngle = ((Math.min(cat.max, maxBmi) - minBmi) / (maxBmi - minBmi)) * 180;
    return { ...cat, startAngle, endAngle };
  });

  // Needle endpoint
  const needleAngle = (180 - angle) * (Math.PI / 180);
  const nx = cx + (r - 10) * Math.cos(needleAngle);
  const ny = cy - (r - 10) * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-48 h-auto">
        {/* Background arc segments */}
        {segments.map((seg) => {
          const start = (180 - seg.startAngle) * (Math.PI / 180);
          const end = (180 - seg.endAngle) * (Math.PI / 180);
          const x1 = cx + r * Math.cos(start);
          const y1 = cy - r * Math.sin(start);
          const x2 = cx + r * Math.cos(end);
          const y2 = cy - r * Math.sin(end);
          const largeArc = seg.endAngle - seg.startAngle > 90 ? 1 : 0;

          return (
            <path
              key={seg.key}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeLinecap="round"
              opacity={0.3}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={info.color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill={info.color} />

        {/* Value */}
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fontSize={18}
          fontWeight="bold"
          fill={info.color}
          className="select-none"
        >
          {bmi.toFixed(1)}
        </text>
      </svg>
      <span
        className="text-xs font-medium px-3 py-1 rounded-full -mt-2"
        style={{ color: info.color, backgroundColor: `${info.color}15` }}
      >
        {info.label}
      </span>
    </div>
  );
}

// ============================================================================
// WEIGHT TREND CHART
// ============================================================================

function WeightTrendChart({
  data,
  themeColor,
}: {
  data: Array<{ date: string; weight: number }>;
  themeColor: string;
}) {
  if (data.length < 2) return null;

  const maxW = Math.max(...data.map((d) => d.weight));
  const minW = Math.min(...data.map((d) => d.weight));
  const range = maxW - minW || 1;

  const points = data.map((d, i) => {
    const x = 10 + (i / (data.length - 1)) * 280;
    const y = 70 - ((d.weight - minW) / range) * 60;
    return { x, y, ...d };
  });

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">Tendencia de peso</p>
      <svg viewBox="0 0 300 80" className="w-full h-16">
        {/* Area fill */}
        <path
          d={`M ${points[0].x} ${points[0].y} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} 70 L ${points[0].x} 70 Z`}
          fill={themeColor}
          opacity={0.08}
        />
        {/* Line */}
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={themeColor}
          strokeWidth={2}
        />
        {/* Dots */}
        {points.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="white"
            stroke={themeColor}
            strokeWidth={1.5}
          />
        ))}
        {/* Labels */}
        <text x={points[0].x} y={78} textAnchor="start" fontSize={8} fill="#9ca3af">
          {points[0].date.slice(5)}
        </text>
        <text x={points[points.length - 1].x} y={78} textAnchor="end" fontSize={8} fill="#9ca3af">
          {points[points.length - 1].date.slice(5)}
        </text>
      </svg>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BodyComposition({
  weightKg,
  heightCm,
  waistCm,
  hipCm,
  skinfolds,
  age,
  sex,
  onWeightChange,
  onHeightChange,
  onWaistChange,
  onHipChange,
  onSkinfoldsChange,
  weightHistory,
  themeColor = '#22c55e',
  readOnly = false,
}: BodyCompositionProps) {
  const bmi = useMemo(() => {
    if (weightKg == null || heightCm == null || heightCm <= 0) return null;
    return calculateBMI(weightKg, heightCm);
  }, [weightKg, heightCm]);

  const whr = useMemo(() => {
    if (waistCm == null || hipCm == null) return null;
    return waistHipRatio(waistCm, hipCm);
  }, [waistCm, hipCm]);

  const bodyFat = useMemo(() => {
    if (!skinfolds || age == null) return null;
    return estimateBodyFat(sex, age, skinfolds);
  }, [skinfolds, age, sex]);

  const renderInput = (
    label: string,
    value: number | null,
    onChange: (v: number | null) => void,
    unit: string,
    min = 0,
    max = 500,
    step = 0.1,
  ) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {readOnly ? (
        <p className="text-sm font-medium text-gray-700">
          {value != null ? `${value} ${unit}` : '—'}
        </p>
      ) : (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value ?? ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onChange(Number.isNaN(v) ? null : v);
            }}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-xs text-gray-400 shrink-0">{unit}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* BMI gauge */}
      {bmi != null && (
        <BmiGauge bmi={bmi} themeColor={themeColor} />
      )}

      {/* Weight trend */}
      {weightHistory && weightHistory.length > 1 && (
        <WeightTrendChart data={weightHistory} themeColor={themeColor} />
      )}

      {/* Basic measurements */}
      <div className="grid grid-cols-2 gap-3">
        {renderInput('Peso', weightKg, onWeightChange, 'kg', 20, 300, 0.1)}
        {renderInput('Talla', heightCm, onHeightChange, 'cm', 50, 250, 0.1)}
      </div>

      {/* Computed BMI */}
      {bmi != null && !readOnly && (
        <div className="text-center text-xs text-gray-400">
          IMC calculado: <span className="font-medium text-gray-600">{bmi.toFixed(1)} kg/m²</span>
        </div>
      )}

      {/* Waist/hip */}
      <div className="grid grid-cols-2 gap-3">
        {renderInput('Circunferencia cintura', waistCm, onWaistChange, 'cm', 40, 200, 0.5)}
        {renderInput('Circunferencia cadera', hipCm, onHipChange, 'cm', 50, 200, 0.5)}
      </div>

      {whr != null && (
        <div className="text-center text-xs text-gray-400">
          Índice cintura/cadera:{' '}
          <span
            className={cn(
              'font-medium',
              (sex === 'male' && whr > 0.9) || (sex === 'female' && whr > 0.85)
                ? 'text-orange-600'
                : 'text-green-600',
            )}
          >
            {whr.toFixed(2)}
          </span>
          {' '}
          ({(sex === 'male' && whr > 0.9) || (sex === 'female' && whr > 0.85)
            ? 'Riesgo elevado'
            : 'Normal'})
        </div>
      )}

      {/* Skinfolds */}
      {!readOnly && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Pliegues cutáneos (mm) — Durnin-Womersley
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['biceps', 'triceps', 'subscapular', 'suprailiac'] as const).map((site) => {
              const labels: Record<string, string> = {
                biceps: 'Bíceps',
                triceps: 'Tríceps',
                subscapular: 'Subescapular',
                suprailiac: 'Suprailíaco',
              };
              return (
                <div key={site}>
                  <label className="block text-xs text-gray-500 mb-1">{labels[site]}</label>
                  <input
                    type="number"
                    min={2}
                    max={80}
                    step={0.5}
                    value={skinfolds?.[site] ?? ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      const current = skinfolds ?? { biceps: 0, triceps: 0, subscapular: 0, suprailiac: 0 };
                      onSkinfoldsChange({
                        ...current,
                        [site]: Number.isNaN(v) ? 0 : v,
                      });
                    }}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Body fat result */}
      {bodyFat != null && (
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Grasa corporal estimada</p>
          <p className="text-2xl font-bold text-gray-700">{bodyFat}%</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {sex === 'male'
              ? bodyFat < 14
                ? 'Atlético'
                : bodyFat < 20
                  ? 'Fitness'
                  : bodyFat < 25
                    ? 'Aceptable'
                    : 'Exceso'
              : bodyFat < 21
                ? 'Atlético'
                : bodyFat < 25
                  ? 'Fitness'
                  : bodyFat < 32
                    ? 'Aceptable'
                    : 'Exceso'}
          </p>
        </div>
      )}
    </div>
  );
}
