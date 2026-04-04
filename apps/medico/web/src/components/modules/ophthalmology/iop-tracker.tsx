'use client';

import { useMemo, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { IopData, IopMethod, OphthalmologyExam } from './use-ophthalmology';

// ============================================================================
// CONSTANTS
// ============================================================================

const IOP_NORMAL_MIN = 10;
const IOP_NORMAL_MAX = 21;

const IOP_METHODS: { value: IopMethod; label: string }[] = [
  { value: 'goldmann', label: 'Goldmann' },
  { value: 'tonopen', label: 'Tonopen' },
  { value: 'icare', label: 'iCare' },
  { value: 'non_contact', label: 'No contacto' },
  { value: 'palpation', label: 'Palpación' },
];

// ============================================================================
// IOP TREND CHART (SVG)
// ============================================================================

interface IopTrendPoint {
  date: string;
  od: number | null;
  os: number | null;
}

function IopTrendChart({
  data,
  themeColor,
}: {
  data: IopTrendPoint[];
  themeColor: string;
}) {
  const chartMetrics = useMemo(() => {
    if (data.length === 0) return null;

    const allValues = data
      .flatMap((d) => [d.od, d.os])
      .filter((v): v is number => v !== null);

    if (allValues.length === 0) return null;

    const minVal = Math.min(...allValues, IOP_NORMAL_MIN - 2);
    const maxVal = Math.max(...allValues, IOP_NORMAL_MAX + 5);

    const padding = 40;
    const width = 500;
    const height = 200;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    const xScale = (i: number) => padding + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
    const yScale = (v: number) => padding + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;

    // Normal range band
    const normalTop = yScale(IOP_NORMAL_MAX);
    const normalBot = yScale(IOP_NORMAL_MIN);

    // Line paths
    const buildPath = (key: 'od' | 'os') => {
      const points = data
        .map((d, i) => {
          const v = d[key];
          if (v === null) return null;
          return `${xScale(i)},${yScale(v)}`;
        })
        .filter(Boolean);

      if (points.length < 2) return null;
      return `M ${points.join(' L ')}`;
    };

    return { minVal, maxVal, width, height, padding, plotW, plotH, xScale, yScale, normalTop, normalBot, buildPath };
  }, [data]);

  if (!chartMetrics || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        Sin datos históricos disponibles
      </div>
    );
  }

  const { width, height, padding, plotW, xScale, yScale, normalTop, normalBot, buildPath, minVal, maxVal } = chartMetrics;

  const odPath = buildPath('od');
  const osPath = buildPath('os');

  // Y-axis ticks
  const yTicks: number[] = [];
  const step = maxVal - minVal > 20 ? 5 : maxVal - minVal > 10 ? 3 : 2;
  for (let v = Math.ceil(minVal / step) * step; v <= maxVal; v += step) {
    yTicks.push(v);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Tendencia de PIO">
      {/* Normal range band */}
      <rect
        x={padding}
        y={normalTop}
        width={plotW}
        height={normalBot - normalTop}
        fill="#10b98115"
        rx="2"
      />
      <text x={padding + 4} y={normalTop + 12} fontSize="8" fill="#10b981" fontFamily="sans-serif">
        Rango normal (10-21)
      </text>

      {/* Y-axis ticks */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={padding}
            y1={yScale(v)}
            x2={padding + plotW}
            y2={yScale(v)}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <text
            x={padding - 5}
            y={yScale(v) + 3}
            textAnchor="end"
            fontSize="8"
            fill="#9ca3af"
            fontFamily="sans-serif"
          >
            {v}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={d.date}
          x={xScale(i)}
          y={height - 8}
          textAnchor="middle"
          fontSize="7"
          fill="#9ca3af"
          fontFamily="sans-serif"
        >
          {new Date(d.date).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
        </text>
      ))}

      {/* Alert threshold line */}
      <line
        x1={padding}
        y1={yScale(IOP_NORMAL_MAX)}
        x2={padding + plotW}
        y2={yScale(IOP_NORMAL_MAX)}
        stroke="#ef4444"
        strokeWidth="1"
        strokeDasharray="4,3"
        opacity="0.5"
      />

      {/* OD line */}
      {odPath && (
        <path d={odPath} fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* OS line */}
      {osPath && (
        <path d={osPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Data points */}
      {data.map((d, i) => (
        <g key={d.date}>
          {d.od !== null && (
            <circle
              cx={xScale(i)}
              cy={yScale(d.od)}
              r="3"
              fill="white"
              stroke={themeColor}
              strokeWidth="2"
            />
          )}
          {d.os !== null && (
            <circle
              cx={xScale(i)}
              cy={yScale(d.os)}
              r="3"
              fill="white"
              stroke="#f59e0b"
              strokeWidth="2"
            />
          )}
        </g>
      ))}

      {/* Legend */}
      <circle cx={padding} cy={height - 20} r="4" fill={themeColor} />
      <text x={padding + 8} y={height - 17} fontSize="8" fill="#6b7280" fontFamily="sans-serif">
        OD
      </text>
      <circle cx={padding + 35} cy={height - 20} r="4" fill="#f59e0b" />
      <text x={padding + 43} y={height - 17} fontSize="8" fill="#6b7280" fontFamily="sans-serif">
        OS
      </text>

      {/* Y-axis label */}
      <text
        x="10"
        y={height / 2}
        textAnchor="middle"
        fontSize="8"
        fill="#9ca3af"
        fontFamily="sans-serif"
        transform={`rotate(-90 10 ${height / 2})`}
      >
        mmHg
      </text>
    </svg>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

interface IopTrackerProps {
  value: IopData;
  onChange: (data: IopData) => void;
  history?: OphthalmologyExam[];
  themeColor?: string;
}

export function IopTracker({
  value,
  onChange,
  history = [],
  themeColor = '#7C3AED',
}: IopTrackerProps) {
  const odAlert = value.od_value !== null && value.od_value > IOP_NORMAL_MAX;
  const osAlert = value.os_value !== null && value.os_value > IOP_NORMAL_MAX;

  // Build trend data from history
  const trendData = useMemo<IopTrendPoint[]>(() => {
    return history
      .filter((e) => e.iop !== null)
      .map((e) => ({
        date: e.exam_date,
        od: e.iop?.od_value ?? null,
        os: e.iop?.os_value ?? null,
      }))
      .reverse(); // oldest first for chart
  }, [history]);

  const handleFieldChange = useCallback(
    <K extends keyof IopData>(field: K, val: IopData[K]) => {
      onChange({ ...value, [field]: val });
    },
    [value, onChange],
  );

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {(odAlert || osAlert) && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-medium">Sospecha de glaucoma</p>
            <p className="text-xs mt-0.5">
              {odAlert && osAlert
                ? 'Presión intraocular elevada en ambos ojos (>21 mmHg).'
                : odAlert
                  ? 'Presión intraocular elevada en ojo derecho (>21 mmHg).'
                  : 'Presión intraocular elevada en ojo izquierdo (>21 mmHg).'}
            </p>
          </div>
        </div>
      )}

      {/* Current IOP inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* OD */}
        <div className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <Label className="text-sm font-semibold text-gray-700">Ojo Derecho (OD)</Label>
          <div className="relative">
            <Input
              type="number"
              value={value.od_value ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                handleFieldChange('od_value', raw === '' ? null : parseFloat(raw));
              }}
              min={0}
              max={80}
              step={1}
              className={cn('h-10 text-lg font-semibold pr-14', odAlert && 'border-red-300 bg-red-50')}
              placeholder="—"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              mmHg
            </span>
          </div>
          {/* Normal range indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: value.od_value
                    ? `${Math.min(100, (value.od_value / 40) * 100)}%`
                    : '0%',
                  backgroundColor:
                    value.od_value === null
                      ? '#d1d5db'
                      : value.od_value <= IOP_NORMAL_MAX && value.od_value >= IOP_NORMAL_MIN
                        ? '#10b981'
                        : value.od_value > IOP_NORMAL_MAX
                          ? '#ef4444'
                          : '#f59e0b',
                }}
              />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {value.od_value !== null
                ? value.od_value >= IOP_NORMAL_MIN && value.od_value <= IOP_NORMAL_MAX
                  ? 'Normal'
                  : value.od_value > IOP_NORMAL_MAX
                    ? 'Elevada'
                    : 'Baja'
                : '—'}
            </span>
          </div>
        </div>

        {/* OS */}
        <div className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <Label className="text-sm font-semibold text-gray-700">Ojo Izquierdo (OS)</Label>
          <div className="relative">
            <Input
              type="number"
              value={value.os_value ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                handleFieldChange('os_value', raw === '' ? null : parseFloat(raw));
              }}
              min={0}
              max={80}
              step={1}
              className={cn('h-10 text-lg font-semibold pr-14', osAlert && 'border-red-300 bg-red-50')}
              placeholder="—"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              mmHg
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: value.os_value
                    ? `${Math.min(100, (value.os_value / 40) * 100)}%`
                    : '0%',
                  backgroundColor:
                    value.os_value === null
                      ? '#d1d5db'
                      : value.os_value <= IOP_NORMAL_MAX && value.os_value >= IOP_NORMAL_MIN
                        ? '#10b981'
                        : value.os_value > IOP_NORMAL_MAX
                          ? '#ef4444'
                          : '#f59e0b',
                }}
              />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {value.os_value !== null
                ? value.os_value >= IOP_NORMAL_MIN && value.os_value <= IOP_NORMAL_MAX
                  ? 'Normal'
                  : value.os_value > IOP_NORMAL_MAX
                    ? 'Elevada'
                    : 'Baja'
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Method and time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Method selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500">Método</Label>
          <div className="flex flex-wrap gap-1.5">
            {IOP_METHODS.map((m) => {
              const isActive = value.method === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleFieldChange('method', isActive ? null : m.value)}
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-md transition-colors border',
                    isActive
                      ? 'text-white border-transparent'
                      : 'text-gray-600 border-gray-200 hover:border-gray-300 bg-white',
                  )}
                  style={isActive ? { backgroundColor: themeColor } : undefined}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time of measurement */}
        <div className="space-y-1.5">
          <Label htmlFor="iop_time" className="text-xs font-medium text-gray-500">
            Hora de medición
          </Label>
          <Input
            id="iop_time"
            type="time"
            value={value.time_of_day ?? ''}
            onChange={(e) => handleFieldChange('time_of_day', e.target.value || null)}
            className="h-9 text-sm w-36"
          />
          <p className="text-xs text-gray-400">La PIO varía según la hora del día</p>
        </div>
      </div>

      {/* Historical trend chart */}
      {trendData.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Tendencia Histórica</h4>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <IopTrendChart data={trendData} themeColor={themeColor} />
          </div>
        </div>
      )}
    </div>
  );
}
