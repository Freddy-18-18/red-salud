'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Share2, AlertTriangle } from 'lucide-react';
import { Button, Input } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';

import { supabase } from '@/lib/supabase/client';
import { ModuleWrapper } from '../module-wrapper';
import type { ModuleComponentProps } from '../module-registry';

interface Patient {
  id: string;
  full_name: string;
  national_id: string | null;
}
interface Specialty {
  id: string;
  slug: string;
  name: string;
}
interface Referral {
  id: string;
  patient_id: string;
  specialty_id: string;
  reason: string;
  diagnosis: string | null;
  urgency: 'rutinaria' | 'preferente' | 'urgente';
  status: string;
  created_at: string;
  expires_at: string | null;
}

const URGENCY_LABEL: Record<Referral['urgency'], string> = {
  rutinaria: 'Rutinaria',
  preferente: 'Preferente',
  urgente: 'Urgente',
};
const URGENCY_COLOR: Record<Referral['urgency'], string> = {
  rutinaria: 'bg-gray-100 text-gray-600',
  preferente: 'bg-amber-100 text-amber-700',
  urgente: 'bg-red-100 text-red-700',
};

export default function ReferralsModule({
  doctorId,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [doctorProfileId, setDoctorProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadReferrals = useCallback(async (dpId: string) => {
    const { data } = await supabase
      .from('medical_referrals')
      .select('id, patient_id, specialty_id, reason, diagnosis, urgency, status, created_at, expires_at')
      .eq('referring_doctor_id', dpId)
      .order('created_at', { ascending: false });
    setReferrals(((data ?? []) as unknown) as Referral[]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Resolve doctor_profiles.id from auth user id (referring_doctor_id FK)
      const { data: dp } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('profile_id', doctorId)
        .maybeSingle();
      const dpId = (dp as { id: string } | null)?.id ?? null;
      const [apptsRes, specRes] = await Promise.all([
        supabase.from('appointments').select('patient_id').eq('doctor_id', doctorId).not('patient_id', 'is', null),
        supabase.from('specialties').select('id, slug, name').eq('active', true).order('name'),
      ]);
      const ids = Array.from(new Set(((apptsRes.data ?? []) as { patient_id: string | null }[])
        .map((a) => a.patient_id).filter((id): id is string => Boolean(id))));
      let pats: Patient[] = [];
      if (ids.length > 0) {
        const { data } = await supabase.from('profiles').select('id, full_name, national_id').in('id', ids);
        pats = (data ?? []) as Patient[];
      }
      if (!cancelled) {
        setPatients(pats);
        setSpecialties((specRes.data ?? []) as Specialty[]);
        setDoctorProfileId(dpId);
        if (dpId) await loadReferrals(dpId);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doctorId, loadReferrals]);

  const patientById = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const specialtyById = useMemo(() => new Map(specialties.map((s) => [s.id, s])), [specialties]);

  return (
    <ModuleWrapper
      moduleKey="referrals"
      title="Derivaciones a Especialistas"
      icon="Share2"
      description="Interconsultas con consentimiento del paciente"
      themeColor={themeColor}
      isLoading={loading}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {referrals.length} derivacion{referrals.length !== 1 ? 'es' : ''}
        </p>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Nueva derivación
          </Button>
        )}
      </div>

      {showForm && doctorProfileId && (
        <ReferralForm
          doctorProfileId={doctorProfileId}
          patients={patients}
          specialties={specialties}
          onSaved={async () => {
            await loadReferrals(doctorProfileId);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {referrals.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Share2 className="h-10 w-10 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Sin derivaciones</p>
          <p className="text-xs text-gray-300 mt-1">
            Generá una derivación para enviar un paciente a un especialista
          </p>
        </div>
      ) : (
        <ul className="space-y-2 mt-3">
          {referrals.map((r) => {
            const patient = patientById.get(r.patient_id);
            const specialty = specialtyById.get(r.specialty_id);
            return (
              <li key={r.id} className="p-3 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">{patient?.full_name ?? r.patient_id.slice(0, 8)}</p>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', URGENCY_COLOR[r.urgency])}>
                        {URGENCY_LABEL[r.urgency]}
                      </span>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{r.status}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      → <strong>{specialty?.name ?? r.specialty_id}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Motivo: {r.reason}</p>
                    {r.diagnosis && <p className="text-xs text-gray-400 mt-0.5">Dx: {r.diagnosis}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(r.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {r.expires_at && ` · Expira ${new Date(r.expires_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}`}
                    </p>
                  </div>
                  {r.urgency === 'urgente' && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ModuleWrapper>
  );
}

function ReferralForm({
  doctorProfileId,
  patients,
  specialties,
  onSaved,
  onCancel,
}: {
  doctorProfileId: string;
  patients: Patient[];
  specialties: Specialty[];
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [patientId, setPatientId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [urgency, setUrgency] = useState<Referral['urgency']>('rutinaria');
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !specialtyId || !reason.trim()) return;
    setSaving(true);
    setError(null);
    const expires = new Date();
    expires.setDate(expires.getDate() + 90);
    const { error: insErr } = await supabase.from('medical_referrals').insert({
      patient_id: patientId,
      referring_doctor_id: doctorProfileId,
      specialty_id: specialtyId,
      reason: reason.trim(),
      diagnosis: diagnosis.trim() || null,
      clinical_notes: clinicalNotes.trim() || null,
      urgency,
      status: 'pendiente',
      patient_consent_given: false,
      share_referrer_identity: true,
      expires_at: expires.toISOString(),
    });
    setSaving(false);
    if (insErr) {
      setError(insErr.message ?? 'Error al crear la derivación');
      return;
    }
    await onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-3 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Paciente</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm">
            <option value="">Seleccionar paciente…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}{p.national_id ? ` · CI ${p.national_id}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Especialidad destino</label>
          <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} required className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm">
            <option value="">Seleccionar especialidad…</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Urgencia</label>
        <div className="flex gap-2">
          {(['rutinaria', 'preferente', 'urgente'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUrgency(u)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border',
                urgency === u ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              {URGENCY_LABEL[u]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Motivo de derivación *</label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: Evaluación de soplo cardiaco…" required className="h-9" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Diagnóstico presuntivo</label>
        <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Ej: HTA refractaria" className="h-9" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Notas clínicas</label>
        <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} rows={3} placeholder="Contexto adicional, exámenes realizados, tratamientos previos…" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
      </div>
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button type="submit" size="sm" disabled={saving || !patientId || !specialtyId || !reason.trim()}>
          {saving ? 'Guardando…' : 'Crear derivación'}
        </Button>
      </div>
    </form>
  );
}
