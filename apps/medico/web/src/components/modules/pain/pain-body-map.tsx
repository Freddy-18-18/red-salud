'use client';

import { useCallback } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  NRS_LABELS,
  PAIN_TYPE_LABELS,
  type PainPoint,
  type PainType,
} from './pain-scales-data';

// ============================================================================
// TYPES
// ============================================================================

interface PainBodyMapProps {
  points: PainPoint[];
  onChange: (points: PainPoint[]) => void;
  selectedType: PainType;
  selectedIntensity: number;
  themeColor?: string;
  readOnly?: boolean;
}

// ============================================================================
// BODY OUTLINE PATH
// ============================================================================

// Simplified front-view body outline (0-100 coordinate space)
const BODY_OUTLINE = `
  M 50 4
  C 44 4 40 8 40 13 C 40 18 44 22 50 22 C 56 22 60 18 60 13 C 60 8 56 4 50 4 Z
  M 50 22
  L 50 24
  M 42 26 L 38 28 L 28 38 L 20 50 L 18 54 L 22 54 L 30 44 L 38 36 L 42 34
  M 58 26 L 62 28 L 72 38 L 80 50 L 82 54 L 78 54 L 70 44 L 62 36 L 58 34
  M 42 24 L 42 34 L 42 58 L 40 70 L 38 82 L 38 96
  M 58 24 L 58 34 L 58 58 L 60 70 L 62 82 L 62 96
  M 42 58 L 58 58
  M 38 96 L 35 98 L 42 98 L 40 96
  M 62 96 L 58 98 L 65 98 L 62 96
`;

// ============================================================================
// COMPONENT
// ============================================================================

export function PainBodyMap({
  points,
  onChange,
  selectedType,
  selectedIntensity,
  themeColor = '#ef4444',
  readOnly = false,
}: PainBodyMapProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) return;

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Check if clicking near an existing point (to remove)
      const nearby = points.find(
        (p) => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < 5,
      );

      if (nearby) {
        onChange(points.filter((p) => p.id !== nearby.id));
        return;
      }

      const newPoint: PainPoint = {
        id: `pain-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        intensity: selectedIntensity,
        type: selectedType,
      };

      onChange([...points, newPoint]);
    },
    [points, onChange, selectedType, selectedIntensity, readOnly],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {/* Body SVG */}
        <div className="flex-1">
          <svg
            viewBox="0 0 100 100"
            className={cn(
              'w-full max-w-[240px] mx-auto h-auto',
              !readOnly && 'cursor-crosshair',
            )}
            onClick={handleClick}
          >
            {/* Background */}
            <rect x={0} y={0} width={100} height={100} fill="transparent" />

            {/* Body outline */}
            <path
              d={BODY_OUTLINE}
              fill="none"
              stroke="#d1d5db"
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pain points */}
            {points.map((point) => {
              const color =
                NRS_LABELS[Math.min(point.intensity, 10)]?.color ?? themeColor;
              const radius = 2 + (point.intensity / 10) * 2;

              return (
                <g key={point.id}>
                  {/* Glow */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius + 2}
                    fill={color}
                    opacity={0.2}
                  />
                  {/* Point */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius}
                    fill={color}
                    stroke="white"
                    strokeWidth={0.5}
                    opacity={0.85}
                  />
                  {/* Intensity label */}
                  <text
                    x={point.x}
                    y={point.y + 0.8}
                    textAnchor="middle"
                    fontSize={2.5}
                    fontWeight="bold"
                    fill="white"
                    className="select-none"
                  >
                    {point.intensity}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Point list */}
        {points.length > 0 && (
          <div className="w-36 shrink-0 space-y-1">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Puntos ({points.length})
            </p>
            {points.map((point) => {
              const color =
                NRS_LABELS[Math.min(point.intensity, 10)]?.color ?? themeColor;
              return (
                <div
                  key={point.id}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-600 truncate">
                    {PAIN_TYPE_LABELS[point.type]} ({point.intensity})
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange(points.filter((p) => p.id !== point.id))
                      }
                      className="text-gray-400 hover:text-red-500 ml-auto shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!readOnly && (
        <p className="text-[10px] text-gray-400 text-center">
          Haga clic en el cuerpo para marcar dolor. Clic en un punto existente para eliminarlo.
        </p>
      )}
    </div>
  );
}
