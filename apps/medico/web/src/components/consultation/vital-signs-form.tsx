'use client';

import { useCallback } from 'react';
import {
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Ruler,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface VitalSigns {
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  height: number | null;
}

interface VitalSignsFormProps {
  value: VitalSigns;
  onChange: (signs: VitalSigns) => void;
  disabled?: boolean;
  themeColor?: string;
}

// ============================================================================
// FIELD CONFIG
// ============================================================================

interface VitalField {
  key: keyof VitalSigns;
  label: string;
  unit: string;
  icon: typeof HeartPulse;
  min: number;
  max: number;
  step: number;
  normalRange: [number, number];
  criticalLow?: number;
  criticalHigh?: number;
  placeholder: string;
}

const VITAL_FIELDS: VitalField[] = [
  {
    key: 'systolic_bp',
    label: 'PA Sistólica',
    unit: 'mmHg',
    icon: Droplets,
    min: 50,
    max: 300,
    step: 1,
    normalRange: [90, 140],
    criticalLow: 80,
    criticalHigh: 180,
    placeholder: '120',
  },
  {
    key: 'diastolic_bp',
    label: 'PA Diastólica',
    unit: 'mmHg',
    icon: Droplets,
    min: 30,
    max: 200,
    step: 1,
    normalRange: [60, 90],
    criticalLow: 50,
    criticalHigh: 120,
    placeholder: '80',
  },
  {
    key: 'heart_rate',
    label: 'Frecuencia Cardíaca',
    unit: 'lpm',
    icon: HeartPulse,
    min: 20,
    max: 250,
    step: 1,
    normalRange: [60, 100],
    criticalLow: 40,
    criticalHigh: 150,
    placeholder: '72',
  },
  {
    key: 'temperature',
    label: 'Temperatura',
    unit: '°C',
    icon: Thermometer,
    min: 30,
    max: 45,
    step: 0.1,
    normalRange: [36.0, 37.5],
    criticalLow: 35.0,
    criticalHigh: 39.5,
    placeholder: '36.5',
  },
  {
    key: 'respiratory_rate',
    label: 'Frecuencia Respiratoria',
    unit: 'rpm',
    icon: Wind,
    min: 5,
    max: 60,
    step: 1,
    normalRange: [12, 20],
    criticalLow: 8,
    criticalHigh: 30,
    placeholder: '16',
  },
  {
    key: 'oxygen_saturation',
    label: 'Saturación O₂',
    unit: '%',
    icon: Wind,
    min: 50,
    max: 100,
    step: 1,
    normalRange: [95, 100],
    criticalLow: 90,
    placeholder: '98',
  },
  {
    key: 'weight',
    label: 'Peso',
    unit: 'kg',
    icon: Scale,
    min: 0.5,
    max: 300,
    step: 0.1,
    normalRange: [40, 120],
    placeholder: '70',
  },
  {
    key: 'height',
    label: 'Talla',
    unit: 'cm',
    icon: Ruler,
    min: 30,
    max: 250,
    step: 0.5,
    normalRange: [140, 200],
    placeholder: '170',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function getValueStatus(
  value: number | null,
  field: VitalField,
): 'normal' | 'warning' | 'critical' | 'none' {
  if (value === null) return 'none';

  const [low, high] = field.normalRange;

  if (field.criticalLow !== undefined && value < field.criticalLow) return 'critical';
  if (field.criticalHigh !== undefined && value > field.criticalHigh) return 'critical';
  if (value < low || value > high) return 'warning';
  return 'normal';
}

const STATUS_STYLES = {
  none: 'border-gray-200',
  normal: 'border-emerald-300 bg-emerald-50/30',
  warning: 'border-amber-300 bg-amber-50/30',
  critical: 'border-red-400 bg-red-50/30',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function VitalSignsForm({
  value,
  onChange,
  disabled = false,
}: VitalSignsFormProps) {
  const handleChange = useCallback(
    (key: keyof VitalSigns, rawValue: string) => {
      const num = rawValue === '' ? null : Number(rawValue);
      onChange({ ...value, [key]: num });
    },
    [value, onChange],
  );

  // Calculate BMI if weight and height are available
  const bmi = value.weight && value.height
    ? (value.weight / ((value.height / 100) ** 2)).toFixed(1)
    : null;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VITAL_FIELDS.map((field) => {
          const Icon = field.icon;
          const status = getValueStatus(value[field.key], field);

          return (
            <div
              key={field.key}
              className={`rounded-lg border px-3 py-2.5 transition-colors ${STATUS_STYLES[status]}`}
            >
              <label className="flex items-center gap-1.5 mb-1.5">
                <Icon className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">{field.label}</span>
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={value[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  disabled={disabled}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={field.placeholder}
                  className={`
                    w-full text-lg font-semibold bg-transparent border-none outline-none
                    placeholder:text-gray-200 [appearance:textfield]
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                    ${disabled ? 'text-gray-400' : 'text-gray-900'}
                  `}
                />
                <span className="text-xs text-gray-400 flex-shrink-0">{field.unit}</span>
              </div>
              {status === 'warning' && (
                <p className="text-[10px] text-amber-600 mt-0.5">Fuera de rango normal</p>
              )}
              {status === 'critical' && (
                <p className="text-[10px] text-red-600 font-semibold mt-0.5">Valor crítico</p>
              )}
            </div>
          );
        })}
      </div>

      {/* BMI display */}
      {bmi && (
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
          <span className="text-xs text-gray-500">IMC calculado:</span>
          <span className="text-sm font-semibold text-gray-800">{bmi} kg/m²</span>
          <span className="text-xs text-gray-400">
            ({Number(bmi) < 18.5
              ? 'Bajo peso'
              : Number(bmi) < 25
                ? 'Normal'
                : Number(bmi) < 30
                  ? 'Sobrepeso'
                  : 'Obesidad'})
          </span>
        </div>
      )}
    </div>
  );
}
