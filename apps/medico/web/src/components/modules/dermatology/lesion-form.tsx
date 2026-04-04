'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Save, X, AlertCircle, Search, Camera, Link2 } from 'lucide-react';
import { Button, Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import {
  LESION_TYPE_LABELS,
  BODY_REGION_LABELS,
  type LesionRecord,
  type CreateLesionRecord,
  type LesionType,
  type MalignancyRisk,
  type LesionStatus,
  type AbcdeChecklist,
  type BodyRegion,
  type BodyView,
} from './use-dermatology';

// ============================================================================
// CONSTANTS
// ============================================================================

const LESION_TYPES = Object.entries(LESION_TYPE_LABELS) as [LesionType, string][];

const RISK_OPTIONS: Array<{ value: MalignancyRisk; label: string; color: string }> = [
  { value: 'low', label: 'Bajo', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'moderate', label: 'Moderado', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'high', label: 'Alto', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-gray-900 text-white border-gray-900' },
];

const STATUS_OPTIONS: Array<{ value: LesionStatus; label: string }> = [
  { value: 'active', label: 'Activa' },
  { value: 'monitoring', label: 'En seguimiento' },
  { value: 'resolved', label: 'Resuelta' },
  { value: 'biopsied', label: 'Biopsiada' },
  { value: 'excised', label: 'Extirpada' },
];

const ABCDE_CRITERIA = [
  { key: 'asymmetry', label: 'Asimetría', description: 'Forma irregular, no simétrica' },
  { key: 'border_irregular', label: 'Borde irregular', description: 'Bordes no definidos, irregulares o dentados' },
  { key: 'color_variation', label: 'Color variado', description: 'Múltiples tonos (marrón, negro, rojo, blanco, azul)' },
  { key: 'diameter_over_6mm', label: 'Diámetro >6mm', description: 'Diámetro mayor a 6 milímetros' },
  { key: 'evolution', label: 'Evolución', description: 'Cambios recientes en tamaño, forma o color' },
] as const;

const FOLLOW_UP_OPTIONS = [
  { value: 2, label: '2 semanas' },
  { value: 4, label: '1 mes' },
  { value: 8, label: '2 meses' },
  { value: 12, label: '3 meses' },
  { value: 24, label: '6 meses' },
  { value: 52, label: '1 año' },
];

// ============================================================================
// TYPES
// ============================================================================

interface LesionFormProps {
  onSubmit: (data: CreateLesionRecord) => void;
  onCancel: () => void;
  initialData?: Partial<LesionRecord>;
  /** Pre-set position from body map click */
  position?: { x: number; y: number; region: BodyRegion; view: BodyView };
  /** Available lesions for linking to previous visit */
  linkableLesions?: LesionRecord[];
  isSubmitting?: boolean;
  themeColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LesionForm({
  onSubmit,
  onCancel,
  initialData,
  position,
  linkableLesions = [],
  isSubmitting = false,
  themeColor = '#8B5CF6',
}: LesionFormProps) {
  // Core fields
  const [lesionType, setLesionType] = useState<LesionType | ''>(
    initialData?.lesion_type ?? '',
  );
  const [bodyRegion] = useState<BodyRegion>(
    initialData?.body_region ?? position?.region ?? 'chest',
  );
  const [bodyView] = useState<BodyView>(
    initialData?.body_view ?? position?.view ?? 'front',
  );
  const [posX] = useState(initialData?.position_x ?? position?.x ?? 150);
  const [posY] = useState(initialData?.position_y ?? position?.y ?? 150);
  const [status, setStatus] = useState<LesionStatus>(
    initialData?.status ?? 'active',
  );

  // ABCDE checklist
  const [abcde, setAbcde] = useState<AbcdeChecklist>(
    initialData?.abcde ?? {
      asymmetry: false,
      border_irregular: false,
      color_variation: false,
      diameter_over_6mm: false,
      evolution: false,
    },
  );

  // Physical characteristics
  const [sizeMm, setSizeMm] = useState(initialData?.size_mm?.toString() ?? '');
  const [color, setColor] = useState(initialData?.color ?? '');
  const [borderDescription, setBorderDescription] = useState(
    initialData?.border_description ?? '',
  );
  const [symmetry, setSymmetry] = useState(initialData?.symmetry ?? '');
  const [elevation, setElevation] = useState(initialData?.elevation ?? '');
  const [texture, setTexture] = useState(initialData?.texture ?? '');

  // Dermoscopy
  const [dermoscopyFindings, setDermoscopyFindings] = useState(
    initialData?.dermoscopy_findings ?? '',
  );

  // Diagnosis & treatment
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis ?? '');
  const [diagnosisIcd11, setDiagnosisIcd11] = useState(
    initialData?.diagnosis_icd11 ?? '',
  );
  const [icd11Search, setIcd11Search] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState(
    initialData?.treatment_plan ?? '',
  );
  const [biopsyRecommended, setBiopsyRecommended] = useState(
    initialData?.biopsy_recommended ?? false,
  );
  const [followUpWeeks, setFollowUpWeeks] = useState<number | null>(
    initialData?.follow_up_weeks ?? null,
  );

  // Risk assessment
  const [malignancyRisk, setMalignancyRisk] = useState<MalignancyRisk>(
    initialData?.malignancy_risk ?? 'low',
  );

  // Linking
  const [linkedLesionId, setLinkedLesionId] = useState<string | null>(
    initialData?.linked_lesion_id ?? null,
  );

  // Notes
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Computed ABCDE score (number of positive criteria)
  const abcdeScore = Object.values(abcde).filter(Boolean).length;

  // Auto-compute risk based on ABCDE score
  const handleAbcdeChange = useCallback(
    (key: keyof AbcdeChecklist, value: boolean) => {
      const updated = { ...abcde, [key]: value };
      setAbcde(updated);

      // Auto-suggest risk level based on score
      const score = Object.values(updated).filter(Boolean).length;
      if (score >= 4) {
        setMalignancyRisk('high');
      } else if (score >= 2) {
        setMalignancyRisk('moderate');
      } else {
        setMalignancyRisk('low');
      }
    },
    [abcde],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!lesionType) {
        newErrors.lesionType = 'Seleccione un tipo de lesión';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const data: CreateLesionRecord = {
        patient_id: initialData?.patient_id,
        body_region: bodyRegion,
        body_view: bodyView,
        position_x: posX,
        position_y: posY,
        lesion_type: lesionType as LesionType,
        malignancy_risk: malignancyRisk,
        status,
        abcde,
        size_mm: sizeMm ? parseFloat(sizeMm) : null,
        color: color || null,
        border_description: borderDescription || null,
        symmetry: symmetry || null,
        elevation: elevation || null,
        texture: texture || null,
        dermoscopy_findings: dermoscopyFindings || null,
        diagnosis: diagnosis || null,
        diagnosis_icd11: diagnosisIcd11 || null,
        treatment_plan: treatmentPlan || null,
        biopsy_recommended: biopsyRecommended,
        follow_up_weeks: followUpWeeks,
        linked_lesion_id: linkedLesionId,
        notes: notes || null,
      };

      onSubmit(data);
    },
    [
      lesionType, bodyRegion, bodyView, posX, posY, malignancyRisk, status,
      abcde, sizeMm, color, borderDescription, symmetry, elevation, texture,
      dermoscopyFindings, diagnosis, diagnosisIcd11, treatmentPlan,
      biopsyRecommended, followUpWeeks, linkedLesionId, notes,
      initialData?.patient_id, onSubmit,
    ],
  );

  const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ── Location info ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-200">
          <span className="text-xs font-bold text-gray-500">
            {bodyView === 'front' ? 'F' : 'P'}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-700">
            {BODY_REGION_LABELS[bodyRegion]}
          </span>
          <span className="text-gray-400 ml-2">
            ({bodyView === 'front' ? 'Vista Frontal' : 'Vista Posterior'})
          </span>
        </div>
      </div>

      {/* ── Lesion type selector ───────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Tipo de Lesión <span className="text-red-500">*</span>
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {LESION_TYPES.map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setLesionType(type);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.lesionType;
                  return next;
                });
              }}
              className={cn(
                'text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors',
                lesionType === type
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
              )}
              style={
                lesionType === type
                  ? { backgroundColor: themeColor }
                  : undefined
              }
            >
              {label}
            </button>
          ))}
        </div>
        {errors.lesionType && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.lesionType}
          </p>
        )}
      </fieldset>

      {/* ── ABCDE Melanoma Checklist ───────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Criterios ABCDE
          <span
            className={cn(
              'ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full',
              abcdeScore >= 4
                ? 'bg-red-100 text-red-700'
                : abcdeScore >= 2
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-emerald-100 text-emerald-700',
            )}
          >
            {abcdeScore}/5
          </span>
        </legend>
        <div className="space-y-2">
          {ABCDE_CRITERIA.map((criterion) => (
            <label
              key={criterion.key}
              className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={abcde[criterion.key]}
                onChange={(e) => handleAbcdeChange(criterion.key, e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  <span className="font-bold text-gray-800">
                    {criterion.key[0].toUpperCase()}
                  </span>
                  {' — '}
                  {criterion.label}
                </p>
                <p className="text-xs text-gray-400">{criterion.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Physical characteristics ───────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Características Físicas
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="size_mm" className="text-xs">
              Tamaño (mm)
            </Label>
            <Input
              id="size_mm"
              type="number"
              min={0}
              max={500}
              step={0.1}
              placeholder="5.0"
              value={sizeMm}
              onChange={(e) => setSizeMm(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="color" className="text-xs">
              Color
            </Label>
            <Input
              id="color"
              placeholder="Marrón oscuro"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="border_desc" className="text-xs">
              Borde
            </Label>
            <Input
              id="border_desc"
              placeholder="Irregular, difuso"
              value={borderDescription}
              onChange={(e) => setBorderDescription(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="symmetry" className="text-xs">
              Simetría
            </Label>
            <select
              id="symmetry"
              value={symmetry}
              onChange={(e) => setSymmetry(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              <option value="symmetric">Simétrica</option>
              <option value="asymmetric_1_axis">Asimétrica 1 eje</option>
              <option value="asymmetric_2_axes">Asimétrica 2 ejes</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="elevation" className="text-xs">
              Elevación
            </Label>
            <select
              id="elevation"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              <option value="flat">Plana</option>
              <option value="slightly_raised">Ligeramente elevada</option>
              <option value="raised">Elevada</option>
              <option value="dome">Cúpula</option>
              <option value="pedunculated">Pediculada</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="texture" className="text-xs">
              Textura
            </Label>
            <select
              id="texture"
              value={texture}
              onChange={(e) => setTexture(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              <option value="smooth">Lisa</option>
              <option value="rough">Rugosa</option>
              <option value="scaly">Escamosa</option>
              <option value="verrucous">Verrugosa</option>
              <option value="crusted">Costrosa</option>
              <option value="ulcerated">Ulcerada</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Dermoscopy findings ────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Hallazgos Dermatoscópicos
        </legend>
        <textarea
          placeholder="Red de pigmento, glóbulos, puntos, velo azul-blanquecino..."
          value={dermoscopyFindings}
          onChange={(e) => setDermoscopyFindings(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </fieldset>

      {/* ── Image upload placeholders ──────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Imágenes
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
            <Camera className="h-6 w-6 text-gray-300 mb-1.5" />
            <p className="text-xs text-gray-500 font-medium">Foto Clínica</p>
            <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG (max. 25 MB)</p>
          </div>
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
            <Camera className="h-6 w-6 text-gray-300 mb-1.5" />
            <p className="text-xs text-gray-500 font-medium">Imagen Dermatoscópica</p>
            <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG (max. 25 MB)</p>
          </div>
        </div>
      </fieldset>

      {/* ── Diagnosis ──────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Diagnóstico
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="diagnosis" className="text-xs">
              Diagnóstico clínico
            </Label>
            <Input
              id="diagnosis"
              placeholder="Nevo melanocítico compuesto"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="icd11" className="text-xs">
              Código ICD-11
            </Label>
            <div className="relative">
              <Input
                id="icd11"
                placeholder="Buscar ICD-11..."
                value={icd11Search || diagnosisIcd11}
                onChange={(e) => {
                  setIcd11Search(e.target.value);
                  setDiagnosisIcd11(e.target.value);
                }}
                className="h-9 pr-8"
              />
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </fieldset>

      {/* ── Risk assessment ────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Riesgo de Malignidad
        </legend>
        <div className="flex flex-wrap gap-2">
          {RISK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMalignancyRisk(opt.value)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                malignancyRisk === opt.value
                  ? opt.color
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── Treatment & follow-up ──────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Tratamiento y Seguimiento
        </legend>

        <div className="space-y-1.5">
          <Label htmlFor="treatment" className="text-xs">
            Plan de tratamiento
          </Label>
          <textarea
            id="treatment"
            placeholder="Observación, extirpación quirúrgica, crioterapia..."
            value={treatmentPlan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Biopsy recommended */}
          <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={biopsyRecommended}
              onChange={(e) => setBiopsyRecommended(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 font-medium">
              Biopsia Recomendada
            </span>
          </label>

          {/* Follow-up interval */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Seguimiento</Label>
            <div className="flex flex-wrap gap-1.5">
              {FOLLOW_UP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setFollowUpWeeks(followUpWeeks === opt.value ? null : opt.value)
                  }
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-lg border transition-colors',
                    followUpWeeks === opt.value
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                  )}
                  style={
                    followUpWeeks === opt.value
                      ? { backgroundColor: themeColor }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs">Estado</Label>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-lg border transition-colors',
                  status === opt.value
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                )}
                style={
                  status === opt.value
                    ? { backgroundColor: themeColor }
                    : undefined
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      {/* ── Link to previous lesion ────────────────────────────── */}
      {linkableLesions.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-700">
            <Link2 className="inline h-3.5 w-3.5 mr-1" />
            Vincular a lesión previa
          </legend>
          <select
            value={linkedLesionId ?? ''}
            onChange={(e) => setLinkedLesionId(e.target.value || null)}
            className={selectClass}
          >
            <option value="">Sin vínculo</option>
            {linkableLesions.map((l) => (
              <option key={l.id} value={l.id}>
                {LESION_TYPE_LABELS[l.lesion_type]} — {BODY_REGION_LABELS[l.body_region]} —{' '}
                {new Date(l.created_at).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      {/* ── Notes ──────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">Notas</legend>
        <textarea
          placeholder="Observaciones adicionales..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </fieldset>

      {/* ── Actions ────────────────────────────────────────────── */}
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
              {initialData?.id ? 'Actualizar Lesión' : 'Registrar Lesión'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
