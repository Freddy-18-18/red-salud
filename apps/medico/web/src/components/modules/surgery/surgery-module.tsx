'use client';

import { useState, useCallback } from 'react';
import { Plus, History, ChevronDown } from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useSurgicalChecklist,
  type SurgicalChecklistRecord,
  type CreateSurgicalChecklist,
} from './use-surgical-checklist';
import {
  SURGICAL_CHECKLISTS,
  getChecklistById,
  type ChecklistDefinition,
} from './surgical-checklists-data';
import { ChecklistForm } from './checklist-form';
import { SurgicalHistory } from './surgical-history';

// ============================================================================
// VIEW STATE
// ============================================================================

type ViewState = 'list' | 'select-type' | 'active' | 'history';

// ============================================================================
// CHECKLIST TYPE SELECTOR
// ============================================================================

function ChecklistTypeSelector({
  onSelect,
  onCancel,
  themeColor,
}: {
  onSelect: (typeId: string) => void;
  onCancel: () => void;
  themeColor: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Seleccione el tipo de lista de verificación:
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SURGICAL_CHECKLISTS.map((def) => (
          <button
            key={def.id}
            type="button"
            onClick={() => onSelect(def.id)}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
          >
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <span className="text-lg">
                {def.icon === 'ShieldCheck' ? '\u{1F6E1}' :
                 def.icon === 'ClipboardList' ? '\u{1F4CB}' :
                 def.icon === 'HeartPulse' ? '\u{2764}' :
                 def.icon === 'DoorOpen' ? '\u{1F6AA}' : '\u{2705}'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700">{def.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                {def.description}
              </p>
              <p className="text-[10px] text-gray-300 mt-1">
                {def.phases.length} fases &middot;{' '}
                {def.phases.reduce((s, p) => s + p.items.length, 0)} items
              </p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-end border-t pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SurgeryModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [activeChecklist, setActiveChecklist] = useState<SurgicalChecklistRecord | null>(null);
  const [activeDefinition, setActiveDefinition] = useState<ChecklistDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { checklists, loading, error, createChecklist, updateItem, completeChecklist, refresh } =
    useSurgicalChecklist(doctorId, {
      patientId,
      limit: 50,
    });

  // ── Handlers ──────────────────────────────────────────────────
  const handleSelectType = useCallback(
    async (typeId: string) => {
      setIsSubmitting(true);
      const result = await createChecklist({
        patient_id: patientId,
        checklist_type: typeId,
      });
      setIsSubmitting(false);
      if (result) {
        const def = getChecklistById(typeId);
        if (def) {
          setActiveDefinition(def);
          setActiveChecklist(result);
          setViewState('active');
        }
      }
    },
    [createChecklist, patientId],
  );

  const handleOpenChecklist = useCallback((checklist: SurgicalChecklistRecord) => {
    const def = getChecklistById(checklist.checklist_type);
    if (def) {
      setActiveDefinition(def);
      setActiveChecklist(checklist);
      setViewState('active');
    }
  }, []);

  const handleToggleItem = useCallback(
    (phaseId: string, itemId: string, checked: boolean, notes?: string | null) => {
      if (!activeChecklist) return;
      updateItem(activeChecklist.id, phaseId, itemId, checked, notes);

      // Optimistic update
      setActiveChecklist((prev) => {
        if (!prev) return prev;
        const phases = prev.phases.map((p) => {
          if (p.phase_id !== phaseId) return p;
          return {
            ...p,
            items: p.items.map((i) =>
              i.item_id === itemId
                ? {
                    ...i,
                    checked,
                    completed_at: checked ? new Date().toISOString() : null,
                    notes: notes !== undefined ? notes : i.notes,
                  }
                : i,
            ),
          };
        });
        const total = phases.reduce((s, p) => s + p.items.length, 0);
        const done = phases.reduce((s, p) => s + p.items.filter((i) => i.checked).length, 0);
        return {
          ...prev,
          phases,
          completion_pct: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      });
    },
    [activeChecklist, updateItem],
  );

  const handleCloseActive = useCallback(() => {
    setActiveChecklist(null);
    setActiveDefinition(null);
    setViewState('list');
    refresh();
  }, [refresh]);

  // ── Module actions ──────────────────────────────────────────
  const moduleActions = [
    {
      label: 'Nueva lista',
      onClick: () => setViewState('select-type'),
      icon: Plus,
    },
  ];

  // In-progress checklists
  const activeChecklists = checklists.filter((c) => c.status === 'in_progress');
  const completedChecklists = checklists.filter((c) => c.status !== 'in_progress');

  // ── Select type view ──────────────────────────────────────────
  if (viewState === 'select-type') {
    return (
      <ModuleWrapper
        moduleKey="surgical-checklist"
        title="Nuevo Checklist Quirúrgico"
        icon="ShieldCheck"
        themeColor={themeColor}
      >
        <ChecklistTypeSelector
          onSelect={handleSelectType}
          onCancel={() => setViewState('list')}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Active checklist view ─────────────────────────────────────
  if (viewState === 'active' && activeChecklist && activeDefinition) {
    return (
      <ModuleWrapper
        moduleKey="surgical-checklist"
        title={activeDefinition.name}
        icon="ShieldCheck"
        description={`Progreso: ${activeChecklist.completion_pct}%`}
        themeColor={themeColor}
      >
        <ChecklistForm
          definition={activeDefinition}
          phases={activeChecklist.phases}
          onToggleItem={handleToggleItem}
          onClose={handleCloseActive}
          readOnly={activeChecklist.status === 'completed'}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── History view ──────────────────────────────────────────────
  if (viewState === 'history') {
    return (
      <ModuleWrapper
        moduleKey="surgical-checklist"
        title="Historial de Checklists"
        icon="ShieldCheck"
        themeColor={themeColor}
        actions={[
          {
            label: 'Volver',
            onClick: () => setViewState('list'),
            variant: 'outline',
          },
        ]}
      >
        <SurgicalHistory
          checklists={completedChecklists}
          onSelect={handleOpenChecklist}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── List view (default) ────────────────────────────────────────
  return (
    <ModuleWrapper
      moduleKey="surgical-checklist"
      title="Checklists Quirúrgicos"
      icon="ShieldCheck"
      description="Listas de verificación de cirugía segura"
      themeColor={themeColor}
      isEmpty={!loading && checklists.length === 0}
      emptyMessage="Sin checklists quirúrgicos registrados"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Active checklists ───────────────────────────────────── */}
      {activeChecklists.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            En progreso
          </p>
          {activeChecklists.map((checklist) => {
            const def = getChecklistById(checklist.checklist_type);
            return (
              <button
                key={checklist.id}
                type="button"
                onClick={() => handleOpenChecklist(checklist)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors text-left"
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${themeColor}15` }}
                >
                  <span className="text-sm font-bold" style={{ color: themeColor }}>
                    {checklist.completion_pct}%
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {def?.name ?? checklist.checklist_type}
                  </p>
                  {checklist.patient_name && (
                    <p className="text-xs text-gray-400">{checklist.patient_name}</p>
                  )}
                </div>
                <div className="w-20 h-1.5 bg-white rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${checklist.completion_pct}%`,
                      backgroundColor: themeColor,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Completed summary ──────────────────────────────────── */}
      {completedChecklists.length > 0 && (
        <button
          type="button"
          onClick={() => setViewState('history')}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {completedChecklists.length} checklists completados
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 -rotate-90" />
        </button>
      )}

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
