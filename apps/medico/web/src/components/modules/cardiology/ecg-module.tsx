'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Eye,
  Save,
  X,
  Calendar,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { Badge, Button, Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useEcg,
  type EcgRecord,
  type CreateEcgRecord,
  type EcgClassification,
  type EcgInterpretation,
  type EcgStatus,
} from './use-ecg';
import { EcgViewer } from './ecg-viewer';
import { EcgInterpretationForm } from './ecg-interpretation-form';

// ============================================================================
// CONSTANTS
// ============================================================================

const CLASSIFICATION_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  normal: { label: 'Normal', variant: 'outline' },
  borderline: { label: 'Limítrofe', variant: 'secondary' },
  abnormal: { label: 'Anormal', variant: 'default' },
  critical: { label: 'Crítico', variant: 'destructive' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-600' },
  interpreted: { label: 'Interpretado', color: 'bg-blue-100 text-blue-700' },
  reviewed: { label: 'Revisado', color: 'bg-emerald-100 text-emerald-700' },
  amended: { label: 'Enmendado', color: 'bg-amber-100 text-amber-700' },
};

type FilterClassification = 'all' | EcgClassification;
type ViewState = 'list' | 'new' | 'viewing' | 'interpreting';

// ============================================================================
// NEW ECG FORM
// ============================================================================

function NewEcgForm({
  onSubmit,
  onCancel,
  isSubmitting,
  themeColor,
}: {
  onSubmit: (data: CreateEcgRecord) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  themeColor: string;
}) {
  const [recordingDate, setRecordingDate] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!recordingDate) {
        newErrors.recordingDate = 'La fecha es requerida';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      onSubmit({
        recording_date: new Date(recordingDate).toISOString(),
        notes: notes || null,
        status: 'pending',
      });
    },
    [recordingDate, notes, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Recording date */}
        <div className="space-y-1.5">
          <Label htmlFor="recording_date" className="text-sm font-medium">
            Fecha de registro <span className="text-red-500">*</span>
          </Label>
          <Input
            id="recording_date"
            type="datetime-local"
            value={recordingDate}
            onChange={(e) => {
              setRecordingDate(e.target.value);
              setErrors((prev) => {
                if (!('recordingDate' in prev)) return prev;
                const next = { ...prev };
                delete next.recordingDate;
                return next;
              });
            }}
          />
          {errors.recordingDate && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {errors.recordingDate}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notas
          </Label>
          <textarea
            id="notes"
            placeholder="Notas adicionales sobre el registro..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Image upload placeholder */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label className="text-sm font-medium">Imagen del ECG</Label>
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
            <Calendar className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              Arrastra una imagen del ECG o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPEG, PNG, PDF (max. 25 MB)
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="mr-1.5 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
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
              Registrar ECG
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function EcgModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#DC2626',
}: ModuleComponentProps) {
  // State
  const [viewState, setViewState] = useState<ViewState>('list');
  const [filterClassification, setFilterClassification] = useState<FilterClassification>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EcgRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const { records, loading, error, create, update, refresh } = useEcg(doctorId, {
    patientId,
    classification: filterClassification === 'all' ? undefined : filterClassification,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: 50,
  });

  // Filtered records (classification already handled by hook, but 'all' case)
  const filteredRecords = useMemo(() => {
    if (filterClassification === 'all') return records;
    return records.filter((r) => r.classification === filterClassification);
  }, [records, filterClassification]);

  // Handlers
  const handleCreate = useCallback(
    async (data: CreateEcgRecord) => {
      setIsSubmitting(true);
      const result = await create(data);
      setIsSubmitting(false);
      if (result) {
        setViewState('list');
      }
    },
    [create],
  );

  const handleViewRecord = useCallback((record: EcgRecord) => {
    setSelectedRecord(record);
    setViewState('viewing');
  }, []);

  const handleInterpret = useCallback(() => {
    setViewState('interpreting');
  }, []);

  const handleSaveInterpretation = useCallback(
    async (interpretation: EcgInterpretation) => {
      if (!selectedRecord) return;
      setIsSubmitting(true);
      const success = await update(selectedRecord.id, {
        interpretation,
        classification: interpretation.classification,
        status: 'interpreted',
      });
      setIsSubmitting(false);
      if (success) {
        // Update the local record so the viewer shows the new data
        setSelectedRecord((prev) =>
          prev
            ? {
                ...prev,
                interpretation,
                classification: interpretation.classification,
                status: 'interpreted' as EcgStatus,
              }
            : null,
        );
        setViewState('viewing');
      }
    },
    [selectedRecord, update],
  );

  // Module actions
  const moduleActions = [
    {
      label: 'Nuevo ECG',
      onClick: () => setViewState('new'),
      icon: Plus,
    },
  ];

  // ── Interpretation form view ────────────────────────────────
  if (viewState === 'interpreting' && selectedRecord) {
    return (
      <ModuleWrapper
        moduleKey="cardiology-ecg"
        title="Interpretación de ECG"
        icon="HeartPulse"
        themeColor={themeColor}
      >
        <EcgInterpretationForm
          onSubmit={handleSaveInterpretation}
          onCancel={() => setViewState('viewing')}
          initialData={selectedRecord.interpretation ?? undefined}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Viewer view ─────────────────────────────────────────────
  if (viewState === 'viewing' && selectedRecord) {
    return (
      <EcgViewer
        record={selectedRecord}
        onClose={() => {
          setViewState('list');
          setSelectedRecord(null);
          refresh();
        }}
        onInterpret={handleInterpret}
        themeColor={themeColor}
      />
    );
  }

  // ── New ECG form ────────────────────────────────────────────
  if (viewState === 'new') {
    return (
      <ModuleWrapper
        moduleKey="cardiology-ecg"
        title="Nuevo Electrocardiograma"
        icon="HeartPulse"
        themeColor={themeColor}
      >
        <NewEcgForm
          onSubmit={handleCreate}
          onCancel={() => setViewState('list')}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── List view ───────────────────────────────────────────────
  return (
    <ModuleWrapper
      moduleKey="cardiology-ecg"
      title="Electrocardiogramas"
      icon="HeartPulse"
      description="Registros y análisis de ECG"
      themeColor={themeColor}
      isEmpty={!loading && filteredRecords.length === 0}
      emptyMessage="Sin electrocardiogramas registrados"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="space-y-3 mb-4">
        {/* Classification filter pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(['all', 'normal', 'borderline', 'abnormal', 'critical'] as const).map(
              (cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setFilterClassification(cls)}
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full transition-colors',
                    filterClassification === cls
                      ? 'text-white'
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
                  )}
                  style={
                    filterClassification === cls
                      ? { backgroundColor: themeColor }
                      : undefined
                  }
                >
                  {cls === 'all'
                    ? 'Todos'
                    : CLASSIFICATION_CONFIG[cls]?.label ?? cls}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded transition-colors',
              showFilters
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Date range filter (collapsible) */}
        {showFilters && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              <Label className="text-xs text-gray-500 whitespace-nowrap">Desde</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Label className="text-xs text-gray-500 whitespace-nowrap">Hasta</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Record list ─────────────────────────────────────────── */}
      <div className="space-y-2">
        {filteredRecords.map((record) => {
          const statusCfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.pending;
          const classCfg = record.classification
            ? CLASSIFICATION_CONFIG[record.classification]
            : null;

          return (
            <button
              key={record.id}
              type="button"
              onClick={() => handleViewRecord(record)}
              className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Icon */}
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeColor}10` }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke={themeColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12h4l3-9 4 18 3-9h4" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    ECG
                  </p>
                  {record.interpretation?.heart_rate && (
                    <span className="text-xs text-gray-400">
                      {record.interpretation.heart_rate} lpm
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {record.patient_name && (
                    <p className="text-xs text-gray-400 truncate">
                      {record.patient_name}
                    </p>
                  )}
                  {record.interpretation?.rhythm_type && (
                    <p className="text-xs text-gray-400">
                      &middot;{' '}
                      {record.interpretation.rhythm_type === 'sinus'
                        ? 'Sinusal'
                        : 'No sinusal'}
                    </p>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                {classCfg && (
                  <Badge variant={classCfg.variant} className="text-xs">
                    {classCfg.label}
                  </Badge>
                )}
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusCfg.color)}>
                  {statusCfg.label}
                </span>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                {new Date(record.recording_date).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                })}
              </p>

              <Eye className="h-4 w-4 text-gray-300 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
