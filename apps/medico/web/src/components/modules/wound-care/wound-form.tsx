'use client';

import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { Save, X, AlertCircle, Upload, ChevronDown } from 'lucide-react';
import {
  Button,
  Input,
  Label,
} from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import {
  type CreateWoundRecord,
  type CreateWoundAssessment,
  type WoundType,
  type WoundStatus,
  type ExudateAmount,
  type ExudateType,
  type SurroundingSkin,
  type EdgeType,
  type WoundMeasurement,
  type WoundBed,
  WOUND_TYPE_OPTIONS,
  WOUND_STATUS_OPTIONS,
  BODY_REGION_OPTIONS,
  calculatePushScore,
} from './use-wound-care';

// ============================================================================
// TYPES
// ============================================================================

interface WoundFormProps {
  mode: 'new-wound' | 'assessment';
  woundId?: string;
  onSubmitWound?: (data: CreateWoundRecord) => void;
  onSubmitAssessment?: (data: CreateWoundAssessment) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  themeColor?: string;
}

// ============================================================================
// SELECT HELPER
// ============================================================================

function SelectField({
  id,
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string; group?: string }>;
  placeholder?: string;
  error?: string;
}) {
  // Group options if groups exist
  const hasGroups = options.some((o) => o.group);
  const groups = hasGroups
    ? Array.from(new Set(options.map((o) => o.group ?? ''))).filter(Boolean)
    : [];

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          error && 'border-red-500 focus-visible:ring-red-500',
        )}
      >
        <option value="">{placeholder ?? 'Seleccionar...'}</option>
        {hasGroups
          ? groups.map((group) => (
              <optgroup key={group} label={group}>
                {options
                  .filter((o) => o.group === group)
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
              </optgroup>
            ))
          : options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
      </select>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SLIDER HELPER
// ============================================================================

function PercentageSlider({
  id,
  label,
  value,
  onChange,
  themeColor,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  themeColor: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-medium text-gray-600">
          {label}
        </Label>
        <span className="text-xs font-bold tabular-nums" style={{ color: themeColor }}>
          {value}%
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-current"
        style={{ accentColor: themeColor }}
      />
    </div>
  );
}

// ============================================================================
// SECTION HEADER
// ============================================================================

function SectionHeader({
  title,
  themeColor,
  collapsed,
  onToggle,
}: {
  title: string;
  themeColor: string;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 w-full group"
    >
      <div className="h-1 flex-1 rounded" style={{ backgroundColor: `${themeColor}20` }} />
      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
        {title}
      </h4>
      {onToggle && (
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            collapsed && '-rotate-90',
          )}
          style={{ color: themeColor }}
        />
      )}
      <div className="h-1 flex-1 rounded" style={{ backgroundColor: `${themeColor}20` }} />
    </button>
  );
}

// ============================================================================
// EXUDATE OPTIONS
// ============================================================================

const EXUDATE_AMOUNT_OPTIONS: Array<{ value: ExudateAmount; label: string }> = [
  { value: 'none', label: 'Ninguno' },
  { value: 'scant', label: 'Escaso' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'copious', label: 'Abundante' },
];

const EXUDATE_TYPE_OPTIONS: Array<{ value: ExudateType; label: string }> = [
  { value: 'serous', label: 'Seroso' },
  { value: 'sanguineous', label: 'Sanguinolento' },
  { value: 'serosanguineous', label: 'Serosanguinolento' },
  { value: 'purulent', label: 'Purulento' },
];

const SURROUNDING_SKIN_OPTIONS: Array<{ value: SurroundingSkin; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'erythema', label: 'Eritema' },
  { value: 'macerated', label: 'Macerada' },
  { value: 'indurated', label: 'Indurada' },
  { value: 'edema', label: 'Edema' },
  { value: 'callused', label: 'Callosa' },
];

const EDGE_TYPE_OPTIONS: Array<{ value: EdgeType; label: string }> = [
  { value: 'attached', label: 'Adheridos' },
  { value: 'unattached', label: 'No adheridos' },
  { value: 'rolled', label: 'Enrollados' },
  { value: 'undermining', label: 'Socavados' },
];

const TREATMENT_OPTIONS = [
  'Apósito hidrocoloide',
  'Apósito de espuma',
  'Apósito de alginato',
  'Gasa húmeda',
  'Gasa seca',
  'Apósito de plata',
  'Hidrogel',
  'Film transparente',
  'Desbridamiento quirúrgico',
  'Desbridamiento enzimático',
  'Desbridamiento autolítico',
  'Terapia de presión negativa (VAC)',
  'Terapia compresiva',
  'Irrigación',
  'Otro',
];

// ============================================================================
// COMPONENT
// ============================================================================

export function WoundForm({
  mode,
  woundId,
  onSubmitWound,
  onSubmitAssessment,
  onCancel,
  isSubmitting = false,
  themeColor = '#3B82F6',
}: WoundFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── New wound fields ───────────────────────────────────────
  const [woundType, setWoundType] = useState<WoundType | ''>('');
  const [locationText, setLocationText] = useState('');
  const [bodyRegion, setBodyRegion] = useState('');
  const [onsetDate, setOnsetDate] = useState('');

  // ── Assessment fields ──────────────────────────────────────
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');

  const [granulation, setGranulation] = useState(0);
  const [slough, setSlough] = useState(0);
  const [necrotic, setNecrotic] = useState(0);
  const [epithelialization, setEpithelialization] = useState(0);

  const [edgeType, setEdgeType] = useState<EdgeType>('attached');
  const [underminingPositions, setUnderminingPositions] = useState('');

  const [exudateAmount, setExudateAmount] = useState<ExudateAmount>('none');
  const [exudateType, setExudateType] = useState<ExudateType | ''>('');

  const [surroundingSkin, setSurroundingSkin] = useState<SurroundingSkin>('normal');
  const [painLevel, setPainLevel] = useState(0);
  const [treatment, setTreatment] = useState('');
  const [assessmentNotes, setAssessmentNotes] = useState('');

  // ── Section collapse state ─────────────────────────────────
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) =>
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Computed values ────────────────────────────────────────
  const area = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    return Math.round(l * w * 100) / 100;
  }, [length, width]);

  const bedTotal = granulation + slough + necrotic + epithelialization;

  const pushScore = useMemo(() => {
    if (mode === 'new-wound') return 0;
    return calculatePushScore(
      area,
      exudateAmount,
      { granulation_pct: granulation, slough_pct: slough, necrotic_pct: necrotic, epithelialization_pct: epithelialization },
    );
  }, [mode, area, exudateAmount, granulation, slough, necrotic, epithelialization]);

  // ── Clear field error ──────────────────────────────────────
  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (mode === 'new-wound') {
        if (!woundType) newErrors.wound_type = 'Seleccione tipo de herida';
        if (!locationText.trim()) newErrors.location_text = 'Indique la ubicación de la herida';
        if (!bodyRegion) newErrors.body_region = 'Seleccione la región corporal';

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }

        onSubmitWound?.({
          wound_type: woundType as WoundType,
          location_text: locationText.trim(),
          body_region: bodyRegion,
          onset_date: onsetDate || null,
        });
      } else {
        // Assessment validation
        if (!length || parseFloat(length) < 0) newErrors.length = 'Largo requerido';
        if (!width || parseFloat(width) < 0) newErrors.width = 'Ancho requerido';
        if (!treatment.trim()) newErrors.treatment = 'Indique la curación aplicada';
        if (bedTotal !== 100 && bedTotal !== 0) newErrors.wound_bed = `El lecho debe sumar 100% (actual: ${bedTotal}%)`;

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }

        const measurement: WoundMeasurement = {
          length_cm: parseFloat(length) || 0,
          width_cm: parseFloat(width) || 0,
          depth_cm: parseFloat(depth) || 0,
          area_cm2: area,
        };

        const wound_bed: WoundBed = {
          granulation_pct: granulation,
          slough_pct: slough,
          necrotic_pct: necrotic,
          epithelialization_pct: epithelialization,
        };

        onSubmitAssessment?.({
          wound_id: woundId!,
          measurement,
          wound_bed,
          edges: {
            type: edgeType,
            undermining_positions: edgeType === 'undermining' ? underminingPositions : undefined,
          },
          exudate_amount: exudateAmount,
          exudate_type: exudateAmount !== 'none' ? (exudateType as ExudateType) || null : null,
          surrounding_skin: surroundingSkin,
          pain_level: painLevel,
          photo_urls: [],
          treatment: treatment.trim(),
          push_score: pushScore,
          notes: assessmentNotes.trim() || null,
        });
      }
    },
    [
      mode, woundType, locationText, bodyRegion, onsetDate, length, width, depth,
      area, granulation, slough, necrotic, epithelialization, bedTotal, edgeType,
      underminingPositions, exudateAmount, exudateType, surroundingSkin, painLevel,
      treatment, pushScore, assessmentNotes, woundId, onSubmitWound, onSubmitAssessment,
    ],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ================================================================== */}
      {/* NEW WOUND SECTION                                                  */}
      {/* ================================================================== */}
      {mode === 'new-wound' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            id="wound_type"
            label="Tipo de Herida"
            required
            value={woundType}
            onChange={(val) => { setWoundType(val as WoundType); clearError('wound_type'); }}
            options={WOUND_TYPE_OPTIONS}
            placeholder="Seleccionar tipo..."
            error={errors.wound_type}
          />

          <SelectField
            id="body_region"
            label="Región Corporal"
            required
            value={bodyRegion}
            onChange={(val) => { setBodyRegion(val); clearError('body_region'); }}
            options={BODY_REGION_OPTIONS.map((r) => ({ value: r, label: r }))}
            placeholder="Seleccionar región..."
            error={errors.body_region}
          />

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="location_text" className="text-sm font-medium">
              Ubicación Detallada <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location_text"
              type="text"
              placeholder="Ej: cara anterior de pierna derecha, tercio inferior"
              value={locationText}
              onChange={(e) => { setLocationText(e.target.value); clearError('location_text'); }}
              className={cn(errors.location_text && 'border-red-500')}
            />
            {errors.location_text && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.location_text}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="onset_date" className="text-sm font-medium">
              Fecha de Inicio
            </Label>
            <Input
              id="onset_date"
              type="date"
              value={onsetDate}
              onChange={(e) => setOnsetDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ASSESSMENT SECTION                                                 */}
      {/* ================================================================== */}
      {mode === 'assessment' && (
        <div className="space-y-5">
          {/* ── Measurements ──────────────────────────────────────── */}
          <SectionHeader
            title="Medidas"
            themeColor={themeColor}
            collapsed={collapsedSections.measurements}
            onToggle={() => toggleSection('measurements')}
          />
          {!collapsedSections.measurements && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="length" className="text-xs font-medium">
                  Largo (cm) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={length}
                  onChange={(e) => { setLength(e.target.value); clearError('length'); }}
                  className={cn('text-center', errors.length && 'border-red-500')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-xs font-medium">
                  Ancho (cm) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={width}
                  onChange={(e) => { setWidth(e.target.value); clearError('width'); }}
                  className={cn('text-center', errors.width && 'border-red-500')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="depth" className="text-xs font-medium">
                  Profundidad (cm)
                </Label>
                <Input
                  id="depth"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="text-center"
                />
              </div>

              {/* Auto-calculated area */}
              <div className="col-span-3 flex items-center gap-2 p-2.5 rounded-lg bg-gray-50">
                <span className="text-xs text-gray-500">Area calculada:</span>
                <span className="text-sm font-bold" style={{ color: themeColor }}>
                  {area} cm&sup2;
                </span>
              </div>

              {errors.length && (
                <p className="col-span-3 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  Indique las medidas de la herida
                </p>
              )}
            </div>
          )}

          {/* ── Wound Bed ─────────────────────────────────────────── */}
          <SectionHeader
            title="Lecho de la Herida"
            themeColor={themeColor}
            collapsed={collapsedSections.bed}
            onToggle={() => toggleSection('bed')}
          />
          {!collapsedSections.bed && (
            <div className="space-y-3">
              <PercentageSlider id="granulation" label="Granulación" value={granulation} onChange={setGranulation} themeColor="#EF4444" />
              <PercentageSlider id="slough" label="Esfacelo" value={slough} onChange={setSlough} themeColor="#EAB308" />
              <PercentageSlider id="necrotic" label="Necrótico" value={necrotic} onChange={setNecrotic} themeColor="#1F2937" />
              <PercentageSlider id="epithelialization" label="Epitelización" value={epithelialization} onChange={setEpithelialization} themeColor="#EC4899" />

              <div className={cn(
                'flex items-center justify-between p-2.5 rounded-lg text-xs font-medium',
                bedTotal === 100 ? 'bg-emerald-50 text-emerald-700' : bedTotal === 0 ? 'bg-gray-50 text-gray-500' : 'bg-amber-50 text-amber-700',
              )}>
                <span>Total lecho</span>
                <span>{bedTotal}%</span>
              </div>
              {errors.wound_bed && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.wound_bed}
                </p>
              )}
            </div>
          )}

          {/* ── Edges ─────────────────────────────────────────────── */}
          <SectionHeader
            title="Bordes"
            themeColor={themeColor}
            collapsed={collapsedSections.edges}
            onToggle={() => toggleSection('edges')}
          />
          {!collapsedSections.edges && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {EDGE_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEdgeType(opt.value)}
                    className={cn(
                      'px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-center',
                      edgeType === opt.value
                        ? 'text-white border-transparent'
                        : 'text-gray-600 border-gray-200 hover:bg-gray-50',
                    )}
                    style={edgeType === opt.value ? { backgroundColor: themeColor } : undefined}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {edgeType === 'undermining' && (
                <div className="space-y-1.5">
                  <Label htmlFor="undermining_pos" className="text-xs font-medium text-gray-600">
                    Posiciones del reloj (socavación)
                  </Label>
                  <Input
                    id="undermining_pos"
                    type="text"
                    placeholder="Ej: 2-5 en punto"
                    value={underminingPositions}
                    onChange={(e) => setUnderminingPositions(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Exudate ───────────────────────────────────────────── */}
          <SectionHeader
            title="Exudado"
            themeColor={themeColor}
            collapsed={collapsedSections.exudate}
            onToggle={() => toggleSection('exudate')}
          />
          {!collapsedSections.exudate && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                id="exudate_amount"
                label="Cantidad"
                value={exudateAmount}
                onChange={(val) => setExudateAmount(val as ExudateAmount)}
                options={EXUDATE_AMOUNT_OPTIONS}
              />
              {exudateAmount !== 'none' && (
                <SelectField
                  id="exudate_type"
                  label="Tipo"
                  value={exudateType}
                  onChange={(val) => setExudateType(val as ExudateType)}
                  options={EXUDATE_TYPE_OPTIONS}
                />
              )}
            </div>
          )}

          {/* ── Surrounding Skin ──────────────────────────────────── */}
          <SectionHeader
            title="Piel Perilesional"
            themeColor={themeColor}
            collapsed={collapsedSections.skin}
            onToggle={() => toggleSection('skin')}
          />
          {!collapsedSections.skin && (
            <div className="flex flex-wrap gap-2">
              {SURROUNDING_SKIN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSurroundingSkin(opt.value)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                    surroundingSkin === opt.value
                      ? 'text-white border-transparent'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50',
                  )}
                  style={surroundingSkin === opt.value ? { backgroundColor: themeColor } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Pain Level ────────────────────────────────────────── */}
          <SectionHeader
            title="Dolor (NRS 0-10)"
            themeColor={themeColor}
            collapsed={collapsedSections.pain}
            onToggle={() => toggleSection('pain')}
          />
          {!collapsedSections.pain && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: painLevel > 6 ? '#EF4444' : painLevel > 3 ? '#EAB308' : '#22C55E' }}
                />
                <span
                  className={cn(
                    'text-lg font-bold tabular-nums w-8 text-center',
                    painLevel > 6 ? 'text-red-500' : painLevel > 3 ? 'text-amber-500' : 'text-emerald-500',
                  )}
                >
                  {painLevel}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 px-1">
                <span>Sin dolor</span>
                <span>Moderado</span>
                <span>Peor dolor</span>
              </div>
            </div>
          )}

          {/* ── Photo Upload ──────────────────────────────────────── */}
          <SectionHeader
            title="Fotografías"
            themeColor={themeColor}
            collapsed={collapsedSections.photos}
            onToggle={() => toggleSection('photos')}
          />
          {!collapsedSections.photos && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                Arrastra fotografías aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG (antes y después de curación)
              </p>
            </div>
          )}

          {/* ── Treatment ─────────────────────────────────────────── */}
          <SectionHeader
            title="Curación Aplicada"
            themeColor={themeColor}
            collapsed={collapsedSections.treatment}
            onToggle={() => toggleSection('treatment')}
          />
          {!collapsedSections.treatment && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {TREATMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setTreatment((prev) => {
                        const items = prev ? prev.split(', ').filter(Boolean) : [];
                        if (items.includes(opt)) {
                          return items.filter((i) => i !== opt).join(', ');
                        }
                        return [...items, opt].join(', ');
                      });
                      clearError('treatment');
                    }}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors',
                      treatment.includes(opt)
                        ? 'text-white border-transparent'
                        : 'text-gray-500 border-gray-200 hover:bg-gray-50',
                    )}
                    style={treatment.includes(opt) ? { backgroundColor: themeColor } : undefined}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {errors.treatment && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.treatment}
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="treatment_notes" className="text-xs font-medium text-gray-600">
                  Notas adicionales de curación
                </Label>
                <textarea
                  id="treatment_notes"
                  placeholder="Detalles del tratamiento aplicado..."
                  value={assessmentNotes}
                  onChange={(e) => setAssessmentNotes(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[50px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          )}

          {/* ── PUSH Score (auto-calculated) ──────────────────────── */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: `${themeColor}10` }}
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                PUSH Score (auto)
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Pressure Ulcer Scale for Healing (0-17)
              </p>
            </div>
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: themeColor }}
            >
              {pushScore}
            </span>
          </div>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────── */}
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
        <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: themeColor }}>
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Guardando...
            </span>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              {mode === 'new-wound' ? 'Registrar Herida' : 'Guardar Evaluación'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
