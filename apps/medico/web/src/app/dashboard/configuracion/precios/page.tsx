'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { useDoctorProfile } from '@/hooks/use-doctor-profile';
import { ConfigSection } from '@/components/configuracion/config-section';

/**
 * /dashboard/configuracion/precios
 *
 * Pricing + insurance acceptance. Two cards:
 *
 *   1. Tarifa de consulta — single USD amount. Currency conversion (BCV)
 *      happens at display time on the patient side; we store USD as source
 *      of truth to stay sane in Venezuela's inflation context.
 *   2. Seguros aceptados — boolean toggle for now. The detailed list of
 *      insurers (Mercantil, Banesco, etc.) lives in `accepted_insurances`
 *      JSONB; that UI is out of scope for this initial cut.
 */
export default function PreciosPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    consultation_fee: '',
    accepts_insurance: false,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { profile, loading, updateProfile } = useDoctorProfile(userId ?? undefined);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      consultation_fee: profile.consultation_fee?.toString() ?? '',
      accepts_insurance: profile.accepts_insurance ?? false,
    });
  }, [profile]);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const fee = formData.consultation_fee
        ? Number(formData.consultation_fee)
        : null;
      if (fee !== null && (Number.isNaN(fee) || fee < 0)) {
        setSaveError('El precio debe ser un número mayor o igual a 0.');
        setSaving(false);
        return;
      }
      await updateProfile({
        consultation_fee: fee,
        accepts_insurance: formData.accepts_insurance,
      } as Record<string, unknown>);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('No se pudo guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [userId, formData, updateProfile]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-56 rounded-2xl border border-border bg-card" />
        <div className="h-40 rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfigSection
        icon={DollarSign}
        title="Tarifa de consulta"
        description="El precio que verás cuando un paciente reserve una cita."
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Guardando…
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Guardado
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Guardar
              </>
            )}
          </button>
        }
      >
        {saveError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            {saveError}
          </div>
        )}

        <div className="space-y-1.5 max-w-sm">
          <label
            htmlFor="consultation_fee"
            className="block text-sm font-medium text-foreground"
          >
            Precio de la consulta
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
              aria-hidden="true"
            >
              USD $
            </span>
            <input
              id="consultation_fee"
              type="number"
              min={0}
              step="0.01"
              value={formData.consultation_fee}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  consultation_fee: e.target.value,
                }))
              }
              placeholder="50.00"
              className="w-full rounded-lg border border-border bg-background pl-16 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
            />
          </div>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            Lo guardamos en USD como fuente de verdad. Los pacientes verán el
            equivalente en Bs.S al cambio BCV vigente.
          </p>
        </div>
      </ConfigSection>

      <ConfigSection
        icon={ShieldCheck}
        title="Seguros médicos"
        description="¿Atendés pacientes con seguros médicos?"
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.accepts_insurance}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                accepts_insurance: e.target.checked,
              }))
            }
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
          />
          <span className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">
              Acepto seguros médicos
            </span>
            <span className="text-xs text-muted-foreground">
              La lista detallada de aseguradoras (Mercantil, Banesco, etc.) se
              configura en una sección aparte. Por ahora basta con marcar si
              aceptás o no.
            </span>
          </span>
        </label>
      </ConfigSection>
    </div>
  );
}
