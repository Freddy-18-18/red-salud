'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Save,
  ChevronDown,
  Printer,
  History,
  AlertCircle,
  Droplets,
} from 'lucide-react';
import { Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import ToothChart from './tooth-chart';
import type { ToothChartTooth } from './tooth-chart';
import {
  usePeriodontogram,
  ADULT_TEETH,
  PEDIATRIC_TEETH,
  UPPER_TEETH,
  LOWER_TEETH,
  MOLAR_TEETH,
  PROBING_SITES,
  PROBING_SITE_LABELS,
  emptyToothData,
  depthColor,
  computePerioSummary,
  type ToothPerioData,
  type PerioExam,
  type ProbingSite,
} from './use-periodontogram';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Summary statistics bar */
function PerioSummaryBar({
  summary,
  themeColor,
}: {
  summary: ReturnType<typeof computePerioSummary>;
  themeColor: string;
}) {
  const stats = [
    {
      label: 'BOP',
      value: `${summary.bopPercentage}%`,
      detail: `${summary.bopCount}/${summary.totalSites} sitios`,
      color: summary.bopPercentage > 30 ? '#EF4444' : summary.bopPercentage > 10 ? '#EAB308' : '#22C55E',
    },
    {
      label: 'Prof. media',
      value: `${summary.avgProbingDepth}mm`,
      detail: null,
      color: summary.avgProbingDepth > 4 ? '#EF4444' : summary.avgProbingDepth > 3 ? '#EAB308' : '#22C55E',
    },
    {
      label: 'Bolsas >4mm',
      value: `${summary.pocketsOver4mmPercentage}%`,
      detail: `${summary.pocketsOver4mm} sitios`,
      color: summary.pocketsOver4mmPercentage > 20 ? '#EF4444' : '#EAB308',
    },
    {
      label: 'Bolsas >6mm',
      value: `${summary.pocketsOver6mmPercentage}%`,
      detail: `${summary.pocketsOver6mm} sitios`,
      color: summary.pocketsOver6mmPercentage > 10 ? '#EF4444' : '#EAB308',
    },
    {
      label: 'Ausentes',
      value: `${summary.missingTeeth}`,
      detail: null,
      color: '#6B7280',
    },
    {
      label: 'Movilidad',
      value: `${summary.teethWithMobility}`,
      detail: 'dientes',
      color: summary.teethWithMobility > 0 ? '#F97316' : '#22C55E',
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center p-2 rounded-lg bg-gray-50 border border-gray-100"
        >
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</span>
          <span
            className="text-lg font-bold"
            style={{ color: s.color }}
          >
            {s.value}
          </span>
          {s.detail && (
            <span className="text-[10px] text-gray-400">{s.detail}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Probing depth input row for a single tooth */
function ToothProbeInput({
  toothCode,
  data,
  isMolar,
  onChange,
  themeColor,
}: {
  toothCode: string;
  data: ToothPerioData;
  isMolar: boolean;
  onChange: (toothCode: string, updated: ToothPerioData) => void;
  themeColor: string;
}) {
  const handleDepthChange = useCallback(
    (siteIdx: number, value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 20) return;
      const newDepths = [...data.probing_depth];
      newDepths[siteIdx] = num;
      onChange(toothCode, { ...data, probing_depth: newDepths });
    },
    [toothCode, data, onChange],
  );

  const handleRecessionChange = useCallback(
    (siteIdx: number, value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < -5 || num > 15) return;
      const newRec = [...data.recession];
      newRec[siteIdx] = num;
      onChange(toothCode, { ...data, recession: newRec });
    },
    [toothCode, data, onChange],
  );

  const handleBleedingToggle = useCallback(
    (siteIdx: number) => {
      const newBleeding = [...data.bleeding];
      newBleeding[siteIdx] = !newBleeding[siteIdx];
      onChange(toothCode, { ...data, bleeding: newBleeding });
    },
    [toothCode, data, onChange],
  );

  const handleMobilityChange = useCallback(
    (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 3) return;
      onChange(toothCode, { ...data, mobility: num });
    },
    [toothCode, data, onChange],
  );

  const handleFurcationChange = useCallback(
    (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 3) return;
      onChange(toothCode, { ...data, furcation: num });
    },
    [toothCode, data, onChange],
  );

  const handleMissingToggle = useCallback(() => {
    onChange(toothCode, { ...data, missing: !data.missing });
  }, [toothCode, data, onChange]);

  if (data.missing) {
    return (
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100">
        <span className="font-mono text-sm font-bold w-8 text-center" style={{ color: themeColor }}>
          {toothCode}
        </span>
        <span className="text-sm text-gray-400 flex-1">Ausente</span>
        <button
          type="button"
          onClick={handleMissingToggle}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          Restaurar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      {/* Header: tooth code + mobility/furcation + missing toggle */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span className="font-mono text-sm font-bold w-8 text-center" style={{ color: themeColor }}>
          {toothCode}
        </span>
        <div className="flex items-center gap-3 flex-1">
          <label className="flex items-center gap-1 text-[10px] text-gray-500">
            Mov:
            <select
              value={data.mobility}
              onChange={(e) => handleMobilityChange(e.target.value)}
              className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
            >
              <option value="0">0</option>
              <option value="1">I</option>
              <option value="2">II</option>
              <option value="3">III</option>
            </select>
          </label>
          {isMolar && (
            <label className="flex items-center gap-1 text-[10px] text-gray-500">
              Furca:
              <select
                value={data.furcation}
                onChange={(e) => handleFurcationChange(e.target.value)}
                className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
              >
                <option value="0">0</option>
                <option value="1">I</option>
                <option value="2">II</option>
                <option value="3">III</option>
              </select>
            </label>
          )}
        </div>
        <button
          type="button"
          onClick={handleMissingToggle}
          className="text-[10px] text-gray-400 hover:text-red-500"
          title="Marcar como ausente"
        >
          X
        </button>
      </div>

      {/* Probing depths per site */}
      <div className="grid grid-cols-6 divide-x divide-gray-100">
        {PROBING_SITES.map((site, idx) => {
          const depth = data.probing_depth[idx] ?? 0;
          const recession = data.recession[idx] ?? 0;
          const cal = depth + recession;
          const bleeding = data.bleeding[idx] ?? false;

          return (
            <div key={site} className="flex flex-col items-center py-1.5 px-1">
              <span className="text-[9px] text-gray-400 uppercase">{site}</span>

              {/* Probing depth */}
              <input
                type="number"
                min={0}
                max={20}
                value={depth}
                onChange={(e) => handleDepthChange(idx, e.target.value)}
                className="w-full text-center text-sm font-mono font-bold border-0 bg-transparent focus:ring-0 focus:outline-none p-0"
                style={{ color: depthColor(depth) }}
                aria-label={`Sondaje ${PROBING_SITE_LABELS[site]}`}
              />

              {/* Recession */}
              <input
                type="number"
                min={-5}
                max={15}
                value={recession}
                onChange={(e) => handleRecessionChange(idx, e.target.value)}
                className="w-full text-center text-[10px] font-mono text-gray-500 border-0 bg-transparent focus:ring-0 focus:outline-none p-0"
                aria-label={`Recesi\u00f3n ${PROBING_SITE_LABELS[site]}`}
              />

              {/* CAL computed */}
              <span className="text-[9px] text-gray-300 font-mono">
                {cal}
              </span>

              {/* BOP toggle */}
              <button
                type="button"
                onClick={() => handleBleedingToggle(idx)}
                className={cn(
                  'mt-0.5 w-3.5 h-3.5 rounded-full border transition-colors',
                  bleeding
                    ? 'bg-red-500 border-red-500'
                    : 'bg-white border-gray-300 hover:border-red-300',
                )}
                title="Sangrado al sondaje"
                aria-label={`BOP ${PROBING_SITE_LABELS[site]}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Exam history sidebar / dropdown */
function ExamHistory({
  exams,
  currentExamId,
  onSelect,
  themeColor,
}: {
  exams: PerioExam[];
  currentExamId: string | null;
  onSelect: (exam: PerioExam) => void;
  themeColor: string;
}) {
  if (exams.length === 0) return null;

  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 px-1">
        Historial de ex\u00e1menes
      </span>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {exams.map((exam) => {
          const isActive = exam.id === currentExamId;
          const summary = computePerioSummary(exam.teeth);
          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => onSelect(exam)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors text-sm',
                isActive
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent',
              )}
              style={isActive ? { borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` } : undefined}
            >
              <div>
                <span className="font-medium text-gray-700">
                  {new Date(exam.exam_date).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                {exam.notes && (
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">{exam.notes}</p>
                )}
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-xs font-mono" style={{ color: depthColor(summary.avgProbingDepth) }}>
                  {summary.avgProbingDepth}mm
                </span>
                <span className="block text-[10px] text-gray-400">
                  BOP {summary.bopPercentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN MODULE
// ============================================================================

export default function PeriodontogramModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#0EA5E9',
}: ModuleComponentProps) {
  // State
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPediatric, setIsPediatric] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local editable teeth data (working copy)
  const [localTeeth, setLocalTeeth] = useState<Record<string, ToothPerioData> | null>(null);
  const [notes, setNotes] = useState('');

  // Data hook
  const {
    exams,
    currentExam,
    loading,
    error,
    summary,
    create,
    update,
    selectExam,
    refresh,
  } = usePeriodontogram(doctorId, { patientId, limit: 20 });

  const toothCodes = isPediatric ? PEDIATRIC_TEETH : ADULT_TEETH;

  // Determine which teeth data we're viewing/editing
  const activeTeeth = localTeeth ?? currentExam?.teeth ?? {};
  const activeSummary = localTeeth
    ? computePerioSummary(localTeeth)
    : summary;

  const isEditing = localTeeth !== null;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleNewExam = useCallback(() => {
    // Initialize all teeth with empty data
    const initial: Record<string, ToothPerioData> = {};
    for (const code of toothCodes) {
      initial[code] = emptyToothData();
    }
    setLocalTeeth(initial);
    setNotes('');
    setIsCreating(true);
  }, [toothCodes]);

  const handleEditExam = useCallback(() => {
    if (!currentExam) return;
    // Copy current exam data into local state for editing
    const copy: Record<string, ToothPerioData> = {};
    for (const code of toothCodes) {
      copy[code] = currentExam.teeth[code]
        ? { ...currentExam.teeth[code] }
        : emptyToothData();
    }
    setLocalTeeth(copy);
    setNotes(currentExam.notes);
    setIsCreating(false);
  }, [currentExam, toothCodes]);

  const handleCancel = useCallback(() => {
    setLocalTeeth(null);
    setIsCreating(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!localTeeth || !patientId) return;
    setIsSaving(true);

    if (isCreating) {
      await create({
        patient_id: patientId,
        teeth: localTeeth,
        notes,
      });
    } else if (currentExam) {
      await update(currentExam.id, {
        teeth: localTeeth,
        notes,
      });
    }

    setLocalTeeth(null);
    setIsCreating(false);
    setIsSaving(false);
  }, [localTeeth, patientId, isCreating, currentExam, create, update, notes]);

  const handleToothDataChange = useCallback(
    (toothCode: string, updated: ToothPerioData) => {
      if (!localTeeth) return;
      setLocalTeeth((prev) => ({
        ...prev!,
        [toothCode]: updated,
      }));
    },
    [localTeeth],
  );

  const handleExamSelect = useCallback(
    (exam: PerioExam) => {
      setLocalTeeth(null);
      setIsCreating(false);
      selectExam(exam);
      setShowHistory(false);
    },
    [selectExam],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Build chart teeth ───────────────────────────────────────────────────

  const chartTeeth = useMemo<ToothChartTooth[]>(() => {
    return toothCodes.map((code) => {
      const data = activeTeeth[code];
      if (!data) return { code };

      // Color by worst probing depth
      const maxDepth = Math.max(...(data.probing_depth ?? [0]));
      const hasBleeding = (data.bleeding ?? []).some(Boolean);

      return {
        code,
        isMissing: data.missing,
        highlight: hasBleeding ? '#EF4444' : undefined,
        condition: data.missing
          ? 'missing' as const
          : maxDepth >= 6
            ? 'caries' as const
            : maxDepth >= 4
              ? 'crown' as const
              : 'healthy' as const,
      };
    });
  }, [toothCodes, activeTeeth]);

  // ── Module actions ──────────────────────────────────────────────────────

  const moduleActions = isEditing
    ? [
        {
          label: 'Cancelar',
          onClick: handleCancel,
          variant: 'ghost' as const,
        },
        {
          label: isSaving ? 'Guardando...' : 'Guardar',
          onClick: handleSave,
          icon: Save,
        },
      ]
    : [
        ...(currentExam
          ? [
              {
                label: 'Editar',
                onClick: handleEditExam,
                variant: 'outline' as const,
              },
            ]
          : []),
        {
          label: 'Nuevo examen',
          onClick: handleNewExam,
          icon: Plus,
        },
      ];

  // ── Teeth for selected detail ───────────────────────────────────────────

  const selectedToothData = selectedTooth ? activeTeeth[selectedTooth] : null;

  return (
    <ModuleWrapper
      moduleKey="dental-periodontogram"
      title="Periodontograma"
      icon="Scan"
      description="Registro periodontal por sitio"
      themeColor={themeColor}
      isEmpty={!loading && !isEditing && exams.length === 0}
      emptyMessage="Sin ex\u00e1menes periodontales. Cree uno nuevo para comenzar."
      isLoading={loading}
      actions={moduleActions}
    >
      <div className="space-y-4">
        {/* ── History toggle ──────────────────────────────────────── */}
        {exams.length > 1 && !isEditing && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              <History className="h-3.5 w-3.5" />
              {exams.length} ex\u00e1menes
              <ChevronDown className={cn('h-3 w-3 transition-transform', showHistory && 'rotate-180')} />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </button>
          </div>
        )}

        {/* History panel */}
        {showHistory && (
          <ExamHistory
            exams={exams}
            currentExamId={currentExam?.id ?? null}
            onSelect={handleExamSelect}
            themeColor={themeColor}
          />
        )}

        {/* ── Current exam date ────────────────────────────────── */}
        {currentExam && !isEditing && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>
              Examen del{' '}
              {new Date(currentExam.exam_date).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {currentExam.notes && (
              <span className="text-gray-300">&middot; {currentExam.notes}</span>
            )}
          </div>
        )}

        {/* ── Notes (edit mode) ────────────────────────────────── */}
        {isEditing && (
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Notas del examen</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones generales..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}

        {/* ── Summary stats ────────────────────────────────────── */}
        {activeSummary && activeSummary.totalSites > 0 && (
          <PerioSummaryBar summary={activeSummary} themeColor={themeColor} />
        )}

        {/* ── Tooth chart ──────────────────────────────────────── */}
        <ToothChart
          teeth={chartTeeth}
          selectedTooth={selectedTooth}
          onToothClick={(code) => setSelectedTooth(selectedTooth === code ? null : code)}
          isPediatric={isPediatric}
          themeColor={themeColor}
          showSurfaces={false}
        />

        {/* ── Color legend ─────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {[
            { color: '#22C55E', label: '1-3mm' },
            { color: '#EAB308', label: '4-5mm' },
            { color: '#EF4444', label: '6+mm' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-gray-500">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-500">BOP</span>
          </div>
        </div>

        {/* ── Probing data per tooth (editing or viewing selected) ── */}
        {isEditing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Datos de sondaje por pieza
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">Profundidad</span>
                <span className="text-[10px] text-gray-300">|</span>
                <span className="text-[10px] text-gray-400">Recesi\u00f3n</span>
                <span className="text-[10px] text-gray-300">|</span>
                <span className="text-[10px] text-gray-400">NIC</span>
                <span className="text-[10px] text-gray-300">|</span>
                <Droplets className="h-3 w-3 text-red-400" />
              </div>
            </div>

            {/* Upper arch */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-300 uppercase">Arcada superior</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {(isPediatric
                  ? ['55', '54', '53', '52', '51', '61', '62', '63', '64', '65']
                  : UPPER_TEETH
                ).map((code) => (
                  <ToothProbeInput
                    key={code}
                    toothCode={code}
                    data={localTeeth?.[code] ?? emptyToothData()}
                    isMolar={MOLAR_TEETH.has(code)}
                    onChange={handleToothDataChange}
                    themeColor={themeColor}
                  />
                ))}
              </div>
            </div>

            {/* Lower arch */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-300 uppercase">Arcada inferior</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {(isPediatric
                  ? ['85', '84', '83', '82', '81', '71', '72', '73', '74', '75']
                  : LOWER_TEETH
                ).map((code) => (
                  <ToothProbeInput
                    key={code}
                    toothCode={code}
                    data={localTeeth?.[code] ?? emptyToothData()}
                    isMolar={MOLAR_TEETH.has(code)}
                    onChange={handleToothDataChange}
                    themeColor={themeColor}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Selected tooth detail (view mode) ────────────────── */}
        {!isEditing && selectedTooth && selectedToothData && !selectedToothData.missing && (
          <div className="rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">
                Pieza {selectedTooth}
              </h4>
              <div className="flex items-center gap-2">
                {selectedToothData.mobility > 0 && (
                  <Badge variant="outline" className="text-[10px]">
                    Mov. {['0', 'I', 'II', 'III'][selectedToothData.mobility]}
                  </Badge>
                )}
                {selectedToothData.furcation > 0 && (
                  <Badge variant="outline" className="text-[10px]">
                    Furca {['0', 'I', 'II', 'III'][selectedToothData.furcation]}
                  </Badge>
                )}
              </div>
            </div>

            {/* Probing depths visual */}
            <div className="grid grid-cols-6 gap-1">
              {PROBING_SITES.map((site, idx) => {
                const depth = selectedToothData.probing_depth[idx] ?? 0;
                const recession = selectedToothData.recession[idx] ?? 0;
                const cal = depth + recession;
                const bleeding = selectedToothData.bleeding[idx] ?? false;

                return (
                  <div key={site} className="flex flex-col items-center">
                    <span className="text-[9px] text-gray-400 uppercase">{site}</span>
                    <div
                      className="w-6 rounded-sm flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        backgroundColor: depthColor(depth),
                        height: Math.max(16, depth * 4),
                      }}
                    >
                      {depth}
                    </div>
                    {recession > 0 && (
                      <span className="text-[9px] text-gray-400 mt-0.5">R:{recession}</span>
                    )}
                    <span className="text-[9px] text-gray-300 mt-0.5">NIC:{cal}</span>
                    {bleeding && (
                      <Droplets className="h-3 w-3 text-red-500 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </ModuleWrapper>
  );
}
