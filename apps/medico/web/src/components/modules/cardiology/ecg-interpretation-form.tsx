'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { Button, Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type {
  EcgInterpretation,
  EcgClassification,
  RhythmType,
  RhythmRegularity,
  AxisDeviation,
  EcgMorphologyFindings,
} from './use-ecg';

// ============================================================================
// TYPES
// ============================================================================

interface EcgInterpretationFormProps {
  onSubmit: (data: EcgInterpretation) => void;
  onCancel: () => void;
  initialData?: Partial<EcgInterpretation>;
  isSubmitting?: boolean;
  themeColor?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LEAD_OPTIONS = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

const CLASSIFICATION_OPTIONS: Array<{ value: EcgClassification; label: string; color: string }> = [
  { value: 'normal', label: 'Normal', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'borderline', label: 'Limítrofe', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'abnormal', label: 'Anormal', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'critical', label: 'Agudo/Crítico', color: 'bg-red-100 text-red-700 border-red-300' },
];

const EMPTY_MORPHOLOGY: EcgMorphologyFindings = {
  st_elevation: [],
  st_depression: [],
  t_wave_inversion: [],
  q_waves: [],
  bundle_branch_block: null,
  lvh: false,
  rvh: false,
  atrial_enlargement: null,
};

// ============================================================================
// LEAD CHECKBOX GROUP
// ============================================================================

function LeadCheckboxGroup({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: string[];
  onChange: (leads: string[]) => void;
}) {
  const toggle = (lead: string) => {
    if (selected.includes(lead)) {
      onChange(selected.filter((l) => l !== lead));
    } else {
      onChange([...selected, lead]);
    }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <div className="flex flex-wrap gap-1">
        {LEAD_OPTIONS.map((lead) => (
          <button
            key={lead}
            type="button"
            onClick={() => toggle(lead)}
            className={cn(
              'text-xs px-2 py-0.5 rounded border transition-colors',
              selected.includes(lead)
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100',
            )}
          >
            {lead}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EcgInterpretationForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
  themeColor = '#DC2626',
}: EcgInterpretationFormProps) {
  // Rate & rhythm
  const [heartRate, setHeartRate] = useState<string>(
    initialData?.heart_rate?.toString() ?? '',
  );
  const [rhythmType, setRhythmType] = useState<RhythmType | ''>(
    initialData?.rhythm_type ?? '',
  );
  const [rhythmRegularity, setRhythmRegularity] = useState<RhythmRegularity | ''>(
    initialData?.rhythm_regularity ?? '',
  );

  // Intervals
  const [prInterval, setPrInterval] = useState<string>(
    initialData?.pr_interval?.toString() ?? '',
  );
  const [qrsDuration, setQrsDuration] = useState<string>(
    initialData?.qrs_duration?.toString() ?? '',
  );
  const [qtInterval, setQtInterval] = useState<string>(
    initialData?.qt_interval?.toString() ?? '',
  );
  const [qtcInterval, setQtcInterval] = useState<string>(
    initialData?.qtc_interval?.toString() ?? '',
  );

  // Axis
  const [axis, setAxis] = useState<AxisDeviation | ''>(initialData?.axis ?? '');

  // Morphology
  const [morphology, setMorphology] = useState<EcgMorphologyFindings>(
    initialData?.morphology ?? { ...EMPTY_MORPHOLOGY },
  );

  // Interpretation & classification
  const [interpretationText, setInterpretationText] = useState(
    initialData?.interpretation_text ?? '',
  );
  const [classification, setClassification] = useState<EcgClassification | ''>(
    initialData?.classification ?? '',
  );
  const [comparisonNotes, setComparisonNotes] = useState(
    initialData?.comparison_notes ?? '',
  );

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMorphology = useCallback(
    <K extends keyof EcgMorphologyFindings>(key: K, value: EcgMorphologyFindings[K]) => {
      setMorphology((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!classification) {
        newErrors.classification = 'Seleccione una clasificación';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const data: EcgInterpretation = {
        heart_rate: heartRate ? parseInt(heartRate, 10) : null,
        rhythm_type: (rhythmType as RhythmType) || null,
        rhythm_regularity: (rhythmRegularity as RhythmRegularity) || null,
        pr_interval: prInterval ? parseInt(prInterval, 10) : null,
        qrs_duration: qrsDuration ? parseInt(qrsDuration, 10) : null,
        qt_interval: qtInterval ? parseInt(qtInterval, 10) : null,
        qtc_interval: qtcInterval ? parseInt(qtcInterval, 10) : null,
        axis: (axis as AxisDeviation) || null,
        morphology,
        interpretation_text: interpretationText,
        classification: classification as EcgClassification,
        comparison_notes: comparisonNotes,
      };

      onSubmit(data);
    },
    [
      heartRate, rhythmType, rhythmRegularity,
      prInterval, qrsDuration, qtInterval, qtcInterval,
      axis, morphology, interpretationText, classification,
      comparisonNotes, onSubmit,
    ],
  );

  const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ── Rate & Rhythm ─────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Frecuencia y Ritmo
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="heart_rate" className="text-xs">
              Frecuencia Cardíaca (lpm)
            </Label>
            <Input
              id="heart_rate"
              type="number"
              min={0}
              max={400}
              placeholder="72"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rhythm_type" className="text-xs">
              Tipo de ritmo
            </Label>
            <select
              id="rhythm_type"
              value={rhythmType}
              onChange={(e) => setRhythmType(e.target.value as RhythmType | '')}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              <option value="sinus">Sinusal</option>
              <option value="non_sinus">No sinusal</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rhythm_regularity" className="text-xs">
              Regularidad
            </Label>
            <select
              id="rhythm_regularity"
              value={rhythmRegularity}
              onChange={(e) => setRhythmRegularity(e.target.value as RhythmRegularity | '')}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              <option value="regular">Regular</option>
              <option value="irregular">Irregular</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Intervals ─────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Intervalos
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pr_interval" className="text-xs">
              PR (ms)
            </Label>
            <Input
              id="pr_interval"
              type="number"
              min={0}
              max={500}
              placeholder="160"
              value={prInterval}
              onChange={(e) => setPrInterval(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qrs_duration" className="text-xs">
              QRS (ms)
            </Label>
            <Input
              id="qrs_duration"
              type="number"
              min={0}
              max={300}
              placeholder="90"
              value={qrsDuration}
              onChange={(e) => setQrsDuration(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qt_interval" className="text-xs">
              QT (ms)
            </Label>
            <Input
              id="qt_interval"
              type="number"
              min={0}
              max={700}
              placeholder="400"
              value={qtInterval}
              onChange={(e) => setQtInterval(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qtc_interval" className="text-xs">
              QTc (ms)
            </Label>
            <Input
              id="qtc_interval"
              type="number"
              min={0}
              max={700}
              placeholder="440"
              value={qtcInterval}
              onChange={(e) => setQtcInterval(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Axis ──────────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Eje
        </legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'normal', label: 'Normal' },
              { value: 'left', label: 'Desviación izquierda (DAI)' },
              { value: 'right', label: 'Desviación derecha (DAD)' },
              { value: 'extreme', label: 'Desviación extrema' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAxis(axis === opt.value ? '' : opt.value)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                axis === opt.value
                  ? 'text-white border-transparent'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
              )}
              style={axis === opt.value ? { backgroundColor: themeColor } : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── Morphology ────────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700">
          Hallazgos Morfológicos
        </legend>

        {/* ST / T wave / Q wave per lead */}
        <div className="space-y-3">
          <LeadCheckboxGroup
            label="Elevación del ST"
            selected={morphology.st_elevation}
            onChange={(leads) => updateMorphology('st_elevation', leads)}
          />
          <LeadCheckboxGroup
            label="Depresión del ST"
            selected={morphology.st_depression}
            onChange={(leads) => updateMorphology('st_depression', leads)}
          />
          <LeadCheckboxGroup
            label="Inversión de onda T"
            selected={morphology.t_wave_inversion}
            onChange={(leads) => updateMorphology('t_wave_inversion', leads)}
          />
          <LeadCheckboxGroup
            label="Ondas Q patológicas"
            selected={morphology.q_waves}
            onChange={(leads) => updateMorphology('q_waves', leads)}
          />
        </div>

        {/* BBB */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="bbb" className="text-xs">
              Bloqueo de rama
            </Label>
            <select
              id="bbb"
              value={morphology.bundle_branch_block ?? 'none'}
              onChange={(e) =>
                updateMorphology(
                  'bundle_branch_block',
                  e.target.value === 'none' ? null : (e.target.value as 'lbbb' | 'rbbb'),
                )
              }
              className={selectClass}
            >
              <option value="none">Ninguno</option>
              <option value="lbbb">BRIHH (izquierdo)</option>
              <option value="rbbb">BRDHH (derecho)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="atrial" className="text-xs">
              Crecimiento auricular
            </Label>
            <select
              id="atrial"
              value={morphology.atrial_enlargement ?? 'none'}
              onChange={(e) =>
                updateMorphology(
                  'atrial_enlargement',
                  e.target.value === 'none'
                    ? null
                    : (e.target.value as 'left' | 'right' | 'bilateral'),
                )
              }
              className={selectClass}
            >
              <option value="none">Ninguno</option>
              <option value="left">Aurícula izquierda</option>
              <option value="right">Aurícula derecha</option>
              <option value="bilateral">Bilateral</option>
            </select>
          </div>

          {/* Ventricular hypertrophy checkboxes */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600">Hipertrofia ventricular</p>
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={morphology.lvh}
                  onChange={(e) => updateMorphology('lvh', e.target.checked)}
                  className="rounded border-gray-300"
                />
                HVI
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={morphology.rvh}
                  onChange={(e) => updateMorphology('rvh', e.target.checked)}
                  className="rounded border-gray-300"
                />
                HVD
              </label>
            </div>
          </div>
        </div>
      </fieldset>

      {/* ── Interpretation text ───────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Interpretación
        </legend>
        <textarea
          placeholder="Interpretación del electrocardiograma..."
          value={interpretationText}
          onChange={(e) => setInterpretationText(e.target.value)}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </fieldset>

      {/* ── Classification ────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Clasificación <span className="text-red-500">*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {CLASSIFICATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setClassification(opt.value);
                setErrors((prev) => {
                  if (!('classification' in prev)) return prev;
                  const next = { ...prev };
                  delete next.classification;
                  return next;
                });
              }}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                classification === opt.value
                  ? opt.color
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.classification && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.classification}
          </p>
        )}
      </fieldset>

      {/* ── Comparison with previous ──────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Comparación con ECG previo
        </legend>
        <textarea
          placeholder="Cambios respecto al ECG anterior (si aplica)..."
          value={comparisonNotes}
          onChange={(e) => setComparisonNotes(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </fieldset>

      {/* ── Actions ───────────────────────────────────────────────── */}
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
              Guardar interpretación
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
