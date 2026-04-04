'use client';

import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import { ROM_JOINTS, type RomJoint, type RomMovement } from './rehab-scales-data';
import type { RomEntry } from './use-rehabilitation';

// ============================================================================
// TYPES
// ============================================================================

interface RomAssessmentProps {
  entries: RomEntry[];
  onChange: (entries: RomEntry[]) => void;
  readOnly?: boolean;
  themeColor?: string;
}

// ============================================================================
// ARC DIAGRAM (SVG)
// ============================================================================

function ArcDiagram({
  normalMax,
  activeValue,
  passiveValue,
  color,
  size = 60,
}: {
  normalMax: number;
  activeValue: number | null;
  passiveValue: number | null;
  color: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 6;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const normalAngle = Math.min((normalMax / 180) * 180, 180);
  const activeAngle = activeValue !== null ? Math.min((activeValue / 180) * 180, 180) : 0;
  const passiveAngle = passiveValue !== null ? Math.min((passiveValue / 180) * 180, 180) : 0;

  const arcPath = (angle: number) => {
    const startAngle = -90;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const deficit = activeValue !== null ? Math.max(0, normalMax - activeValue) : null;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Normal range (background) */}
        <path
          d={arcPath(normalAngle)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* Passive ROM */}
        {passiveValue !== null && passiveAngle > 0 && (
          <path
            d={arcPath(passiveAngle)}
            fill="none"
            stroke={`${color}40`}
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}
        {/* Active ROM */}
        {activeValue !== null && activeAngle > 0 && (
          <path
            d={arcPath(activeAngle)}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}
      </svg>
      {deficit !== null && deficit > 0 && (
        <span className="text-[10px] text-red-500 font-medium">
          -{deficit}°
        </span>
      )}
    </div>
  );
}

// ============================================================================
// MOVEMENT ROW
// ============================================================================

function MovementRow({
  joint,
  movement,
  entry,
  onChange,
  readOnly,
  themeColor,
}: {
  joint: RomJoint;
  movement: RomMovement;
  entry: RomEntry | undefined;
  onChange: (updated: RomEntry) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  const baseEntry: RomEntry = entry ?? {
    joint_id: joint.id,
    movement_id: movement.id,
    active_left: null,
    active_right: null,
    passive_left: null,
    passive_right: null,
  };

  const handleChange = (field: keyof RomEntry, value: string) => {
    const num = value === '' ? null : Number(value);
    onChange({ ...baseEntry, [field]: num });
  };

  const activeAvg = useMemo(() => {
    const vals = [baseEntry.active_left, baseEntry.active_right].filter((v) => v !== null) as number[];
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }, [baseEntry.active_left, baseEntry.active_right]);

  return (
    <div className="grid grid-cols-[1fr_60px_60px_60px_60px_50px] gap-1 items-center">
      {/* Label */}
      <div className="pr-2">
        <p className="text-xs font-medium text-gray-600">{movement.label}</p>
        <p className="text-[10px] text-gray-400">Normal: 0-{movement.normalMax}°</p>
      </div>

      {/* Active Left */}
      <Input
        type="number"
        min={0}
        max={360}
        placeholder="—"
        value={baseEntry.active_left ?? ''}
        onChange={(e) => handleChange('active_left', e.target.value)}
        disabled={readOnly}
        className="h-7 text-xs text-center px-1"
      />

      {/* Active Right */}
      <Input
        type="number"
        min={0}
        max={360}
        placeholder="—"
        value={baseEntry.active_right ?? ''}
        onChange={(e) => handleChange('active_right', e.target.value)}
        disabled={readOnly}
        className="h-7 text-xs text-center px-1"
      />

      {/* Passive Left */}
      <Input
        type="number"
        min={0}
        max={360}
        placeholder="—"
        value={baseEntry.passive_left ?? ''}
        onChange={(e) => handleChange('passive_left', e.target.value)}
        disabled={readOnly}
        className="h-7 text-xs text-center px-1"
      />

      {/* Passive Right */}
      <Input
        type="number"
        min={0}
        max={360}
        placeholder="—"
        value={baseEntry.passive_right ?? ''}
        onChange={(e) => handleChange('passive_right', e.target.value)}
        disabled={readOnly}
        className="h-7 text-xs text-center px-1"
      />

      {/* Visual arc */}
      <ArcDiagram
        normalMax={movement.normalMax}
        activeValue={activeAvg}
        passiveValue={null}
        color={themeColor}
        size={40}
      />
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RomAssessment({
  entries,
  onChange,
  readOnly = false,
  themeColor = '#3B82F6',
}: RomAssessmentProps) {
  const [expandedJoints, setExpandedJoints] = useState<Record<string, boolean>>({});

  const toggleJoint = (id: string) => {
    setExpandedJoints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEntryChange = (updated: RomEntry) => {
    const existing = entries.findIndex(
      (e) => e.joint_id === updated.joint_id && e.movement_id === updated.movement_id,
    );
    if (existing >= 0) {
      const next = [...entries];
      next[existing] = updated;
      onChange(next);
    } else {
      onChange([...entries, updated]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        Rango de Movimiento Articular
      </p>

      {ROM_JOINTS.map((joint) => {
        const expanded = expandedJoints[joint.id] ?? false;
        const jointEntries = entries.filter((e) => e.joint_id === joint.id);
        const filledCount = jointEntries.filter(
          (e) => e.active_left !== null || e.active_right !== null,
        ).length;

        return (
          <div key={joint.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleJoint(joint.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {joint.label}
                </span>
                {filledCount > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {filledCount}/{joint.movements.length}
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
              <div className="px-3 pb-3 space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[1fr_60px_60px_60px_60px_50px] gap-1 text-[10px] font-medium text-gray-400 uppercase">
                  <span>Movimiento</span>
                  <span className="text-center">Act. Izq</span>
                  <span className="text-center">Act. Der</span>
                  <span className="text-center">Pas. Izq</span>
                  <span className="text-center">Pas. Der</span>
                  <span className="text-center"></span>
                </div>

                {joint.movements.map((movement) => {
                  const entry = entries.find(
                    (e) => e.joint_id === joint.id && e.movement_id === movement.id,
                  );
                  return (
                    <MovementRow
                      key={movement.id}
                      joint={joint}
                      movement={movement}
                      entry={entry}
                      onChange={handleEntryChange}
                      readOnly={readOnly}
                      themeColor={themeColor}
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
