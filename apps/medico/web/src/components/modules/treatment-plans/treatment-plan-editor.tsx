'use client';

import { useState, useCallback, type FormEvent } from 'react';
import {
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import {
  Button,
  Input,
  Label,
} from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { CreateTreatmentPlan } from './use-treatment-plans';

// ============================================================================
// TYPES
// ============================================================================

interface PlanItem {
  title: string;
  description: string;
  phase: number;
  estimated_cost: number | null;
  duration_days: number | null;
  tooth_numbers: string;
}

interface TreatmentPlanEditorProps {
  onSubmit: (data: CreateTreatmentPlan) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  showToothField?: boolean;
  themeColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TreatmentPlanEditor({
  onSubmit,
  onCancel,
  isSubmitting = false,
  showToothField = false,
  themeColor = '#3B82F6',
}: TreatmentPlanEditorProps) {
  // Plan-level fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('');
  const [insuranceCoverage, setInsuranceCoverage] = useState<number | null>(null);

  // Items
  const [items, setItems] = useState<PlanItem[]>([
    { title: '', description: '', phase: 1, estimated_cost: null, duration_days: null, tooth_numbers: '' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add item
  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { title: '', description: '', phase: 1, estimated_cost: null, duration_days: null, tooth_numbers: '' },
    ]);
  }, []);

  // Remove item
  const removeItem = useCallback((idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Update item field
  const updateItem = useCallback(
    (idx: number, field: keyof PlanItem, value: unknown) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === idx ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  // Calculate totals
  const estimatedTotal = items.reduce(
    (sum, item) => sum + (item.estimated_cost ?? 0),
    0,
  );
  const patientCost = estimatedTotal - (insuranceCoverage ?? 0);

  // Submit
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!title.trim()) {
        newErrors.title = 'El título del plan es requerido';
      }
      if (items.length === 0) {
        newErrors.items = 'Agregue al menos un procedimiento';
      }
      const emptyItems = items.filter((item) => !item.title.trim());
      if (emptyItems.length > 0) {
        newErrors.item_titles = 'Todos los procedimientos necesitan un título';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      onSubmit({
        title,
        description: description || null,
        diagnosis: diagnosis || null,
        diagnosis_code: diagnosisCode || null,
        estimated_cost: estimatedTotal > 0 ? estimatedTotal : null,
        insurance_coverage: insuranceCoverage,
        items: items.map((item, idx) => ({
          title: item.title,
          description: item.description || null,
          phase: item.phase,
          estimated_cost: item.estimated_cost,
          duration_days: item.duration_days,
          tooth_numbers: item.tooth_numbers || null,
          sort_order: idx,
        })),
      });
    },
    [title, description, diagnosis, diagnosisCode, insuranceCoverage, items, estimatedTotal, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ── Plan header fields ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="plan_title" className="text-sm font-medium">
            Título del plan <span className="text-red-500">*</span>
          </Label>
          <Input
            id="plan_title"
            placeholder="Ej: Plan de restauración dental completa"
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

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="plan_desc" className="text-sm font-medium">
            Descripción
          </Label>
          <textarea
            id="plan_desc"
            placeholder="Descripción general del plan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[50px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plan_diag" className="text-sm font-medium">
            Diagnóstico
          </Label>
          <Input
            id="plan_diag"
            placeholder="Diagnóstico principal..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plan_diag_code" className="text-sm font-medium">
            Código ICD-11
          </Label>
          <Input
            id="plan_diag_code"
            placeholder="Ej: DA0Z"
            value={diagnosisCode}
            onChange={(e) => setDiagnosisCode(e.target.value)}
          />
        </div>
      </div>

      {/* ── Items (procedures) ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">
            Procedimientos <span className="text-red-500">*</span>
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Agregar
          </Button>
        </div>

        {errors.items && (
          <p className="flex items-center gap-1 text-xs text-red-500 mb-2">
            <AlertCircle className="h-3 w-3" />
            {errors.items}
          </p>
        )}
        {errors.item_titles && (
          <p className="flex items-center gap-1 text-xs text-red-500 mb-2">
            <AlertCircle className="h-3 w-3" />
            {errors.item_titles}
          </p>
        )}

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50"
            >
              <div className="flex items-start pt-2">
                <GripVertical className="h-4 w-4 text-gray-300" />
              </div>

              <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-12">
                {/* Title */}
                <div className="sm:col-span-5">
                  <Input
                    placeholder="Nombre del procedimiento"
                    value={item.title}
                    onChange={(e) => updateItem(idx, 'title', e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Phase */}
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    placeholder="Fase"
                    value={item.phase}
                    min={1}
                    onChange={(e) => updateItem(idx, 'phase', parseInt(e.target.value) || 1)}
                    className="text-sm"
                  />
                </div>

                {/* Estimated cost */}
                <div className="sm:col-span-3">
                  <Input
                    type="number"
                    placeholder="Costo estimado"
                    value={item.estimated_cost ?? ''}
                    min={0}
                    step={0.01}
                    onChange={(e) =>
                      updateItem(idx, 'estimated_cost', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="text-sm"
                  />
                </div>

                {/* Duration */}
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    placeholder="Días"
                    value={item.duration_days ?? ''}
                    min={0}
                    onChange={(e) =>
                      updateItem(idx, 'duration_days', e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="text-sm"
                  />
                </div>

                {/* Tooth numbers (dental) */}
                {showToothField && (
                  <div className="sm:col-span-4">
                    <Input
                      placeholder="Dientes (ej: 11,12,21)"
                      value={item.tooth_numbers}
                      onChange={(e) => updateItem(idx, 'tooth_numbers', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Financial summary ─────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Costo estimado total
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {new Intl.NumberFormat('es-VE', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
              }).format(estimatedTotal)}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="insurance" className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Cobertura seguro
            </Label>
            <Input
              id="insurance"
              type="number"
              placeholder="0.00"
              value={insuranceCoverage ?? ''}
              min={0}
              step={0.01}
              onChange={(e) =>
                setInsuranceCoverage(e.target.value ? parseFloat(e.target.value) : null)
              }
              className="text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Costo paciente
            </p>
            <p className={cn(
              'text-lg font-bold mt-1',
              patientCost > 0 ? 'text-gray-900' : 'text-emerald-600',
            )}>
              {new Intl.NumberFormat('es-VE', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
              }).format(Math.max(0, patientCost))}
            </p>
          </div>
        </div>
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
              Creando...
            </span>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              Crear plan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
