'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Eye,
  Save,
  X,
  Filter,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { Badge, Button, Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useOphthalmology,
  type OphthalmologyExam,
  type CreateOphthalmologyExam,
  type ExamType,
  type VisualAcuityData,
  type RefractionData,
  type IopData,
  type FundoscopyData,
} from './use-ophthalmology';
import { VisualAcuityChart } from './visual-acuity-chart';
import { RefractionForm } from './refraction-form';
import { IopTracker } from './iop-tracker';

// ============================================================================
// CONSTANTS
// ============================================================================

const EXAM_TYPE_CONFIG: Record<ExamType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  visual_acuity: { label: 'Agudeza Visual', variant: 'outline' },
  refraction: { label: 'Refracción', variant: 'secondary' },
  iop: { label: 'PIO', variant: 'default' },
  fundoscopy: { label: 'Fondo de Ojo', variant: 'outline' },
  complete: { label: 'Completo', variant: 'secondary' },
};

type TabId = 'visual_acuity' | 'refraction' | 'iop' | 'fundoscopy' | 'complete';

const TABS: { id: TabId; label: string }[] = [
  { id: 'visual_acuity', label: 'Agudeza Visual' },
  { id: 'refraction', label: 'Refracción' },
  { id: 'iop', label: 'Presión Intraocular' },
  { id: 'fundoscopy', label: 'Fondo de Ojo' },
  { id: 'complete', label: 'Examen Completo' },
];

type FilterType = 'all' | ExamType;
type ViewState = 'list' | 'new' | 'viewing';

const EMPTY_VISUAL_ACUITY: VisualAcuityData = {
  od_uncorrected: null,
  od_corrected: null,
  od_pinhole: null,
  os_uncorrected: null,
  os_corrected: null,
  os_pinhole: null,
  ou_uncorrected: null,
  ou_corrected: null,
};

const EMPTY_REFRACTION: RefractionData = {
  od_sphere: null,
  od_cylinder: null,
  od_axis: null,
  od_add: null,
  os_sphere: null,
  os_cylinder: null,
  os_axis: null,
  os_add: null,
  pupillary_distance: null,
};

const EMPTY_IOP: IopData = {
  od_value: null,
  os_value: null,
  method: null,
  time_of_day: null,
};

const EMPTY_FUNDOSCOPY: FundoscopyData = {
  od_findings: null,
  os_findings: null,
  od_cup_disc_ratio: null,
  os_cup_disc_ratio: null,
};

// ============================================================================
// FUNDOSCOPY SUB-FORM
// ============================================================================

function FundoscopyForm({
  value,
  onChange,
  themeColor,
}: {
  value: FundoscopyData;
  onChange: (data: FundoscopyData) => void;
  themeColor: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OD */}
        <div className="space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700">Ojo Derecho (OD)</h4>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500">Hallazgos</Label>
            <textarea
              value={value.od_findings ?? ''}
              onChange={(e) => onChange({ ...value, od_findings: e.target.value || null })}
              rows={3}
              placeholder="Describir hallazgos del fondo de ojo..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500">Relación copa/disco</Label>
            <Input
              type="number"
              value={value.od_cup_disc_ratio ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({
                  ...value,
                  od_cup_disc_ratio: raw === '' ? null : parseFloat(raw),
                });
              }}
              min={0}
              max={1}
              step={0.1}
              className="h-9 text-sm w-24"
              placeholder="0.3"
            />
          </div>
        </div>

        {/* OS */}
        <div className="space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700">Ojo Izquierdo (OS)</h4>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500">Hallazgos</Label>
            <textarea
              value={value.os_findings ?? ''}
              onChange={(e) => onChange({ ...value, os_findings: e.target.value || null })}
              rows={3}
              placeholder="Describir hallazgos del fondo de ojo..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500">Relación copa/disco</Label>
            <Input
              type="number"
              value={value.os_cup_disc_ratio ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({
                  ...value,
                  os_cup_disc_ratio: raw === '' ? null : parseFloat(raw),
                });
              }}
              min={0}
              max={1}
              step={0.1}
              className="h-9 text-sm w-24"
              placeholder="0.3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NEW EXAM FORM
// ============================================================================

function NewExamForm({
  onSubmit,
  onCancel,
  isSubmitting,
  themeColor,
  history,
}: {
  onSubmit: (data: CreateOphthalmologyExam) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  themeColor: string;
  history: OphthalmologyExam[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>('visual_acuity');
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [visualAcuity, setVisualAcuity] = useState<VisualAcuityData>(EMPTY_VISUAL_ACUITY);
  const [refraction, setRefraction] = useState<RefractionData>(EMPTY_REFRACTION);
  const [iop, setIop] = useState<IopData>(EMPTY_IOP);
  const [fundoscopy, setFundoscopy] = useState<FundoscopyData>(EMPTY_FUNDOSCOPY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!examDate) {
        newErrors.examDate = 'La fecha es requerida';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Determine exam type from active tab or 'complete' for full exams
      const examType: ExamType = activeTab === 'complete' ? 'complete' : activeTab;

      onSubmit({
        exam_type: examType,
        exam_date: new Date(examDate).toISOString(),
        visual_acuity: activeTab === 'visual_acuity' || activeTab === 'complete' ? visualAcuity : null,
        refraction: activeTab === 'refraction' || activeTab === 'complete' ? refraction : null,
        iop: activeTab === 'iop' || activeTab === 'complete' ? iop : null,
        fundoscopy: activeTab === 'fundoscopy' || activeTab === 'complete' ? fundoscopy : null,
        notes: notes || null,
      });
    },
    [examDate, activeTab, visualAcuity, refraction, iop, fundoscopy, notes, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="exam_date" className="text-sm font-medium">
            Fecha del examen <span className="text-red-500">*</span>
          </Label>
          <Input
            id="exam_date"
            type="datetime-local"
            value={examDate}
            onChange={(e) => {
              setExamDate(e.target.value);
              setErrors((prev) => {
                if (!('examDate' in prev)) return prev;
                const next = { ...prev };
                delete next.examDate;
                return next;
              });
            }}
          />
          {errors.examDate && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {errors.examDate}
            </p>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-current'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              )}
              style={activeTab === tab.id ? { color: themeColor } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {(activeTab === 'visual_acuity' || activeTab === 'complete') && (
          <div className={cn(activeTab === 'complete' && 'mb-6')}>
            {activeTab === 'complete' && (
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Agudeza Visual</h3>
            )}
            <VisualAcuityChart
              value={visualAcuity}
              onChange={setVisualAcuity}
              themeColor={themeColor}
            />
          </div>
        )}

        {(activeTab === 'refraction' || activeTab === 'complete') && (
          <div className={cn(activeTab === 'complete' && 'mb-6')}>
            {activeTab === 'complete' && (
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Refracción</h3>
            )}
            <RefractionForm
              value={refraction}
              onChange={setRefraction}
              themeColor={themeColor}
            />
          </div>
        )}

        {(activeTab === 'iop' || activeTab === 'complete') && (
          <div className={cn(activeTab === 'complete' && 'mb-6')}>
            {activeTab === 'complete' && (
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Presión Intraocular</h3>
            )}
            <IopTracker
              value={iop}
              onChange={setIop}
              history={history}
              themeColor={themeColor}
            />
          </div>
        )}

        {(activeTab === 'fundoscopy' || activeTab === 'complete') && (
          <div className={cn(activeTab === 'complete' && 'mb-6')}>
            {activeTab === 'complete' && (
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Fondo de Ojo</h3>
            )}
            <FundoscopyForm
              value={fundoscopy}
              onChange={setFundoscopy}
              themeColor={themeColor}
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="exam_notes" className="text-sm font-medium">
          Notas
        </Label>
        <textarea
          id="exam_notes"
          placeholder="Notas adicionales sobre el examen..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
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
              Guardar Examen
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// EXAM DETAIL VIEWER
// ============================================================================

function ExamViewer({
  exam,
  onClose,
  onPrint,
  themeColor,
  history,
}: {
  exam: OphthalmologyExam;
  onClose: () => void;
  onPrint: () => void;
  themeColor: string;
  history: OphthalmologyExam[];
}) {
  const formatAcuity = (v: string | null) => v ?? '—';

  return (
    <ModuleWrapper
      moduleKey="ophthalmology-exam"
      title="Detalle del Examen"
      icon="Eye"
      themeColor={themeColor}
      actions={[
        { label: 'Imprimir', onClick: onPrint, icon: Printer, variant: 'outline' },
        { label: 'Cerrar', onClick: onClose, icon: X, variant: 'ghost' },
      ]}
    >
      <div className="space-y-5">
        {/* Header info */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>
            {new Date(exam.exam_date).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <Badge variant={EXAM_TYPE_CONFIG[exam.exam_type]?.variant ?? 'outline'}>
            {EXAM_TYPE_CONFIG[exam.exam_type]?.label ?? exam.exam_type}
          </Badge>
          {exam.patient_name && (
            <span className="text-gray-600 font-medium">{exam.patient_name}</span>
          )}
        </div>

        {/* Visual Acuity */}
        {exam.visual_acuity && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Agudeza Visual</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* OD */}
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">OD</p>
                <p className="text-sm">
                  <span className="text-xs text-gray-400">SC: </span>
                  <span className="font-medium">{formatAcuity(exam.visual_acuity.od_uncorrected)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-xs text-gray-400">CC: </span>
                  <span className="font-medium">{formatAcuity(exam.visual_acuity.od_corrected)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-xs text-gray-400">PH: </span>
                  <span className="font-medium">{formatAcuity(exam.visual_acuity.od_pinhole)}</span>
                </p>
              </div>
              {/* OS */}
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">OS</p>
                <p className="text-sm">
                  <span className="text-xs text-gray-400">SC: </span>
                  <span className="font-medium">{formatAcuity(exam.visual_acuity.os_uncorrected)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-xs text-gray-400">CC: </span>
                  <span className="font-medium">{formatAcuity(exam.visual_acuity.os_corrected)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-xs text-gray-400">PH: </span>
                  <span className="font-medium">{formatAcuity(exam.visual_acuity.os_pinhole)}</span>
                </p>
              </div>
              {/* OU */}
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">OU</p>
                <p className="text-sm">
                  <span className="text-xs text-gray-400">SC: </span>
                  <span className="font-medium">{formatAcuity(exam.visual_acuity.ou_uncorrected)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-xs text-gray-400">CC: </span>
                  <span className="font-medium">{formatAcuity(exam.visual_acuity.ou_corrected)}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Refraction */}
        {exam.refraction && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Refracción</h4>
            <div className="grid grid-cols-2 gap-3">
              {(['od', 'os'] as const).map((eye) => {
                const sph = exam.refraction![`${eye}_sphere` as keyof RefractionData] as number | null;
                const cyl = exam.refraction![`${eye}_cylinder` as keyof RefractionData] as number | null;
                const axis = exam.refraction![`${eye}_axis` as keyof RefractionData] as number | null;
                const add = exam.refraction![`${eye}_add` as keyof RefractionData] as number | null;
                return (
                  <div key={eye} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{eye.toUpperCase()}</p>
                    <p className="text-sm font-mono">
                      {sph !== null ? `${sph > 0 ? '+' : ''}${sph.toFixed(2)}` : '—'}
                      {' / '}
                      {cyl !== null ? cyl.toFixed(2) : '—'}
                      {' x '}
                      {axis !== null ? `${axis}°` : '—'}
                    </p>
                    {add !== null && (
                      <p className="text-xs text-gray-400 mt-0.5">Add: +{add.toFixed(2)}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {exam.refraction.pupillary_distance !== null && (
              <p className="text-sm text-gray-500">
                DP: <span className="font-medium">{exam.refraction.pupillary_distance} mm</span>
              </p>
            )}
          </div>
        )}

        {/* IOP */}
        {exam.iop && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Presión Intraocular</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">OD</p>
                <p className={cn(
                  'text-lg font-semibold',
                  exam.iop.od_value !== null && exam.iop.od_value > 21 ? 'text-red-600' : 'text-gray-700',
                )}>
                  {exam.iop.od_value !== null ? `${exam.iop.od_value} mmHg` : '—'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">OS</p>
                <p className={cn(
                  'text-lg font-semibold',
                  exam.iop.os_value !== null && exam.iop.os_value > 21 ? 'text-red-600' : 'text-gray-700',
                )}>
                  {exam.iop.os_value !== null ? `${exam.iop.os_value} mmHg` : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {exam.iop.method && <span>Método: {exam.iop.method}</span>}
              {exam.iop.time_of_day && <span>Hora: {exam.iop.time_of_day}</span>}
            </div>
            {/* Show IOP trend if there's history */}
            {history.length > 1 && (
              <IopTracker
                value={exam.iop}
                onChange={() => {}}
                history={history}
                themeColor={themeColor}
              />
            )}
          </div>
        )}

        {/* Fundoscopy */}
        {exam.fundoscopy && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Fondo de Ojo</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">OD</p>
                <p className="text-sm text-gray-600">{exam.fundoscopy.od_findings ?? '—'}</p>
                {exam.fundoscopy.od_cup_disc_ratio !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    Copa/disco: {exam.fundoscopy.od_cup_disc_ratio}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">OS</p>
                <p className="text-sm text-gray-600">{exam.fundoscopy.os_findings ?? '—'}</p>
                {exam.fundoscopy.os_cup_disc_ratio !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    Copa/disco: {exam.fundoscopy.os_cup_disc_ratio}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {exam.notes && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-700">Notas</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{exam.notes}</p>
          </div>
        )}
      </div>
    </ModuleWrapper>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function OphthalmologyModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#7C3AED',
}: ModuleComponentProps) {
  // State
  const [viewState, setViewState] = useState<ViewState>('list');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExam, setSelectedExam] = useState<OphthalmologyExam | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const { exams, loading, error, create, refresh } = useOphthalmology(doctorId, {
    patientId,
    examType: filterType === 'all' ? undefined : filterType,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: 50,
  });

  // Filtered exams
  const filteredExams = useMemo(() => {
    if (filterType === 'all') return exams;
    return exams.filter((e) => e.exam_type === filterType);
  }, [exams, filterType]);

  // Handlers
  const handleCreate = useCallback(
    async (data: CreateOphthalmologyExam) => {
      setIsSubmitting(true);
      const result = await create(data);
      setIsSubmitting(false);
      if (result) {
        setViewState('list');
      }
    },
    [create],
  );

  const handleViewExam = useCallback((exam: OphthalmologyExam) => {
    setSelectedExam(exam);
    setViewState('viewing');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Module actions
  const moduleActions = [
    {
      label: 'Nuevo Examen',
      onClick: () => setViewState('new'),
      icon: Plus,
    },
  ];

  // ── Viewer ────────────────────────────────────────────────────
  if (viewState === 'viewing' && selectedExam) {
    return (
      <ExamViewer
        exam={selectedExam}
        onClose={() => {
          setViewState('list');
          setSelectedExam(null);
          refresh();
        }}
        onPrint={handlePrint}
        themeColor={themeColor}
        history={exams}
      />
    );
  }

  // ── New exam form ─────────────────────────────────────────────
  if (viewState === 'new') {
    return (
      <ModuleWrapper
        moduleKey="ophthalmology-exam"
        title="Nuevo Examen Oftalmológico"
        icon="Eye"
        themeColor={themeColor}
      >
        <NewExamForm
          onSubmit={handleCreate}
          onCancel={() => setViewState('list')}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
          history={exams}
        />
      </ModuleWrapper>
    );
  }

  // ── List view ─────────────────────────────────────────────────
  return (
    <ModuleWrapper
      moduleKey="ophthalmology-exam"
      title="Exámenes Oftalmológicos"
      icon="Eye"
      description="Agudeza visual, refracción, PIO y fondo de ojo"
      themeColor={themeColor}
      isEmpty={!loading && filteredExams.length === 0}
      emptyMessage="Sin exámenes oftalmológicos registrados"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="space-y-3 mb-4">
        {/* Type filter pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['all', 'visual_acuity', 'refraction', 'iop', 'fundoscopy', 'complete'] as const).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
                    filterType === type
                      ? 'text-white'
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
                  )}
                  style={
                    filterType === type ? { backgroundColor: themeColor } : undefined
                  }
                >
                  {type === 'all' ? 'Todos' : EXAM_TYPE_CONFIG[type]?.label ?? type}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded transition-colors shrink-0 ml-2',
              showFilters
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Date range filter */}
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

      {/* ── Exam list ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        {filteredExams.map((exam) => {
          const typeCfg = EXAM_TYPE_CONFIG[exam.exam_type];
          const hasIopAlert =
            exam.iop &&
            ((exam.iop.od_value !== null && exam.iop.od_value > 21) ||
              (exam.iop.os_value !== null && exam.iop.os_value > 21));

          // Build a summary line
          const summaryParts: string[] = [];
          if (exam.visual_acuity) {
            const od = exam.visual_acuity.od_corrected ?? exam.visual_acuity.od_uncorrected;
            const os = exam.visual_acuity.os_corrected ?? exam.visual_acuity.os_uncorrected;
            if (od || os) summaryParts.push(`AV: ${od ?? '—'}/${os ?? '—'}`);
          }
          if (exam.iop) {
            if (exam.iop.od_value !== null || exam.iop.os_value !== null) {
              summaryParts.push(`PIO: ${exam.iop.od_value ?? '—'}/${exam.iop.os_value ?? '—'}`);
            }
          }

          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => handleViewExam(exam)}
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
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {typeCfg?.label ?? 'Examen'}
                  </p>
                  {hasIopAlert && (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {exam.patient_name && (
                    <p className="text-xs text-gray-400 truncate">{exam.patient_name}</p>
                  )}
                  {summaryParts.length > 0 && (
                    <p className="text-xs text-gray-400 truncate">
                      {exam.patient_name ? '\u00b7 ' : ''}
                      {summaryParts.join(' | ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Badge */}
              <div className="shrink-0">
                <Badge variant={typeCfg?.variant ?? 'outline'} className="text-xs">
                  {typeCfg?.label ?? exam.exam_type}
                </Badge>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                {new Date(exam.exam_date).toLocaleDateString('es-VE', {
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
