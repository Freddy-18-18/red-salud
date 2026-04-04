'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import { NIHSS_ITEMS, NIHSS_MAX, classifyNihss, type NihssItem } from './neurology-scales-data';

// ============================================================================
// TYPES
// ============================================================================

interface NihssFormProps {
  scores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  readOnly?: boolean;
  themeColor?: string;
}

// ============================================================================
// SEVERITY BAND
// ============================================================================

function SeverityBand({ total }: { total: number }) {
  const bands = [
    { min: 0, max: 0, label: 'Sin deficit', color: '#22C55E' },
    { min: 1, max: 4, label: 'Menor', color: '#84CC16' },
    { min: 5, max: 15, label: 'Moderado', color: '#EAB308' },
    { min: 16, max: 20, label: 'Mod-Severo', color: '#F97316' },
    { min: 21, max: 42, label: 'Severo', color: '#EF4444' },
  ];

  return (
    <div className="flex items-center gap-1">
      {bands.map((band) => {
        const active = total >= band.min && total <= band.max;
        return (
          <div key={band.label} className="flex-1">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                active ? 'h-3' : 'opacity-30',
              )}
              style={{ backgroundColor: band.color }}
            />
            <p
              className={cn(
                'text-[9px] text-center mt-0.5',
                active ? 'font-bold' : 'text-gray-400',
              )}
              style={active ? { color: band.color } : undefined}
            >
              {band.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// STEP ITEM
// ============================================================================

function NihssStep({
  item,
  value,
  onChange,
  readOnly,
  themeColor,
}: {
  item: NihssItem;
  value: number;
  onChange: (value: number) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: themeColor }}
        >
          {item.number}
        </span>
        <p className="text-sm font-medium text-gray-700">{item.label}</p>
      </div>

      <div className="space-y-1 pl-8">
        {item.options.map((opt) => (
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
                'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                value === opt.value ? 'bg-white/20' : 'bg-gray-100',
              )}
              style={value === opt.value ? undefined : { color: themeColor }}
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

export function NihssForm({
  scores,
  onChange,
  readOnly = false,
  themeColor = '#3B82F6',
}: NihssFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const total = useMemo(
    () => Object.values(scores).reduce((sum, v) => sum + v, 0),
    [scores],
  );
  const classification = useMemo(() => classifyNihss(total), [total]);

  const currentItem = NIHSS_ITEMS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === NIHSS_ITEMS.length - 1;

  const handleChange = (value: number) => {
    onChange({ ...scores, [currentItem.id]: value });
  };

  return (
    <div className="space-y-4">
      {/* ── Running total ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ backgroundColor: `${classification.color}10` }}
      >
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            NIHSS Total
          </p>
          <p className="text-xs mt-0.5" style={{ color: classification.color }}>
            {classification.label}
          </p>
        </div>
        <p
          className="text-3xl font-bold tabular-nums"
          style={{ color: classification.color }}
        >
          {total}
        </p>
      </div>

      {/* ── Severity band ─────────────────────────────────────────── */}
      <SeverityBand total={total} />

      {/* ── Progress indicator ────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {NIHSS_ITEMS.map((item, idx) => {
          const filled = scores[item.id] !== undefined;
          const active = idx === currentStep;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={cn(
                'h-2 flex-1 rounded-full transition-all',
                active
                  ? 'h-3'
                  : filled
                    ? 'opacity-60'
                    : 'bg-gray-200',
              )}
              style={{
                backgroundColor: active || filled ? themeColor : undefined,
              }}
              title={`${item.number}: ${item.label}`}
            />
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Paso {currentStep + 1} de {NIHSS_ITEMS.length}
      </p>

      {/* ── Current step ──────────────────────────────────────────── */}
      {currentItem && (
        <NihssStep
          item={currentItem}
          value={scores[currentItem.id] ?? 0}
          onChange={handleChange}
          readOnly={readOnly}
          themeColor={themeColor}
        />
      )}

      {/* ── Navigation ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t pt-3">
        <Button
          type="button"
          variant="outline"
          disabled={isFirst}
          onClick={() => setCurrentStep((s) => s - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        <span className="text-xs text-gray-400 tabular-nums">
          {currentStep + 1}/{NIHSS_ITEMS.length}
        </span>

        <Button
          type="button"
          disabled={isLast}
          onClick={() => setCurrentStep((s) => s + 1)}
          style={{ backgroundColor: themeColor }}
        >
          Siguiente
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
