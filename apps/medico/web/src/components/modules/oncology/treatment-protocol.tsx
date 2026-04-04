'use client';

import { useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import {
  SIDE_EFFECT_GRADES,
  COMMON_SIDE_EFFECTS,
  type CycleStatus,
  type SideEffectGrade,
} from './oncology-staging-data';
import type { TreatmentCycle } from './use-oncology';

// ============================================================================
// TYPES
// ============================================================================

interface TreatmentProtocolProps {
  protocolName: string | null;
  onProtocolNameChange: (v: string | null) => void;
  cycles: TreatmentCycle[];
  onCyclesChange: (cycles: TreatmentCycle[]) => void;
  themeColor?: string;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const CYCLE_STATUS_CONFIG: Record<CycleStatus, { label: string; color: string }> = {
  scheduled: { label: 'Programado', color: '#3b82f6' },
  in_progress: { label: 'En curso', color: '#f59e0b' },
  completed: { label: 'Completado', color: '#22c55e' },
  delayed: { label: 'Retrasado', color: '#f97316' },
  cancelled: { label: 'Cancelado', color: '#ef4444' },
};

// ============================================================================
// CYCLE TIMELINE SVG
// ============================================================================

function CycleTimeline({
  cycles,
  themeColor,
}: {
  cycles: TreatmentCycle[];
  themeColor: string;
}) {
  if (cycles.length === 0) return null;

  const width = Math.max(300, cycles.length * 60);
  const height = 60;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14">
      {/* Connecting line */}
      <line
        x1={30}
        y1={25}
        x2={width - 30}
        y2={25}
        stroke="#e5e7eb"
        strokeWidth={2}
      />

      {cycles.map((cycle, i) => {
        const x = 30 + (i / Math.max(cycles.length - 1, 1)) * (width - 60);
        const statusCfg = CYCLE_STATUS_CONFIG[cycle.status];

        return (
          <g key={cycle.cycleNumber}>
            {/* Progress line */}
            {i > 0 && cycle.status !== 'scheduled' && (
              <line
                x1={30 + ((i - 1) / Math.max(cycles.length - 1, 1)) * (width - 60)}
                y1={25}
                x2={x}
                y2={25}
                stroke={statusCfg.color}
                strokeWidth={2}
              />
            )}

            {/* Node */}
            <circle
              cx={x}
              cy={25}
              r={10}
              fill={
                cycle.status === 'completed'
                  ? statusCfg.color
                  : 'white'
              }
              stroke={statusCfg.color}
              strokeWidth={2}
            />

            {/* Cycle number */}
            <text
              x={x}
              y={28}
              textAnchor="middle"
              fontSize={9}
              fontWeight="bold"
              fill={cycle.status === 'completed' ? 'white' : statusCfg.color}
              className="select-none"
            >
              {cycle.cycleNumber}
            </text>

            {/* Date label */}
            {cycle.date && (
              <text
                x={x}
                y={48}
                textAnchor="middle"
                fontSize={7}
                fill="#9ca3af"
                className="select-none"
              >
                {cycle.date.slice(5)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TreatmentProtocol({
  protocolName,
  onProtocolNameChange,
  cycles,
  onCyclesChange,
  themeColor = '#8B5CF6',
}: TreatmentProtocolProps) {
  const [expandedCycle, setExpandedCycle] = useState<number | null>(null);

  const addCycle = useCallback(() => {
    const newCycle: TreatmentCycle = {
      cycleNumber: cycles.length + 1,
      date: new Date().toISOString().slice(0, 10),
      status: 'scheduled',
      drugs: [],
      sideEffects: [],
      labValues: {},
      doseModification: null,
      notes: null,
    };
    onCyclesChange([...cycles, newCycle]);
    setExpandedCycle(newCycle.cycleNumber);
  }, [cycles, onCyclesChange]);

  const updateCycle = useCallback(
    (cycleNum: number, updates: Partial<TreatmentCycle>) => {
      const updated = cycles.map((c) =>
        c.cycleNumber === cycleNum ? { ...c, ...updates } : c,
      );
      onCyclesChange(updated);
    },
    [cycles, onCyclesChange],
  );

  const removeCycle = useCallback(
    (cycleNum: number) => {
      const filtered = cycles
        .filter((c) => c.cycleNumber !== cycleNum)
        .map((c, i) => ({ ...c, cycleNumber: i + 1 }));
      onCyclesChange(filtered);
      if (expandedCycle === cycleNum) setExpandedCycle(null);
    },
    [cycles, onCyclesChange, expandedCycle],
  );

  return (
    <div className="space-y-4">
      {/* Protocol name */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Nombre del protocolo</label>
        <input
          type="text"
          value={protocolName ?? ''}
          onChange={(e) => onProtocolNameChange(e.target.value || null)}
          placeholder="Ej: FOLFOX, AC-T, R-CHOP..."
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Timeline */}
      <CycleTimeline cycles={cycles} themeColor={themeColor} />

      {/* Cycles */}
      <div className="space-y-2">
        {cycles.map((cycle) => {
          const isExpanded = expandedCycle === cycle.cycleNumber;
          const statusCfg = CYCLE_STATUS_CONFIG[cycle.status];

          return (
            <div
              key={cycle.cycleNumber}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Cycle header */}
              <button
                type="button"
                onClick={() =>
                  setExpandedCycle(isExpanded ? null : cycle.cycleNumber)
                }
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: statusCfg.color }}
                >
                  {cycle.cycleNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">
                    Ciclo {cycle.cycleNumber}
                  </p>
                  <p className="text-xs text-gray-400">
                    {cycle.date || 'Sin fecha'}
                    {cycle.drugs.length > 0 && ` — ${cycle.drugs.map((d) => d.name).join(', ')}`}
                  </p>
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ color: statusCfg.color, backgroundColor: `${statusCfg.color}15` }}
                >
                  {statusCfg.label}
                </span>
                {cycle.sideEffects.length > 0 && (
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {cycle.sideEffects.length} EA
                  </span>
                )}
              </button>

              {/* Cycle detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
                  {/* Date & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                      <input
                        type="date"
                        value={cycle.date}
                        onChange={(e) =>
                          updateCycle(cycle.cycleNumber, { date: e.target.value })
                        }
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Estado</label>
                      <select
                        value={cycle.status}
                        onChange={(e) =>
                          updateCycle(cycle.cycleNumber, {
                            status: e.target.value as CycleStatus,
                          })
                        }
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        {(Object.entries(CYCLE_STATUS_CONFIG) as Array<[CycleStatus, { label: string }]>).map(
                          ([key, cfg]) => (
                            <option key={key} value={key}>
                              {cfg.label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Drugs */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Medicamentos</p>
                    {cycle.drugs.map((drug, di) => (
                      <div key={di} className="flex gap-2 mb-1">
                        <input
                          type="text"
                          value={drug.name}
                          onChange={(e) => {
                            const updated = [...cycle.drugs];
                            updated[di] = { ...drug, name: e.target.value };
                            updateCycle(cycle.cycleNumber, { drugs: updated });
                          }}
                          placeholder="Nombre"
                          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                          type="text"
                          value={drug.dose}
                          onChange={(e) => {
                            const updated = [...cycle.drugs];
                            updated[di] = { ...drug, dose: e.target.value };
                            updateCycle(cycle.cycleNumber, { drugs: updated });
                          }}
                          placeholder="Dosis"
                          className="w-24 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                          type="text"
                          value={drug.route}
                          onChange={(e) => {
                            const updated = [...cycle.drugs];
                            updated[di] = { ...drug, route: e.target.value };
                            updateCycle(cycle.cycleNumber, { drugs: updated });
                          }}
                          placeholder="Vía"
                          className="w-16 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = cycle.drugs.filter((_, i) => i !== di);
                            updateCycle(cycle.cycleNumber, { drugs: updated });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        updateCycle(cycle.cycleNumber, {
                          drugs: [...cycle.drugs, { name: '', dose: '', route: 'IV' }],
                        });
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1"
                    >
                      <Plus className="h-3 w-3" /> Agregar medicamento
                    </button>
                  </div>

                  {/* Side effects */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Efectos adversos</p>
                    {cycle.sideEffects.map((se, si) => (
                      <div key={si} className="flex gap-2 mb-1 items-center">
                        <select
                          value={se.name}
                          onChange={(e) => {
                            const updated = [...cycle.sideEffects];
                            updated[si] = { ...se, name: e.target.value };
                            updateCycle(cycle.cycleNumber, { sideEffects: updated });
                          }}
                          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="">Seleccionar...</option>
                          {COMMON_SIDE_EFFECTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1">
                          {SIDE_EFFECT_GRADES.map((g) => (
                            <button
                              key={g.grade}
                              type="button"
                              onClick={() => {
                                const updated = [...cycle.sideEffects];
                                updated[si] = { ...se, grade: g.grade };
                                updateCycle(cycle.cycleNumber, { sideEffects: updated });
                              }}
                              className={cn(
                                'w-6 h-6 text-[10px] font-bold rounded',
                                se.grade === g.grade
                                  ? 'text-white'
                                  : 'text-gray-400 bg-gray-100',
                              )}
                              style={
                                se.grade === g.grade
                                  ? { backgroundColor: g.color }
                                  : undefined
                              }
                              title={g.label}
                            >
                              {g.grade}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = cycle.sideEffects.filter((_, i) => i !== si);
                            updateCycle(cycle.cycleNumber, { sideEffects: updated });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        updateCycle(cycle.cycleNumber, {
                          sideEffects: [
                            ...cycle.sideEffects,
                            { name: '', grade: 1 as SideEffectGrade },
                          ],
                        });
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1"
                    >
                      <Plus className="h-3 w-3" /> Agregar efecto adverso
                    </button>
                  </div>

                  {/* Dose modification & notes */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Modificación de dosis</label>
                      <input
                        type="text"
                        value={cycle.doseModification ?? ''}
                        onChange={(e) =>
                          updateCycle(cycle.cycleNumber, {
                            doseModification: e.target.value || null,
                          })
                        }
                        placeholder="Ej: Reducción 25%"
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Notas</label>
                      <input
                        type="text"
                        value={cycle.notes ?? ''}
                        onChange={(e) =>
                          updateCycle(cycle.cycleNumber, {
                            notes: e.target.value || null,
                          })
                        }
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Remove cycle */}
                  <button
                    type="button"
                    onClick={() => removeCycle(cycle.cycleNumber)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Eliminar ciclo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add cycle button */}
      <button
        type="button"
        onClick={addCycle}
        className="w-full flex items-center justify-center gap-2 text-xs font-medium px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Agregar ciclo {cycles.length + 1}
      </button>
    </div>
  );
}
