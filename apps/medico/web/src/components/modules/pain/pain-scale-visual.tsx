'use client';

import { useState, useCallback } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  NRS_LABELS,
  FACES_SCALE,
  vasToNrs,
  nrsToVas,
  getVasColor,
} from './pain-scales-data';

// ============================================================================
// TYPES
// ============================================================================

interface PainScaleVisualProps {
  nrsValue: number;
  onNrsChange: (value: number) => void;
  vasValue: number;
  onVasChange: (value: number) => void;
  themeColor?: string;
  readOnly?: boolean;
}

type ScaleView = 'nrs' | 'vas' | 'faces';

// ============================================================================
// NRS COMPONENT
// ============================================================================

function NrsScale({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {NRS_LABELS.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={readOnly}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex-1 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all',
              value === item.value
                ? 'ring-2 ring-offset-1 scale-110 text-white'
                : 'text-gray-400 hover:opacity-80',
            )}
            style={{
              backgroundColor:
                value === item.value ? item.color : `${item.color}20`,
              '--tw-ring-color': item.color,
            } as React.CSSProperties}
          >
            {item.value}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 px-1">
        <span>Sin dolor</span>
        <span>Peor dolor posible</span>
      </div>
      <p className="text-center text-sm font-medium" style={{ color: NRS_LABELS[value].color }}>
        {NRS_LABELS[value].label} ({value}/10)
      </p>
    </div>
  );
}

// ============================================================================
// VAS COMPONENT
// ============================================================================

function VasScale({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Gradient bar */}
        <div
          className="h-8 rounded-full"
          style={{
            background: 'linear-gradient(to right, #22c55e 0%, #eab308 40%, #f97316 60%, #ef4444 80%, #991b1b 100%)',
          }}
        />
        {/* Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          disabled={readOnly}
          className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer disabled:cursor-default"
        />
        {/* Indicator */}
        <div
          className="absolute top-0 h-8 w-1.5 bg-white border-2 rounded-full shadow-md pointer-events-none"
          style={{
            left: `calc(${value}% - 3px)`,
            borderColor: getVasColor(value),
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 px-1">
        <span>0 mm</span>
        <span>100 mm</span>
      </div>
      <p className="text-center text-sm font-medium" style={{ color: getVasColor(value) }}>
        VAS: {value} mm (NRS equivalente: {vasToNrs(value)})
      </p>
    </div>
  );
}

// ============================================================================
// FACES COMPONENT
// ============================================================================

function FacesScale({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly: boolean;
}) {
  const nrs = vasToNrs(value * 10);
  const closestFace = FACES_SCALE.reduce((prev, curr) =>
    Math.abs(curr.value - nrs) < Math.abs(prev.value - nrs) ? curr : prev,
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {FACES_SCALE.map((face) => {
          const isSelected = face.value === closestFace.value;
          return (
            <button
              key={face.value}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(face.value)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                isSelected
                  ? 'ring-2 ring-offset-1 scale-110 bg-white shadow-sm'
                  : 'opacity-50 hover:opacity-80',
              )}
              style={isSelected ? { '--tw-ring-color': face.color } as React.CSSProperties : undefined}
            >
              {/* SVG Face */}
              <svg viewBox="0 0 40 40" className="w-12 h-12">
                {/* Head */}
                <circle cx={20} cy={20} r={18} fill={face.color} opacity={0.15} stroke={face.color} strokeWidth={1.5} />

                {/* Eyes */}
                {face.eyeType === 'happy' ? (
                  <>
                    <path d="M 12 16 Q 14 14 16 16" fill="none" stroke={face.color} strokeWidth={1.5} strokeLinecap="round" />
                    <path d="M 24 16 Q 26 14 28 16" fill="none" stroke={face.color} strokeWidth={1.5} strokeLinecap="round" />
                  </>
                ) : face.eyeType === 'cry' ? (
                  <>
                    <circle cx={14} cy={15} r={1.5} fill={face.color} />
                    <circle cx={26} cy={15} r={1.5} fill={face.color} />
                    <line x1={26} y1={17} x2={26} y2={20} stroke={face.color} strokeWidth={1} strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <circle cx={14} cy={15} r={1.5} fill={face.color} />
                    <circle cx={26} cy={15} r={1.5} fill={face.color} />
                  </>
                )}

                {/* Mouth */}
                <path d={face.mouthPath} fill="none" stroke={face.color} strokeWidth={1.5} strokeLinecap="round" />
              </svg>

              <span className="text-[10px] font-medium" style={{ color: face.color }}>
                {face.value}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-sm font-medium" style={{ color: closestFace.color }}>
        {closestFace.label} ({closestFace.value}/10)
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PainScaleVisual({
  nrsValue,
  onNrsChange,
  vasValue,
  onVasChange,
  themeColor = '#ef4444',
  readOnly = false,
}: PainScaleVisualProps) {
  const [activeScale, setActiveScale] = useState<ScaleView>('nrs');

  // Link scales
  const handleNrsChange = useCallback(
    (v: number) => {
      onNrsChange(v);
      onVasChange(nrsToVas(v));
    },
    [onNrsChange, onVasChange],
  );

  const handleVasChange = useCallback(
    (v: number) => {
      onVasChange(v);
      onNrsChange(vasToNrs(v));
    },
    [onNrsChange, onVasChange],
  );

  const handleFacesChange = useCallback(
    (v: number) => {
      onNrsChange(v);
      onVasChange(nrsToVas(v));
    },
    [onNrsChange, onVasChange],
  );

  return (
    <div className="space-y-3">
      {/* Scale selector */}
      <div className="flex gap-2">
        {([
          { key: 'nrs' as ScaleView, label: 'NRS (0-10)' },
          { key: 'vas' as ScaleView, label: 'VAS (0-100)' },
          { key: 'faces' as ScaleView, label: 'FACES' },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveScale(tab.key)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
              activeScale === tab.key
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              activeScale === tab.key ? { backgroundColor: themeColor } : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeScale === 'nrs' && (
        <NrsScale value={nrsValue} onChange={handleNrsChange} readOnly={readOnly} />
      )}
      {activeScale === 'vas' && (
        <VasScale value={vasValue} onChange={handleVasChange} readOnly={readOnly} />
      )}
      {activeScale === 'faces' && (
        <FacesScale value={nrsValue} onChange={handleFacesChange} readOnly={readOnly} />
      )}
    </div>
  );
}
