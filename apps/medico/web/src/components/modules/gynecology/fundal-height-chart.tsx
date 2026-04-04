'use client';

import { useState, useMemo, useCallback, useRef, type MouseEvent } from 'react';
import { Printer } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { PrenatalVisit } from './use-prenatal';

// ============================================================================
// TYPES
// ============================================================================

interface FundalHeightChartProps {
  visits: PrenatalVisit[];
  themeColor?: string;
  className?: string;
}

interface TooltipData {
  x: number;
  y: number;
  visit: PrenatalVisit;
  value: number;
  status: 'normal' | 'low' | 'high';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_WIDTH = 700;
const CHART_HEIGHT = 380;
const PADDING = { top: 30, right: 30, bottom: 50, left: 60 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

// Gestational weeks range for the chart
const WEEK_MIN = 20;
const WEEK_MAX = 42;
// Fundal height range (cm)
const FH_MIN = 14;
const FH_MAX = 44;

/**
 * Normal fundal height band data (P10/P50/P90 approximations).
 * Based on the clinical rule: fundal height ~ gestational weeks in cm, +/- 2cm.
 * P10 and P90 are approximately -3cm and +3cm from median at each week.
 */
function getNormalBand(): { weeks: number[]; p10: number[]; p50: number[]; p90: number[] } {
  const weeks: number[] = [];
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];

  for (let w = WEEK_MIN; w <= 36; w++) {
    weeks.push(w);
    p50.push(w);
    p10.push(w - 3);
    p90.push(w + 3);
  }
  // After 36 weeks, fundal height plateaus or may drop slightly
  for (let w = 37; w <= WEEK_MAX; w++) {
    weeks.push(w);
    p50.push(36 + (w - 36) * 0.3);
    p10.push(36 - 3 + (w - 36) * 0.2);
    p90.push(36 + 3 + (w - 36) * 0.4);
  }

  return { weeks, p10, p50, p90 };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FundalHeightChart({
  visits,
  themeColor = '#ec4899',
  className,
}: FundalHeightChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const normalBand = useMemo(() => getNormalBand(), []);

  // ── Coordinate transforms ────────────────────────────────────────────

  const toX = useCallback(
    (week: number) =>
      PADDING.left + ((week - WEEK_MIN) / (WEEK_MAX - WEEK_MIN)) * PLOT_WIDTH,
    [],
  );

  const toY = useCallback(
    (cm: number) =>
      PADDING.top + (1 - (cm - FH_MIN) / (FH_MAX - FH_MIN)) * PLOT_HEIGHT,
    [],
  );

  // ── Normal band paths ────────────────────────────────────────────────

  const bandPaths = useMemo(() => {
    const { weeks, p10, p50, p90 } = normalBand;

    // P10-P90 area fill
    const areaPoints: string[] = [];
    for (let i = 0; i < weeks.length; i++) {
      areaPoints.push(`${i === 0 ? 'M' : 'L'}${toX(weeks[i])},${toY(p90[i])}`);
    }
    for (let i = weeks.length - 1; i >= 0; i--) {
      areaPoints.push(`L${toX(weeks[i])},${toY(p10[i])}`);
    }
    areaPoints.push('Z');
    const areaPath = areaPoints.join(' ');

    // Median line (P50)
    const medianPath = weeks
      .map((w, i) => `${i === 0 ? 'M' : 'L'}${toX(w)},${toY(p50[i])}`)
      .join(' ');

    // P10 line
    const p10Path = weeks
      .map((w, i) => `${i === 0 ? 'M' : 'L'}${toX(w)},${toY(p10[i])}`)
      .join(' ');

    // P90 line
    const p90Path = weeks
      .map((w, i) => `${i === 0 ? 'M' : 'L'}${toX(w)},${toY(p90[i])}`)
      .join(' ');

    return { areaPath, medianPath, p10Path, p90Path };
  }, [normalBand, toX, toY]);

  // ── Filter visits with fundal height data ────────────────────────────

  const dataPoints = useMemo(() => {
    return visits
      .filter(
        (v) =>
          v.fundal_height_cm != null &&
          v.gestational_weeks >= WEEK_MIN &&
          v.gestational_weeks <= WEEK_MAX,
      )
      .map((v) => {
        const fh = v.fundal_height_cm!;
        const w = v.gestational_weeks;
        // Determine if normal, low, or high
        const idx = normalBand.weeks.indexOf(w);
        let status: 'normal' | 'low' | 'high' = 'normal';
        if (idx >= 0) {
          if (fh < normalBand.p10[idx]) status = 'low';
          else if (fh > normalBand.p90[idx]) status = 'high';
        }
        return {
          x: toX(w + v.gestational_days / 7),
          y: toY(fh),
          visit: v,
          value: fh,
          status,
        };
      });
  }, [visits, normalBand, toX, toY]);

  // ── Patient data line ────────────────────────────────────────────────

  const dataLinePath = useMemo(() => {
    if (dataPoints.length < 2) return '';
    return dataPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
      .join(' ');
  }, [dataPoints]);

  // ── Grid lines ───────────────────────────────────────────────────────

  const gridLines = useMemo(() => {
    const xLines: number[] = [];
    for (let w = WEEK_MIN; w <= WEEK_MAX; w += 2) {
      xLines.push(w);
    }
    const yLines: number[] = [];
    for (let v = FH_MIN; v <= FH_MAX; v += 2) {
      yLines.push(v);
    }
    return { xLines, yLines };
  }, []);

  // ── Tooltip handler ──────────────────────────────────────────────────

  const handlePointHover = useCallback(
    (e: MouseEvent, point: TooltipData) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      setTooltip({
        ...point,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Render ───────────────────────────────────────────────────────────

  if (dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        Sin datos de altura uterina para graficar (se requieren controles desde la semana 20)
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

        {/* Grid */}
        {gridLines.xLines.map((w) => (
          <line
            key={`gx-${w}`}
            x1={toX(w)}
            y1={PADDING.top}
            x2={toX(w)}
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

        {/* Normal band fill (P10-P90) */}
        <path d={bandPaths.areaPath} fill="#FCE7F3" opacity={0.4} />

        {/* P10 line */}
        <path
          d={bandPaths.p10Path}
          fill="none"
          stroke="#F9A8D4"
          strokeWidth={1}
          strokeDasharray="4,3"
          opacity={0.8}
        />

        {/* P50 median line */}
        <path
          d={bandPaths.medianPath}
          fill="none"
          stroke="#F472B6"
          strokeWidth={1.5}
          opacity={0.9}
        />

        {/* P90 line */}
        <path
          d={bandPaths.p90Path}
          fill="none"
          stroke="#F9A8D4"
          strokeWidth={1}
          strokeDasharray="4,3"
          opacity={0.8}
        />

        {/* Percentile labels */}
        <text
          x={toX(WEEK_MAX) + 4}
          y={toY(normalBand.p10[normalBand.p10.length - 1])}
          fill="#F9A8D4"
          fontSize={9}
          dominantBaseline="middle"
        >
          P10
        </text>
        <text
          x={toX(WEEK_MAX) + 4}
          y={toY(normalBand.p50[normalBand.p50.length - 1])}
          fill="#F472B6"
          fontSize={9}
          fontWeight={600}
          dominantBaseline="middle"
        >
          P50
        </text>
        <text
          x={toX(WEEK_MAX) + 4}
          y={toY(normalBand.p90[normalBand.p90.length - 1])}
          fill="#F9A8D4"
          fontSize={9}
          dominantBaseline="middle"
        >
          P90
        </text>

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
        {dataPoints.map((point, i) => {
          const pointColor =
            point.status === 'low'
              ? '#ef4444'
              : point.status === 'high'
                ? '#f59e0b'
                : themeColor;
          return (
            <g key={point.visit.id ?? i}>
              <circle
                cx={point.x}
                cy={point.y}
                r={6}
                fill={pointColor}
                opacity={0.15}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill="white"
                stroke={pointColor}
                strokeWidth={2}
                className="cursor-pointer"
                onMouseEnter={(e) => handlePointHover(e, point)}
                onMouseMove={(e) => handlePointHover(e, point)}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          );
        })}

        {/* X axis labels */}
        {gridLines.xLines.map((w) => (
          <text
            key={`xl-${w}`}
            x={toX(w)}
            y={CHART_HEIGHT - 10}
            fill="#9ca3af"
            fontSize={10}
            textAnchor="middle"
          >
            {w}
          </text>
        ))}

        {/* Y axis labels */}
        {gridLines.yLines
          .filter((_, i) => i % 2 === 0)
          .map((v) => (
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
          Semanas de Gestación
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
          Altura Uterina (cm)
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
          Curva de Altura Uterina vs. Edad Gestacional
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
            AU: {tooltip.value} cm
          </p>
          <p className="text-xs text-gray-400">
            Semana {tooltip.visit.gestational_weeks}+{tooltip.visit.gestational_days}
          </p>
          <p
            className="text-xs font-medium"
            style={{
              color:
                tooltip.status === 'low'
                  ? '#ef4444'
                  : tooltip.status === 'high'
                    ? '#f59e0b'
                    : '#22c55e',
            }}
          >
            {tooltip.status === 'low'
              ? 'Por debajo del P10 — posible RCIU'
              : tooltip.status === 'high'
                ? 'Por encima del P90 — evaluar macrosomia'
                : 'Rango normal'}
          </p>
          <p className="text-xs text-gray-300">
            {new Date(tooltip.visit.visit_date).toLocaleDateString('es-VE')}
          </p>
        </div>
      )}
    </div>
  );
}
