'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { Button, Input } from '@red-salud/design-system';

import { supabase } from '@/lib/supabase/client';
import { ModuleWrapper } from '../module-wrapper';
import type { ModuleComponentProps } from '../module-registry';

const RELACIONES: Array<{ value: string; label: string }> = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'hermano', label: 'Hermano' },
  { value: 'hermana', label: 'Hermana' },
  { value: 'abuelo_paterno', label: 'Abuelo paterno' },
  { value: 'abuela_paterna', label: 'Abuela paterna' },
  { value: 'abuelo_materno', label: 'Abuelo materno' },
  { value: 'abuela_materna', label: 'Abuela materna' },
  { value: 'tio', label: 'Tío' },
  { value: 'tia', label: 'Tía' },
  { value: 'primo', label: 'Primo' },
  { value: 'prima', label: 'Prima' },
  { value: 'hijo', label: 'Hijo' },
  { value: 'hija', label: 'Hija' },
  { value: 'otro', label: 'Otro' },
];

const RELACION_LABEL: Record<string, string> = Object.fromEntries(
  RELACIONES.map((r) => [r.value, r.label]),
);

interface Patient {
  id: string;
  full_name: string;
  national_id: string | null;
}

interface FamilyEntry {
  id: string;
  patient_id: string;
  relacion: string;
  condicion: string;
  edad_diagnostico: number | null;
  vivo: boolean | null;
  notas: string | null;
}

export default function FamilyHistoryModule({
  doctorId,
  patientId: presetPatientId,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(presetPatientId ?? null);
  const [entries, setEntries] = useState<FamilyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Load doctor's patient roster
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

  const loadEntries = useCallback(async (patientId: string) => {
    const { data } = await supabase
      .from('patient_family_history')
      .select('id, patient_id, relacion, condicion, edad_diagnostico, vivo, notas')
      .eq('patient_id', patientId)
      .order('relacion');
    setEntries(((data ?? []) as unknown) as FamilyEntry[]);
  }, []);

  useEffect(() => {
    if (selectedId) void loadEntries(selectedId);
    else setEntries([]);
  }, [selectedId, loadEntries]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedId) ?? null,
    [patients, selectedId],
  );

  return (
    <ModuleWrapper
      moduleKey="family-history"
      title="Historia Familiar"
      icon="Users"
      description="Antecedentes hereditarios y factores de riesgo familiares"
      themeColor={themeColor}
      isLoading={loading}
    >
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
        {/* Patient list */}
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
                      className={`w-full text-left rounded-lg border px-3 py-2 ${
                        isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
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

        {/* Entries panel */}
        <div>
          {!selectedPatient ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Seleccioná un paciente para ver sus antecedentes</p>
            </div>
          ) : (
            <div className="space-y-3">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">{selectedPatient.full_name}</h2>
                  <p className="text-xs text-gray-500">{entries.length} antecedente{entries.length !== 1 ? 's' : ''}</p>
                </div>
                {!showForm && (
                  <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
                  </Button>
                )}
              </header>

              {showForm && (
                <FamilyHistoryForm
                  patientId={selectedPatient.id}
                  doctorId={doctorId}
                  onSaved={async () => {
                    await loadEntries(selectedPatient.id);
                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              )}

              {entries.length === 0 && !showForm ? (
                <p className="text-sm text-gray-400 py-8 text-center">Sin antecedentes registrados</p>
              ) : (
                <ul className="space-y-2">
                  {entries.map((e) => (
                    <li key={e.id} className="flex items-start justify-between gap-2 p-3 rounded-lg border border-gray-200">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {RELACION_LABEL[e.relacion] ?? e.relacion} — {e.condicion}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {e.edad_diagnostico != null && `Dx a los ${e.edad_diagnostico} años · `}
                          {e.vivo === false ? 'Fallecido' : e.vivo === true ? 'Vivo' : 'Estado desconocido'}
                        </p>
                        {e.notas && <p className="text-xs text-gray-400 mt-1">{e.notas}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await supabase.from('patient_family_history').delete().eq('id', e.id);
                          await loadEntries(selectedPatient.id);
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
            </div>
          )}
        </div>
      </div>
    </ModuleWrapper>
  );
}

function FamilyHistoryForm({
  patientId,
  doctorId,
  onSaved,
  onCancel,
}: {
  patientId: string;
  doctorId: string;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [relacion, setRelacion] = useState('madre');
  const [condicion, setCondicion] = useState('');
  const [edad, setEdad] = useState('');
  const [vivo, setVivo] = useState<'true' | 'false' | ''>('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condicion.trim()) return;
    setSaving(true);
    await supabase.from('patient_family_history').insert({
      patient_id: patientId,
      created_by: doctorId,
      relacion,
      condicion: condicion.trim(),
      edad_diagnostico: edad ? parseInt(edad, 10) : null,
      vivo: vivo === '' ? null : vivo === 'true',
      notas: notas.trim() || null,
    });
    setSaving(false);
    await onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Relación</label>
          <select value={relacion} onChange={(e) => setRelacion(e.target.value)} className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm">
            {RELACIONES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Condición</label>
          <Input value={condicion} onChange={(e) => setCondicion(e.target.value)} placeholder="HTA, IAM, cáncer mama..." required className="h-9" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Edad al diagnóstico</label>
          <Input type="number" value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="55" className="h-9" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Estado</label>
          <select value={vivo} onChange={(e) => setVivo(e.target.value as 'true' | 'false' | '')} className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm">
            <option value="">No especificado</option>
            <option value="true">Vivo</option>
            <option value="false">Fallecido</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Notas</label>
        <Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Tratamiento, complicaciones..." className="h-9" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button type="submit" size="sm" disabled={saving || !condicion.trim()}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
