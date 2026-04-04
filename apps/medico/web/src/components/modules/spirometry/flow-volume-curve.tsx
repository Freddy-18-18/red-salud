'use client';

import type { SpirometryValues, PredictedValues } from './spirometry-reference-data';
import { generateNormalFlowVolumeCurve } from './spirometry-reference-data';

// ============================================================================
// TYPES
// ============================================================================

interface FlowVolumeCurveProps {
  preValues: SpirometryValues;
  postValues?: SpirometryValues;
  predicted?: PredictedValues;
  themeColor?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SVG_WIDTH = 480;
const SVG_HEIGHT = 360;
const MARGIN = { top: 30, right: 30, bottom: 40, left: 50 };
const CHART_W = SVG_WIDTH - MARGIN.left - MARGIN.right;
const CHART_H = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

const VOL_MAX = 7; // L
const FLOW_MAX = 14; // L/s (expiratory)
const FLOW_MIN = -6; // L/s (inspiratory)
const FLOW_RANGE = FLOW_MAX - FLOW_MIN;

// ============================================================================
// HELPERS
// ============================================================================

function volToX(vol: number): number {
  return MARGIN.left + (vol / VOL_MAX) * CHART_W;
}

function flowToY(flow: number): number {
  // Expiratory is positive (up), inspiratory negative (down)
  return MARGIN.top + ((FLOW_MAX - flow) / FLOW_RANGE) * CHART_H;
}

/**
 * Generate a simulated patient flow-volume curve from spirometry values.
 */
function generatePatientCurve(values: SpirometryValues): Array<[number, number]> {
  const fvc = values.fvc ?? 3;
  const pef = values.pef ?? 6;
  const fef2575 = values.fef2575 ?? 3;
  const points: Array<[number, number]> = [];

  const steps = 30;
  const peakVol = fvc * 0.12;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const vol = t * fvc;
    let flow: number;

    if (vol <= peakVol) {
      // Rising to PEF
      flow = pef * (vol / peakVol);
    } else {
      // Descending limb
      const remaining = (vol - peakVol) / (fvc - peakVol);
      // Use FEF25-75 to shape the curve
      const midFlow = fef2575;
      if (remaining < 0.5) {
        flow = pef - (pef - midFlow) * (remaining / 0.5);
      } else {
        flow = midFlow * (1 - ((remaining - 0.5) / 0.5) * 0.85);
      }
    }

    points.push([vol, Math.max(0, flow)]);
  }

  return points;
}

function pointsToPath(points: Array<[number, number]>): string {
  return points
    .map(([vol, flow], i) => {
      const x = volToX(vol);
      const y = flowToY(flow);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FlowVolumeCurve({
  preValues,
  postValues,
  predicted,
  themeColor = '#3B82F6',
}: FlowVolumeCurveProps) {
  const preCurve = generatePatientCurve(preValues);
  const postCurve = postValues ? generatePatientCurve(postValues) : null;
  const normalCurve = predicted ? generateNormalFlowVolumeCurve(predicted) : null;

  // PEF marker position
  const pefX = preValues.pef != null ? volToX((preValues.fvc ?? 3) * 0.12) : null;
  const pefY = preValues.pef != null ? flowToY(preValues.pef) : null;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto">
        {/* ── Grid ─────────────────────────────────────── */}
        {/* Vertical — volume */}
        {Array.from({ length: 8 }, (_, i) => i).map((v) => (
          <line
            key={`vg-${v}`}
            x1={volToX(v)}
            y1={MARGIN.top}
            x2={volToX(v)}
            y2={SVG_HEIGHT - MARGIN.bottom}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        {/* Horizontal — flow */}
        {Array.from({ length: 11 }, (_, i) => FLOW_MIN + i * 2).map((f) => (
          <line
            key={`hg-${f}`}
            x1={MARGIN.left}
            y1={flowToY(f)}
            x2={SVG_WIDTH - MARGIN.right}
            y2={flowToY(f)}
            stroke={f === 0 ? '#9ca3af' : '#e5e7eb'}
            strokeWidth={f === 0 ? 1 : 0.5}
          />
        ))}

        {/* ── Axes labels ──────────────────────────────── */}
        {Array.from({ length: 8 }, (_, i) => i).map((v) => (
          <text
            key={`xl-${v}`}
            x={volToX(v)}
            y={SVG_HEIGHT - MARGIN.bottom + 16}
            textAnchor="middle"
            fontSize={10}
            fill="#6b7280"
            className="select-none"
          >
            {v}
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
          Volumen (L)
        </text>

        {Array.from({ length: 11 }, (_, i) => FLOW_MIN + i * 2).map((f) => (
          <text
            key={`yl-${f}`}
            x={MARGIN.left - 8}
            y={flowToY(f) + 3}
            textAnchor="end"
            fontSize={9}
            fill="#6b7280"
            className="select-none"
          >
            {f}
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
          Flujo (L/s)
        </text>

        {/* ── Normal reference (shaded) ────────────────── */}
        {normalCurve && (
          <path
            d={pointsToPath(normalCurve) + ` L ${volToX(normalCurve[normalCurve.length - 1][0])} ${flowToY(0)} L ${volToX(0)} ${flowToY(0)} Z`}
            fill="#22c55e"
            opacity={0.08}
          />
        )}
        {normalCurve && (
          <path
            d={pointsToPath(normalCurve)}
            fill="none"
            stroke="#22c55e"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.4}
          />
        )}

        {/* ── Pre-bronchodilator curve ─────────────────── */}
        <path
          d={pointsToPath(preCurve)}
          fill="none"
          stroke={themeColor}
          strokeWidth={2}
        />

        {/* ── Post-bronchodilator curve ────────────────── */}
        {postCurve && (
          <path
            d={pointsToPath(postCurve)}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="6 3"
          />
        )}

        {/* ── PEF marker ──────────────────────────────── */}
        {pefX != null && pefY != null && (
          <g>
            <circle cx={pefX} cy={pefY} r={4} fill={themeColor} />
            <text
              x={pefX + 8}
              y={pefY - 6}
              fontSize={9}
              fill={themeColor}
              fontWeight="bold"
              className="select-none"
            >
              PEF
            </text>
          </g>
        )}

        {/* ── Legend ────────────────────────────────────── */}
        <g transform={`translate(${SVG_WIDTH - MARGIN.right - 140}, ${MARGIN.top})`}>
          <line x1={0} y1={0} x2={20} y2={0} stroke={themeColor} strokeWidth={2} />
          <text x={24} y={3} fontSize={9} fill={themeColor} className="select-none">
            Pre-BD
          </text>
          {postCurve && (
            <>
              <line x1={0} y1={14} x2={20} y2={14} stroke="#22c55e" strokeWidth={2} strokeDasharray="6 3" />
              <text x={24} y={17} fontSize={9} fill="#22c55e" className="select-none">
                Post-BD
              </text>
            </>
          )}
          {normalCurve && (
            <>
              <line x1={0} y1={postCurve ? 28 : 14} x2={20} y2={postCurve ? 28 : 14} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
              <text x={24} y={postCurve ? 31 : 17} fontSize={9} fill="#22c55e" opacity={0.6} className="select-none">
                Referencia
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
