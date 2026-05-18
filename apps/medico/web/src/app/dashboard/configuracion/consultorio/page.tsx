'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Plus,
  Info,
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { useDoctorProfile } from '@/hooks/use-doctor-profile';
import { ConfigSection } from '@/components/configuracion/config-section';

/**
 * /dashboard/configuracion/consultorio
 *
 * Practice / location settings. For now (pre Fase H multi-sede), we expose:
 *   - The primary location captured during onboarding (name + address)
 *   - Professional phone
 *
 * When Fase H lands, this page will be replaced with a full CRUD for
 * `doctor_locations`. The "Agregar otro consultorio" button is shown disabled
 * with a "Próximamente" tooltip so users see multi-sede coming.
 */
export default function ConsultorioPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    practice_name: '',
    clinic_address: '',
    professional_phone: '',
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
    const dashboardConfig =
      (profile.dashboard_config as { practice_name?: string } | null | undefined) ?? {};
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      practice_name: dashboardConfig.practice_name ?? '',
      clinic_address: profile.clinic_address ?? '',
      professional_phone: profile.professional_phone ?? '',
    });
  }, [profile]);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const existingConfig =
        (profile?.dashboard_config as Record<string, unknown> | null | undefined) ?? {};
      await updateProfile({
        clinic_address: formData.clinic_address.trim() || null,
        professional_phone: formData.professional_phone.trim() || null,
        dashboard_config: {
          ...existingConfig,
          practice_name: formData.practice_name.trim() || undefined,
        },
      } as Record<string, unknown>);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('No se pudo guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [userId, formData, profile?.dashboard_config, updateProfile]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-72 rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfigSection
        icon={Building2}
        title="Tu consultorio principal"
        description="La sede donde atendés actualmente."
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

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="practice_name"
              className="block text-sm font-medium text-foreground"
            >
              Nombre del consultorio
            </label>
            <input
              id="practice_name"
              type="text"
              value={formData.practice_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, practice_name: e.target.value }))
              }
              placeholder="Consultorio Dr. Pérez"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="clinic_address"
              className="block text-sm font-medium text-foreground"
            >
              <MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" aria-hidden="true" />
              Dirección
            </label>
            <textarea
              id="clinic_address"
              value={formData.clinic_address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, clinic_address: e.target.value }))
              }
              placeholder="Av. Principal, Torre Médica, Piso 3, Consultorio 305"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="professional_phone"
              className="block text-sm font-medium text-foreground"
            >
              <Phone className="inline h-3.5 w-3.5 mr-1 -mt-0.5" aria-hidden="true" />
              Teléfono del consultorio
            </label>
            <input
              id="professional_phone"
              type="tel"
              value={formData.professional_phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  professional_phone: e.target.value,
                }))
              }
              placeholder="+58 212 1234567"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
            />
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
              Los pacientes se contactan vía el chat de Red-Salud, no por
              teléfono directo. Este número es solo para que el consultorio
              aparezca completo en tu perfil público.
            </p>
          </div>
        </div>
      </ConfigSection>

      {/* Multi-sede teaser */}
      <ConfigSection
        icon={Plus}
        title="Múltiples consultorios"
        description="¿Atendés en más de un lugar?"
      >
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Próximamente vas a poder agregar varios consultorios con horarios,
            tarifas y agenda independientes. Tus pacientes podrán elegir dónde
            atenderse cuando reserven.
          </p>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60"
            title="Próximamente"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar otro consultorio
          </button>
        </div>
      </ConfigSection>
    </div>
  );
}
