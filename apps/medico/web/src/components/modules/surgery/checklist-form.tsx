'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertCircle,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { Badge, Button, Input } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type {
  ChecklistDefinition,
  ChecklistPhase,
  ChecklistItem,
  TeamRole,
} from './surgical-checklists-data';
import { TEAM_ROLE_LABELS } from './surgical-checklists-data';
import type { ChecklistPhaseCompletion, ChecklistItemCompletion } from './use-surgical-checklist';
import { phaseCompletionPct, phaseMandatoryComplete } from './use-surgical-checklist';

// ============================================================================
// TYPES
// ============================================================================

interface ChecklistFormProps {
  definition: ChecklistDefinition;
  phases: ChecklistPhaseCompletion[];
  onToggleItem: (phaseId: string, itemId: string, checked: boolean, notes?: string | null) => void;
  onClose: () => void;
  readOnly?: boolean;
  themeColor?: string;
}

// ============================================================================
// ROLE BADGE
// ============================================================================

const ROLE_COLORS: Record<TeamRole, string> = {
  cirujano: '#3B82F6',
  anestesiologo: '#8B5CF6',
  enfermero: '#10B981',
};

function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span
      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
      style={{ backgroundColor: ROLE_COLORS[role] }}
    >
      {TEAM_ROLE_LABELS[role]}
    </span>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

function PhaseProgressBar({
  pct,
  color,
}: {
  pct: number;
  color: string;
}) {
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ============================================================================
// CHECKLIST ITEM ROW
// ============================================================================

function ChecklistItemRow({
  item,
  completion,
  onToggle,
  readOnly,
  phaseColor,
}: {
  item: ChecklistItem;
  completion: ChecklistItemCompletion;
  onToggle: (checked: boolean, notes?: string | null) => void;
  readOnly: boolean;
  phaseColor: string;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(completion.notes ?? '');

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        completion.checked
          ? 'border-transparent bg-gray-50'
          : item.mandatory
            ? 'border-amber-200 bg-amber-50/30'
            : 'border-gray-100',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onToggle(!completion.checked)}
          className={cn(
            'h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
            completion.checked
              ? 'border-transparent text-white'
              : 'border-gray-300 hover:border-gray-400',
            readOnly && 'cursor-not-allowed opacity-60',
          )}
          style={completion.checked ? { backgroundColor: phaseColor } : undefined}
        >
          {completion.checked && <Check className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm font-medium',
                completion.checked ? 'text-gray-400 line-through' : 'text-gray-700',
              )}
            >
              {item.label}
            </p>
            {item.mandatory && !completion.checked && (
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                Obligatorio
              </Badge>
            )}
          </div>

          {item.hint && (
            <p className="text-xs text-gray-400 mt-0.5">{item.hint}</p>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            {item.responsible && <RoleBadge role={item.responsible} />}
            {completion.completed_at && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock className="h-3 w-3" />
                {new Date(completion.completed_at).toLocaleTimeString('es-VE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
            {!readOnly && (
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className={cn(
                  'flex items-center gap-1 text-[10px] transition-colors',
                  showNotes || completion.notes ? 'text-blue-500' : 'text-gray-300 hover:text-gray-500',
                )}
              >
                <MessageSquare className="h-3 w-3" />
                Nota
              </button>
            )}
          </div>

          {/* Notes field */}
          {(showNotes || (readOnly && completion.notes)) && (
            <div className="mt-2">
              {readOnly ? (
                <p className="text-xs text-gray-500 italic">{completion.notes}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Nota adicional..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-7 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-7 text-xs px-2"
                    onClick={() => {
                      onToggle(completion.checked, notes || null);
                      setShowNotes(false);
                    }}
                  >
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ChecklistForm({
  definition,
  phases,
  onToggleItem,
  onClose,
  readOnly = false,
  themeColor = '#3B82F6',
}: ChecklistFormProps) {
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);

  const activePhase = definition.phases[activePhaseIdx];
  const activeCompletion = phases.find((p) => p.phase_id === activePhase?.id);

  const pct = activeCompletion ? phaseCompletionPct(activeCompletion) : 0;
  const mandatoryDone = activeCompletion
    ? phaseMandatoryComplete(activeCompletion, definition)
    : false;

  const isLastPhase = activePhaseIdx === definition.phases.length - 1;
  const isFirstPhase = activePhaseIdx === 0;

  const overallPct = useMemo(() => {
    const total = phases.reduce((sum, p) => sum + p.items.length, 0);
    if (total === 0) return 0;
    const checked = phases.reduce(
      (sum, p) => sum + p.items.filter((i) => i.checked).length,
      0,
    );
    return Math.round((checked / total) * 100);
  }, [phases]);

  return (
    <div className="space-y-4">
      {/* ── Phase tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {definition.phases.map((phase, idx) => {
          const pc = phases.find((p) => p.phase_id === phase.id);
          const phasePct = pc ? phaseCompletionPct(pc) : 0;
          const isActive = idx === activePhaseIdx;

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => setActivePhaseIdx(idx)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border',
                isActive
                  ? 'text-white border-transparent'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50',
              )}
              style={isActive ? { backgroundColor: phase.color } : undefined}
            >
              <span>{phase.name}</span>
              <span
                className={cn(
                  'text-[10px] font-bold',
                  isActive ? 'text-white/80' : 'text-gray-400',
                )}
              >
                {phasePct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Overall progress ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <PhaseProgressBar pct={overallPct} color={themeColor} />
        <span className="text-xs font-bold tabular-nums text-gray-500">
          {overallPct}%
        </span>
      </div>

      {/* ── Active phase header ───────────────────────────────────── */}
      {activePhase && (
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${activePhase.color}10` }}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: activePhase.color }} />
            <h4 className="text-sm font-bold" style={{ color: activePhase.color }}>
              {activePhase.name}
            </h4>
          </div>
          <p className="text-xs text-gray-500 mt-1">{activePhase.description}</p>
          <div className="mt-2">
            <PhaseProgressBar pct={pct} color={activePhase.color} />
          </div>
        </div>
      )}

      {/* ── Items ──────────────────────────────────────────────────── */}
      {activePhase && activeCompletion && (
        <div className="space-y-2">
          {activePhase.items.map((item) => {
            const itemCompletion = activeCompletion.items.find(
              (i) => i.item_id === item.id,
            ) ?? {
              item_id: item.id,
              checked: false,
              notes: null,
              completed_at: null,
              completed_by: null,
            };

            return (
              <ChecklistItemRow
                key={item.id}
                item={item}
                completion={itemCompletion}
                onToggle={(checked, notes) =>
                  onToggleItem(activePhase.id, item.id, checked, notes)
                }
                readOnly={readOnly}
                phaseColor={activePhase.color}
              />
            );
          })}
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isFirstPhase}
          onClick={() => setActivePhaseIdx((prev) => prev - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        {!mandatoryDone && !readOnly && (
          <p className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3 w-3" />
            Complete los items obligatorios
          </p>
        )}

        {isLastPhase ? (
          <Button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: themeColor }}
          >
            Cerrar
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!mandatoryDone && !readOnly}
            onClick={() => setActivePhaseIdx((prev) => prev + 1)}
            style={{ backgroundColor: activePhase?.color }}
          >
            Siguiente
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
