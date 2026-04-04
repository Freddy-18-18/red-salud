'use client';

import { useState, useCallback } from 'react';
import { Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { VisualAcuityData, AcuityValue } from './use-ophthalmology';

// ============================================================================
// CONSTANTS
// ============================================================================

const ACUITY_VALUES: { value: AcuityValue; label: string }[] = [
  { value: '20/20', label: '20/20' },
  { value: '20/25', label: '20/25' },
  { value: '20/30', label: '20/30' },
  { value: '20/40', label: '20/40' },
  { value: '20/50', label: '20/50' },
  { value: '20/70', label: '20/70' },
  { value: '20/100', label: '20/100' },
  { value: '20/200', label: '20/200' },
  { value: 'CF', label: 'CF' },
  { value: 'MM', label: 'MM' },
  { value: 'PL', label: 'PL' },
  { value: 'NPL', label: 'NPL' },
];

const ACUITY_DESCRIPTIONS: Record<string, string> = {
  CF: 'Cuenta Dedos',
  MM: 'Movimiento de Manos',
  PL: 'Percepción de Luz',
  NPL: 'No Percepción de Luz',
};

/** Snellen row sizes (font size in SVG units) mapped to acuity values */
const SNELLEN_ROWS: { size: number; letters: string; acuity: string }[] = [
  { size: 48, letters: 'E', acuity: '20/200' },
  { size: 36, letters: 'FP', acuity: '20/100' },
  { size: 28, letters: 'TOZ', acuity: '20/70' },
  { size: 22, letters: 'LPED', acuity: '20/50' },
  { size: 18, letters: 'PECFD', acuity: '20/40' },
  { size: 14, letters: 'EDFCZP', acuity: '20/30' },
  { size: 11, letters: 'FELOPZD', acuity: '20/25' },
  { size: 9, letters: 'DEFPOTEC', acuity: '20/20' },
];

type EyeField =
  | 'od_uncorrected'
  | 'od_corrected'
  | 'od_pinhole'
  | 'os_uncorrected'
  | 'os_corrected'
  | 'os_pinhole'
  | 'ou_uncorrected'
  | 'ou_corrected';

// ============================================================================
// SNELLEN CHART SVG
// ============================================================================

function SnellenChartSvg({ themeColor }: { themeColor: string }) {
  return (
    <svg
      viewBox="0 0 260 320"
      className="w-full max-w-[260px] mx-auto"
      role="img"
      aria-label="Carta de Snellen"
    >
      {/* Background */}
      <rect width="260" height="320" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1" />

      {/* Title */}
      <text x="130" y="22" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="sans-serif">
        CARTA DE SNELLEN
      </text>

      {/* Rows */}
      {SNELLEN_ROWS.map((row, i) => {
        const y = 52 + i * 34;
        return (
          <g key={row.acuity}>
            <text
              x="130"
              y={y}
              textAnchor="middle"
              fontSize={row.size}
              fill="#1f2937"
              fontFamily="serif"
              fontWeight="bold"
              letterSpacing={row.size > 20 ? '4' : '2'}
            >
              {row.letters}
            </text>
            <text
              x="248"
              y={y - 2}
              textAnchor="end"
              fontSize="7"
              fill={themeColor}
              fontFamily="sans-serif"
            >
              {row.acuity}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// ACUITY SELECTOR
// ============================================================================

function AcuitySelector({
  label,
  value,
  onChange,
  themeColor,
}: {
  label: string;
  value: AcuityValue | null;
  onChange: (v: AcuityValue | null) => void;
  themeColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-500">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {ACUITY_VALUES.map((av) => {
          const isActive = value === av.value;
          const desc = ACUITY_DESCRIPTIONS[av.value];
          return (
            <button
              key={av.value}
              type="button"
              title={desc ?? av.label}
              onClick={() => onChange(isActive ? null : av.value)}
              className={cn(
                'text-xs font-medium px-2 py-1 rounded-md transition-colors border',
                isActive
                  ? 'text-white border-transparent'
                  : 'text-gray-600 border-gray-200 hover:border-gray-300 bg-white',
              )}
              style={isActive ? { backgroundColor: themeColor } : undefined}
            >
              {av.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// EYE SECTION
// ============================================================================

function EyeSection({
  title,
  eye,
  data,
  onChange,
  themeColor,
}: {
  title: string;
  eye: 'od' | 'os' | 'ou';
  data: VisualAcuityData;
  onChange: (field: EyeField, value: AcuityValue | null) => void;
  themeColor: string;
}) {
  const uncorrectedField = `${eye}_uncorrected` as EyeField;
  const correctedField = `${eye}_corrected` as EyeField;
  const pinholeField = eye !== 'ou' ? (`${eye}_pinhole` as EyeField) : null;

  return (
    <div className="space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <AcuitySelector
        label="Sin Corrección"
        value={data[uncorrectedField] ?? null}
        onChange={(v) => onChange(uncorrectedField, v)}
        themeColor={themeColor}
      />
      <AcuitySelector
        label="Con Corrección"
        value={data[correctedField] ?? null}
        onChange={(v) => onChange(correctedField, v)}
        themeColor={themeColor}
      />
      {pinholeField && (
        <AcuitySelector
          label="Agujero Estenopeico"
          value={data[pinholeField] ?? null}
          onChange={(v) => onChange(pinholeField, v)}
          themeColor={themeColor}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

interface VisualAcuityChartProps {
  value: VisualAcuityData;
  onChange: (data: VisualAcuityData) => void;
  themeColor?: string;
}

export function VisualAcuityChart({
  value,
  onChange,
  themeColor = '#7C3AED',
}: VisualAcuityChartProps) {
  const handleFieldChange = useCallback(
    (field: EyeField, acuity: AcuityValue | null) => {
      onChange({ ...value, [field]: acuity });
    },
    [value, onChange],
  );

  return (
    <div className="space-y-5">
      {/* Snellen chart visual */}
      <div className="flex justify-center">
        <SnellenChartSvg themeColor={themeColor} />
      </div>

      {/* Eye inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EyeSection
          title="Ojo Derecho (OD)"
          eye="od"
          data={value}
          onChange={handleFieldChange}
          themeColor={themeColor}
        />
        <EyeSection
          title="Ojo Izquierdo (OS)"
          eye="os"
          data={value}
          onChange={handleFieldChange}
          themeColor={themeColor}
        />
      </div>

      {/* Both eyes */}
      <EyeSection
        title="Ambos Ojos (OU)"
        eye="ou"
        data={value}
        onChange={handleFieldChange}
        themeColor={themeColor}
      />
    </div>
  );
}
