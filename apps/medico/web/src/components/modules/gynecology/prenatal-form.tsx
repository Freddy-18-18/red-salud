'use client';

import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { Button, Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import {
  type CreatePrenatalVisit,
  type Pregnancy,
  calculateGestationalAge,
} from './use-prenatal';

// ============================================================================
// CONSTANTS
// ============================================================================

const VISIT_TYPES = [
  { value: 'routine', label: 'Rutina' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'high_risk', label: 'Alto riesgo' },
  { value: 'postpartum', label: 'Postparto' },
] as const;

const PRESENTATION_OPTIONS = [
  { value: 'cephalic', label: 'Cefálica' },
  { value: 'breech', label: 'Podálica' },
  { value: 'transverse', label: 'Transversa' },
  { value: 'oblique', label: 'Oblicua' },
  { value: 'undetermined', label: 'No determinada' },
];

const MOVEMENT_OPTIONS = [
  { value: 'present_normal', label: 'Presentes y normales' },
  { value: 'present_decreased', label: 'Disminuidos' },
  { value: 'present_increased', label: 'Aumentados' },
  { value: 'absent', label: 'Ausentes' },
  { value: 'not_evaluated', label: 'No evaluados' },
];

const AMNIOTIC_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'oligohydramnios', label: 'Oligohidramnios' },
  { value: 'polyhydramnios', label: 'Polihidramnios' },
  { value: 'not_evaluated', label: 'No evaluado' },
];

const URINE_PROTEIN_OPTIONS = [
  { value: 'negative', label: 'Negativo' },
  { value: 'trace', label: 'Trazas' },
  { value: '1+', label: '1+' },
  { value: '2+', label: '2+' },
  { value: '3+', label: '3+' },
  { value: '4+', label: '4+' },
];

const RISK_FACTORS_OPTIONS = [
  'Hipertensión crónica',
  'Diabetes pregestacional',
  'Diabetes gestacional',
  'Preeclampsia previa',
  'Parto pretérmino previo',
  'Anemia',
  'Infección urinaria',
  'Placenta previa',
  'RCIU',
  'Embarazo múltiple',
  'Edad materna >35',
  'Obesidad (IMC >30)',
  'Tabaquismo',
  'Antecedente de aborto recurrente',
  'Rh negativo',
];

const SUPPLEMENTS_OPTIONS = [
  'Ácido fólico',
  'Hierro',
  'Calcio',
  'Vitamina D',
  'Omega-3',
  'Complejo vitamínico prenatal',
  'Progesterona',
];

// ============================================================================
// TYPES
// ============================================================================

interface PrenatalFormProps {
  pregnancy: Pregnancy;
  onSubmit: (data: CreatePrenatalVisit) => void;
  onCancel: () => void;
  initialData?: Partial<CreatePrenatalVisit>;
  isSubmitting?: boolean;
  themeColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PrenatalForm({
  pregnancy,
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
  themeColor = '#ec4899',
}: PrenatalFormProps) {
  // Visit info
  const [visitDate, setVisitDate] = useState(
    initialData?.visit_date ?? new Date().toISOString().slice(0, 10),
  );
  const [visitType, setVisitType] = useState<CreatePrenatalVisit['visit_type']>(
    initialData?.visit_type ?? 'routine',
  );

  // Auto-calculate gestational age from visit date
  const gestationalAge = useMemo(() => {
    if (!visitDate || !pregnancy.lmp_date) return null;
    return calculateGestationalAge(pregnancy.lmp_date, visitDate);
  }, [visitDate, pregnancy.lmp_date]);

  const [gestWeeks, setGestWeeks] = useState(
    initialData?.gestational_weeks?.toString() ?? '',
  );
  const [gestDays, setGestDays] = useState(
    initialData?.gestational_days?.toString() ?? '',
  );

  // Auto-fill gestational age when date changes
  useMemo(() => {
    if (gestationalAge && !initialData?.gestational_weeks) {
      setGestWeeks(gestationalAge.weeks.toString());
      setGestDays(gestationalAge.days.toString());
    }
  }, [gestationalAge, initialData?.gestational_weeks]);

  // Maternal vitals
  const [weightKg, setWeightKg] = useState(
    initialData?.weight_kg?.toString() ?? '',
  );
  const [bpSystolic, setBpSystolic] = useState(
    initialData?.blood_pressure_systolic?.toString() ?? '',
  );
  const [bpDiastolic, setBpDiastolic] = useState(
    initialData?.blood_pressure_diastolic?.toString() ?? '',
  );
  const [fundalHeight, setFundalHeight] = useState(
    initialData?.fundal_height_cm?.toString() ?? '',
  );

  // Fetal assessment
  const [fetalHR, setFetalHR] = useState(
    initialData?.fetal_heart_rate?.toString() ?? '',
  );
  const [presentation, setPresentation] = useState(
    initialData?.fetal_presentation ?? '',
  );
  const [movements, setMovements] = useState(
    initialData?.fetal_movements ?? '',
  );
  const [amnioticFluid, setAmnioticFluid] = useState(
    initialData?.amniotic_fluid ?? '',
  );

  // Labs
  const [hemoglobin, setHemoglobin] = useState(
    initialData?.hemoglobin?.toString() ?? '',
  );
  const [hematocrit, setHematocrit] = useState(
    initialData?.hematocrit?.toString() ?? '',
  );
  const [glucose, setGlucose] = useState(
    initialData?.glucose?.toString() ?? '',
  );
  const [urineProtein, setUrineProtein] = useState(
    initialData?.urine_protein ?? '',
  );

  // Ultrasound
  const [ultrasoundNotes, setUltrasoundNotes] = useState(
    initialData?.ultrasound_notes ?? '',
  );

  // Risk factors & supplements
  const [riskFactors, setRiskFactors] = useState<string[]>(
    initialData?.risk_factors ?? [],
  );
  const [supplements, setSupplements] = useState<string[]>(
    initialData?.supplements ?? [],
  );

  // Plan
  const [plan, setPlan] = useState(initialData?.plan ?? '');
  const [nextVisitDate, setNextVisitDate] = useState(
    initialData?.next_visit_date ?? '',
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  const handleToggle = (
    list: string[],
    setList: (v: string[]) => void,
    item: string,
  ) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!visitDate) newErrors.visitDate = 'Fecha requerida';
      if (!gestWeeks) newErrors.gestWeeks = 'Semanas requeridas';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const data: CreatePrenatalVisit = {
        pregnancy_id: pregnancy.id,
        patient_id: pregnancy.patient_id,
        visit_date: visitDate,
        visit_type: visitType,
        gestational_weeks: parseInt(gestWeeks, 10),
        gestational_days: parseInt(gestDays || '0', 10),
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        blood_pressure_systolic: bpSystolic ? parseInt(bpSystolic, 10) : null,
        blood_pressure_diastolic: bpDiastolic ? parseInt(bpDiastolic, 10) : null,
        fundal_height_cm: fundalHeight ? parseFloat(fundalHeight) : null,
        fetal_heart_rate: fetalHR ? parseInt(fetalHR, 10) : null,
        fetal_presentation: presentation || null,
        fetal_movements: movements || null,
        amniotic_fluid: amnioticFluid || null,
        hemoglobin: hemoglobin ? parseFloat(hemoglobin) : null,
        hematocrit: hematocrit ? parseFloat(hematocrit) : null,
        glucose: glucose ? parseFloat(glucose) : null,
        urine_protein: urineProtein || null,
        ultrasound_notes: ultrasoundNotes || null,
        risk_factors: riskFactors,
        supplements,
        plan: plan || null,
        next_visit_date: nextVisitDate || null,
        notes: notes || null,
      };

      onSubmit(data);
    },
    [
      visitDate, visitType, gestWeeks, gestDays, weightKg, bpSystolic, bpDiastolic,
      fundalHeight, fetalHR, presentation, movements, amnioticFluid,
      hemoglobin, hematocrit, glucose, urineProtein, ultrasoundNotes,
      riskFactors, supplements, plan, nextVisitDate, notes,
      pregnancy.id, pregnancy.patient_id, onSubmit,
    ],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ── Gestational age info ─────────────────────────────────── */}
      {gestationalAge && (
        <div
          className="flex items-center gap-3 p-3 rounded-lg border"
          style={{ backgroundColor: `${themeColor}08`, borderColor: `${themeColor}25` }}
        >
          <div
            className="text-lg font-bold"
            style={{ color: themeColor }}
          >
            {gestationalAge.weeks}+{gestationalAge.days}
          </div>
          <div className="text-xs text-gray-500">
            Semanas de gestación al{' '}
            {new Date(visitDate).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
      )}

      {/* ── Visit info ───────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Información de la Consulta
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="visit_date" className="text-xs">
              Fecha <span className="text-red-500">*</span>
            </Label>
            <Input
              id="visit_date"
              type="date"
              value={visitDate}
              onChange={(e) => {
                setVisitDate(e.target.value);
                setErrors((prev) => { const n = { ...prev }; delete n.visitDate; return n; });
              }}
              className="h-9"
            />
            {errors.visitDate && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.visitDate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de consulta</Label>
            <div className="flex flex-wrap gap-1">
              {VISIT_TYPES.map((vt) => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => setVisitType(vt.value)}
                  className={cn(
                    'text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors',
                    visitType === vt.value
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                  )}
                  style={
                    visitType === vt.value ? { backgroundColor: themeColor } : undefined
                  }
                >
                  {vt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gest_weeks" className="text-xs">
              Semanas <span className="text-red-500">*</span>
            </Label>
            <Input
              id="gest_weeks"
              type="number"
              min={0}
              max={45}
              value={gestWeeks}
              onChange={(e) => {
                setGestWeeks(e.target.value);
                setErrors((prev) => { const n = { ...prev }; delete n.gestWeeks; return n; });
              }}
              className="h-9"
            />
            {errors.gestWeeks && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.gestWeeks}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gest_days" className="text-xs">Días</Label>
            <Input
              id="gest_days"
              type="number"
              min={0}
              max={6}
              value={gestDays}
              onChange={(e) => setGestDays(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Maternal vitals ──────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Signos Vitales Maternos
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="weight" className="text-xs">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step={0.1}
              min={30}
              max={200}
              placeholder="65.0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp_sys" className="text-xs">TA Sistólica</Label>
            <Input
              id="bp_sys"
              type="number"
              min={60}
              max={250}
              placeholder="120"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp_dia" className="text-xs">TA Diastólica</Label>
            <Input
              id="bp_dia"
              type="number"
              min={40}
              max={160}
              placeholder="80"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fundal" className="text-xs">Altura Uterina (cm)</Label>
            <Input
              id="fundal"
              type="number"
              step={0.5}
              min={0}
              max={50}
              placeholder="28"
              value={fundalHeight}
              onChange={(e) => setFundalHeight(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Fetal assessment ─────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Evaluación Fetal
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fhr" className="text-xs">FCF (lpm)</Label>
            <Input
              id="fhr"
              type="number"
              min={60}
              max={220}
              placeholder="140"
              value={fetalHR}
              onChange={(e) => setFetalHR(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="presentation" className="text-xs">Presentación</Label>
            <select
              id="presentation"
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              {PRESENTATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="movements" className="text-xs">Movimientos</Label>
            <select
              id="movements"
              value={movements}
              onChange={(e) => setMovements(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              {MOVEMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amniotic" className="text-xs">Líquido Amniótico</Label>
            <select
              id="amniotic"
              value={amnioticFluid}
              onChange={(e) => setAmnioticFluid(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              {AMNIOTIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Lab summary ──────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Laboratorio
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hb" className="text-xs">Hemoglobina (g/dL)</Label>
            <Input
              id="hb"
              type="number"
              step={0.1}
              min={3}
              max={20}
              placeholder="12.0"
              value={hemoglobin}
              onChange={(e) => setHemoglobin(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hct" className="text-xs">Hematocrito (%)</Label>
            <Input
              id="hct"
              type="number"
              step={0.1}
              min={10}
              max={60}
              placeholder="36.0"
              value={hematocrit}
              onChange={(e) => setHematocrit(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="glucose" className="text-xs">Glucosa (mg/dL)</Label>
            <Input
              id="glucose"
              type="number"
              min={30}
              max={500}
              placeholder="85"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="urine_protein" className="text-xs">Proteinuria</Label>
            <select
              id="urine_protein"
              value={urineProtein}
              onChange={(e) => setUrineProtein(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar...</option>
              {URINE_PROTEIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Ultrasound ───────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Ecografía
        </legend>
        <textarea
          placeholder="Hallazgos ecográficos, biometría fetal, placenta..."
          value={ultrasoundNotes}
          onChange={(e) => setUltrasoundNotes(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </fieldset>

      {/* ── Risk factors ─────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Factores de Riesgo
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {RISK_FACTORS_OPTIONS.map((rf) => (
            <button
              key={rf}
              type="button"
              onClick={() => handleToggle(riskFactors, setRiskFactors, rf)}
              className={cn(
                'text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-colors',
                riskFactors.includes(rf)
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
              )}
            >
              {rf}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── Supplements ──────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Suplementos
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {SUPPLEMENTS_OPTIONS.map((sup) => (
            <button
              key={sup}
              type="button"
              onClick={() => handleToggle(supplements, setSupplements, sup)}
              className={cn(
                'text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-colors',
                supplements.includes(sup)
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
              )}
              style={supplements.includes(sup) ? { backgroundColor: themeColor } : undefined}
            >
              {sup}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── Plan & next visit ────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700">
          Plan y Próxima Consulta
        </legend>
        <textarea
          placeholder="Indicaciones, plan de manejo, estudios pendientes..."
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="next_visit" className="text-xs">Próxima cita</Label>
            <Input
              id="next_visit"
              type="date"
              value={nextVisitDate}
              onChange={(e) => setNextVisitDate(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <textarea
          placeholder="Notas adicionales..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground resize-y min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </fieldset>

      {/* ── Actions ──────────────────────────────────────────────── */}
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
              Guardar Control
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
