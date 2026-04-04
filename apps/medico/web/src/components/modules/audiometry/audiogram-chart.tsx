'use client';

import { useCallback } from 'react';
import {
  AUDIOGRAM_FREQUENCIES,
  SEVERITY_BANDS,
  type AudiogramThreshold,
  type EarSide,
  type ConductionType,
} from './use-audiometry';

// ============================================================================
// TYPES
// ============================================================================

interface AudiogramChartProps {
  thresholds: AudiogramThreshold[];
  onPlot?: (frequency: number, threshold: number, ear: EarSide) => void;
  selectedEar?: EarSide;
  showBone?: boolean;
  /** Optional overlay thresholds for comparison (gray dashed) */
  overlayThresholds?: AudiogramThreshold[];
  themeColor?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SVG_WIDTH = 480;
const SVG_HEIGHT = 400;
const MARGIN = { top: 30, right: 30, bottom: 40, left: 50 };
const CHART_W = SVG_WIDTH - MARGIN.left - MARGIN.right;
const CHART_H = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

const DB_MIN = -10;
const DB_MAX = 120;
const DB_RANGE = DB_MAX - DB_MIN;

const FREQ_LABELS = ['125', '250', '500', '1K', '2K', '4K', '8K'];

// ============================================================================
// HELPERS
// ============================================================================

function freqToX(freq: number): number {
  const idx = AUDIOGRAM_FREQUENCIES.indexOf(freq as (typeof AUDIOGRAM_FREQUENCIES)[number]);
  if (idx === -1) return 0;
  return MARGIN.left + (idx / (AUDIOGRAM_FREQUENCIES.length - 1)) * CHART_W;
}

function dbToY(db: number): number {
  // Inverted: higher dB = lower on chart
  return MARGIN.top + ((db - DB_MIN) / DB_RANGE) * CHART_H;
}

function yToDb(y: number): number {
  return Math.round(((y - MARGIN.top) / CHART_H) * DB_RANGE + DB_MIN);
}

function getClosestFrequency(x: number): number {
  let closest: number = AUDIOGRAM_FREQUENCIES[0];
  let minDist = Infinity;
  for (const f of AUDIOGRAM_FREQUENCIES) {
    const dist = Math.abs(freqToX(f) - x);
    if (dist < minDist) {
      minDist = dist;
      closest = f;
    }
  }
  return closest;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AudiogramChart({
  thresholds,
  onPlot,
  selectedEar = 'right',
  showBone = false,
  overlayThresholds,
  themeColor = '#3B82F6',
}: AudiogramChartProps) {
  // Click handler for interactive plotting
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!onPlot) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check bounds
      if (x < MARGIN.left || x > SVG_WIDTH - MARGIN.right) return;
      if (y < MARGIN.top || y > SVG_HEIGHT - MARGIN.bottom) return;

      const freq = getClosestFrequency(x);
      const db = Math.round(yToDb(y) / 5) * 5; // Snap to 5 dB

      onPlot(freq, Math.max(DB_MIN, Math.min(DB_MAX, db)), selectedEar);
    },
    [onPlot, selectedEar],
  );

  // Get thresholds by ear and conduction
  type FreqPoint = { freq: (typeof AUDIOGRAM_FREQUENCIES)[number]; db: number };
  const getLine = (ear: EarSide, conduction: ConductionType, data: AudiogramThreshold[]): FreqPoint[] => {
    return AUDIOGRAM_FREQUENCIES
      .map((f) => {
        const t = data.find(
          (th) => th.frequency === f && th.ear === ear && th.conduction === conduction,
        );
        return t ? { freq: f, db: t.threshold } : null;
      })
      .filter((p): p is FreqPoint => p != null);
  };

  const rightAir = getLine('right', 'air', thresholds);
  const leftAir = getLine('left', 'air', thresholds);
  const rightBone = showBone ? getLine('right', 'bone', thresholds) : [];
  const leftBone = showBone ? getLine('left', 'bone', thresholds) : [];

  const overlayRight = overlayThresholds ? getLine('right', 'air', overlayThresholds) : [];
  const overlayLeft = overlayThresholds ? getLine('left', 'air', overlayThresholds) : [];

  // Build polyline path
  const buildPath = (points: FreqPoint[]) =>
    points.map((p) => `${freqToX(p.freq)},${dbToY(p.db)}`).join(' ');

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto cursor-crosshair"
        onClick={handleClick}
      >
        {/* ── Normal hearing zone ──────────────────────── */}
        <rect
          x={MARGIN.left}
          y={dbToY(DB_MIN)}
          width={CHART_W}
          height={dbToY(25) - dbToY(DB_MIN)}
          fill="#22c55e"
          opacity={0.06}
        />

        {/* ── Severity band labels ─────────────────────── */}
        {SEVERITY_BANDS.map((band) => (
          <text
            key={band.label}
            x={SVG_WIDTH - MARGIN.right + 4}
            y={(dbToY(band.min) + dbToY(band.max)) / 2 + 3}
            fontSize={8}
            fill={band.color}
            opacity={0.5}
            className="select-none"
          >
            {band.label}
          </text>
        ))}

        {/* ── Grid lines ───────────────────────────────── */}
        {/* Vertical — frequencies */}
        {AUDIOGRAM_FREQUENCIES.map((f, i) => (
          <line
            key={`vg-${f}`}
            x1={freqToX(f)}
            y1={MARGIN.top}
            x2={freqToX(f)}
            y2={SVG_HEIGHT - MARGIN.bottom}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        {/* Horizontal — dB levels */}
        {Array.from({ length: 14 }, (_, i) => DB_MIN + i * 10).map((db) => (
          <line
            key={`hg-${db}`}
            x1={MARGIN.left}
            y1={dbToY(db)}
            x2={SVG_WIDTH - MARGIN.right}
            y2={dbToY(db)}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}

        {/* ── Axes labels ──────────────────────────────── */}
        {/* X axis — frequencies */}
        {AUDIOGRAM_FREQUENCIES.map((f, i) => (
          <text
            key={`xl-${f}`}
            x={freqToX(f)}
            y={SVG_HEIGHT - MARGIN.bottom + 16}
            textAnchor="middle"
            fontSize={10}
            fill="#6b7280"
            className="select-none"
          >
            {FREQ_LABELS[i]}
          </text>
        ))}
        <text
          x={SVG_WIDTH / 2}
          y={SVG_HEIGHT - 4}
          textAnchor="middle"
          fontSize={10}
          fill="#9ca3af"
          className="select-none"
        >
          Frecuencia (Hz)
        </text>

        {/* Y axis — dB */}
        {Array.from({ length: 14 }, (_, i) => DB_MIN + i * 10).map((db) => (
          <text
            key={`yl-${db}`}
            x={MARGIN.left - 8}
            y={dbToY(db) + 3}
            textAnchor="end"
            fontSize={9}
            fill="#6b7280"
            className="select-none"
          >
            {db}
          </text>
        ))}
        <text
          x={14}
          y={SVG_HEIGHT / 2}
          textAnchor="middle"
          fontSize={10}
          fill="#9ca3af"
          transform={`rotate(-90, 14, ${SVG_HEIGHT / 2})`}
          className="select-none"
        >
          dB HL
        </text>

        {/* ── Overlay (comparison) ─────────────────────── */}
        {overlayRight.length > 1 && (
          <polyline
            points={buildPath(overlayRight)}
            fill="none"
            stroke="#9ca3af"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}
        {overlayLeft.length > 1 && (
          <polyline
            points={buildPath(overlayLeft)}
            fill="none"
            stroke="#9ca3af"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}

        {/* ── Right ear (red) — Air conduction ─────────── */}
        {rightAir.length > 1 && (
          <polyline
            points={buildPath(rightAir)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
        )}
        {rightAir.map((p) => (
          <g key={`ro-${p.freq}`}>
            <circle
              cx={freqToX(p.freq)}
              cy={dbToY(p.db)}
              r={6}
              fill="white"
              stroke="#ef4444"
              strokeWidth={2}
            />
            {/* O symbol */}
            <text
              x={freqToX(p.freq)}
              y={dbToY(p.db) + 3.5}
              textAnchor="middle"
              fontSize={9}
              fontWeight="bold"
              fill="#ef4444"
              className="select-none"
            >
              O
            </text>
          </g>
        ))}

        {/* ── Left ear (blue) — Air conduction ─────────── */}
        {leftAir.length > 1 && (
          <polyline
            points={buildPath(leftAir)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1.5}
          />
        )}
        {leftAir.map((p) => (
          <g key={`lx-${p.freq}`}>
            {/* X symbol */}
            <line
              x1={freqToX(p.freq) - 5}
              y1={dbToY(p.db) - 5}
              x2={freqToX(p.freq) + 5}
              y2={dbToY(p.db) + 5}
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <line
              x1={freqToX(p.freq) + 5}
              y1={dbToY(p.db) - 5}
              x2={freqToX(p.freq) - 5}
              y2={dbToY(p.db) + 5}
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </g>
        ))}

        {/* ── Right ear — Bone conduction ──────────────── */}
        {rightBone.length > 1 && (
          <polyline
            points={buildPath(rightBone)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="3 2"
          />
        )}
        {rightBone.map((p) => (
          <g key={`rb-${p.freq}`}>
            {/* < bracket */}
            <path
              d={`M ${freqToX(p.freq) + 4} ${dbToY(p.db) - 5} L ${freqToX(p.freq) - 4} ${dbToY(p.db)} L ${freqToX(p.freq) + 4} ${dbToY(p.db) + 5}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
            />
          </g>
        ))}

        {/* ── Left ear — Bone conduction ───────────────── */}
        {leftBone.length > 1 && (
          <polyline
            points={buildPath(leftBone)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="3 2"
          />
        )}
        {leftBone.map((p) => (
          <g key={`lb-${p.freq}`}>
            {/* > bracket */}
            <path
              d={`M ${freqToX(p.freq) - 4} ${dbToY(p.db) - 5} L ${freqToX(p.freq) + 4} ${dbToY(p.db)} L ${freqToX(p.freq) - 4} ${dbToY(p.db) + 5}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </g>
        ))}

        {/* ── Legend ────────────────────────────────────── */}
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top - 16})`}>
          <circle cx={0} cy={0} r={4} fill="white" stroke="#ef4444" strokeWidth={1.5} />
          <text x={8} y={3} fontSize={9} fill="#ef4444" className="select-none">OD (derecho)</text>
          <line x1={80} y1={-3} x2={90} y2={3} stroke="#3b82f6" strokeWidth={1.5} />
          <line x1={90} y1={-3} x2={80} y2={3} stroke="#3b82f6" strokeWidth={1.5} />
          <text x={96} y={3} fontSize={9} fill="#3b82f6" className="select-none">OI (izquierdo)</text>
        </g>
      </svg>
    </div>
  );
}
