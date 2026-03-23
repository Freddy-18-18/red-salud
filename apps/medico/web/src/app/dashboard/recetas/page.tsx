'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Pill,
  Plus,
  Search,
  User,
  Calendar,
  FileSignature,
  Printer,
  Trash2,
  ChevronRight,
  AlertCircle,
  Check,
  Loader2,
  X,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Prescription {
  id: string;
  patient_id: string;
  diagnosis: string | null;
  general_instructions: string | null;
  prescribed_at: string;
  expires_at: string | null;
  status: string;
  paciente?: {
    nombre_completo: string;
  } | null;
}

interface MedicationLine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface NewPrescriptionForm {
  patient_id: string | null;
  patient_name: string;
  diagnosis: string;
  medications: MedicationLine[];
  general_instructions: string;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const EMPTY_MEDICATION: MedicationLine = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

const INITIAL_FORM: NewPrescriptionForm = {
  patient_id: null,
  patient_name: '',
  diagnosis: '',
  medications: [{ ...EMPTY_MEDICATION }],
  general_instructions: '',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function RecetasPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<NewPrescriptionForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Patient search for the form
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<Array<{ id: string; nombre_completo: string; cedula: string | null }>>([]);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);

  // Init
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Fetch prescriptions
  const fetchPrescriptions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          patient_id,
          diagnosis,
          general_instructions,
          prescribed_at,
          expires_at,
          status,
          paciente:profiles!prescriptions_patient_id_fkey(nombre_completo)
        `)
        .eq('doctor_id', userId)
        .order('prescribed_at', { ascending: false })
        .limit(50);

      if (!error) {
        setPrescriptions((data as unknown as Prescription[]) ?? []);
      }
    } catch {
      // Graceful degradation
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // Patient search
  useEffect(() => {
    if (patientQuery.length < 2) {
      setPatientResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, nombre_completo, cedula')
        .or(`nombre_completo.ilike.%${patientQuery}%,cedula.ilike.%${patientQuery}%`)
        .eq('role', 'paciente')
        .limit(8);
      setPatientResults(data ?? []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientQuery]);

  // Medication line management
  const addMedication = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      medications: [...prev.medications, { ...EMPTY_MEDICATION }],
    }));
  }, []);

  const removeMedication = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  }, []);

  const updateMedication = useCallback((index: number, field: keyof MedicationLine, value: string) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.map((m, i) =>
        i === index ? { ...m, [field]: value } : m,
      ),
    }));
  }, []);

  // Save prescription
  const savePrescription = useCallback(async () => {
    if (!userId || !form.patient_id) return;

    setSaving(true);
    setSaveError(null);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase.from('prescriptions').insert({
        patient_id: form.patient_id,
        doctor_id: userId,
        diagnosis: form.diagnosis || null,
        general_instructions: JSON.stringify({
          medications: form.medications.filter((m) => m.name.trim()),
          instructions: form.general_instructions,
        }),
        prescribed_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active',
      });

      if (error) throw error;

      setShowCreate(false);
      setForm(INITIAL_FORM);
      fetchPrescriptions();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al crear receta');
    } finally {
      setSaving(false);
    }
  }, [userId, form, fetchPrescriptions]);

  // ---- Status styles ----
  const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Activa' },
    expired: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Expirada' },
    dispensed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dispensada' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-600', label: 'Cancelada' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recetas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Creación y gestión de prescripciones médicas
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? 'Cancelar' : 'Nueva receta'}
        </button>
      </div>

      {/* Digital signature notice */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        <FileSignature className="h-4 w-4 flex-shrink-0" />
        Las recetas requieren firma digital antes de imprimir. Configúrala en Configuración.
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Nueva Receta Médica</h2>

          {/* Patient selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Paciente</label>
            {form.patient_id ? (
              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{form.patient_name}</span>
                </div>
                <button
                  onClick={() => setForm((prev) => ({ ...prev, patient_id: null, patient_name: '' }))}
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
                  onChange={(e) => { setPatientQuery(e.target.value); setPatientSearchOpen(true); }}
                  placeholder="Buscar paciente..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
                />
                {patientSearchOpen && patientResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {patientResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, patient_id: p.id, patient_name: p.nombre_completo }));
                          setPatientSearchOpen(false);
                          setPatientQuery('');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm"
                      >
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {p.nombre_completo}
                        {p.cedula && <span className="text-xs text-gray-400 ml-auto">{p.cedula}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Diagnosis */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Diagnóstico</label>
            <input
              type="text"
              value={form.diagnosis}
              onChange={(e) => setForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Diagnóstico principal..."
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
            />
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Medicamentos</label>
              <button
                onClick={addMedication}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Agregar medicamento
              </button>
            </div>
            <div className="space-y-3">
              {form.medications.map((med, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">Medicamento {idx + 1}</span>
                    {form.medications.length > 1 && (
                      <button onClick={() => removeMedication(idx)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                      placeholder="Nombre del medicamento"
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
                    />
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                      placeholder="Dosis (ej: 500mg)"
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
                    />
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                      placeholder="Frecuencia (ej: cada 8h)"
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
                    />
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                      placeholder="Duración (ej: 7 días)"
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => updateMedication(idx, 'instructions', e.target.value)}
                    placeholder="Instrucciones adicionales..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* General instructions */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Instrucciones generales</label>
            <textarea
              value={form.general_instructions}
              onChange={(e) => setForm((prev) => ({ ...prev, general_instructions: e.target.value }))}
              placeholder="Indicaciones generales, dieta, reposo, cuidados..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300 resize-y"
            />
          </div>

          {/* Save error */}
          {saveError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setShowCreate(false); setForm(INITIAL_FORM); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={savePrescription}
              disabled={saving || !form.patient_id || form.medications.every((m) => !m.name.trim())}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Crear receta
            </button>
          </div>
        </div>
      )}

      {/* Prescriptions list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Recetas recientes</p>
        </div>

        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 py-3">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="flex-1 h-4 bg-gray-100 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-8 text-center">
            <Pill className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Sin recetas registradas</p>
            <p className="text-sm text-gray-400 mt-1">Las recetas que crees aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {prescriptions.map((rx) => {
              const style = statusStyles[rx.status] ?? statusStyles.active;
              return (
                <div key={rx.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <Pill className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {rx.paciente?.nombre_completo ?? 'Paciente'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {rx.diagnosis ?? 'Sin diagnóstico'}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(rx.prescribed_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
