'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Syringe, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { Button, Input } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';

import { supabase } from '@/lib/supabase/client';
import { ModuleWrapper } from '../module-wrapper';
import type { ModuleComponentProps } from '../module-registry';

const ADULT_SCHEDULE = [
  { key: 'influenza', label: 'Influenza', frequency: 'Anual', targetGroup: 'Todos' },
  { key: 'tdap', label: 'Tdap / Td', frequency: 'Cada 10 años', targetGroup: 'Todos' },
  { key: 'pneumococcal', label: 'Neumococo (PCV13/PPSV23)', frequency: 'Según riesgo', targetGroup: '≥ 65 años' },
  { key: 'herpes_zoster', label: 'Herpes Zóster', frequency: 'Única', targetGroup: '≥ 50 años' },
  { key: 'hepatitis_b', label: 'Hepatitis B', frequency: 'Esquema 3 dosis', targetGroup: 'No vacunados' },
  { key: 'covid19', label: 'COVID-19', frequency: 'Según recomendación', targetGroup: 'Todos' },
] as const;

const VACCINE_MATCH: Record<string, string[]> = {
  influenza: ['influenza', 'gripe', 'flu'],
  tdap: ['tdap', 'td ', 'tétanos', 'tetanos', 'difteria', 'tos ferina', 'pertussis'],
  pneumococcal: ['neumococ', 'pcv13', 'ppsv23', 'pneumococ'],
  herpes_zoster: ['zóster', 'zoster', 'shingrix'],
  hepatitis_b: ['hepatitis b', 'hep b', 'hbv'],
  covid19: ['covid', 'sars-cov', 'pfizer', 'moderna', 'sinopharm', 'sinovac', 'astrazeneca'],
};

interface Patient {
  id: string;
  full_name: string;
  national_id: string | null;
}

interface VaccinationRecord {
  id: string;
  patient_id: string;
  vaccine_name: string;
  dose_number: number | null;
  administered_date: string | null;
  administered_by: string | null;
  location: string | null;
  lot_number: string | null;
  next_dose_date: string | null;
  notes: string | null;
}

function classifyVaccine(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [key, terms] of Object.entries(VACCINE_MATCH)) {
    if (terms.some((t) => lower.includes(t))) return key;
  }
  return null;
}

export default function VaccinationsModule({
  doctorId,
  patientId: presetPatientId,
  themeColor = '#22c55e',
}: ModuleComponentProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(presetPatientId ?? null);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: appts } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', doctorId)
        .not('patient_id', 'is', null);
      const ids = Array.from(
        new Set(((appts ?? []) as { patient_id: string | null }[])
          .map((a) => a.patient_id).filter((id): id is string => Boolean(id))),
      );
      if (ids.length === 0) {
        if (!cancelled) { setPatients([]); setLoading(false); }
        return;
      }
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, national_id')
        .in('id', ids);
      if (!cancelled) {
        setPatients((profiles ?? []) as Patient[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doctorId]);

  const loadRecords = useCallback(async (patientId: string) => {
    const { data } = await supabase
      .from('vaccination_records')
      .select('id, patient_id, vaccine_name, dose_number, administered_date, administered_by, location, lot_number, next_dose_date, notes')
      .eq('patient_id', patientId)
      .order('administered_date', { ascending: false });
    setRecords(((data ?? []) as unknown) as VaccinationRecord[]);
  }, []);

  useEffect(() => {
    if (selectedId) void loadRecords(selectedId);
    else setRecords([]);
  }, [selectedId, loadRecords]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedId) ?? null,
    [patients, selectedId],
  );

  const scheduleStatus = useMemo(() => {
    const applied = new Set<string>();
    for (const r of records) {
      const k = classifyVaccine(r.vaccine_name);
      if (k) applied.add(k);
    }
    return ADULT_SCHEDULE.map((s) => ({ ...s, applied: applied.has(s.key) }));
  }, [records]);

  return (
    <ModuleWrapper
      moduleKey="vaccinations"
      title="Vacunación"
      icon="Syringe"
      description="Esquema de inmunización para adultos y registro de dosis"
      themeColor={themeColor}
      isLoading={loading}
    >
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
        <div className="md:border-r md:border-gray-100 md:pr-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Pacientes ({patients.length})
          </p>
          {patients.length === 0 ? (
            <p className="text-xs text-gray-400">Sin pacientes registrados</p>
          ) : (
            <ul className="space-y-1.5">
              {patients.map((p) => {
                const isActive = p.id === selectedId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      aria-current={isActive ? 'true' : 'false'}
                      className={cn(
                        'w-full text-left rounded-lg border px-3 py-2',
                        isActive ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50',
                      )}
                    >
                      <p className="text-sm font-medium text-gray-800">{p.full_name}</p>
                      {p.national_id && (
                        <p className="text-[11px] text-gray-400">CI {p.national_id}</p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          {!selectedPatient ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Syringe className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Seleccioná un paciente para ver su esquema</p>
            </div>
          ) : (
            <div className="space-y-4">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">{selectedPatient.full_name}</h2>
                  <p className="text-xs text-gray-500">{records.length} dosis registrada{records.length !== 1 ? 's' : ''}</p>
                </div>
                {!showForm && (
                  <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Registrar dosis
                  </Button>
                )}
              </header>

              <section>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Esquema recomendado (adultos)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scheduleStatus.map((s) => (
                    <div
                      key={s.key}
                      className={cn(
                        'p-2.5 rounded-lg border flex items-start gap-2',
                        s.applied
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-gray-200 bg-white',
                      )}
                    >
                      {s.applied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">{s.label}</p>
                        <p className="text-[11px] text-gray-500">
                          {s.frequency} · {s.targetGroup}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {showForm && (
                <VaccinationForm
                  patientId={selectedPatient.id}
                  onSaved={async () => {
                    await loadRecords(selectedPatient.id);
                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              )}

              <section>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Historial
                </p>
                {records.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">Sin dosis registradas</p>
                ) : (
                  <ul className="space-y-2">
                    {records.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-start justify-between gap-2 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {r.vaccine_name}
                            {r.dose_number ? ` · Dosis ${r.dose_number}` : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {r.administered_date
                              ? new Date(r.administered_date).toLocaleDateString('es-VE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Fecha no especificada'}
                            {r.administered_by ? ` · ${r.administered_by}` : ''}
                            {r.location ? ` · ${r.location}` : ''}
                          </p>
                          {r.lot_number && (
                            <p className="text-[11px] text-gray-400 mt-0.5">Lote: {r.lot_number}</p>
                          )}
                          {r.next_dose_date && (
                            <p className="text-[11px] text-blue-600 mt-0.5">
                              Próxima dosis:{' '}
                              {new Date(r.next_dose_date).toLocaleDateString('es-VE', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                          {r.notes && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            await supabase.from('vaccination_records').delete().eq('id', r.id);
                            await loadRecords(selectedPatient.id);
                          }}
                          className="text-gray-300 hover:text-red-500"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </ModuleWrapper>
  );
}

function VaccinationForm({
  patientId,
  onSaved,
  onCancel,
}: {
  patientId: string;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [vaccineName, setVaccineName] = useState('');
  const [doseNumber, setDoseNumber] = useState('1');
  const [administeredDate, setAdministeredDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [administeredBy, setAdministeredBy] = useState('');
  const [location, setLocation] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [nextDoseDate, setNextDoseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickFill = (vaccineLabel: string) => setVaccineName(vaccineLabel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim()) return;
    setSaving(true);
    setError(null);
    const { error: insErr } = await supabase.from('vaccination_records').insert({
      patient_id: patientId,
      vaccine_name: vaccineName.trim(),
      dose_number: doseNumber ? parseInt(doseNumber, 10) : 1,
      administered_date: administeredDate ? new Date(administeredDate).toISOString() : new Date().toISOString(),
      administered_by: administeredBy.trim() || null,
      location: location.trim() || null,
      lot_number: lotNumber.trim() || null,
      next_dose_date: nextDoseDate || null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (insErr) {
      setError(insErr.message ?? 'Error al registrar la dosis');
      return;
    }
    await onSaved();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-3"
    >
      <div className="flex flex-wrap gap-1">
        {ADULT_SCHEDULE.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => quickFill(s.label)}
            className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 hover:bg-white"
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Vacuna *</label>
          <Input
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            placeholder="Influenza, Tdap, COVID-19..."
            required
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Dosis #</label>
          <Input
            type="number"
            min="1"
            value={doseNumber}
            onChange={(e) => setDoseNumber(e.target.value)}
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Fecha de aplicación</label>
          <Input
            type="datetime-local"
            value={administeredDate}
            onChange={(e) => setAdministeredDate(e.target.value)}
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Próxima dosis</label>
          <Input
            type="date"
            value={nextDoseDate}
            onChange={(e) => setNextDoseDate(e.target.value)}
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Aplicada por</label>
          <Input
            value={administeredBy}
            onChange={(e) => setAdministeredBy(e.target.value)}
            placeholder="Dr. González, vacunatorio X..."
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Sitio anatómico / Centro</label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Deltoides izq, vacunatorio..."
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Lote</label>
          <Input
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            placeholder="AB1234"
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Notas</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reacción adversa, refuerzo..."
            className="h-9"
          />
        </div>
      </div>
      {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={saving || !vaccineName.trim()}>
          {saving ? 'Guardando…' : 'Guardar dosis'}
        </Button>
      </div>
    </form>
  );
}
