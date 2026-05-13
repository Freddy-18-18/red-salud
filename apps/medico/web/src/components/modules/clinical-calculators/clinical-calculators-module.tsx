'use client';

import { useMemo, useState } from 'react';
import { Calculator, Activity, Droplets, Pill, Scale } from 'lucide-react';
import { Button, Input } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';

import { ModuleWrapper } from '../module-wrapper';
import type { ModuleComponentProps } from '../module-registry';
import {
  calculateBMI,
  calculateCockcroftGault,
  calculateEGFR,
  calculateFramingham,
} from './calculators';

type CalcKey = 'bmi' | 'egfr' | 'framingham' | 'cockcroft';

const TABS: Array<{ key: CalcKey; label: string; icon: typeof Scale }> = [
  { key: 'bmi', label: 'IMC', icon: Scale },
  { key: 'egfr', label: 'TFG (CKD-EPI)', icon: Droplets },
  { key: 'framingham', label: 'Riesgo CV (ACC/AHA)', icon: Activity },
  { key: 'cockcroft', label: 'Cockcroft-Gault', icon: Pill },
];

export default function ClinicalCalculatorsModule({
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  const [active, setActive] = useState<CalcKey>('bmi');

  return (
    <ModuleWrapper
      moduleKey="clinical-calculators"
      title="Calculadoras Clínicas"
      icon="Calculator"
      description="IMC · TFG · Riesgo CV · Clearance de creatinina"
      themeColor={themeColor}
    >
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap',
                isActive
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {active === 'bmi' && <BMICalculator />}
      {active === 'egfr' && <EGFRCalculator />}
      {active === 'framingham' && <FraminghamCalculator />}
      {active === 'cockcroft' && <CockcroftCalculator />}
    </ModuleWrapper>
  );
}

// ============================================================================
// BMI
// ============================================================================

function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const result = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    return Number.isFinite(w) && Number.isFinite(h) ? calculateBMI(w, h) : null;
  }, [weight, height]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Peso (kg)">
          <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="h-9" />
        </Field>
        <Field label="Talla (cm)">
          <Input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" className="h-9" />
        </Field>
      </div>
      {result && (
        <ResultBox>
          <div className="text-2xl font-bold text-gray-800">{result.bmi.toFixed(1)}</div>
          <div className="text-sm text-gray-500">kg/m² — {result.categoryLabel}</div>
        </ResultBox>
      )}
    </div>
  );
}

// ============================================================================
// eGFR
// ============================================================================

function EGFRCalculator() {
  const [creat, setCreat] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');

  const result = useMemo(() => {
    const c = parseFloat(creat);
    const a = parseFloat(age);
    if (!Number.isFinite(c) || !Number.isFinite(a)) return null;
    return calculateEGFR({ creatinineMgDl: c, ageYears: a, sex });
  }, [creat, age, sex]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Creatinina sérica (mg/dL)">
          <Input type="number" step="0.01" value={creat} onChange={(e) => setCreat(e.target.value)} placeholder="1.0" className="h-9" />
        </Field>
        <Field label="Edad (años)">
          <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="50" className="h-9" />
        </Field>
        <Field label="Sexo">
          <select value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female')} className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm">
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </Field>
      </div>
      {result && (
        <ResultBox>
          <div className="text-2xl font-bold text-gray-800">{result.egfr}</div>
          <div className="text-sm text-gray-500">mL/min/1.73m² · KDIGO {result.stage} — {result.stageLabel}</div>
        </ResultBox>
      )}
    </div>
  );
}

// ============================================================================
// Framingham
// ============================================================================

function FraminghamCalculator() {
  const [form, setForm] = useState({
    ageYears: '',
    sex: 'male' as 'male' | 'female',
    totalCholesterol: '',
    hdl: '',
    systolicBP: '',
    treatedHTN: false,
    smoker: false,
    diabetes: false,
  });

  const result = useMemo(() => {
    const age = parseFloat(form.ageYears);
    const tc = parseFloat(form.totalCholesterol);
    const hdl = parseFloat(form.hdl);
    const sbp = parseFloat(form.systolicBP);
    if (![age, tc, hdl, sbp].every(Number.isFinite)) return null;
    return calculateFramingham({
      ageYears: age,
      sex: form.sex,
      totalCholesterol: tc,
      hdl,
      systolicBP: sbp,
      treatedHTN: form.treatedHTN,
      smoker: form.smoker,
      diabetes: form.diabetes,
    });
  }, [form]);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Edad (años, 30-79)">
          <Input type="number" value={form.ageYears} onChange={(e) => update('ageYears', e.target.value)} className="h-9" />
        </Field>
        <Field label="Sexo">
          <select value={form.sex} onChange={(e) => update('sex', e.target.value as 'male' | 'female')} className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm">
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </Field>
        <Field label="Colesterol total (mg/dL)">
          <Input type="number" value={form.totalCholesterol} onChange={(e) => update('totalCholesterol', e.target.value)} className="h-9" />
        </Field>
        <Field label="HDL (mg/dL)">
          <Input type="number" value={form.hdl} onChange={(e) => update('hdl', e.target.value)} className="h-9" />
        </Field>
        <Field label="TA Sistólica (mmHg)">
          <Input type="number" value={form.systolicBP} onChange={(e) => update('systolicBP', e.target.value)} className="h-9" />
        </Field>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <Checkbox checked={form.treatedHTN} onChange={(v) => update('treatedHTN', v)} label="Tratamiento HTA" />
        <Checkbox checked={form.smoker} onChange={(v) => update('smoker', v)} label="Tabaquismo activo" />
        <Checkbox checked={form.diabetes} onChange={(v) => update('diabetes', v)} label="Diabetes" />
      </div>
      {result && (
        <ResultBox>
          <div className="text-2xl font-bold text-gray-800">{result.riskPercent.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Riesgo CV a 10 años — {result.categoryLabel}</div>
        </ResultBox>
      )}
    </div>
  );
}

// ============================================================================
// Cockcroft-Gault
// ============================================================================

function CockcroftCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [creat, setCreat] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');

  const result = useMemo(() => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const c = parseFloat(creat);
    if (![a, w, c].every(Number.isFinite)) return null;
    return calculateCockcroftGault({
      ageYears: a, weightKg: w, sex, creatinineMgDl: c,
    });
  }, [age, weight, creat, sex]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Edad (años)">
          <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-9" />
        </Field>
        <Field label="Peso (kg)">
          <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" />
        </Field>
        <Field label="Creatinina (mg/dL)">
          <Input type="number" step="0.01" value={creat} onChange={(e) => setCreat(e.target.value)} className="h-9" />
        </Field>
        <Field label="Sexo">
          <select value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female')} className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm">
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </Field>
      </div>
      {result != null && (
        <ResultBox>
          <div className="text-2xl font-bold text-gray-800">{result}</div>
          <div className="text-sm text-gray-500">mL/min — Clearance estimado (para ajuste de dosis)</div>
        </ResultBox>
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}
