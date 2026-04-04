'use client';

import { useMemo } from 'react';
import { Camera, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { WoundRecord, WoundAssessment } from './use-wound-care';

// ============================================================================
// TYPES
// ============================================================================

interface WoundTimelineProps {
  wound: WoundRecord;
  onBack: () => void;
  themeColor?: string;
}

// ============================================================================
// MINI SVG LINE CHART
// ============================================================================

function MiniTrendChart({
  data,
  label,
  unit,
  color,
  invertBetter = false,
}: {
  data: number[];
  label: string;
  unit: string;
  color: string;
  invertBetter?: boolean;
}) {
  if (data.length < 2) {
    return (
      <div className="p-3 rounded-lg bg-gray-50 text-center">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-500 mt-1">
          {data.length === 1 ? `${data[0]} ${unit}` : 'Sin datos'}
        </p>
      </div>
    );
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  const w = 120;
  const h = 40;
  const padding = 4;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (w - padding * 2);
    const y = h - padding - ((val - minVal) / range) * (h - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const current = data[data.length - 1];
  const previous = data[data.length - 2];
  const improving = invertBetter ? current > previous : current < previous;

  return (
    <div className="p-3 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400">{label}</p>
        <div className="flex items-center gap-1">
          {improving ? (
            <TrendingDown className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingUp className="h-3 w-3 text-red-500" />
          )}
          <span className="text-xs font-bold" style={{ color }}>
            {current} {unit}
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: '40px' }}>
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Current value dot */}
        {data.length > 0 && (
          <circle
            cx={padding + ((data.length - 1) / (data.length - 1)) * (w - padding * 2)}
            cy={h - padding - ((current - minVal) / range) * (h - padding * 2)}
            r={3}
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// PHOTO GALLERY
// ============================================================================

function PhotoGallery({
  assessments,
  themeColor,
}: {
  assessments: WoundAssessment[];
  themeColor: string;
}) {
  const photosWithDates = useMemo(() => {
    return assessments
      .filter((a) => a.photo_urls.length > 0)
      .flatMap((a) =>
        a.photo_urls.map((url) => ({
          url,
          date: a.date,
        })),
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [assessments]);

  if (photosWithDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Camera className="h-8 w-8 text-gray-200 mb-2" />
        <p className="text-xs text-gray-400">Sin fotografias registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        Galeria cronologica
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {photosWithDates.map((photo, idx) => (
          <div key={idx} className="shrink-0">
            <div
              className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden"
            >
              <img
                src={photo.url}
                alt={`Herida ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1">
              {new Date(photo.date).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// HEALING RATE
// ============================================================================

function HealingRate({
  assessments,
  themeColor,
}: {
  assessments: WoundAssessment[];
  themeColor: string;
}) {
  const rate = useMemo(() => {
    if (assessments.length < 2) return null;

    const sorted = [...assessments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const areaChange = first.measurement.area_cm2 - last.measurement.area_cm2;
    const daysDiff =
      (new Date(last.date).getTime() - new Date(first.date).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysDiff <= 0) return null;

    const pctChange = first.measurement.area_cm2 > 0
      ? Math.round((areaChange / first.measurement.area_cm2) * 100)
      : 0;
    const ratePerWeek = daysDiff > 0
      ? Math.round((areaChange / daysDiff) * 7 * 100) / 100
      : 0;

    return {
      pctChange,
      ratePerWeek,
      days: Math.round(daysDiff),
      improving: areaChange > 0,
    };
  }, [assessments]);

  if (!rate) {
    return (
      <div className="p-3 rounded-lg bg-gray-50 text-center">
        <p className="text-xs text-gray-400">
          Se necesitan al menos 2 evaluaciones para calcular la tasa de cicatrizacion
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg"
      style={{ backgroundColor: `${themeColor}08` }}
    >
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        Tasa de cicatrizacion
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p
            className="text-lg font-bold tabular-nums"
            style={{ color: rate.improving ? '#22C55E' : '#EF4444' }}
          >
            {rate.improving ? '-' : '+'}{Math.abs(rate.pctChange)}%
          </p>
          <p className="text-[10px] text-gray-400">Cambio total</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums" style={{ color: themeColor }}>
            {rate.ratePerWeek}
          </p>
          <p className="text-[10px] text-gray-400">cm&sup2;/semana</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-gray-600">
            {rate.days}
          </p>
          <p className="text-[10px] text-gray-400">dias seguimiento</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WoundTimeline({
  wound,
  onBack,
  themeColor = '#3B82F6',
}: WoundTimelineProps) {
  const sortedAssessments = useMemo(
    () =>
      [...wound.assessments].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [wound.assessments],
  );

  const areaTrend = sortedAssessments.map((a) => a.measurement.area_cm2);
  const pushTrend = sortedAssessments.map((a) => a.push_score);

  return (
    <div className="space-y-5">
      {/* ── Back button ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        &larr; Volver a lista
      </button>

      {/* ── Wound header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${themeColor}10` }}
        >
          <Activity className="h-5 w-5" style={{ color: themeColor }} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            {wound.location_text}
          </p>
          <p className="text-xs text-gray-400">
            {wound.body_region} &middot;{' '}
            {sortedAssessments.length} evaluaciones
          </p>
        </div>
      </div>

      {/* ── Photo gallery ────────────────────────────────────────── */}
      <PhotoGallery assessments={sortedAssessments} themeColor={themeColor} />

      {/* ── Trend charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MiniTrendChart
          data={areaTrend}
          label="Area (cm²)"
          unit="cm²"
          color={themeColor}
        />
        <MiniTrendChart
          data={pushTrend}
          label="PUSH Score"
          unit="pts"
          color="#8B5CF6"
        />
      </div>

      {/* ── Healing rate ─────────────────────────────────────────── */}
      <HealingRate assessments={sortedAssessments} themeColor={themeColor} />

      {/* ── Assessment timeline ───────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Evaluaciones
        </p>
        {sortedAssessments.map((assessment, idx) => (
          <div
            key={assessment.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: themeColor }}
              />
              {idx < sortedAssessments.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 mt-1" />
              )}
            </div>

            {/* Assessment details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-600">
                  {new Date(assessment.date).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: themeColor }}
                >
                  PUSH: {assessment.push_score}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>
                  {assessment.measurement.length_cm} x {assessment.measurement.width_cm} cm
                </span>
                <span>
                  Area: {assessment.measurement.area_cm2} cm&sup2;
                </span>
                <span>
                  Dolor: {assessment.pain_level}/10
                </span>
              </div>
              {assessment.treatment && (
                <p className="text-xs text-gray-500 mt-1">
                  Tx: {assessment.treatment}
                </p>
              )}
              {assessment.notes && (
                <p className="text-xs text-gray-400 italic mt-1">
                  {assessment.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
