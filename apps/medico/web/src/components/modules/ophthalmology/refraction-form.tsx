'use client';

import { useCallback } from 'react';
import { Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { RefractionData } from './use-ophthalmology';

// ============================================================================
// CONSTANTS
// ============================================================================

const SPHERE_MIN = -20;
const SPHERE_MAX = 20;
const SPHERE_STEP = 0.25;
const CYLINDER_MIN = -10;
const CYLINDER_MAX = 0;
const CYLINDER_STEP = 0.25;
const AXIS_MIN = 0;
const AXIS_MAX = 180;
const ADD_MIN = 0;
const ADD_MAX = 4;
const ADD_STEP = 0.25;

// ============================================================================
// LENS DIAGRAM SVG
// ============================================================================

function LensDiagram({
  sphere,
  cylinder,
  label,
  themeColor,
}: {
  sphere: number | null;
  cylinder: number | null;
  label: string;
  themeColor: string;
}) {
  const sph = sphere ?? 0;
  const cyl = cylinder ?? 0;

  // Concave lens: negative sphere = thinner center
  // Convex lens: positive sphere = thicker center
  const maxBulge = 20;
  const bulge = Math.max(-maxBulge, Math.min(maxBulge, sph * 2));
  const cylEffect = Math.max(-10, Math.min(0, cyl));

  // Lens shape: two arcs
  const cx = 50;
  const topY = 15;
  const botY = 85;
  const leftBulge = bulge + cylEffect;
  const rightBulge = bulge;

  const leftPath = `M ${cx} ${topY} Q ${cx - 20 + leftBulge} 50 ${cx} ${botY}`;
  const rightPath = `M ${cx} ${topY} Q ${cx + 20 + rightBulge} 50 ${cx} ${botY}`;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <path d={leftPath} fill="none" stroke={themeColor} strokeWidth="2" opacity="0.7" />
        <path d={rightPath} fill="none" stroke={themeColor} strokeWidth="2" opacity="0.7" />
        {/* Center line */}
        <line
          x1={cx}
          y1={topY - 5}
          x2={cx}
          y2={botY + 5}
          stroke="#d1d5db"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      </svg>
      <span className="text-xs text-gray-400 mt-0.5">{label}</span>
      {(sph !== 0 || cyl !== 0) && (
        <span className="text-xs font-medium" style={{ color: themeColor }}>
          {sph > 0 ? '+' : ''}
          {sph.toFixed(2)} / {cyl.toFixed(2)}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// NUMERIC INPUT
// ============================================================================

function NumericField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-500">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange(null);
              return;
            }
            const num = parseFloat(raw);
            if (!isNaN(num) && num >= min && num <= max) {
              onChange(num);
            }
          }}
          min={min}
          max={max}
          step={step}
          className="h-9 text-sm pr-8"
          placeholder="—"
        />
        {unit && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EYE REFRACTION SECTION
// ============================================================================

function EyeRefractionSection({
  title,
  eye,
  data,
  onChange,
  themeColor,
}: {
  title: string;
  eye: 'od' | 'os';
  data: RefractionData;
  onChange: (field: keyof RefractionData, value: number | null) => void;
  themeColor: string;
}) {
  const sphereField = `${eye}_sphere` as keyof RefractionData;
  const cylinderField = `${eye}_cylinder` as keyof RefractionData;
  const axisField = `${eye}_axis` as keyof RefractionData;
  const addField = `${eye}_add` as keyof RefractionData;

  return (
    <div className="space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <LensDiagram
          sphere={data[sphereField]}
          cylinder={data[cylinderField]}
          label={eye.toUpperCase()}
          themeColor={themeColor}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NumericField
          label="Esfera"
          value={data[sphereField]}
          onChange={(v) => onChange(sphereField, v)}
          min={SPHERE_MIN}
          max={SPHERE_MAX}
          step={SPHERE_STEP}
          unit="D"
        />
        <NumericField
          label="Cilindro"
          value={data[cylinderField]}
          onChange={(v) => onChange(cylinderField, v)}
          min={CYLINDER_MIN}
          max={CYLINDER_MAX}
          step={CYLINDER_STEP}
          unit="D"
        />
        <NumericField
          label="Eje"
          value={data[axisField]}
          onChange={(v) => onChange(axisField, v)}
          min={AXIS_MIN}
          max={AXIS_MAX}
          step={1}
          unit="°"
        />
        <NumericField
          label="Adición"
          value={data[addField]}
          onChange={(v) => onChange(addField, v)}
          min={ADD_MIN}
          max={ADD_MAX}
          step={ADD_STEP}
          unit="D"
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

interface RefractionFormProps {
  value: RefractionData;
  onChange: (data: RefractionData) => void;
  themeColor?: string;
}

export function RefractionForm({
  value,
  onChange,
  themeColor = '#7C3AED',
}: RefractionFormProps) {
  const handleFieldChange = useCallback(
    (field: keyof RefractionData, v: number | null) => {
      onChange({ ...value, [field]: v });
    },
    [value, onChange],
  );

  return (
    <div className="space-y-4">
      {/* Eye sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EyeRefractionSection
          title="Ojo Derecho (OD)"
          eye="od"
          data={value}
          onChange={handleFieldChange}
          themeColor={themeColor}
        />
        <EyeRefractionSection
          title="Ojo Izquierdo (OS)"
          eye="os"
          data={value}
          onChange={handleFieldChange}
          themeColor={themeColor}
        />
      </div>

      {/* Pupillary distance */}
      <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
        <div className="max-w-[200px]">
          <NumericField
            label="Distancia Pupilar"
            value={value.pupillary_distance}
            onChange={(v) => handleFieldChange('pupillary_distance', v)}
            min={40}
            max={80}
            step={0.5}
            unit="mm"
          />
        </div>
      </div>

      {/* Visual comparison of both lenses */}
      <div className="flex items-center justify-center gap-8 py-3">
        <LensDiagram
          sphere={value.od_sphere}
          cylinder={value.od_cylinder}
          label="OD"
          themeColor={themeColor}
        />
        <div className="h-12 w-px bg-gray-200" />
        <LensDiagram
          sphere={value.os_sphere}
          cylinder={value.os_cylinder}
          label="OS"
          themeColor={themeColor}
        />
      </div>
    </div>
  );
}
