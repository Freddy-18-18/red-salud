'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Save,
  X,
  Eye,
  Calendar,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { Badge, Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useRehabilitation,
  type RehabSession,
  type CreateRehabSession,
  type RomEntry,
  type MmtEntry,
  type ScaleScore,
} from './use-rehabilitation';
import { RomAssessment } from './rom-assessment';
import { MuscleStrength } from './muscle-strength';
import { FunctionalScales } from './functional-scales';

// ============================================================================
// VIEW STATE
// ============================================================================

type ViewState = 'list' | 'new' | 'viewing';
type FormTab = 'rom' | 'mmt' | 'scales';

// ============================================================================
// SESSION SUMMARY CARD
// ============================================================================

function SessionSummaryCard({
  session,
  onClick,
  themeColor,
}: {
  session: RehabSession;
  onClick: () => void;
  themeColor: string;
}) {
  const romCount = session.rom_entries.filter(
    (e) => e.active_left !== null || e.active_right !== null,
  ).length;
  const mmtCount = session.mmt_entries.length;
  const scalesCount = session.scale_scores.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
    >
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${themeColor}10` }}
      >
        <Activity className="h-5 w-5" style={{ color: themeColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">
          {new Date(session.date).toLocaleDateString('es-VE', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {session.patient_name && (
            <span className="text-xs text-gray-400 truncate">
              {session.patient_name}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {romCount > 0 && (
              <Badge variant="outline" className="text-[10px]">
                ROM: {romCount}
              </Badge>
            )}
            {mmtCount > 0 && (
              <Badge variant="outline" className="text-[10px]">
                MMT: {mmtCount}
              </Badge>
            )}
            {scalesCount > 0 && (
              <Badge variant="outline" className="text-[10px]">
                Escalas: {scalesCount}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
    </button>
  );
}

// ============================================================================
// NEW SESSION FORM
// ============================================================================

function NewSessionForm({
  onSubmit,
  onCancel,
  isSubmitting,
  history,
  themeColor,
}: {
  onSubmit: (data: CreateRehabSession) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  history: ScaleScore[][];
  themeColor: string;
}) {
  const [activeTab, setActiveTab] = useState<FormTab>('rom');
  const [romEntries, setRomEntries] = useState<RomEntry[]>([]);
  const [mmtEntries, setMmtEntries] = useState<MmtEntry[]>([]);
  const [scaleScores, setScaleScores] = useState<ScaleScore[]>([]);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      date: new Date().toISOString(),
      rom_entries: romEntries,
      mmt_entries: mmtEntries,
      scale_scores: scaleScores,
      notes: notes || null,
    });
  };

  const tabs: Array<{ id: FormTab; label: string }> = [
    { id: 'rom', label: 'ROM' },
    { id: 'mmt', label: 'Fuerza' },
    { id: 'scales', label: 'Escalas' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              activeTab === tab.id ? { backgroundColor: themeColor } : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'rom' && (
        <RomAssessment
          entries={romEntries}
          onChange={setRomEntries}
          themeColor={themeColor}
        />
      )}
      {activeTab === 'mmt' && (
        <MuscleStrength
          entries={mmtEntries}
          onChange={setMmtEntries}
          themeColor={themeColor}
        />
      )}
      {activeTab === 'scales' && (
        <FunctionalScales
          scores={scaleScores}
          onChange={setScaleScores}
          history={history}
          themeColor={themeColor}
        />
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">
          Notas de la sesion
        </label>
        <textarea
          placeholder="Observaciones, plan de tratamiento..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[50px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="mr-1.5 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ backgroundColor: themeColor }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Guardando...
            </span>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              Guardar Sesion
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// SESSION VIEWER
// ============================================================================

function SessionViewer({
  session,
  history,
  onBack,
  themeColor,
}: {
  session: RehabSession;
  history: ScaleScore[][];
  onBack: () => void;
  themeColor: string;
}) {
  const [activeTab, setActiveTab] = useState<FormTab>('rom');

  const tabs: Array<{ id: FormTab; label: string }> = [
    { id: 'rom', label: 'ROM' },
    { id: 'mmt', label: 'Fuerza' },
    { id: 'scales', label: 'Escalas' },
  ];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        &larr; Volver a lista
      </button>

      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">
          {new Date(session.date).toLocaleDateString('es-VE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              activeTab === tab.id ? { backgroundColor: themeColor } : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'rom' && (
        <RomAssessment
          entries={session.rom_entries}
          onChange={() => {}}
          readOnly
          themeColor={themeColor}
        />
      )}
      {activeTab === 'mmt' && (
        <MuscleStrength
          entries={session.mmt_entries}
          onChange={() => {}}
          readOnly
          themeColor={themeColor}
        />
      )}
      {activeTab === 'scales' && (
        <FunctionalScales
          scores={session.scale_scores}
          onChange={() => {}}
          history={history}
          readOnly
          themeColor={themeColor}
        />
      )}

      {session.notes && (
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-1">Notas:</p>
          <p className="text-sm text-gray-600">{session.notes}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RehabilitationModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedSession, setSelectedSession] = useState<RehabSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sessions, loading, error, createSession, refresh } = useRehabilitation(
    doctorId,
    { patientId, limit: 50 },
  );

  // Historical scale scores for trend charts
  const scaleHistory = useMemo(
    () => sessions.map((s) => s.scale_scores),
    [sessions],
  );

  const handleCreate = useCallback(
    async (data: CreateRehabSession) => {
      setIsSubmitting(true);
      const result = await createSession({
        ...data,
        patient_id: patientId,
      });
      setIsSubmitting(false);
      if (result) {
        setViewState('list');
      }
    },
    [createSession, patientId],
  );

  const handleViewSession = useCallback((session: RehabSession) => {
    setSelectedSession(session);
    setViewState('viewing');
  }, []);

  const moduleActions = [
    {
      label: 'Nueva Sesion',
      onClick: () => setViewState('new'),
      icon: Plus,
    },
  ];

  // ── New session form ──────────────────────────────────────────
  if (viewState === 'new') {
    return (
      <ModuleWrapper
        moduleKey="rehabilitation-progress"
        title="Nueva Sesion de Rehabilitacion"
        icon="Accessibility"
        themeColor={themeColor}
      >
        <NewSessionForm
          onSubmit={handleCreate}
          onCancel={() => setViewState('list')}
          isSubmitting={isSubmitting}
          history={scaleHistory}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Session viewer ────────────────────────────────────────────
  if (viewState === 'viewing' && selectedSession) {
    return (
      <ModuleWrapper
        moduleKey="rehabilitation-progress"
        title="Sesion de Rehabilitacion"
        icon="Accessibility"
        themeColor={themeColor}
      >
        <SessionViewer
          session={selectedSession}
          history={scaleHistory}
          onBack={() => {
            setViewState('list');
            setSelectedSession(null);
            refresh();
          }}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── List view (default) ────────────────────────────────────────
  return (
    <ModuleWrapper
      moduleKey="rehabilitation-progress"
      title="Rehabilitacion"
      icon="Accessibility"
      description="Sesiones, ROM, fuerza y escalas funcionales"
      themeColor={themeColor}
      isEmpty={!loading && sessions.length === 0}
      emptyMessage="Sin sesiones de rehabilitacion registradas"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Quick summary ─────────────────────────────────────── */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gray-50 text-center">
            <p className="text-lg font-bold tabular-nums" style={{ color: themeColor }}>
              {sessions.length}
            </p>
            <p className="text-[10px] text-gray-400">Sesiones</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 text-center">
            <p className="text-lg font-bold tabular-nums" style={{ color: themeColor }}>
              {sessions.reduce((s, se) => s + se.rom_entries.filter((e) => e.active_left !== null || e.active_right !== null).length, 0)}
            </p>
            <p className="text-[10px] text-gray-400">ROM medidos</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 text-center">
            <p className="text-lg font-bold tabular-nums" style={{ color: themeColor }}>
              {sessions.reduce((s, se) => s + se.mmt_entries.length, 0)}
            </p>
            <p className="text-[10px] text-gray-400">MMT registrados</p>
          </div>
        </div>
      )}

      {/* ── Session list ──────────────────────────────────────── */}
      <div className="space-y-2">
        {sessions.map((session) => (
          <SessionSummaryCard
            key={session.id}
            session={session}
            onClick={() => handleViewSession(session)}
            themeColor={themeColor}
          />
        ))}
      </div>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
