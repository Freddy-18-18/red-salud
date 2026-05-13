'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';

import { supabase } from '@/lib/supabase/client';
import { ModuleWrapper } from '../module-wrapper';
import type { ModuleComponentProps } from '../module-registry';

type Sex = 'male' | 'female' | 'unspecified';

interface ScreeningDef {
  key: string;
  label: string;
  frequency: string;
  gender?: 'male' | 'female';
  startAge?: number;
  metricNames?: string[];
  vaccineKeywords?: string[];
  notes?: string;
}

interface AgeGroupDef {
  key: 'adults_18_39' | 'adults_40_64' | 'adults_65_plus';
  label: string;
  minAge: number;
  maxAge: number;
  screenings: ScreeningDef[];
}

const AGE_GROUPS: AgeGroupDef[] = [
  {
    key: 'adults_18_39',
    label: 'Adultos 18-39 años',
    minAge: 18,
    maxAge: 39,
    screenings: [
      { key: 'bp_check', label: 'Control Tensión Arterial', frequency: 'Anual', metricNames: ['Presión Sistólica', 'Presión Diastólica'] },
      { key: 'lipid_panel', label: 'Perfil Lipídico', frequency: 'Cada 5 años', startAge: 20, metricNames: ['Colesterol Total', 'HDL', 'LDL', 'Triglicéridos'] },
      { key: 'glucose_fasting', label: 'Glucosa Ayunas', frequency: 'Cada 3 años', startAge: 35, metricNames: ['Glucosa Ayunas', 'HbA1c'] },
      { key: 'pap_smear', label: 'Papanicolaou', frequency: 'Cada 3 años', gender: 'female', startAge: 21, notes: 'Registrar en historia clínica' },
      { key: 'hpv_test', label: 'VPH', frequency: 'Cada 5 años', gender: 'female', startAge: 30, notes: 'Co-test con Pap' },
      { key: 'hiv_screening', label: 'VIH', frequency: 'Al menos una vez', notes: 'Solicitar en lab-orders' },
      { key: 'hepatitis_b', label: 'Hepatitis B (vacuna)', frequency: 'Esquema 3 dosis', vaccineKeywords: ['hepatitis b', 'hep b'] },
    ],
  },
  {
    key: 'adults_40_64',
    label: 'Adultos 40-64 años',
    minAge: 40,
    maxAge: 64,
    screenings: [
      { key: 'bp_check', label: 'Control Tensión Arterial', frequency: 'Anual', metricNames: ['Presión Sistólica', 'Presión Diastólica'] },
      { key: 'lipid_panel', label: 'Perfil Lipídico', frequency: 'Cada 2 años', metricNames: ['Colesterol Total', 'HDL', 'LDL', 'Triglicéridos'] },
      { key: 'glucose_hba1c', label: 'Glucosa Ayunas / HbA1c', frequency: 'Cada 3 años', metricNames: ['Glucosa Ayunas', 'HbA1c'] },
      { key: 'colonoscopy', label: 'Colonoscopía', frequency: 'Cada 10 años', startAge: 45, notes: 'Derivar a gastro' },
      { key: 'mammography', label: 'Mamografía', frequency: 'Cada 2 años', gender: 'female', startAge: 40, notes: 'Solicitar imagen' },
      { key: 'psa', label: 'PSA (discutir)', frequency: 'Anual', gender: 'male', startAge: 50, notes: 'Compartir decisión' },
      { key: 'dexa', label: 'Densitometría Ósea', frequency: 'Según riesgo', gender: 'female', notes: 'Si factores de riesgo' },
    ],
  },
  {
    key: 'adults_65_plus',
    label: 'Adultos ≥65 años',
    minAge: 65,
    maxAge: 200,
    screenings: [
      { key: 'bp_check', label: 'Control Tensión Arterial', frequency: 'Cada consulta', metricNames: ['Presión Sistólica', 'Presión Diastólica'] },
      { key: 'glucose_hba1c', label: 'HbA1c', frequency: 'Semestral', metricNames: ['HbA1c'] },
      { key: 'renal_function', label: 'Función Renal', frequency: 'Anual', metricNames: ['Creatinina sérica', 'TFG estimada'] },
      { key: 'dexa', label: 'Densitometría Ósea', frequency: 'Cada 2 años', gender: 'female' },
      { key: 'cognitive_screening', label: 'Tamizaje Cognitivo', frequency: 'Anual', notes: 'Mini-Mental / MoCA' },
      { key: 'fall_risk', label: 'Riesgo de Caídas', frequency: 'Anual', notes: 'Timed Up & Go' },
      { key: 'vision_hearing', label: 'Visión y Audición', frequency: 'Anual', notes: 'Derivar a oftalmo/ORL' },
    ],
  },
];

interface Patient {
  id: string;
  full_name: string;
  national_id: string | null;
  date_of_birth: string | null;
}

interface MetricRow {
  metric_type_id: string;
  measured_at: string;
}

interface VaccineRow {
  vaccine_name: string;
  administered_date: string | null;
}

interface MetricTypeRow {
  id: string;
  name: string;
}

interface ScreeningStatus {
  key: string;
  completed: boolean;
  lastDate: string | null;
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function pickGroup(age: number | null): AgeGroupDef | null {
  if (age == null) return null;
  return AGE_GROUPS.find((g) => age >= g.minAge && age <= g.maxAge) ?? null;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function PreventiveScreeningModule({
  doctorId,
  patientId: presetPatientId,
  themeColor = '#0EA5E9',
}: ModuleComponentProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(presetPatientId ?? null);
  const [sex, setSex] = useState<Sex>('unspecified');
  const [metricTypes, setMetricTypes] = useState<MetricTypeRow[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [vaccines, setVaccines] = useState<VaccineRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [apptsRes, mtRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('patient_id')
          .eq('doctor_id', doctorId)
          .not('patient_id', 'is', null),
        supabase.from('health_metric_types').select('id, name'),
      ]);
      const ids = Array.from(
        new Set(
          ((apptsRes.data ?? []) as { patient_id: string | null }[])
            .map((a) => a.patient_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      let profs: Patient[] = [];
      if (ids.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, national_id, date_of_birth')
          .in('id', ids);
        profs = (data ?? []) as Patient[];
      }
      if (!cancelled) {
        setPatients(profs);
        setMetricTypes((mtRes.data ?? []) as MetricTypeRow[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doctorId]);

  const loadPatientData = useCallback(async (patientId: string) => {
    const [metricsRes, vacRes] = await Promise.all([
      supabase
        .from('health_metrics')
        .select('metric_type_id, measured_at')
        .eq('patient_id', patientId)
        .order('measured_at', { ascending: false })
        .limit(500),
      supabase
        .from('vaccination_records')
        .select('vaccine_name, administered_date')
        .eq('patient_id', patientId),
    ]);
    setMetrics(((metricsRes.data ?? []) as unknown) as MetricRow[]);
    setVaccines(((vacRes.data ?? []) as unknown) as VaccineRow[]);
  }, []);

  useEffect(() => {
    if (selectedId) void loadPatientData(selectedId);
    else { setMetrics([]); setVaccines([]); }
  }, [selectedId, loadPatientData]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedId) ?? null,
    [patients, selectedId],
  );

  const patientAge = useMemo(
    () => (selectedPatient ? calculateAge(selectedPatient.date_of_birth) : null),
    [selectedPatient],
  );

  const ageGroup = useMemo(() => pickGroup(patientAge), [patientAge]);

  const metricTypeByName = useMemo(
    () => new Map(metricTypes.map((mt) => [mt.name.toLowerCase(), mt.id])),
    [metricTypes],
  );

  const lastMeasuredByTypeId = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of metrics) {
      if (!map.has(m.metric_type_id)) map.set(m.metric_type_id, m.measured_at);
    }
    return map;
  }, [metrics]);

  const screeningStatus = useCallback(
    (s: ScreeningDef): ScreeningStatus => {
      let lastDate: string | null = null;
      if (s.metricNames) {
        for (const name of s.metricNames) {
          const typeId = metricTypeByName.get(name.toLowerCase());
          if (typeId) {
            const d = lastMeasuredByTypeId.get(typeId);
            if (d && (!lastDate || d > lastDate)) lastDate = d;
          }
        }
      }
      if (s.vaccineKeywords) {
        for (const v of vaccines) {
          const lower = v.vaccine_name.toLowerCase();
          if (s.vaccineKeywords.some((k) => lower.includes(k))) {
            if (v.administered_date && (!lastDate || v.administered_date > lastDate)) {
              lastDate = v.administered_date;
            }
          }
        }
      }
      return { key: s.key, completed: lastDate != null, lastDate };
    },
    [metricTypeByName, lastMeasuredByTypeId, vaccines],
  );

  const visibleScreenings = useMemo(() => {
    if (!ageGroup) return [];
    return ageGroup.screenings.filter((s) => {
      if (s.gender && sex !== 'unspecified' && s.gender !== sex) return false;
      if (s.startAge && patientAge != null && patientAge < s.startAge) return false;
      return true;
    });
  }, [ageGroup, sex, patientAge]);

  const summary = useMemo(() => {
    const statuses = visibleScreenings.map((s) => screeningStatus(s));
    const total = statuses.length;
    const completed = statuses.filter((s) => s.completed).length;
    return { total, completed, pending: total - completed };
  }, [visibleScreenings, screeningStatus]);

  return (
    <ModuleWrapper
      moduleKey="preventive-screening"
      title="Tamizaje Preventivo"
      icon="ShieldCheck"
      description="Guía USPSTF + cumplimiento auto-detectado por edad y género"
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
                const age = calculateAge(p.date_of_birth);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      aria-current={isActive ? 'true' : 'false'}
                      className={cn(
                        'w-full text-left rounded-lg border px-3 py-2',
                        isActive ? 'border-sky-300 bg-sky-50' : 'border-gray-200 hover:bg-gray-50',
                      )}
                    >
                      <p className="text-sm font-medium text-gray-800">{p.full_name}</p>
                      <p className="text-[11px] text-gray-400">
                        {age != null ? `${age} años` : 'Edad desconocida'}
                        {p.national_id ? ` · CI ${p.national_id}` : ''}
                      </p>
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
              <ShieldCheck className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Seleccioná un paciente para ver su guía preventiva</p>
            </div>
          ) : !ageGroup ? (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800 font-medium">Edad no disponible</p>
              <p className="text-xs text-amber-700 mt-1">
                Registrá la fecha de nacimiento en el perfil del paciente para mostrar el esquema correcto.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">{selectedPatient.full_name}</h2>
                  <p className="text-xs text-gray-500">
                    {patientAge} años · {ageGroup.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Género:</span>
                  {(['unspecified', 'male', 'female'] as Sex[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSex(opt)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-medium border',
                        sex === opt
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      {opt === 'male' ? 'Masc' : opt === 'female' ? 'Fem' : 'Sin filtro'}
                    </button>
                  ))}
                </div>
              </header>

              <div className="grid grid-cols-3 gap-2">
                <SummaryStat label="Total" value={summary.total} icon={Activity} tone="neutral" />
                <SummaryStat label="Completos" value={summary.completed} icon={CheckCircle2} tone="success" />
                <SummaryStat label="Pendientes" value={summary.pending} icon={Clock} tone="warning" />
              </div>

              <ul className="space-y-2">
                {visibleScreenings.map((s) => {
                  const status = screeningStatus(s);
                  return (
                    <li
                      key={s.key}
                      className={cn(
                        'p-3 rounded-lg border flex items-start gap-3',
                        status.completed
                          ? 'border-green-200 bg-green-50/40'
                          : 'border-gray-200 bg-white',
                      )}
                    >
                      <div className="shrink-0 mt-0.5">
                        {status.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <p className="text-sm font-medium text-gray-800">{s.label}</p>
                          <span className="text-[11px] text-gray-500">{s.frequency}</span>
                          {s.gender && (
                            <span className="text-[11px] text-gray-400">
                              {s.gender === 'female' ? 'Solo ♀' : 'Solo ♂'}
                            </span>
                          )}
                          {s.startAge && (
                            <span className="text-[11px] text-gray-400">desde {s.startAge} años</span>
                          )}
                        </div>
                        {status.completed && status.lastDate && (
                          <p className="text-xs text-green-700 mt-0.5">
                            Última evidencia: {formatDate(status.lastDate)}
                          </p>
                        )}
                        {!status.completed && (
                          <p className="text-xs text-amber-700 mt-0.5">
                            {s.notes ?? 'Sin registro reciente — solicitar o documentar'}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <footer className="pt-2 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Detección automática basada en <strong>health_metrics</strong> (labs/signos) y{' '}
                  <strong>vaccination_records</strong>. Procedimientos como Papanicolaou, mamografía o
                  colonoscopía se documentan en su módulo correspondiente o en notas SOAP.
                </p>
              </footer>
            </div>
          )}
        </div>
      </div>
    </ModuleWrapper>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Activity;
  tone: 'neutral' | 'success' | 'warning';
}) {
  const toneCls =
    tone === 'success'
      ? 'border-green-200 bg-green-50 text-green-700'
      : tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-gray-200 bg-gray-50 text-gray-700';
  return (
    <div className={cn('p-2.5 rounded-lg border flex items-center gap-2', toneCls)}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-[10px] uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
