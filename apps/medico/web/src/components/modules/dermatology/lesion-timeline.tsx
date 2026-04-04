'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, Camera, AlertTriangle } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import {
  type LesionRecord,
  type MalignancyRisk,
  LESION_TYPE_LABELS,
  BODY_REGION_LABELS,
} from './use-dermatology';

// ============================================================================
// CONSTANTS
// ============================================================================

const RISK_COLORS: Record<MalignancyRisk, string> = {
  low: '#22C55E',
  moderate: '#EAB308',
  high: '#EF4444',
  confirmed: '#1A1A1A',
};

const RISK_LABELS: Record<MalignancyRisk, string> = {
  low: 'Bajo',
  moderate: 'Moderado',
  high: 'Alto',
  confirmed: 'Confirmado',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  monitoring: 'En seguimiento',
  resolved: 'Resuelta',
  biopsied: 'Biopsiada',
  excised: 'Extirpada',
};

// ============================================================================
// TYPES
// ============================================================================

interface LesionTimelineProps {
  timeline: LesionRecord[];
  isLoading?: boolean;
  themeColor?: string;
  onLesionSelect?: (lesion: LesionRecord) => void;
}

// ============================================================================
// SIZE CHANGE CHART (SVG bar chart)
// ============================================================================

function SizeChangeChart({
  timeline,
  themeColor,
}: {
  timeline: LesionRecord[];
  themeColor: string;
}) {
  const entries = timeline.filter((t) => t.size_mm != null);
  if (entries.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic py-2">
        Sin datos de tamaño registrados
      </p>
    );
  }

  const maxSize = Math.max(...entries.map((e) => e.size_mm!));
  const barWidth = 36;
  const barGap = 8;
  const chartHeight = 100;
  const svgWidth = entries.length * (barWidth + barGap) + barGap;
  const bottomPad = 28;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${chartHeight + bottomPad}`}
      className="w-full"
      style={{ maxWidth: Math.min(svgWidth, 400), maxHeight: chartHeight + bottomPad }}
    >
      {entries.map((entry, i) => {
        const x = barGap + i * (barWidth + barGap);
        const height = maxSize > 0 ? (entry.size_mm! / maxSize) * chartHeight : 0;
        const y = chartHeight - height;
        const color = RISK_COLORS[entry.malignancy_risk] ?? themeColor;

        return (
          <g key={entry.id}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              rx={3}
              fill={color}
              opacity={0.75}
            />
            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              fill={color}
              fontSize={9}
              fontWeight={600}
            >
              {entry.size_mm!.toFixed(1)}
            </text>
            {/* Date label */}
            <text
              x={x + barWidth / 2}
              y={chartHeight + 14}
              textAnchor="middle"
              fill="#9CA3AF"
              fontSize={8}
            >
              {new Date(entry.created_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
              })}
            </text>
          </g>
        );
      })}
      {/* Size axis label */}
      <text
        x={2}
        y={10}
        fill="#9CA3AF"
        fontSize={8}
      >
        mm
      </text>
    </svg>
  );
}

// ============================================================================
// IMAGE COMPARISON
// ============================================================================

function ImageComparison({
  timeline,
}: {
  timeline: LesionRecord[];
}) {
  const withImages = timeline.filter(
    (t) => t.clinical_image_url || t.dermoscopy_image_url,
  );

  if (withImages.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic py-2">
        Sin imágenes disponibles para comparar
      </p>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {withImages.map((entry) => (
        <div
          key={entry.id}
          className="shrink-0 rounded-lg border border-gray-100 overflow-hidden"
          style={{ width: 120 }}
        >
          {entry.clinical_image_url ? (
            <img
              src={entry.clinical_image_url}
              alt={`Lesión - ${new Date(entry.created_at).toLocaleDateString('es-VE')}`}
              className="w-full h-20 object-cover bg-gray-100"
            />
          ) : (
            <div className="w-full h-20 bg-gray-50 flex items-center justify-center">
              <Camera className="h-5 w-5 text-gray-300" />
            </div>
          )}
          <div className="px-2 py-1.5">
            <p className="text-[10px] text-gray-500 font-medium">
              {new Date(entry.created_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            {entry.size_mm != null && (
              <p className="text-[10px] text-gray-400">
                {entry.size_mm} mm
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ABCDE SCORE HISTORY
// ============================================================================

function AbcdeScoreHistory({
  timeline,
  themeColor,
}: {
  timeline: LesionRecord[];
  themeColor: string;
}) {
  const withAbcde = timeline.filter((t) => t.abcde != null);

  if (withAbcde.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic py-2">
        Sin datos ABCDE registrados
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {withAbcde.map((entry) => {
        const score = entry.abcde
          ? Object.values(entry.abcde).filter(Boolean).length
          : 0;
        const maxScore = 5;

        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 text-xs"
          >
            <span className="text-gray-400 shrink-0 w-16">
              {new Date(entry.created_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
            <div className="flex-1 flex items-center gap-1">
              {/* Progress bar */}
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(score / maxScore) * 100}%`,
                    backgroundColor:
                      score >= 4
                        ? '#EF4444'
                        : score >= 2
                          ? '#EAB308'
                          : '#22C55E',
                  }}
                />
              </div>
              <span
                className={cn(
                  'font-bold px-1.5 py-0.5 rounded-full text-[10px]',
                  score >= 4
                    ? 'bg-red-100 text-red-700'
                    : score >= 2
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-emerald-100 text-emerald-700',
                )}
              >
                {score}/5
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// SIZE TREND INDICATOR
// ============================================================================

function SizeTrend({ timeline }: { timeline: LesionRecord[] }) {
  const withSize = timeline.filter((t) => t.size_mm != null);
  if (withSize.length < 2) return null;

  const first = withSize[0].size_mm!;
  const last = withSize[withSize.length - 1].size_mm!;
  const diff = last - first;
  const pctChange = first > 0 ? ((diff / first) * 100).toFixed(0) : '—';

  if (Math.abs(diff) < 0.5) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Minus className="h-3.5 w-3.5" />
        <span>Sin cambio significativo</span>
      </div>
    );
  }

  const growing = diff > 0;
  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs font-medium',
        growing ? 'text-red-600' : 'text-emerald-600',
      )}
    >
      {growing ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      <span>
        {growing ? '+' : ''}
        {diff.toFixed(1)} mm ({growing ? '+' : ''}
        {pctChange}%)
      </span>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LesionTimeline({
  timeline,
  isLoading = false,
  themeColor = '#8B5CF6',
  onLesionSelect,
}: LesionTimelineProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-100 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        Sin historial de evolución para esta lesión
      </div>
    );
  }

  const sorted = [...timeline].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const latest = sorted[sorted.length - 1];

  return (
    <div className="space-y-5">
      {/* ── Header summary ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">
            Evolución de Lesión
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {sorted.length} registro{sorted.length !== 1 ? 's' : ''} &middot;{' '}
            {BODY_REGION_LABELS[latest.body_region]} &middot;{' '}
            {LESION_TYPE_LABELS[latest.lesion_type]}
          </p>
        </div>
        <SizeTrend timeline={sorted} />
      </div>

      {/* ── Size change chart ───────────────────────────────── */}
      <div>
        <h5 className="text-xs font-medium text-gray-500 mb-2">
          Cambio de Tamaño
        </h5>
        <SizeChangeChart timeline={sorted} themeColor={themeColor} />
      </div>

      {/* ── Image comparison ────────────────────────────────── */}
      <div>
        <h5 className="text-xs font-medium text-gray-500 mb-2">
          Comparación de Imágenes
        </h5>
        <ImageComparison timeline={sorted} />
      </div>

      {/* ── ABCDE score history ─────────────────────────────── */}
      <div>
        <h5 className="text-xs font-medium text-gray-500 mb-2">
          Historial ABCDE
        </h5>
        <AbcdeScoreHistory timeline={sorted} themeColor={themeColor} />
      </div>

      {/* ── Timeline entries ────────────────────────────────── */}
      <div>
        <h5 className="text-xs font-medium text-gray-500 mb-2">
          Historial de Registros
        </h5>
        <div className="space-y-0 relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100"
          />

          {sorted.map((entry, i) => {
            const isLatest = i === sorted.length - 1;
            const riskColor = RISK_COLORS[entry.malignancy_risk];
            const abcdeScore = entry.abcde
              ? Object.values(entry.abcde).filter(Boolean).length
              : null;

            return (
              <div
                key={entry.id}
                className={cn(
                  'relative flex items-start gap-3 py-3 pl-1 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors',
                  isLatest && 'bg-gray-50/50',
                )}
                onClick={() => onLesionSelect?.(entry)}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    'relative z-10 h-[30px] w-[30px] rounded-full flex items-center justify-center shrink-0',
                    isLatest ? 'ring-2 ring-offset-1' : '',
                  )}
                  style={{
                    backgroundColor: `${riskColor}15`,
                    '--tw-ring-color': isLatest ? riskColor : undefined,
                  } as React.CSSProperties}
                >
                  <Clock
                    className="h-3.5 w-3.5"
                    style={{ color: riskColor }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(entry.created_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    {isLatest && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: themeColor }}
                      >
                        Actual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Status */}
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {STATUS_LABELS[entry.status] ?? entry.status}
                    </span>

                    {/* Risk badge */}
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${riskColor}15`,
                        color: riskColor,
                      }}
                    >
                      Riesgo: {RISK_LABELS[entry.malignancy_risk]}
                    </span>

                    {/* Size */}
                    {entry.size_mm != null && (
                      <span className="text-[10px] text-gray-400">
                        {entry.size_mm} mm
                      </span>
                    )}

                    {/* ABCDE */}
                    {abcdeScore != null && (
                      <span
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                          abcdeScore >= 4
                            ? 'bg-red-100 text-red-700'
                            : abcdeScore >= 2
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-emerald-100 text-emerald-700',
                        )}
                      >
                        ABCDE: {abcdeScore}/5
                      </span>
                    )}

                    {/* Biopsy */}
                    {entry.biopsy_recommended && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Biopsia
                      </span>
                    )}
                  </div>

                  {/* Diagnosis */}
                  {entry.diagnosis && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      Dx: {entry.diagnosis}
                    </p>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
