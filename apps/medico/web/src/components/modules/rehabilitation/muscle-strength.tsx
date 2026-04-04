'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import { MUSCLE_GROUPS, MMT_GRADES, getMmtColor, type MuscleGroup } from './rehab-scales-data';
import type { MmtEntry } from './use-rehabilitation';

// ============================================================================
// TYPES
// ============================================================================

interface MuscleStrengthProps {
  entries: MmtEntry[];
  onChange: (entries: MmtEntry[]) => void;
  readOnly?: boolean;
  themeColor?: string;
}

// ============================================================================
// GRADE SELECTOR
// ============================================================================

function GradeSelector({
  value,
  onChange,
  readOnly,
  side,
}: {
  value: number;
  onChange: (grade: number) => void;
  readOnly: boolean;
  side: 'left' | 'right';
}) {
  return (
    <div className="flex items-center gap-0.5">
      {MMT_GRADES.map((grade) => (
        <button
          key={grade.value}
          type="button"
          disabled={readOnly}
          onClick={() => onChange(grade.value)}
          title={grade.description}
          className={cn(
            'h-6 w-6 rounded text-[10px] font-bold transition-colors',
            value === grade.value
              ? 'text-white'
              : 'text-gray-400 bg-gray-50 hover:bg-gray-100',
            readOnly && 'cursor-not-allowed',
          )}
          style={value === grade.value ? { backgroundColor: getMmtColor(grade.value) } : undefined}
        >
          {grade.value}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MUSCLE ROW
// ============================================================================

function MuscleRow({
  muscle,
  entry,
  onChange,
  readOnly,
}: {
  muscle: MuscleGroup;
  entry: MmtEntry | undefined;
  onChange: (updated: MmtEntry) => void;
  readOnly: boolean;
}) {
  const baseEntry: MmtEntry = entry ?? {
    muscle_id: muscle.id,
    grade_left: 5,
    grade_right: 5,
  };

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Left side grades */}
      <GradeSelector
        value={baseEntry.grade_left}
        onChange={(grade) => onChange({ ...baseEntry, grade_left: grade })}
        readOnly={readOnly}
        side="left"
      />

      {/* Score display left */}
      <span
        className="text-xs font-bold tabular-nums w-8 text-center"
        style={{ color: getMmtColor(baseEntry.grade_left) }}
      >
        {baseEntry.grade_left}/5
      </span>

      {/* Label */}
      <div className="flex-1 text-center min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">{muscle.label}</p>
      </div>

      {/* Score display right */}
      <span
        className="text-xs font-bold tabular-nums w-8 text-center"
        style={{ color: getMmtColor(baseEntry.grade_right) }}
      >
        {baseEntry.grade_right}/5
      </span>

      {/* Right side grades */}
      <GradeSelector
        value={baseEntry.grade_right}
        onChange={(grade) => onChange({ ...baseEntry, grade_right: grade })}
        readOnly={readOnly}
        side="right"
      />
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MuscleStrength({
  entries,
  onChange,
  readOnly = false,
  themeColor = '#3B82F6',
}: MuscleStrengthProps) {
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) => ({ ...prev, [region]: !prev[region] }));
  };

  const handleEntryChange = (updated: MmtEntry) => {
    const existing = entries.findIndex((e) => e.muscle_id === updated.muscle_id);
    if (existing >= 0) {
      const next = [...entries];
      next[existing] = updated;
      onChange(next);
    } else {
      onChange([...entries, updated]);
    }
  };

  // Group muscles by region
  const regions = Array.from(new Set(MUSCLE_GROUPS.map((m) => m.region)));

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        Prueba Muscular Manual (MMT)
      </p>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 p-2 rounded-lg bg-gray-50">
        {MMT_GRADES.map((grade) => (
          <div key={grade.value} className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: grade.color }}
            />
            <span className="text-[10px] text-gray-500">
              {grade.label}: {grade.description}
            </span>
          </div>
        ))}
      </div>

      {regions.map((region) => {
        const expanded = expandedRegions[region] ?? false;
        const muscles = MUSCLE_GROUPS.filter((m) => m.region === region);
        const regionEntries = entries.filter((e) =>
          muscles.some((m) => m.id === e.muscle_id),
        );
        const filledCount = regionEntries.length;

        return (
          <div key={region} className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleRegion(region)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {region}
                </span>
                {filledCount > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {filledCount}/{muscles.length}
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform',
                  expanded && 'rotate-180',
                )}
              />
            </button>

            {expanded && (
              <div className="px-3 pb-3">
                {/* Header */}
                <div className="flex items-center gap-3 py-1 text-[10px] font-medium text-gray-400 uppercase border-b border-gray-50 mb-1">
                  <span className="w-[calc(6*1.5rem+2.5rem)]">Izquierda</span>
                  <span className="flex-1 text-center">Musculo</span>
                  <span className="w-[calc(6*1.5rem+2.5rem)] text-right">Derecha</span>
                </div>

                {muscles.map((muscle) => {
                  const entry = entries.find((e) => e.muscle_id === muscle.id);
                  return (
                    <MuscleRow
                      key={muscle.id}
                      muscle={muscle}
                      entry={entry}
                      onChange={handleEntryChange}
                      readOnly={readOnly}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
