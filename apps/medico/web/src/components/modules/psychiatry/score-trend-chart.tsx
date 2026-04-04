'use client';

import { useMemo } from 'react';
import type { SeverityBand } from './psychiatric-scales-data';

// ============================================================================
// TYPES
// ============================================================================

interface DataPoint {
  date: string;
  score: number;
  label?: string;
}

interface ScoreTrendChartProps {
  dataPoints: DataPoint[];
  severityBands: SeverityBand[];
  maxScore: number;
  themeColor?: string;
  height?: number;
  width?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
}

/**
 * Determine trend direction from data points.
 */
function getTrend(points: DataPoint[]): 'improving' | 'stable' | 'worsening' {
  if (points.length < 2) return 'stable';
  const first = points[0].score;
  const last = points[points.length - 1].score;
  const delta = last - first;
  const threshold = Math.max(2, Math.abs(first) * 0.1);

  if (delta < -threshold) return 'improving';
  if (delta > threshold) return 'worsening';
  return 'stable';
}

const TREND_CONFIG = {
  improving: { label: 'Mejorando', color: '#22C55E' },
  stable: { label: 'Estable', color: '#6B7280' },
  worsening: { label: 'Empeorando', color: '#EF4444' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ScoreTrendChart({
  dataPoints,
  severityBands,
  maxScore,
  themeColor = '#7C3AED',
  height = 200,
  width = 480,
}: ScoreTrendChartProps) {
  // Chart dimensions
  const padding = { top: 20, right: 50, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Sort data points by date
  const sorted = useMemo(
    () => [...dataPoints].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [dataPoints],
  );

  const trend = useMemo(() => getTrend(sorted), [sorted]);
  const trendCfg = TREND_CONFIG[trend];

  // Scale Y: 0 -> maxScore
  const yScale = useCallback((score: number) => {
    return chartH - (score / maxScore) * chartH;
  });

  // Scale X: evenly distribute across chartW
  const xScale = useCallback((index: number) => {
    if (sorted.length <= 1) return chartW / 2;
    return (index / (sorted.length - 1)) * chartW;
  });

  // Severity band rects (horizontal colored zones)
  const bandRects = useMemo(() => {
    return severityBands.map((band) => {
      const y1 = yScale(band.max);
      const y2 = yScale(band.min);
      return {
        band,
        y: y1,
        height: y2 - y1,
      };
    });
  }, [severityBands, yScale]);

  // Line path
  const linePath = useMemo(() => {
    if (sorted.length === 0) return '';
    return sorted
      .map((pt, i) => {
        const x = xScale(i);
        const y = yScale(pt.score);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  }, [sorted, xScale, yScale]);

  // Trend line (linear regression)
  const trendLinePath = useMemo(() => {
    if (sorted.length < 2) return '';

    const n = sorted.length;
    const xs = sorted.map((_, i) => i);
    const ys = sorted.map((pt) => pt.score);

    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
    const sumXX = xs.reduce((a, x) => a + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const startX = xScale(0);
    const startY = yScale(intercept);
    const endX = xScale(n - 1);
    const endY = yScale(slope * (n - 1) + intercept);

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }, [sorted, xScale, yScale]);

  if (sorted.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-gray-400"
        style={{ height }}
      >
        Sin datos para mostrar tendencia
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Trend indicator */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">
          {sorted.length} evaluación{sorted.length !== 1 ? 'es' : ''}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: trendCfg.color }}
          />
          <span className="text-xs font-medium" style={{ color: trendCfg.color }}>
            {trendCfg.label}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        className="block"
        style={{ maxHeight: height }}
      >
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* ── Severity band zones ──────────────────────────────── */}
          {bandRects.map((rect) => (
            <g key={rect.band.label}>
              <rect
                x={0}
                y={rect.y}
                width={chartW}
                height={Math.max(rect.height, 1)}
                fill={rect.band.color}
                opacity={0.1}
              />
              <text
                x={chartW + 5}
                y={rect.y + rect.height / 2 + 3}
                fill={rect.band.color}
                fontSize={8}
                fontWeight={500}
              >
                {rect.band.label.length > 12
                  ? rect.band.label.substring(0, 12) + '…'
                  : rect.band.label}
              </text>
            </g>
          ))}

          {/* ── Grid lines ───────────────────────────────────────── */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = chartH * (1 - pct);
            const val = Math.round(maxScore * pct);
            return (
              <g key={pct}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartW}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                />
                <text
                  x={-8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#9CA3AF"
                  fontSize={9}
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* ── Trend line (dashed) ──────────────────────────────── */}
          {trendLinePath && (
            <path
              d={trendLinePath}
              fill="none"
              stroke={trendCfg.color}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={0.5}
            />
          )}

          {/* ── Data line ────────────────────────────────────────── */}
          <path
            d={linePath}
            fill="none"
            stroke={themeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ── Data points ──────────────────────────────────────── */}
          {sorted.map((pt, i) => {
            const x = xScale(i);
            const y = yScale(pt.score);
            return (
              <g key={`${pt.date}-${i}`}>
                {/* Outer ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  fill="white"
                  stroke={themeColor}
                  strokeWidth={2}
                />
                {/* Inner dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={2.5}
                  fill={themeColor}
                />
                {/* Score label */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fill={themeColor}
                  fontSize={10}
                  fontWeight={600}
                >
                  {pt.score}
                </text>
                {/* Date label */}
                <text
                  x={x}
                  y={chartH + 16}
                  textAnchor="middle"
                  fill="#9CA3AF"
                  fontSize={8}
                >
                  {formatDate(pt.date)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );

  // Helper closures that use chart dimensions
  function useCallback(fn: (v: number) => number) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(() => fn, [chartH, chartW, maxScore, sorted.length]);
  }
}
