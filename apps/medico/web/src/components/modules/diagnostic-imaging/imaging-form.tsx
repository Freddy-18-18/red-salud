'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Save, X, AlertCircle, Upload } from 'lucide-react';
import {
  Button,
  Input,
  Label,
} from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { CreateImagingStudy, ImagingStatus } from './use-diagnostic-imaging';

// ============================================================================
// TYPES
// ============================================================================

interface ImagingFormProps {
  onSubmit: (data: CreateImagingStudy) => void;
  onCancel: () => void;
  initialData?: Partial<CreateImagingStudy>;
  isEdit?: boolean;
  isSubmitting?: boolean;
  /** Available study types — configurable per specialty */
  studyTypes: Array<{ value: string; label: string }>;
  /** Default body region — configurable per specialty */
  defaultBodyRegion?: string;
  themeColor?: string;
}

// ============================================================================
// STUDY TYPE PRESETS PER SPECIALTY
// ============================================================================

export const IMAGING_STUDY_TYPES: Record<string, Array<{ value: string; label: string }>> = {
  cardiologia: [
    { value: 'ecg', label: 'Electrocardiograma' },
    { value: 'echo', label: 'Ecocardiograma' },
    { value: 'stress_test', label: 'Prueba de esfuerzo' },
    { value: 'holter', label: 'Holter' },
    { value: 'angiography', label: 'Angiografía' },
  ],
  odontologia: [
    { value: 'panoramic', label: 'Panorámica' },
    { value: 'periapical', label: 'Periapical' },
    { value: 'cephalometric', label: 'Cefalométrica' },
    { value: 'cbct', label: 'Tomografía Cone Beam' },
    { value: 'bitewing', label: 'Bite-wing' },
  ],
  traumatologia: [
    { value: 'xray', label: 'Radiografía' },
    { value: 'ct', label: 'Tomografía computarizada' },
    { value: 'mri', label: 'Resonancia magnética' },
    { value: 'ultrasound', label: 'Ecografía' },
    { value: 'bone_scan', label: 'Gammagrafía ósea' },
  ],
  oftalmologia: [
    { value: 'fundoscopy', label: 'Fondo de ojo' },
    { value: 'oct', label: 'Tomografía de coherencia óptica' },
    { value: 'topography', label: 'Topografía corneal' },
    { value: 'angiography_retinal', label: 'Angiografía retinal' },
    { value: 'campimetry', label: 'Campimetría' },
  ],
  default: [
    { value: 'xray', label: 'Radiografía' },
    { value: 'ct', label: 'Tomografía computarizada' },
    { value: 'mri', label: 'Resonancia magnética' },
    { value: 'ultrasound', label: 'Ecografía' },
    { value: 'other', label: 'Otro' },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ImagingForm({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
  isSubmitting = false,
  studyTypes,
  defaultBodyRegion,
  themeColor = '#3B82F6',
}: ImagingFormProps) {
  const [formData, setFormData] = useState<CreateImagingStudy>({
    study_type: initialData?.study_type ?? '',
    body_region: initialData?.body_region ?? defaultBodyRegion ?? '',
    clinical_indication: initialData?.clinical_indication ?? '',
    findings: initialData?.findings ?? '',
    conclusion: initialData?.conclusion ?? '',
    equipment: initialData?.equipment ?? '',
    technique: initialData?.technique ?? '',
    status: initialData?.status ?? 'ordered',
    image_urls: initialData?.image_urls ?? [],
    patient_id: initialData?.patient_id,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (key: keyof CreateImagingStudy, value: unknown) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.study_type) {
        newErrors.study_type = 'Seleccione un tipo de estudio';
      }
      if (!formData.clinical_indication?.trim()) {
        newErrors.clinical_indication = 'La indicación clínica es requerida';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      onSubmit(formData);
    },
    [formData, onSubmit],
  );

  const statusOptions: Array<{ value: ImagingStatus; label: string }> = [
    { value: 'ordered', label: 'Solicitado' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'reviewed', label: 'Revisado' },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Study type */}
        <div className="space-y-1.5">
          <Label htmlFor="study_type" className="text-sm font-medium">
            Tipo de estudio <span className="text-red-500">*</span>
          </Label>
          <select
            id="study_type"
            value={formData.study_type}
            onChange={(e) => handleChange('study_type', e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              errors.study_type && 'border-red-500 focus-visible:ring-red-500',
            )}
          >
            <option value="">Seleccionar tipo...</option>
            {studyTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.study_type && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {errors.study_type}
            </p>
          )}
        </div>

        {/* Body region */}
        <div className="space-y-1.5">
          <Label htmlFor="body_region" className="text-sm font-medium">
            Región corporal
          </Label>
          <Input
            id="body_region"
            type="text"
            placeholder="Ej: Tórax, rodilla derecha..."
            value={formData.body_region ?? ''}
            onChange={(e) => handleChange('body_region', e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-sm font-medium">
            Estado
          </Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment */}
        <div className="space-y-1.5">
          <Label htmlFor="equipment" className="text-sm font-medium">
            Equipo
          </Label>
          <Input
            id="equipment"
            type="text"
            placeholder="Equipo utilizado"
            value={formData.equipment ?? ''}
            onChange={(e) => handleChange('equipment', e.target.value)}
          />
        </div>

        {/* Clinical indication */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label htmlFor="clinical_indication" className="text-sm font-medium">
            Indicación clínica <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="clinical_indication"
            placeholder="Motivo del estudio..."
            value={formData.clinical_indication ?? ''}
            onChange={(e) => handleChange('clinical_indication', e.target.value)}
            rows={3}
            className={cn(
              'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              errors.clinical_indication && 'border-red-500 focus-visible:ring-red-500',
            )}
          />
          {errors.clinical_indication && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {errors.clinical_indication}
            </p>
          )}
        </div>

        {/* Technique */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label htmlFor="technique" className="text-sm font-medium">
            Técnica
          </Label>
          <Input
            id="technique"
            type="text"
            placeholder="Técnica empleada"
            value={formData.technique ?? ''}
            onChange={(e) => handleChange('technique', e.target.value)}
          />
        </div>

        {/* Findings */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label htmlFor="findings" className="text-sm font-medium">
            Hallazgos
          </Label>
          <textarea
            id="findings"
            placeholder="Hallazgos del estudio..."
            value={formData.findings ?? ''}
            onChange={(e) => handleChange('findings', e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Conclusion */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label htmlFor="conclusion" className="text-sm font-medium">
            Conclusión
          </Label>
          <textarea
            id="conclusion"
            placeholder="Conclusión diagnóstica..."
            value={formData.conclusion ?? ''}
            onChange={(e) => handleChange('conclusion', e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* File upload placeholder */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
          <Label className="text-sm font-medium">Imágenes</Label>
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              DICOM, JPEG, PNG (máx. 50 MB por archivo)
            </p>
          </div>
          {formData.image_urls && formData.image_urls.length > 0 && (
            <p className="text-xs text-gray-500">
              {formData.image_urls.length} imagen(es) adjuntas
            </p>
          )}
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
        <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: themeColor }}>
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Guardando...
            </span>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              {isEdit ? 'Guardar cambios' : 'Crear estudio'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
