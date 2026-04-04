'use client';

import { useState, useMemo, useCallback, useRef, type MouseEvent } from 'react';
import { Printer } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import {
  type Sex,
  type ChartType,
  type PercentileKey,
  type GrowthStandardData,
  getGrowthStandard,
  estimatePercentile,
  PERCENTILE_COLORS,
  CHART_CONFIGS,
} from './growth-standards';
import type { GrowthMeasurement } from './use-growth-data';

// ============================================================================
// TYPES
// ============================================================================

interface GrowthChartProps {
  sex: Sex;
  chartType: ChartType;
  measurements: GrowthMeasurement[];
  themeColor?: string;
  className?: string;
}

interface TooltipData {
  x: number;
  y: number;
  measurement: GrowthMeasurement;
  percentile: number | null;
  value: number;
  unit: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_WIDTH = 700;
const CHART_HEIGHT = 400;
const PADDING = { top: 30, right: 30, bottom: 50, left: 60 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

const PERCENTILE_KEYS: PercentileKey[] = ['p3', 'p15', 'p50', 'p85', 'p97'];

// ============================================================================
// CHART SELECTOR
// ============================================================================

export function ChartTypeSelector({
  selected,
  onChange,
  themeColor = '#22c55e',
}: {
  selected: ChartType;
  onChange: (type: ChartType) => void;
  themeColor?: string;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {CHART_CONFIGS.map((cfg) => (
        <button
          key={cfg.type}
          type="button"
          onClick={() => onChange(cfg.type)}
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
            selected === cfg.type
              ? 'text-white'
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
          )}
          style={selected === cfg.type ? { backgroundColor: themeColor } : undefined}
        >
          {cfg.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// SEX TOGGLE
// ============================================================================

export function SexToggle({
  value,
  onChange,
}: {
  value: Sex;
  onChange: (sex: Sex) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
      <button
        type="button"
        onClick={() => onChange('male')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-colors',
          value === 'male'
            ? 'bg-blue-500 text-white'
            : 'text-gray-500 hover:bg-gray-50',
        )}
      >
        Niño
      </button>
      <button
        type="button"
        onClick={() => onChange('female')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-colors',
          value === 'female'
            ? 'bg-pink-500 text-white'
            : 'text-gray-500 hover:bg-gray-50',
        )}
      >
        Niña
      </button>
    </div>
  );
}

// ============================================================================
// MAIN GROWTH CHART
// ============================================================================

export function GrowthChart({
  sex,
  chartType,
  measurements,
  themeColor = '#22c55e',
  className,
}: GrowthChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const chartConfig = CHART_CONFIGS.find((c) => c.type === chartType);
  const standardData = getGrowthStandard(chartType, sex);

  // ── Scale calculations ──────────────────────────────────────────────────

  const { xMin, xMax, yMin, yMax, filteredMeasurements } = useMemo(() => {
    if (!standardData || !chartConfig) {
      return { xMin: 0, xMax: 60, yMin: 0, yMax: 25, filteredMeasurements: [] };
    }

    const months = standardData.months;
    const minMonth = months[0];
    const maxMonth = months[months.length - 1];

    // Y range from percentile data
    const allValues: number[] = [];
    for (const key of PERCENTILE_KEYS) {
      allValues.push(...standardData.percentiles[key]);
    }
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const yPadding = (dataMax - dataMin) * 0.05;

    // Filter measurements to valid range
    const validMeasurements = measurements.filter((m) => {
      if (m.age_months < minMonth || m.age_months > maxMonth) return false;
      const val = getMeasurementValue(m, chartType);
      return val != null;
    });

    return {
      xMin: minMonth,
      xMax: maxMonth,
      yMin: Math.floor(dataMin - yPadding),
      yMax: Math.ceil(dataMax + yPadding),
      filteredMeasurements: validMeasurements,
    };
  }, [standardData, chartConfig, measurements, chartType]);

  // ── Coordinate transforms ───────────────────────────────────────────────

  const toX = useCallback(
    (month: number) => PADDING.left + ((month - xMin) / (xMax - xMin)) * PLOT_WIDTH,
    [xMin, xMax],
  );

  const toY = useCallback(
    (value: number) => PADDING.top + (1 - (value - yMin) / (yMax - yMin)) * PLOT_HEIGHT,
    [yMin, yMax],
  );

  // ── Percentile curves (smooth bezier) ───────────────────────────────────

  const percentilePaths = useMemo(() => {
    if (!standardData) return [];

    return PERCENTILE_KEYS.map((key) => {
      const values = standardData.percentiles[key];
      const months = standardData.months;
      const points = months.map((m, i) => ({ x: toX(m), y: toY(values[i]) }));
      const path = smoothPath(points);
      const colors = PERCENTILE_COLORS[key];

      return {
        key,
        path,
        color: sex === 'male' ? colors.male : colors.female,
        label: colors.label,
        isMajor: key === 'p50' || key === 'p3' || key === 'p97',
      };
    });
  }, [standardData, sex, toX, toY]);

  // ── Patient data points ─────────────────────────────────────────────────

  const dataPoints = useMemo(() => {
    return filteredMeasurements.map((m) => {
      const value = getMeasurementValue(m, chartType)!;
      const percentile = standardData
        ? estimatePercentile(standardData, m.age_months, value)
        : null;

      return {
        x: toX(m.age_months),
        y: toY(value),
        measurement: m,
        value,
        percentile,
      };
    });
  }, [filteredMeasurements, chartType, standardData, toX, toY]);

  // ── Patient data line ───────────────────────────────────────────────────

  const dataLinePath = useMemo(() => {
    if (dataPoints.length < 2) return '';
    return dataPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
      .join(' ');
  }, [dataPoints]);

  // ── Grid lines ──────────────────────────────────────────────────────────

  const gridLines = useMemo(() => {
    const xLines: number[] = [];
    const yLines: number[] = [];

    // X grid: every 6 months
    for (let m = xMin; m <= xMax; m += 6) {
      xLines.push(m);
    }

    // Y grid: auto-spaced
    const yRange = yMax - yMin;
    const step = yRange <= 30 ? 2 : yRange <= 60 ? 5 : 10;
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
      yLines.push(v);
    }

    return { xLines, yLines };
  }, [xMin, xMax, yMin, yMax]);

  // ── Event handlers ──────────────────────────────────────────────────────

  const handlePointHover = useCallback(
    (e: MouseEvent, point: (typeof dataPoints)[number]) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        measurement: point.measurement,
        percentile: point.percentile,
        value: point.value,
        unit: chartConfig?.unit ?? '',
      });
    },
    [chartConfig],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  if (!standardData || !chartConfig) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        Datos no disponibles para este tipo de gráfico
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Print button */}
      <button
        type="button"
        onClick={handlePrint}
        className="absolute top-0 right-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors print:hidden z-10"
        title="Imprimir"
      >
        <Printer className="h-4 w-4" />
      </button>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full h-auto"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Background */}
        <rect
          x={PADDING.left}
          y={PADDING.top}
          width={PLOT_WIDTH}
          height={PLOT_HEIGHT}
          fill="#fafafa"
          rx={4}
        />

        {/* Grid lines */}
        {gridLines.xLines.map((m) => (
          <line
            key={`gx-${m}`}
            x1={toX(m)}
            y1={PADDING.top}
            x2={toX(m)}
            y2={PADDING.top + PLOT_HEIGHT}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        {gridLines.yLines.map((v) => (
          <line
            key={`gy-${v}`}
            x1={PADDING.left}
            y1={toY(v)}
            x2={PADDING.left + PLOT_WIDTH}
            y2={toY(v)}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}

        {/* Percentile fill regions */}
        {standardData && (
          <>
            {/* P3-P97 fill */}
            <path
              d={buildAreaPath(
                standardData.months.map((m) => toX(m)),
                standardData.percentiles.p3.map((v) => toY(v)),
                standardData.percentiles.p97.map((v) => toY(v)),
              )}
              fill={sex === 'male' ? '#DBEAFE' : '#FCE7F3'}
              opacity={0.3}
            />
            {/* P15-P85 fill */}
            <path
              d={buildAreaPath(
                standardData.months.map((m) => toX(m)),
                standardData.percentiles.p15.map((v) => toY(v)),
                standardData.percentiles.p85.map((v) => toY(v)),
              )}
              fill={sex === 'male' ? '#BFDBFE' : '#FBCFE8'}
              opacity={0.3}
            />
          </>
        )}

        {/* Percentile curves */}
        {percentilePaths.map((curve) => (
          <g key={curve.key}>
            <path
              d={curve.path}
              fill="none"
              stroke={curve.color}
              strokeWidth={curve.isMajor ? 1.5 : 1}
              strokeDasharray={curve.key === 'p50' ? undefined : '4,3'}
              opacity={curve.isMajor ? 1 : 0.7}
            />
            {/* Label at end of curve */}
            {standardData && (
              <text
                x={toX(standardData.months[standardData.months.length - 1]) + 4}
                y={toY(standardData.percentiles[curve.key][standardData.percentiles[curve.key].length - 1])}
                fill={curve.color}
                fontSize={9}
                fontWeight={curve.isMajor ? 600 : 400}
                dominantBaseline="middle"
              >
                {curve.label}
              </text>
            )}
          </g>
        ))}

        {/* Patient data line */}
        {dataLinePath && (
          <path
            d={dataLinePath}
            fill="none"
            stroke={themeColor}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Patient data points */}
        {dataPoints.map((point, i) => (
          <g key={point.measurement.id ?? i}>
            {/* Outer glow */}
            <circle
              cx={point.x}
              cy={point.y}
              r={6}
              fill={themeColor}
              opacity={0.15}
            />
            {/* Point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill="white"
              stroke={themeColor}
              strokeWidth={2}
              className="cursor-pointer"
              onMouseEnter={(e) => handlePointHover(e, point)}
              onMouseMove={(e) => handlePointHover(e, point)}
              onMouseLeave={() => setTooltip(null)}
            />
          </g>
        ))}

        {/* X axis labels */}
        {gridLines.xLines.map((m) => (
          <text
            key={`xl-${m}`}
            x={toX(m)}
            y={CHART_HEIGHT - 10}
            fill="#9ca3af"
            fontSize={10}
            textAnchor="middle"
          >
            {m}
          </text>
        ))}

        {/* Y axis labels */}
        {gridLines.yLines.map((v) => (
          <text
            key={`yl-${v}`}
            x={PADDING.left - 8}
            y={toY(v)}
            fill="#9ca3af"
            fontSize={10}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {v}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={CHART_WIDTH / 2}
          y={CHART_HEIGHT - 2}
          fill="#6b7280"
          fontSize={11}
          fontWeight={500}
          textAnchor="middle"
        >
          {chartConfig.xAxisLabel}
        </text>
        <text
          x={14}
          y={CHART_HEIGHT / 2}
          fill="#6b7280"
          fontSize={11}
          fontWeight={500}
          textAnchor="middle"
          transform={`rotate(-90,14,${CHART_HEIGHT / 2})`}
        >
          {chartConfig.yAxisLabel}
        </text>

        {/* Title */}
        <text
          x={CHART_WIDTH / 2}
          y={16}
          fill="#374151"
          fontSize={13}
          fontWeight={600}
          textAnchor="middle"
        >
          {chartConfig.label} — {sex === 'male' ? 'Niños' : 'Niñas'}
        </text>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 z-20 print:hidden"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            transform: tooltip.x > CHART_WIDTH * 0.7 ? 'translateX(-110%)' : undefined,
          }}
        >
          <p className="text-xs font-medium text-gray-700">
            {tooltip.value.toFixed(1)} {tooltip.unit}
          </p>
          <p className="text-xs text-gray-400">
            Edad: {tooltip.measurement.age_months} meses
          </p>
          {tooltip.percentile != null && (
            <p className="text-xs font-medium" style={{ color: themeColor }}>
              Percentil: ~P{tooltip.percentile}
            </p>
          )}
          <p className="text-xs text-gray-300">
            {new Date(tooltip.measurement.date).toLocaleDateString('es-VE')}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get the relevant measurement value for a given chart type.
 */
function getMeasurementValue(m: GrowthMeasurement, chartType: ChartType): number | null {
  switch (chartType) {
    case 'weight-for-age':
    case 'weight-for-height':
      return m.weight_kg;
    case 'height-for-age':
      return m.height_cm;
    case 'head-circumference-for-age':
      return m.head_circumference_cm;
    case 'bmi-for-age':
      return m.bmi;
    default:
      return null;
  }
}

/**
 * Generate a smooth cubic bezier SVG path through a set of points.
 * Uses Catmull-Rom to Bezier conversion for smooth curves through control points.
 */
function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  }

  let d = `M${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to cubic bezier control points
    const tension = 6; // Higher = less curvy
    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;

    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

/**
 * Build an SVG area path between two series of y values sharing the same x values.
 */
function buildAreaPath(
  xs: number[],
  yTop: number[],
  yBottom: number[],
): string {
  if (xs.length === 0) return '';

  let d = `M${xs[0]},${yTop[0]}`;
  for (let i = 1; i < xs.length; i++) {
    d += ` L${xs[i]},${yTop[i]}`;
  }
  for (let i = xs.length - 1; i >= 0; i--) {
    d += ` L${xs[i]},${yBottom[i]}`;
  }
  d += ' Z';
  return d;
}
