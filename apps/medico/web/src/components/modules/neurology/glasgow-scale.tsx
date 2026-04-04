'use client';

import { useMemo } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  GCS_COMPONENTS,
  GCS_MAX,
  classifyGcs,
  formatGcsString,
  type GcsComponent,
} from './neurology-scales-data';

// ============================================================================
// TYPES
// ============================================================================

interface GlasgowScaleProps {
  scores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  readOnly?: boolean;
  themeColor?: string;
}

// ============================================================================
// COMPONENT COLUMN
// ============================================================================

function GcsColumn({
  component,
  value,
  onChange,
  readOnly,
  themeColor,
}: {
  component: GcsComponent;
  value: number;
  onChange: (value: number) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  return (
    <div className="flex-1 space-y-2">
      <div className="text-center">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {component.label}
        </p>
        <p
          className="text-2xl font-bold tabular-nums mt-1"
          style={{ color: themeColor }}
        >
          {value}
        </p>
      </div>

      <div className="space-y-1">
        {component.options
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(opt.value)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors',
                value === opt.value
                  ? 'text-white border-transparent'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50',
                readOnly && 'cursor-not-allowed opacity-70',
              )}
              style={
                value === opt.value ? { backgroundColor: themeColor } : undefined
              }
            >
              <span
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  value === opt.value ? 'bg-white/20' : 'bg-gray-100',
                )}
                style={
                  value === opt.value ? undefined : { color: themeColor }
                }
              >
                {opt.value}
              </span>
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GlasgowScale({
  scores,
  onChange,
  readOnly = false,
  themeColor = '#3B82F6',
}: GlasgowScaleProps) {
  const eye = scores['eye'] ?? 1;
  const verbal = scores['verbal'] ?? 1;
  const motor = scores['motor'] ?? 1;
  const total = eye + verbal + motor;

  const severity = useMemo(() => classifyGcs(total), [total]);
  const gcsString = useMemo(() => formatGcsString(eye, verbal, motor), [eye, verbal, motor]);

  const handleComponentChange = (componentId: string, value: number) => {
    onChange({ ...scores, [componentId]: value });
  };

  return (
    <div className="space-y-4">
      {/* ── Total score (large) ───────────────────────────────────── */}
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ backgroundColor: `${severity.color}10` }}
      >
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Glasgow Coma Scale
          </p>
          <p
            className="text-sm font-medium mt-1"
            style={{ color: severity.color }}
          >
            {severity.label}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-4xl font-bold tabular-nums"
            style={{ color: severity.color }}
          >
            {total}
          </p>
          <p className="text-xs text-gray-400">/{GCS_MAX}</p>
        </div>
      </div>

      {/* ── Quick doc string ──────────────────────────────────────── */}
      <div className="flex items-center justify-center p-2 rounded-lg bg-gray-50">
        <code className="text-xs font-mono font-bold text-gray-600">
          {gcsString}
        </code>
      </div>

      {/* ── 3 columns ─────────────────────────────────────────────── */}
      <div className="flex gap-3">
        {GCS_COMPONENTS.map((component) => (
          <GcsColumn
            key={component.id}
            component={component}
            value={scores[component.id] ?? 1}
            onChange={(value) => handleComponentChange(component.id, value)}
            readOnly={readOnly}
            themeColor={themeColor}
          />
        ))}
      </div>
    </div>
  );
}
