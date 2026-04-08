'use client';

import { useCallback, useMemo } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  ELECTRODES_10_20,
  ELECTRODE_ACTIVITY_CONFIG,
  type ElectrodeActivity,
  type ElectrodePosition,
} from './eeg-montages-data';
import type { ElectrodeMarkings } from './use-eeg';

// ============================================================================
// TYPES
// ============================================================================

interface ElectrodeMapProps {
  /** Current electrode activity markings */
  markings: ElectrodeMarkings;
  /** Callback when an electrode is clicked — cycles through activity states */
  onElectrodeClick?: (electrodeId: string, newActivity: ElectrodeActivity | null) => void;
  /** Whether the map is read-only */
  readOnly?: boolean;
  /** Optional theme color */
  themeColor?: string;
  /** Optional className */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ACTIVITY_CYCLE: (ElectrodeActivity | null)[] = [null, 'normal', 'slowing', 'epileptiform', 'suppression'];

const SVG_SIZE = 300;
const HEAD_CX = 150;
const HEAD_CY = 155;
const HEAD_RX = 130;
const HEAD_RY = 140;
const ELECTRODE_RADIUS = 12;
const NOSE_TIP_Y = 6;

// ============================================================================
// HELPER
// ============================================================================

function toSvgCoords(pos: ElectrodePosition): { cx: number; cy: number } {
  // Electrode positions are 0-100 normalized; map to SVG coords within the head ellipse
  const cx = HEAD_CX - HEAD_RX + (pos.x / 100) * (HEAD_RX * 2);
  const cy = HEAD_CY - HEAD_RY + (pos.y / 100) * (HEAD_RY * 2);
  return { cx, cy };
}

// ============================================================================
// ELECTRODE NODE
// ============================================================================

function ElectrodeNode({
  electrode,
  activity,
  onClick,
  readOnly,
}: {
  electrode: ElectrodePosition;
  activity: ElectrodeActivity | null;
  onClick?: (id: string) => void;
  readOnly: boolean;
}) {
  const { cx, cy } = toSvgCoords(electrode);
  const config = activity ? ELECTRODE_ACTIVITY_CONFIG[activity] : null;
  const fillColor = config?.bgColor ?? '#F3F4F6';
  const strokeColor = config?.borderColor ?? '#D1D5DB';
  const textColor = config?.color ?? '#6B7280';

  return (
    <g
      className={cn(!readOnly && 'cursor-pointer')}
      onClick={() => !readOnly && onClick?.(electrode.id)}
      role={readOnly ? undefined : 'button'}
      tabIndex={readOnly ? undefined : 0}
      aria-label={`${electrode.id}: ${config?.label ?? 'Sin marcar'}`}
      onKeyDown={(e) => {
        if (!readOnly && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.(electrode.id);
        }
      }}
    >
      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={ELECTRODE_RADIUS}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
        className={cn(!readOnly && 'hover:opacity-80 transition-opacity')}
      />
      {/* Label */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={8}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
        className="pointer-events-none select-none"
      >
        {electrode.id}
      </text>
    </g>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ElectrodeMap({
  markings,
  onElectrodeClick,
  readOnly = false,
  themeColor,
  className,
}: ElectrodeMapProps) {
  // Cycle through activity states on click
  const handleClick = useCallback(
    (electrodeId: string) => {
      if (!onElectrodeClick) return;
      const currentActivity = markings[electrodeId] ?? null;
      const currentIdx = ACTIVITY_CYCLE.indexOf(currentActivity);
      const nextIdx = (currentIdx + 1) % ACTIVITY_CYCLE.length;
      onElectrodeClick(electrodeId, ACTIVITY_CYCLE[nextIdx]);
    },
    [markings, onElectrodeClick],
  );

  // Count markings by type for the legend
  const markingCounts = useMemo(() => {
    const counts: Record<ElectrodeActivity, number> = {
      normal: 0,
      slowing: 0,
      epileptiform: 0,
      suppression: 0,
    };
    for (const activity of Object.values(markings)) {
      if (activity && activity in counts) {
        counts[activity]++;
      }
    }
    return counts;
  }, [markings]);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE + 20}`}
        className="w-full max-w-[320px]"
        role="img"
        aria-label="Mapa de electrodos EEG - Sistema 10-20"
      >
        {/* ── Head outline ───────────────────────────────────────── */}
        <ellipse
          cx={HEAD_CX}
          cy={HEAD_CY}
          rx={HEAD_RX}
          ry={HEAD_RY}
          fill="#FAFAFA"
          stroke="#D1D5DB"
          strokeWidth={2}
        />

        {/* Nose indicator */}
        <path
          d={`M ${HEAD_CX - 12} ${HEAD_CY - HEAD_RY + 4} Q ${HEAD_CX} ${NOSE_TIP_Y} ${HEAD_CX + 12} ${HEAD_CY - HEAD_RY + 4}`}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth={2}
        />

        {/* Ears */}
        <path
          d={`M ${HEAD_CX - HEAD_RX} ${HEAD_CY - 15} Q ${HEAD_CX - HEAD_RX - 12} ${HEAD_CY} ${HEAD_CX - HEAD_RX} ${HEAD_CY + 15}`}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth={1.5}
        />
        <path
          d={`M ${HEAD_CX + HEAD_RX} ${HEAD_CY - 15} Q ${HEAD_CX + HEAD_RX + 12} ${HEAD_CY} ${HEAD_CX + HEAD_RX} ${HEAD_CY + 15}`}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth={1.5}
        />

        {/* Midline vertical */}
        <line
          x1={HEAD_CX}
          y1={HEAD_CY - HEAD_RY + 8}
          x2={HEAD_CX}
          y2={HEAD_CY + HEAD_RY - 8}
          stroke="#E5E7EB"
          strokeWidth={0.5}
          strokeDasharray="4 3"
        />

        {/* Midline horizontal */}
        <line
          x1={HEAD_CX - HEAD_RX + 8}
          y1={HEAD_CY}
          x2={HEAD_CX + HEAD_RX - 8}
          y2={HEAD_CY}
          stroke="#E5E7EB"
          strokeWidth={0.5}
          strokeDasharray="4 3"
        />

        {/* Hemisphere labels */}
        <text
          x={HEAD_CX - HEAD_RX + 20}
          y={HEAD_CY + HEAD_RY + 14}
          fill="#9CA3AF"
          fontSize={10}
          fontFamily="system-ui, sans-serif"
        >
          Izq
        </text>
        <text
          x={HEAD_CX + HEAD_RX - 34}
          y={HEAD_CY + HEAD_RY + 14}
          fill="#9CA3AF"
          fontSize={10}
          fontFamily="system-ui, sans-serif"
        >
          Der
        </text>

        {/* Anterior label */}
        <text
          x={HEAD_CX}
          y={NOSE_TIP_Y - 2}
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
        >
          Anterior
        </text>

        {/* ── Electrode nodes ────────────────────────────────────── */}
        {ELECTRODES_10_20.map((electrode) => (
          <ElectrodeNode
            key={electrode.id}
            electrode={electrode}
            activity={markings[electrode.id] ?? null}
            onClick={handleClick}
            readOnly={readOnly}
          />
        ))}
      </svg>

      {/* ── Legend ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
        {(Object.entries(ELECTRODE_ACTIVITY_CONFIG) as [ElectrodeActivity, typeof ELECTRODE_ACTIVITY_CONFIG.normal][]).map(
          ([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border"
                style={{
                  backgroundColor: config.bgColor,
                  borderColor: config.borderColor,
                }}
              />
              <span className="text-xs text-gray-500">
                {config.label}
                {markingCounts[key] > 0 && (
                  <span className="ml-0.5 font-medium" style={{ color: config.color }}>
                    ({markingCounts[key]})
                  </span>
                )}
              </span>
            </div>
          ),
        )}
      </div>

      {!readOnly && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Haga clic en un electrodo para marcar actividad anormal
        </p>
      )}
    </div>
  );
}
