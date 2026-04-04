'use client';

import { useState, useCallback } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  ALLERGEN_PANELS,
  IGE_CLASS_RANGES,
  getIgEClass,
  type Allergen,
  type AllergenCategory,
  type IgEEntry,
  type IgEClass,
} from './allergy-panels-data';

// ============================================================================
// TYPES
// ============================================================================

interface IgEResultsProps {
  entries: IgEEntry[];
  onChange: (entries: IgEEntry[]) => void;
  totalIgE: number | null;
  onTotalIgEChange: (value: number | null) => void;
  themeColor?: string;
  readOnly?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function IgEResults({
  entries,
  onChange,
  totalIgE,
  onTotalIgEChange,
  themeColor = '#3B82F6',
  readOnly = false,
}: IgEResultsProps) {
  const [activeCategory, setActiveCategory] = useState<AllergenCategory>('respiratory');

  const activePanel = ALLERGEN_PANELS.find((p) => p.category === activeCategory);

  const getEntry = useCallback(
    (allergenId: string): IgEEntry | undefined => {
      return entries.find((e) => e.allergen.id === allergenId);
    },
    [entries],
  );

  const updateEntry = useCallback(
    (allergen: Allergen, value: number) => {
      const igeClass = getIgEClass(value);
      const newEntry: IgEEntry = { allergen, value, igeClass };

      const existing = entries.find((e) => e.allergen.id === allergen.id);
      const updated = existing
        ? entries.map((e) => (e.allergen.id === allergen.id ? newEntry : e))
        : [...entries, newEntry];

      onChange(updated);
    },
    [entries, onChange],
  );

  const elevatedCount = entries.filter((e) => e.igeClass >= 2).length;

  return (
    <div className="space-y-4">
      {/* Total IgE */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">IgE Total sérica</p>
          <p className="text-xs text-gray-400">Referencia: &lt;100 UI/mL (adultos)</p>
        </div>
        {readOnly ? (
          <span className="text-lg font-bold text-gray-700">
            {totalIgE != null ? `${totalIgE} UI/mL` : '—'}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={totalIgE ?? ''}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onTotalIgEChange(Number.isNaN(v) ? null : v);
              }}
              placeholder="0"
              className="w-24 text-right text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <span className="text-xs text-gray-500">UI/mL</span>
          </div>
        )}
        {totalIgE != null && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              totalIgE > 100
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700',
            )}
          >
            {totalIgE > 100 ? 'Elevada' : 'Normal'}
          </span>
        )}
      </div>

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

      {/* Class legend */}
      <div className="flex flex-wrap gap-2">
        {([0, 1, 2, 3, 4, 5, 6] as IgEClass[]).map((cls) => {
          const info = IGE_CLASS_RANGES[cls];
          return (
            <span
              key={cls}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ color: info.color, backgroundColor: `${info.color}15` }}
            >
              Clase {cls}: {info.label}
            </span>
          );
        })}
      </div>

      {/* Results table */}
      {activePanel && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_60px_120px] gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b">
            <span>Alérgeno</span>
            <span className="text-center">kU/L</span>
            <span className="text-center">Clase</span>
            <span className="text-center">Interpretación</span>
          </div>

          <div className="divide-y divide-gray-100">
            {activePanel.allergens.map((allergen) => {
              const entry = getEntry(allergen.id);
              const cls = entry?.igeClass ?? 0;
              const clsInfo = IGE_CLASS_RANGES[cls];

              return (
                <div
                  key={allergen.id}
                  className="grid grid-cols-[1fr_100px_60px_120px] gap-2 px-4 py-2 items-center hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-700">{allergen.name}</span>

                  {/* Value */}
                  <div className="flex justify-center">
                    {readOnly ? (
                      <span className="text-sm text-gray-600">
                        {entry?.value ?? '—'}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={entry?.value ?? ''}
                        onChange={(e) =>
                          updateEntry(allergen, parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="w-20 text-center text-sm border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    )}
                  </div>

                  {/* Class */}
                  <div className="flex justify-center">
                    <span
                      className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
                      style={{
                        color: clsInfo.color,
                        backgroundColor: `${clsInfo.color}15`,
                      }}
                    >
                      {cls}
                    </span>
                  </div>

                  {/* Interpretation */}
                  <div className="flex justify-center">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ color: clsInfo.color, backgroundColor: `${clsInfo.color}10` }}
                    >
                      {clsInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {elevatedCount > 0 && (
        <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
          <p className="text-sm font-medium text-orange-700 mb-1">Resumen</p>
          <p className="text-xs text-orange-600">
            {elevatedCount} IgE específica{elevatedCount > 1 ? 's' : ''} elevada{elevatedCount > 1 ? 's' : ''} (Clase ≥ 2):{' '}
            {entries
              .filter((e) => e.igeClass >= 2)
              .map((e) => `${e.allergen.name} (Clase ${e.igeClass})`)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
