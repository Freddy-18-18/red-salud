'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button, Input } from '@red-salud/design-system';
import {
  type VaccineRoute,
  type VaccineSite,
  VACCINATION_SCHEDULE,
  VACCINE_SITE_LABELS,
  VACCINE_ROUTE_LABELS,
} from './vaccination-schedule';
import type { CreateVaccinationRecord } from './use-vaccinations';

// ============================================================================
// TYPES
// ============================================================================

interface VaccinationFormProps {
  patientId: string;
  /** Optionally pre-select a vaccine */
  preselectedVaccineId?: string;
  preselectedDose?: number;
  onSubmit: (data: CreateVaccinationRecord) => Promise<unknown>;
  onCancel: () => void;
  isSubmitting: boolean;
  themeColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function VaccinationForm({
  patientId,
  preselectedVaccineId,
  preselectedDose,
  onSubmit,
  onCancel,
  isSubmitting,
  themeColor = '#22c55e',
}: VaccinationFormProps) {
  const [vaccineId, setVaccineId] = useState(preselectedVaccineId ?? '');
  const [doseNumber, setDoseNumber] = useState<number>(preselectedDose ?? 1);
  const [dateAdministered, setDateAdministered] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [lotNumber, setLotNumber] = useState('');
  const [site, setSite] = useState<VaccineSite | ''>('');
  const [route, setRoute] = useState<VaccineRoute | ''>('');
  const [adverseReactions, setAdverseReactions] = useState('');
  const [notes, setNotes] = useState('');

  // Get selected vaccine entry
  const selectedVaccine = useMemo(
    () => VACCINATION_SCHEDULE.find((v) => v.id === vaccineId),
    [vaccineId],
  );

  // Auto-fill defaults when vaccine changes
  const handleVaccineChange = useCallback(
    (id: string) => {
      setVaccineId(id);
      const entry = VACCINATION_SCHEDULE.find((v) => v.id === id);
      if (entry) {
        setSite(entry.defaultSite);
        setRoute(entry.route);
        setDoseNumber(1);
      }
    },
    [],
  );

  // Available dose numbers for selected vaccine
  const availableDoses = useMemo(() => {
    if (!selectedVaccine) return [];
    return selectedVaccine.doses.map((d) => ({
      number: d.doseNumber,
      label: d.label,
    }));
  }, [selectedVaccine]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!vaccineId || !selectedVaccine) return;

      await onSubmit({
        patient_id: patientId,
        vaccine_id: vaccineId,
        vaccine_name: selectedVaccine.vaccine,
        dose_number: doseNumber,
        date_administered: dateAdministered,
        lot_number: lotNumber || null,
        site: site || null,
        route: route || null,
        adverse_reactions: adverseReactions || null,
        notes: notes || null,
      });
    },
    [
      vaccineId,
      selectedVaccine,
      doseNumber,
      dateAdministered,
      lotNumber,
      site,
      route,
      adverseReactions,
      notes,
      patientId,
      onSubmit,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Vaccine selection */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Vacuna *
        </label>
        <select
          value={vaccineId}
          onChange={(e) => handleVaccineChange(e.target.value)}
          required
          className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white"
        >
          <option value="">Seleccionar vacuna...</option>
          {VACCINATION_SCHEDULE.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.vaccine}
            </option>
          ))}
        </select>
      </div>

      {/* Dose number */}
      {availableDoses.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Dosis *
          </label>
          <select
            value={doseNumber}
            onChange={(e) => setDoseNumber(parseInt(e.target.value, 10))}
            required
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white"
          >
            {availableDoses.map((d) => (
              <option key={d.number} value={d.number}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Fecha de administración *
        </label>
        <Input
          type="date"
          value={dateAdministered}
          onChange={(e) => setDateAdministered(e.target.value)}
          required
          className="h-9"
        />
      </div>

      {/* Lot number */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Número de lote
        </label>
        <Input
          type="text"
          placeholder="Ej: AB1234"
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Site & Route row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Sitio de administración
          </label>
          <select
            value={site}
            onChange={(e) => setSite(e.target.value as VaccineSite)}
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white"
          >
            <option value="">Seleccionar...</option>
            {(Object.entries(VACCINE_SITE_LABELS) as [VaccineSite, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Vía
          </label>
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value as VaccineRoute)}
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white"
          >
            <option value="">Seleccionar...</option>
            {(Object.entries(VACCINE_ROUTE_LABELS) as [VaccineRoute, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {/* Adverse reactions */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Reacciones adversas
        </label>
        <textarea
          value={adverseReactions}
          onChange={(e) => setAdverseReactions(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1"
          rows={2}
          placeholder="Describir reacciones adversas si las hubo..."
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1"
          rows={2}
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Vaccine note */}
      {selectedVaccine?.note && (
        <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-600">
            <span className="font-medium">Nota:</span> {selectedVaccine.note}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !vaccineId}
          style={{ backgroundColor: themeColor }}
        >
          {isSubmitting ? 'Guardando...' : 'Registrar vacuna'}
        </Button>
      </div>
    </form>
  );
}
