'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Save,
  X,
  Trash2,
  ChevronRight,
  AlertCircle,
  Baby,
  User,
} from 'lucide-react';
import { Button, Badge, Label, Input } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import ToothChart from './tooth-chart';
import type { ToothChartTooth } from './tooth-chart';
import {
  useOdontogram,
  ADULT_TEETH,
  PEDIATRIC_TEETH,
  TOOTH_SURFACES,
  SURFACE_LABELS,
  FINDING_TYPES,
  SURFACE_CONDITION_COLORS,
  TOOTH_STATUS_LABELS,
  type ToothSurface,
  type SurfaceCondition,
  type FindingSeverity,
  type OdontogramTooth,
  type ClinicalFinding,
  type CreateClinicalFinding,
} from './use-odontogram';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Color legend */
function OdontogramLegend() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {Object.entries(SURFACE_CONDITION_COLORS).map(([condition, color]) => {
        const labels: Record<string, string> = {
          healthy: 'Sano',
          caries: 'Caries',
          restoration: 'Restauraci\u00f3n',
          fracture: 'Fractura',
          sealant: 'Sellante',
        };
        return (
          <div key={condition} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm border border-gray-200"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-gray-500">{labels[condition] ?? condition}</span>
          </div>
        );
      })}
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 flex items-center justify-center text-[8px] font-bold text-gray-500">X</span>
        <span className="text-[10px] text-gray-500">Ausente</span>
      </div>
    </div>
  );
}

/** Finding form for creating a new clinical finding */
function NewFindingForm({
  toothCode,
  patientId,
  onSubmit,
  onCancel,
  isSubmitting,
  themeColor,
}: {
  toothCode: string;
  patientId: string;
  onSubmit: (data: CreateClinicalFinding) => Promise<ClinicalFinding | null>;
  onCancel: () => void;
  isSubmitting: boolean;
  themeColor: string;
}) {
  const [findingType, setFindingType] = useState('');
  const [severity, setSeverity] = useState<FindingSeverity>('medium');
  const [surfaceCode, setSurfaceCode] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!findingType) {
        setFormError('Seleccione un tipo de hallazgo');
        return;
      }

      const result = await onSubmit({
        patient_id: patientId,
        finding_type: findingType,
        severity,
        tooth_code: toothCode,
        surface_code: surfaceCode || null,
        notes: notes || null,
      });

      if (result) {
        onCancel();
      }
    },
    [findingType, severity, surfaceCode, notes, toothCode, patientId, onSubmit, onCancel],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="font-mono text-sm font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
        >
          Pieza {toothCode}
        </span>
        <span className="text-xs text-gray-400">Nuevo hallazgo</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Finding type */}
        <div className="space-y-1">
          <Label className="text-xs">Tipo de hallazgo *</Label>
          <select
            value={findingType}
            onChange={(e) => { setFindingType(e.target.value); setFormError(''); }}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Seleccionar...</option>
            {FINDING_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>{ft.label}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div className="space-y-1">
          <Label className="text-xs">Severidad</Label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as FindingSeverity)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Cr\u00edtica</option>
          </select>
        </div>

        {/* Surface */}
        <div className="space-y-1">
          <Label className="text-xs">Superficie (opcional)</Label>
          <select
            value={surfaceCode}
            onChange={(e) => setSurfaceCode(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Ninguna</option>
            {TOOTH_SURFACES.map((s) => (
              <option key={s} value={s}>{SURFACE_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label className="text-xs">Notas</Label>
          <Input
            type="text"
            placeholder="Observaciones..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      {formError && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {formError}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-3.5 w-3.5 mr-1" />
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting} style={{ backgroundColor: themeColor }}>
          {isSubmitting ? (
            <span className="flex items-center gap-1">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Guardando...
            </span>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 mr-1" />
              Guardar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/** Tooth detail panel showing existing findings and status */
function ToothDetailPanel({
  tooth,
  onAddFinding: onAdd,
  onRemoveFinding: onRemove,
  themeColor,
}: {
  tooth: OdontogramTooth;
  onAddFinding: () => void;
  onRemoveFinding: (id: string) => void;
  themeColor: string;
}) {
  const severityColors: Record<string, string> = {
    low: '#22C55E',
    medium: '#EAB308',
    high: '#F97316',
    critical: '#EF4444',
  };

  const severityLabels: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Cr\u00edtica',
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-sm font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
          >
            {tooth.code}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {TOOTH_STATUS_LABELS[tooth.status]}
          </Badge>
          {tooth.material !== 'none' && (
            <Badge variant="secondary" className="text-[10px]">
              {tooth.material}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Hallazgo
        </Button>
      </div>

      {/* Surfaces summary */}
      <div className="flex items-center gap-2">
        {TOOTH_SURFACES.map((s) => {
          const condition = tooth.surfaces[s];
          const color = SURFACE_CONDITION_COLORS[condition] ?? SURFACE_CONDITION_COLORS.healthy;
          return (
            <div key={s} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-gray-400">{s}</span>
              <span
                className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-[8px] text-white font-bold"
                style={{ backgroundColor: color }}
              >
                {condition !== 'healthy' ? condition[0].toUpperCase() : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Findings list */}
      {tooth.findings.length > 0 ? (
        <div className="space-y-1.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            Hallazgos ({tooth.findings.length})
          </span>
          {tooth.findings.map((finding) => {
            const typeInfo = FINDING_TYPES.find((ft) => ft.value === finding.finding_type);
            return (
              <div
                key={finding.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: typeInfo?.color ?? '#6B7280' }}
                  />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {typeInfo?.label ?? finding.finding_type}
                  </span>
                  {finding.surface_code && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {finding.surface_code}
                    </Badge>
                  )}
                  <span
                    className="text-[10px] font-medium shrink-0"
                    style={{ color: severityColors[finding.severity] ?? '#6B7280' }}
                  >
                    {severityLabels[finding.severity] ?? finding.severity}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-gray-400">
                    {new Date(finding.observed_at).toLocaleDateString('es-VE', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(finding.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Eliminar hallazgo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-400 py-2">Sin hallazgos registrados</p>
      )}

      {/* Notes */}
      {tooth.notes && (
        <p className="text-xs text-gray-500 italic">{tooth.notes}</p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN MODULE
// ============================================================================

export default function OdontogramModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#0EA5E9',
}: ModuleComponentProps) {
  // State
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [showNewFinding, setShowNewFinding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data hook
  const {
    findings,
    teeth,
    loading,
    error,
    isPediatric,
    setIsPediatric,
    createFinding,
    removeFinding,
    refresh,
  } = useOdontogram(doctorId, { patientId });

  const toothCodes = isPediatric ? PEDIATRIC_TEETH : ADULT_TEETH;

  // ── Build chart teeth ───────────────────────────────────────────────────

  const chartTeeth = useMemo<ToothChartTooth[]>(() => {
    return toothCodes.map((code) => {
      const tooth = teeth[code];
      if (!tooth) return { code };

      const hasCaries = Object.values(tooth.surfaces).some((c) => c === 'caries');
      const hasRestoration = Object.values(tooth.surfaces).some((c) => c === 'restoration');
      const findingsCount = tooth.findings.length;

      return {
        code,
        isMissing: tooth.status === 'missing',
        surfaces: tooth.surfaces,
        condition: tooth.status === 'missing'
          ? 'missing' as const
          : hasCaries
            ? 'caries' as const
            : hasRestoration
              ? 'restoration' as const
              : 'healthy' as const,
        highlight: findingsCount > 0 ? (hasCaries ? '#EF4444' : themeColor) : undefined,
        sublabel: findingsCount > 0 ? `${findingsCount}` : undefined,
      };
    });
  }, [toothCodes, teeth, themeColor]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleToothClick = useCallback((code: string) => {
    setSelectedTooth((prev) => (prev === code ? null : code));
    setShowNewFinding(false);
  }, []);

  const handleCreateFinding = useCallback(
    async (data: CreateClinicalFinding) => {
      setIsSubmitting(true);
      const result = await createFinding(data);
      setIsSubmitting(false);
      return result;
    },
    [createFinding],
  );

  const handleRemoveFinding = useCallback(
    async (id: string) => {
      await removeFinding(id);
    },
    [removeFinding],
  );

  // ── Selected tooth data ─────────────────────────────────────────────────

  const selectedToothData = selectedTooth ? teeth[selectedTooth] : null;

  // ── Finding counts for summary ──────────────────────────────────────────

  const findingSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of findings) {
      counts[f.finding_type] = (counts[f.finding_type] ?? 0) + 1;
    }
    return counts;
  }, [findings]);

  // Module actions
  const moduleActions = patientId
    ? [
        {
          label: showNewFinding ? 'Cancelar' : 'Nuevo hallazgo',
          onClick: () => setShowNewFinding(!showNewFinding),
          icon: showNewFinding ? X : Plus,
          variant: showNewFinding ? ('ghost' as const) : ('default' as const),
        },
      ]
    : [];

  return (
    <ModuleWrapper
      moduleKey="dental-odontogram"
      title="Odontograma"
      icon="Scan"
      description="Carta dental interactiva"
      themeColor={themeColor}
      isEmpty={!loading && findings.length === 0 && !patientId}
      emptyMessage="Seleccione un paciente para ver el odontograma."
      isLoading={loading}
      actions={moduleActions}
    >
      <div className="space-y-4">
        {/* ── Dentition toggle ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPediatric(false)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                !isPediatric ? 'text-white' : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
              )}
              style={!isPediatric ? { backgroundColor: themeColor } : undefined}
            >
              <User className="h-3.5 w-3.5" />
              Adulto (32)
            </button>
            <button
              type="button"
              onClick={() => setIsPediatric(true)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                isPediatric ? 'text-white' : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
              )}
              style={isPediatric ? { backgroundColor: themeColor } : undefined}
            >
              <Baby className="h-3.5 w-3.5" />
              Pedi\u00e1trico (20)
            </button>
          </div>

          {/* Finding counts */}
          {findings.length > 0 && (
            <span className="text-xs text-gray-400">
              {findings.length} hallazgo{findings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Finding summary chips ────────────────────────────── */}
        {Object.keys(findingSummary).length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(findingSummary).map(([type, count]) => {
              const typeInfo = FINDING_TYPES.find((ft) => ft.value === type);
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: typeInfo?.color ?? '#6B7280' }}
                >
                  {typeInfo?.label ?? type}: {count}
                </span>
              );
            })}
          </div>
        )}

        {/* ── Tooth chart ──────────────────────────────────────── */}
        <ToothChart
          teeth={chartTeeth}
          selectedTooth={selectedTooth}
          onToothClick={handleToothClick}
          isPediatric={isPediatric}
          themeColor={themeColor}
          showSurfaces
        />

        {/* ── Legend ────────────────────────────────────────────── */}
        <OdontogramLegend />

        {/* ── New finding form (global, if no tooth selected) ──── */}
        {showNewFinding && selectedTooth && patientId && (
          <NewFindingForm
            toothCode={selectedTooth}
            patientId={patientId}
            onSubmit={handleCreateFinding}
            onCancel={() => setShowNewFinding(false)}
            isSubmitting={isSubmitting}
            themeColor={themeColor}
          />
        )}

        {showNewFinding && !selectedTooth && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-sm text-blue-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Seleccione una pieza dental en el gr\u00e1fico para registrar un hallazgo.
          </div>
        )}

        {/* ── Selected tooth detail ────────────────────────────── */}
        {selectedToothData && !showNewFinding && (
          <ToothDetailPanel
            tooth={selectedToothData}
            onAddFinding={() => setShowNewFinding(true)}
            onRemoveFinding={handleRemoveFinding}
            themeColor={themeColor}
          />
        )}

        {/* ── Recent findings timeline ─────────────────────────── */}
        {!selectedTooth && findings.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider px-1">
              \u00daltimos hallazgos
            </span>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {findings.slice(0, 15).map((finding) => {
                const typeInfo = FINDING_TYPES.find((ft) => ft.value === finding.finding_type);
                return (
                  <button
                    key={finding.id}
                    type="button"
                    onClick={() => {
                      if (finding.tooth_code) {
                        setSelectedTooth(finding.tooth_code);
                      }
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: typeInfo?.color ?? '#6B7280' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-700">
                          {typeInfo?.label ?? finding.finding_type}
                        </span>
                        {finding.tooth_code && (
                          <span className="text-[10px] font-mono text-gray-400">
                            #{finding.tooth_code}
                          </span>
                        )}
                        {finding.surface_code && (
                          <span className="text-[10px] text-gray-400">
                            ({finding.surface_code})
                          </span>
                        )}
                      </div>
                      {finding.notes && (
                        <p className="text-[10px] text-gray-400 truncate">{finding.notes}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(finding.observed_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <ChevronRight className="h-3 w-3 text-gray-300 shrink-0" />
                  </button>
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
