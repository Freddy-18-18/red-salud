'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { SoapEditor, type SoapNotes } from '@/components/consultation/soap-editor';
import { VitalSignsForm, type VitalSigns } from '@/components/consultation/vital-signs-form';
import { DiagnosisSearch, type DiagnosisEntry } from '@/components/consultation/diagnosis-search';
import {
  getSpecialtyExperienceConfig,
  type SpecialtyConfig,
} from '@/lib/specialties';
import {
  Search,
  User,
  Save,
  Printer,
  FileText,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  Pill,
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface PatientOption {
  id: string;
  nombre_completo: string;
  cedula: string | null;
}

interface ConsultationFormData {
  patient_id: string | null;
  soap: SoapNotes;
  vital_signs: VitalSigns;
  diagnoses: DiagnosisEntry[];
  requested_exams: string;
  prescriptions_notes: string;
}

type ActiveSection = 'soap' | 'vitals' | 'diagnosis' | 'exams' | 'prescription';

// ============================================================================
// INITIAL STATE
// ============================================================================

const INITIAL_SOAP: SoapNotes = { subjective: '', objective: '', assessment: '', plan: '' };
const INITIAL_VITALS: VitalSigns = {
  systolic_bp: null, diastolic_bp: null, heart_rate: null,
  temperature: null, respiratory_rate: null, oxygen_saturation: null,
  weight: null, height: null,
};
const INITIAL_FORM: ConsultationFormData = {
  patient_id: null,
  soap: INITIAL_SOAP,
  vital_signs: INITIAL_VITALS,
  diagnoses: [],
  requested_exams: '',
  prescriptions_notes: '',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ConsultaPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [specialtyConfig, setSpecialtyConfig] = useState<SpecialtyConfig | null>(null);
  const [form, setForm] = useState<ConsultationFormData>(INITIAL_FORM);
  const [activeSection, setActiveSection] = useState<ActiveSection>('soap');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Patient search
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);

  // Init
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: details } = await supabase
        .from('doctor_details')
        .select(`
          especialidad:specialties(name, slug),
          profile:profiles!doctor_details_profile_id_fkey(sacs_especialidad)
        `)
        .eq('profile_id', user.id)
        .maybeSingle();

      const especialidad = Array.isArray(details?.especialidad)
        ? details.especialidad[0]
        : details?.especialidad;
      const profileData = Array.isArray(details?.profile)
        ? details.profile[0]
        : details?.profile;
      const config = getSpecialtyExperienceConfig({
        specialtySlug: especialidad?.slug ?? undefined,
        specialtyName: especialidad?.name ?? undefined,
        sacsEspecialidad: profileData?.sacs_especialidad ?? undefined,
      });
      setSpecialtyConfig(config);
    }
    init();
  }, []);

  // Patient search
  const searchPatients = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPatientResults([]);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, nombre_completo, cedula')
      .or(`nombre_completo.ilike.%${query}%,cedula.ilike.%${query}%`)
      .eq('role', 'paciente')
      .limit(10);

    setPatientResults((data as unknown as PatientOption[]) ?? []);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => searchPatients(patientQuery), 300);
    return () => clearTimeout(timeout);
  }, [patientQuery, searchPatients]);

  const selectPatient = useCallback((patient: PatientOption) => {
    setSelectedPatient(patient);
    setForm((prev) => ({ ...prev, patient_id: patient.id }));
    setPatientSearchOpen(false);
    setPatientQuery('');
  }, []);

  // Save consultation
  const saveConsultation = useCallback(async () => {
    if (!userId || !form.patient_id) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const primaryDiagnosis = form.diagnoses.find((d) => d.isPrimary);

      const { error } = await supabase.from('medical_records').insert({
        patient_id: form.patient_id,
        doctor_id: userId,
        diagnosis: primaryDiagnosis
          ? `[${primaryDiagnosis.code}] ${primaryDiagnosis.title}`
          : null,
        observations: JSON.stringify({
          soap: form.soap,
          vital_signs: form.vital_signs,
          diagnoses: form.diagnoses,
          requested_exams: form.requested_exams,
          prescriptions_notes: form.prescriptions_notes,
        }),
        requested_exams: form.requested_exams || null,
      });

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar la consulta');
    } finally {
      setSaving(false);
    }
  }, [userId, form]);

  const themeColor = specialtyConfig?.theme?.primaryColor ?? '#3B82F6';

  // ---- Section navigation ----
  const sections: Array<{ id: ActiveSection; label: string; icon: typeof Stethoscope }> = [
    { id: 'soap', label: 'Notas SOAP', icon: FileText },
    { id: 'vitals', label: 'Signos Vitales', icon: HeartPulse },
    { id: 'diagnosis', label: 'Diagnóstico', icon: Stethoscope },
    { id: 'exams', label: 'Exámenes', icon: ClipboardList },
    { id: 'prescription', label: 'Indicaciones', icon: Pill },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consulta Médica</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Notas clínicas, diagnósticos y examen médico
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveConsultation}
            disabled={saving || !form.patient_id}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: themeColor }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : saveSuccess ? 'Guardado' : 'Guardar consulta'}
          </button>
        </div>
      </div>

      {/* Patient selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Paciente</label>
        {selectedPatient ? (
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: themeColor }}
              >
                {selectedPatient.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedPatient.nombre_completo}</p>
                {selectedPatient.cedula && (
                  <p className="text-xs text-gray-400">CI: {selectedPatient.cedula}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPatient(null);
                setForm((prev) => ({ ...prev, patient_id: null }));
              }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setPatientSearchOpen(true);
              }}
              onFocus={() => patientResults.length > 0 && setPatientSearchOpen(true)}
              placeholder="Buscar paciente por nombre o cédula..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-300"
              style={{ '--tw-ring-color': `${themeColor}40` } as React.CSSProperties}
            />
            {patientSearchOpen && patientResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {patientResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPatient(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-800">{p.nombre_completo}</p>
                      {p.cedula && <p className="text-xs text-gray-400">CI: {p.cedula}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                ${isActive
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'
                }
              `}
              style={isActive ? { backgroundColor: themeColor } : undefined}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Section content */}
      <div>
        {activeSection === 'soap' && (
          <SoapEditor
            value={form.soap}
            onChange={(soap) => setForm((prev) => ({ ...prev, soap }))}
            themeColor={themeColor}
          />
        )}

        {activeSection === 'vitals' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Signos Vitales</h2>
            <VitalSignsForm
              value={form.vital_signs}
              onChange={(vital_signs) => setForm((prev) => ({ ...prev, vital_signs }))}
              themeColor={themeColor}
            />
          </div>
        )}

        {activeSection === 'diagnosis' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnóstico (CIE-11)</h2>
            <DiagnosisSearch
              selected={form.diagnoses}
              onChange={(diagnoses) => setForm((prev) => ({ ...prev, diagnoses }))}
              themeColor={themeColor}
            />
          </div>
        )}

        {activeSection === 'exams' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Exámenes Solicitados</h2>
            <textarea
              value={form.requested_exams}
              onChange={(e) => setForm((prev) => ({ ...prev, requested_exams: e.target.value }))}
              placeholder="Listar los exámenes de laboratorio, imagenología u otros estudios solicitados..."
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-300 resize-y"
              style={{ '--tw-ring-color': `${themeColor}40` } as React.CSSProperties}
            />
          </div>
        )}

        {activeSection === 'prescription' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Indicaciones y Prescripción</h2>
            <textarea
              value={form.prescriptions_notes}
              onChange={(e) => setForm((prev) => ({ ...prev, prescriptions_notes: e.target.value }))}
              placeholder="Indicaciones terapéuticas, medicamentos, dosis, frecuencia, duración del tratamiento..."
              rows={8}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-300 resize-y"
              style={{ '--tw-ring-color': `${themeColor}40` } as React.CSSProperties}
            />
            <p className="text-xs text-gray-400 mt-2">
              Para crear una receta formal con firma digital, usa el módulo de Recetas desde el menú lateral.
            </p>
          </div>
        )}
      </div>

      {/* Save error */}
      {saveError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {saveError}
        </div>
      )}

      {/* Specialty-specific note */}
      {specialtyConfig && specialtyConfig.id !== 'default' && (
        <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-400">
          Especialidad detectada: <span className="font-medium text-gray-600">{specialtyConfig.name}</span>.
          Los módulos específicos de tu especialidad están disponibles en el menú lateral.
        </div>
      )}
    </div>
  );
}
