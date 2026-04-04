'use client';

import { useState, useCallback } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  ALLERGEN_PANELS,
  interpretWhealSize,
  type Allergen,
  type AllergenCategory,
  type SkinPrickEntry,
  type SkinPrickResult,
} from './allergy-panels-data';

// ============================================================================
// TYPES
// ============================================================================

interface SkinPrickTestProps {
  entries: SkinPrickEntry[];
  onChange: (entries: SkinPrickEntry[]) => void;
  themeColor?: string;
  readOnly?: boolean;
}

// ============================================================================
// RESULT BADGE COLORS
// ============================================================================

const RESULT_COLORS: Record<SkinPrickResult, string> = {
  '-': '#6b7280',
  '+': '#eab308',
  '++': '#f97316',
  '+++': '#ef4444',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SkinPrickTest({
  entries,
  onChange,
  themeColor = '#3B82F6',
  readOnly = false,
}: SkinPrickTestProps) {
  const [activeCategory, setActiveCategory] = useState<AllergenCategory>('respiratory');

  const activePanel = ALLERGEN_PANELS.find((p) => p.category === activeCategory);

  const getEntry = useCallback(
    (allergenId: string): SkinPrickEntry | undefined => {
      return entries.find((e) => e.allergen.id === allergenId);
    },
    [entries],
  );

  const updateEntry = useCallback(
    (allergen: Allergen, field: 'whealSize' | 'flareSize', value: number) => {
      const existing = entries.find((e) => e.allergen.id === allergen.id);
      const wheal = field === 'whealSize' ? value : existing?.whealSize ?? 0;
      const flare = field === 'flareSize' ? value : existing?.flareSize ?? 0;
      const result = interpretWhealSize(wheal);

      const newEntry: SkinPrickEntry = {
        allergen,
        whealSize: wheal,
        flareSize: flare,
        result,
      };

      const updated = existing
        ? entries.map((e) => (e.allergen.id === allergen.id ? newEntry : e))
        : [...entries, newEntry];

      onChange(updated);
    },
    [entries, onChange],
  );

  // Summary: count positives
  const positiveCount = entries.filter((e) => e.result !== '-').length;

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {ALLERGEN_PANELS.map((panel) => (
          <button
            key={panel.category}
            type="button"
            onClick={() => setActiveCategory(panel.category)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
              activeCategory === panel.category
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              activeCategory === panel.category
                ? { backgroundColor: themeColor }
                : undefined
            }
          >
            {panel.label}
          </button>
        ))}
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>
          {entries.length} alérgenos probados
        </span>
        <span className={cn(positiveCount > 0 && 'text-orange-600 font-medium')}>
          {positiveCount} positivos
        </span>
        <span className="ml-auto text-gray-400">
          Positivo: pápula ≥ 3 mm
        </span>
      </div>

      {/* Allergen grid */}
      {activePanel && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_80px_70px] gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b">
            <span>Alérgeno</span>
            <span className="text-center">Pápula (mm)</span>
            <span className="text-center">Eritema (mm)</span>
            <span className="text-center">Resultado</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {activePanel.allergens.map((allergen) => {
              const entry = getEntry(allergen.id);
              const result = entry?.result ?? '-';
              const resultColor = RESULT_COLORS[result];

              return (
                <div
                  key={allergen.id}
                  className="grid grid-cols-[1fr_80px_80px_70px] gap-2 px-4 py-2 items-center hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-700">{allergen.name}</span>

                  {/* Wheal size */}
                  <div className="flex justify-center">
                    {readOnly ? (
                      <span className="text-sm text-gray-600">
                        {entry?.whealSize ?? '—'}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={30}
                        step={0.5}
                        value={entry?.whealSize ?? ''}
                        onChange={(e) =>
                          updateEntry(allergen, 'whealSize', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="w-16 text-center text-sm border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    )}
                  </div>

                  {/* Flare size */}
                  <div className="flex justify-center">
                    {readOnly ? (
                      <span className="text-sm text-gray-600">
                        {entry?.flareSize ?? '—'}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={50}
                        step={0.5}
                        value={entry?.flareSize ?? ''}
                        onChange={(e) =>
                          updateEntry(allergen, 'flareSize', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="w-16 text-center text-sm border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    )}
                  </div>

                  {/* Result */}
                  <div className="flex justify-center">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: resultColor,
                        backgroundColor: `${resultColor}15`,
                      }}
                    >
                      {result}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Auto-interpretation */}
      {positiveCount > 0 && (
        <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
          <p className="text-sm font-medium text-orange-700 mb-1">
            Interpretación automática
          </p>
          <p className="text-xs text-orange-600">
            {positiveCount} sensibilización{positiveCount > 1 ? 'es' : ''} detectada{positiveCount > 1 ? 's' : ''}:{' '}
            {entries
              .filter((e) => e.result !== '-')
              .map((e) => `${e.allergen.name} (${e.result})`)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
