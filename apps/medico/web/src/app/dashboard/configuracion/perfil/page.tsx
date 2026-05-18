'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  User,
  ShieldCheck,
  Mail,
  Lock,
  Save,
  Loader2,
  Check,
  Globe,
  Stethoscope,
  Camera,
  AlertCircle,
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { useDoctorProfile } from '@/hooks/use-doctor-profile';
import { ReadOnlyField } from '@/components/configuracion/read-only-field';
import { ConfigSection } from '@/components/configuracion/config-section';

/**
 * /dashboard/configuracion/perfil
 *
 * Personal & professional identity. Splits the form into two cards:
 *
 *  1. **Identidad verificada** — read-only fields backed by SACS / signup.
 *     These are immutable post-registration (cédula, SACS data, email,
 *     verified full name). Each one renders with a lock icon and a
 *     "Contactá soporte para cambiar" tooltip.
 *
 *  2. **Tu presentación pública** — editable fields the doctor controls:
 *     biography, years of experience, languages, photo. These drive what
 *     patients see when searching for doctors.
 */
export default function PerfilPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [identity, setIdentity] = useState<{
    full_name: string | null;
    national_id: string | null;
    sacs_specialty: string | null;
    sacs_license: string | null;
    sacs_verified: boolean;
    sacs_verified_at: string | null;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Editable form fields only.
  const [formData, setFormData] = useState({
    bio: '',
    years_experience: '',
    languages: 'es',
  });

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setAuthEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select(
          'full_name, national_id, sacs_specialty, sacs_license, sacs_verified, sacs_verified_at',
        )
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setIdentity({
          full_name: profile.full_name,
          national_id: profile.national_id,
          sacs_specialty: profile.sacs_specialty,
          sacs_license: profile.sacs_license,
          sacs_verified: !!profile.sacs_verified,
          sacs_verified_at: profile.sacs_verified_at,
        });
      }
    }
    init();
  }, []);

  const { profile, loading, updateProfile } = useDoctorProfile(userId ?? undefined);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      bio: profile.bio ?? '',
      years_experience: profile.years_experience?.toString() ?? '',
      languages: Array.isArray(profile.languages)
        ? profile.languages.join(', ')
        : (profile.languages ?? 'es'),
    });
  }, [profile]);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await updateProfile({
        bio: formData.bio.trim() || null,
        years_experience: Number(formData.years_experience) || 0,
        languages: formData.languages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
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
        <div className="h-40 rounded-2xl border border-border bg-card" />
        <div className="h-72 rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Identidad verificada (read-only) ────────────────────────────── */}
      <ConfigSection
        icon={ShieldCheck}
        title="Identidad verificada"
        description="Estos datos vienen de tu verificación oficial. Para cambiar alguno, contactá a soporte."
      >
        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
          <ReadOnlyField
            label="Nombre completo"
            value={identity?.full_name ?? '—'}
            reason={identity?.sacs_verified ? 'Verificado por SACS' : 'Pendiente de verificación'}
          />
          <ReadOnlyField
            label="Cédula"
            value={identity?.national_id ?? '—'}
            reason="Identificación legal — no se puede modificar"
          />
          <ReadOnlyField
            label="Email de la cuenta"
            value={authEmail || '—'}
            icon={Mail}
            reason="ID de tu cuenta. Para cambiarlo, contactá a soporte."
          />
          <ReadOnlyField
            label="Matrícula SACS"
            value={identity?.sacs_license ?? '—'}
            reason="Provista por el Sistema Autónomo de Contraloría Sanitaria"
          />
          <ReadOnlyField
            label="Especialidad (SACS)"
            value={identity?.sacs_specialty ?? '—'}
            icon={Stethoscope}
            reason="Provista por SACS"
          />
        </div>
      </ConfigSection>

      {/* ─── Tu presentación pública (editable) ──────────────────────────── */}
      <ConfigSection
        icon={User}
        title="Tu presentación pública"
        description="Esto es lo que ven los pacientes cuando te buscan."
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
              'bg-primary text-primary-foreground shadow-sm',
              'hover:bg-primary/90 transition-colors motion-reduce:transition-none',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
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
          {/* Avatar — stub for upload, real upload comes in a later phase */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border border-border">
                {identity?.full_name
                  ? identity.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'DR'}
              </div>
              <button
                type="button"
                disabled
                aria-label="Cambiar foto (próximamente)"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-card border border-border flex items-center justify-center shadow-sm text-muted-foreground cursor-not-allowed opacity-60"
                title="Próximamente"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Foto de perfil</p>
              <p className="text-xs text-muted-foreground">
                La carga de imágenes estará disponible próximamente.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-foreground"
            >
              Biografía profesional
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Describí en pocas líneas tu experiencia, especialización y enfoque. Esto es lo primero que ven los pacientes."
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors resize-y"
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.bio.length}/500
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="years_experience"
                className="block text-sm font-medium text-foreground"
              >
                Años de experiencia
              </label>
              <input
                id="years_experience"
                type="number"
                min={0}
                max={70}
                value={formData.years_experience}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    years_experience: e.target.value,
                  }))
                }
                placeholder="10"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="languages"
                className="block text-sm font-medium text-foreground"
              >
                <Globe className="inline h-3.5 w-3.5 mr-1 -mt-0.5" aria-hidden="true" />
                Idiomas que hablás
              </label>
              <input
                id="languages"
                type="text"
                value={formData.languages}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, languages: e.target.value }))
                }
                placeholder="es, en, pt"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Separá con comas. Útil para pacientes bilingües.
              </p>
            </div>
          </div>
        </div>
      </ConfigSection>
    </div>
  );
}
