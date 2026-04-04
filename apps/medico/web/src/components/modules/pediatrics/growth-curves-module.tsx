'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Calendar,
  Weight,
  Ruler,
  Activity,
} from 'lucide-react';
import { Badge, Button, Input } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useGrowthData,
  calculateAgeMonths,
  type CreateGrowthMeasurement,
  type GrowthMeasurement,
} from './use-growth-data';
import { GrowthChart, ChartTypeSelector, SexToggle } from './growth-chart';
import type { Sex, ChartType } from './growth-standards';

// ============================================================================
// COMPONENT
// ============================================================================

export default function GrowthCurvesModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#22c55e',
}: ModuleComponentProps) {
  // State
  const [showForm, setShowForm] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('weight-for-age');
  const [sex, setSex] = useState<Sex>(
    (config?.patientSex as Sex) ?? 'male',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Patient info from config
  const patientDob = config?.patientDob as string | undefined;
  const effectivePatientId = patientId ?? (config?.patientId as string | undefined);

  // Data
  const {
    measurements,
    loading,
    error,
    addMeasurement,
    deleteMeasurement,
    getPercentiles,
    alerts,
  } = useGrowthData(doctorId, {
    patientId: effectivePatientId,
    patientDob,
    patientSex: sex,
  });

  // ── Form state ──────────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight_kg: '',
    height_cm: '',
    head_circumference_cm: '',
    notes: '',
  });

  const ageMonths = useMemo(() => {
    if (!patientDob || !formData.date) return null;
    return calculateAgeMonths(patientDob, formData.date);
  }, [patientDob, formData.date]);

  const autoBmi = useMemo(() => {
    const w = parseFloat(formData.weight_kg);
    const h = parseFloat(formData.height_cm);
    if (!w || !h || h <= 0) return null;
    const hm = h / 100;
    return (w / (hm * hm)).toFixed(1);
  }, [formData.weight_kg, formData.height_cm]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!effectivePatientId || ageMonths == null) return;

      setIsSubmitting(true);
      const data: CreateGrowthMeasurement = {
        patient_id: effectivePatientId,
        date: formData.date,
        age_months: ageMonths,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        head_circumference_cm: formData.head_circumference_cm
          ? parseFloat(formData.head_circumference_cm)
          : null,
        notes: formData.notes || null,
      };

      const result = await addMeasurement(data);
      setIsSubmitting(false);

      if (result) {
        setShowForm(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          weight_kg: '',
          height_cm: '',
          head_circumference_cm: '',
          notes: '',
        });
      }
    },
    [effectivePatientId, ageMonths, formData, addMeasurement],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMeasurement(id);
    },
    [deleteMeasurement],
  );

  // ── Module actions ──────────────────────────────────────────────────────

  const moduleActions = [
    {
      label: 'Nueva medición',
      onClick: () => setShowForm(true),
      icon: Plus,
    },
  ];

  // ── New measurement form ────────────────────────────────────────────────

  if (showForm) {
    return (
      <ModuleWrapper
        moduleKey="pediatrics-growth-curves"
        title="Nueva Medición"
        icon="TrendingUp"
        themeColor={themeColor}
        actions={[
          {
            label: 'Cancelar',
            onClick: () => setShowForm(false),
            variant: 'outline',
          },
        ]}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Fecha de medición
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Edad
              </label>
              <div className="h-9 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-600">
                {ageMonths != null ? (
                  `${ageMonths} meses${ageMonths >= 12 ? ` (${Math.floor(ageMonths / 12)}a ${ageMonths % 12}m)` : ''}`
                ) : (
                  <span className="text-gray-400">Ingrese fecha de nacimiento</span>
                )}
              </div>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              <Weight className="inline h-3 w-3 mr-1" />
              Peso (kg)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="200"
              placeholder="Ej: 8.5"
              value={formData.weight_kg}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, weight_kg: e.target.value }))
              }
              className="h-9"
            />
          </div>

          {/* Height */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              <Ruler className="inline h-3 w-3 mr-1" />
              Talla/Longitud (cm)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="200"
              placeholder="Ej: 70.5"
              value={formData.height_cm}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, height_cm: e.target.value }))
              }
              className="h-9"
            />
          </div>

          {/* Head circumference */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              <Activity className="inline h-3 w-3 mr-1" />
              Perímetro cefálico (cm)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="80"
              placeholder="Ej: 45.2"
              value={formData.head_circumference_cm}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  head_circumference_cm: e.target.value,
                }))
              }
              className="h-9"
            />
          </div>

          {/* Auto BMI */}
          {autoBmi && (
            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400">IMC calculado</p>
              <p className="text-sm font-semibold text-gray-700">
                {autoBmi} kg/m²
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ focusRingColor: themeColor } as React.CSSProperties}
              rows={2}
              placeholder="Observaciones..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || ageMonths == null}
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </ModuleWrapper>
    );
  }

  // ── Main view ───────────────────────────────────────────────────────────

  return (
    <ModuleWrapper
      moduleKey="pediatrics-growth-curves"
      title="Curvas de Crecimiento"
      icon="TrendingUp"
      description="Percentiles OMS — seguimiento antropométrico"
      themeColor={themeColor}
      isEmpty={!loading && measurements.length === 0}
      emptyMessage="Sin mediciones registradas. Agregue la primera medición."
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Alerts ──────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-4">
          {alerts.map((alert) => (
            <div
              key={`${alert.type}-${alert.severity}`}
              className={cn(
                'flex items-start gap-2 p-2.5 rounded-lg text-sm',
                alert.severity === 'severe'
                  ? 'bg-red-50 text-red-700'
                  : alert.severity === 'moderate'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-yellow-50 text-yellow-700',
              )}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs">{alert.label}</p>
                <p className="text-xs opacity-80">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Chart controls ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <ChartTypeSelector
          selected={chartType}
          onChange={setChartType}
          themeColor={themeColor}
        />
        <SexToggle value={sex} onChange={setSex} />
      </div>

      {/* ── Growth chart ────────────────────────────────────────────── */}
      <div className="print:mb-8">
        <GrowthChart
          sex={sex}
          chartType={chartType}
          measurements={measurements}
          themeColor={themeColor}
        />
      </div>

      {/* ── Measurement table ───────────────────────────────────────── */}
      {measurements.length > 0 && (
        <div className="mt-4 print:mt-2">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Mediciones registradas
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 text-gray-400 font-medium">Fecha</th>
                  <th className="text-left py-2 pr-3 text-gray-400 font-medium">Edad</th>
                  <th className="text-right py-2 pr-3 text-gray-400 font-medium">Peso</th>
                  <th className="text-right py-2 pr-3 text-gray-400 font-medium">Talla</th>
                  <th className="text-right py-2 pr-3 text-gray-400 font-medium">PC</th>
                  <th className="text-right py-2 pr-3 text-gray-400 font-medium">IMC</th>
                  <th className="text-right py-2 text-gray-400 font-medium print:hidden" />
                </tr>
              </thead>
              <tbody>
                {[...measurements].reverse().map((m) => {
                  const percentiles = getPercentiles(m);
                  return (
                    <MeasurementRow
                      key={m.id}
                      measurement={m}
                      percentiles={percentiles}
                      themeColor={themeColor}
                      onDelete={() => handleDelete(m.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}

// ============================================================================
// MEASUREMENT ROW
// ============================================================================

function MeasurementRow({
  measurement,
  percentiles,
  themeColor,
  onDelete,
}: {
  measurement: GrowthMeasurement;
  percentiles: { weight?: number | null; height?: number | null; headCircumference?: number | null; bmi?: number | null };
  themeColor: string;
  onDelete: () => void;
}) {
  const ageLabel = measurement.age_months < 12
    ? `${measurement.age_months}m`
    : `${Math.floor(measurement.age_months / 12)}a ${measurement.age_months % 12}m`;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      <td className="py-2 pr-3 text-gray-600">
        {new Date(measurement.date).toLocaleDateString('es-VE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="py-2 pr-3 text-gray-500">{ageLabel}</td>
      <td className="py-2 pr-3 text-right">
        {measurement.weight_kg != null ? (
          <span className="text-gray-700">
            {measurement.weight_kg.toFixed(1)} kg
            {percentiles.weight != null && (
              <span className="ml-1 text-gray-400">(P{percentiles.weight})</span>
            )}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="py-2 pr-3 text-right">
        {measurement.height_cm != null ? (
          <span className="text-gray-700">
            {measurement.height_cm.toFixed(1)} cm
            {percentiles.height != null && (
              <span className="ml-1 text-gray-400">(P{percentiles.height})</span>
            )}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="py-2 pr-3 text-right">
        {measurement.head_circumference_cm != null ? (
          <span className="text-gray-700">
            {measurement.head_circumference_cm.toFixed(1)} cm
            {percentiles.headCircumference != null && (
              <span className="ml-1 text-gray-400">(P{percentiles.headCircumference})</span>
            )}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="py-2 pr-3 text-right">
        {measurement.bmi != null ? (
          <span className="text-gray-700">
            {measurement.bmi.toFixed(1)}
            {percentiles.bmi != null && (
              <span className="ml-1 text-gray-400">(P{percentiles.bmi})</span>
            )}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="py-2 text-right print:hidden">
        <button
          type="button"
          onClick={onDelete}
          className="h-6 w-6 inline-flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
          title="Eliminar"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
}
