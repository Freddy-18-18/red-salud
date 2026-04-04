'use client';

import { useState, useCallback, type FormEvent } from 'react';
import {
  Save,
  X,
  AlertCircle,
  Plus,
  Tag,
} from 'lucide-react';
import {
  Button,
  Input,
  Label,
} from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { CreateClinicalTemplate, ClinicalTemplate } from './use-clinical-templates';

// ============================================================================
// TYPES
// ============================================================================

interface TemplateEditorProps {
  onSubmit: (data: CreateClinicalTemplate) => void;
  onCancel: () => void;
  initialData?: Partial<ClinicalTemplate>;
  isEdit?: boolean;
  isSubmitting?: boolean;
  themeColor?: string;
}

// ============================================================================
// CATEGORY OPTIONS
// ============================================================================

const CATEGORY_OPTIONS: Array<{ value: ClinicalTemplate['category']; label: string }> = [
  { value: 'soap', label: 'Nota SOAP' },
  { value: 'progress_note', label: 'Nota de evolución' },
  { value: 'referral', label: 'Referencia' },
  { value: 'discharge', label: 'Egreso' },
  { value: 'custom', label: 'Personalizada' },
];

// ============================================================================
// DEFAULT VITAL SIGNS
// ============================================================================

const ALL_VITAL_SIGNS = [
  'Presión arterial',
  'Frecuencia cardíaca',
  'Frecuencia respiratoria',
  'Temperatura',
  'Saturación O2',
  'Peso',
  'Talla',
  'IMC',
  'Glucemia capilar',
  'Dolor (EVA)',
];

// ============================================================================
// COMPONENT
// ============================================================================

export function TemplateEditor({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
  isSubmitting = false,
  themeColor = '#3B82F6',
}: TemplateEditorProps) {
  // Form state
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState<ClinicalTemplate['category']>(
    initialData?.category ?? 'soap',
  );
  const [subjective, setSubjective] = useState(initialData?.subjective ?? '');
  const [objective, setObjective] = useState(initialData?.objective ?? '');
  const [assessment, setAssessment] = useState(initialData?.assessment ?? '');
  const [plan, setPlan] = useState(initialData?.plan ?? '');
  const [vitalSigns, setVitalSigns] = useState<string[]>(
    initialData?.vital_signs_checklist ?? [
      'Presión arterial',
      'Frecuencia cardíaca',
      'Temperatura',
      'Saturación O2',
    ],
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [newTag, setNewTag] = useState('');
  const [defaultIcdCodes, setDefaultIcdCodes] = useState<string[]>(
    initialData?.default_icd_codes ?? [],
  );
  const [newIcdCode, setNewIcdCode] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toggle vital sign
  const toggleVitalSign = useCallback((sign: string) => {
    setVitalSigns((prev) =>
      prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign],
    );
  }, []);

  // Add tag
  const addTag = useCallback(() => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setNewTag('');
    }
  }, [newTag, tags]);

  // Remove tag
  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // Add ICD code
  const addIcdCode = useCallback(() => {
    const trimmed = newIcdCode.trim().toUpperCase();
    if (trimmed && !defaultIcdCodes.includes(trimmed)) {
      setDefaultIcdCodes((prev) => [...prev, trimmed]);
      setNewIcdCode('');
    }
  }, [newIcdCode, defaultIcdCodes]);

  // Remove ICD code
  const removeIcdCode = useCallback((code: string) => {
    setDefaultIcdCodes((prev) => prev.filter((c) => c !== code));
  }, []);

  // Submit
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!title.trim()) {
        newErrors.title = 'El título es requerido';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      onSubmit({
        title,
        description: description || null,
        category,
        subjective: subjective || null,
        objective: objective || null,
        assessment: assessment || null,
        plan: plan || null,
        vital_signs_checklist: vitalSigns,
        default_icd_codes: defaultIcdCodes,
        tags,
      });
    },
    [title, description, category, subjective, objective, assessment, plan, vitalSigns, defaultIcdCodes, tags, onSubmit],
  );

  const isSoap = category === 'soap' || category === 'progress_note';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Title */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="tpl_title" className="text-sm font-medium">
            Título <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tpl_title"
            placeholder="Ej: Consulta de control - Hipertensión"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors((prev) => { const n = { ...prev }; delete n.title; return n; });
              }
            }}
            className={cn(errors.title && 'border-red-500')}
          />
          {errors.title && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="tpl_cat" className="text-sm font-medium">
            Categoría
          </Label>
          <select
            id="tpl_cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as ClinicalTemplate['category'])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="tpl_desc" className="text-sm font-medium">
            Descripción
          </Label>
          <Input
            id="tpl_desc"
            placeholder="Breve descripción de la plantilla"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* ── SOAP Sections ─────────────────────────────────────────── */}
      {isSoap && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600">Secciones SOAP</h4>

          {/* Subjective */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl_s" className="text-sm font-medium text-blue-600">
              S — Subjetivo
            </Label>
            <textarea
              id="tpl_s"
              placeholder="Plantilla para el motivo de consulta y síntomas del paciente...&#10;Puede usar {{placeholders}} para valores dinámicos"
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Objective */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl_o" className="text-sm font-medium text-emerald-600">
              O — Objetivo
            </Label>
            <textarea
              id="tpl_o"
              placeholder="Plantilla para hallazgos del examen físico...&#10;Ej: Signos vitales: {{presion_arterial}} / {{fc}} / {{temp}}"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Assessment */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl_a" className="text-sm font-medium text-amber-600">
              A — Evaluación
            </Label>
            <textarea
              id="tpl_a"
              placeholder="Plantilla para diagnóstico y análisis..."
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Plan */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl_p" className="text-sm font-medium text-purple-600">
              P — Plan
            </Label>
            <textarea
              id="tpl_p"
              placeholder="Plantilla para plan de tratamiento e indicaciones..."
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      )}

      {/* ── Vital Signs Checklist ─────────────────────────────────── */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Signos vitales a registrar
        </Label>
        <div className="flex flex-wrap gap-2">
          {ALL_VITAL_SIGNS.map((sign) => (
            <button
              key={sign}
              type="button"
              onClick={() => toggleVitalSign(sign)}
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full transition-colors border',
                vitalSigns.includes(sign)
                  ? 'text-white border-transparent'
                  : 'text-gray-500 border-gray-200 hover:bg-gray-50',
              )}
              style={
                vitalSigns.includes(sign)
                  ? { backgroundColor: themeColor }
                  : undefined
              }
            >
              {sign}
            </button>
          ))}
        </div>
      </div>

      {/* ── Default ICD Codes ─────────────────────────────────────── */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Códigos ICD-11 sugeridos
        </Label>
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="Ej: BA00, DA0Z..."
            value={newIcdCode}
            onChange={(e) => setNewIcdCode(e.target.value)}
            className="h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addIcdCode();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addIcdCode}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {defaultIcdCodes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {defaultIcdCodes.map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700"
              >
                {code}
                <button
                  type="button"
                  onClick={() => removeIcdCode(code)}
                  className="h-3.5 w-3.5 rounded-full hover:bg-blue-200 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Tags ──────────────────────────────────────────────────── */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Etiquetas
        </Label>
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="Agregar etiqueta..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            <Tag className="h-3.5 w-3.5" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="h-3.5 w-3.5 rounded-full hover:bg-gray-300 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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
              {isEdit ? 'Guardar cambios' : 'Crear plantilla'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
