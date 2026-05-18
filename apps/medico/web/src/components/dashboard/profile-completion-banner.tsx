'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle2, X, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// =============================================================================
// Profile completion banner — shown on /dashboard until the doctor's public
// profile is fully populated. Helps "land users fast in the dashboard" while
// still nudging them to complete the data that makes them discoverable by
// patients (bio, fee, experience, etc.).
//
// Computes a percentage based on a fixed list of "important but not blocking"
// fields. Dismissible (localStorage + 7-day cooldown) but reappears after that
// to avoid permanent ignore.
// =============================================================================

const DISMISS_KEY = 'medico:profile-banner-dismissed-at';
const DISMISS_COOLDOWN_DAYS = 7;

// Fields that contribute to "profile completion %". Each is weighted equally.
// Order in this list = order in which we surface the next 3 missing items.
const IMPORTANT_FIELDS = [
  { key: 'consultation_fee', label: 'Precio de consulta' },
  { key: 'biography', label: 'Biografía / presentación' },
  { key: 'years_experience', label: 'Años de experiencia' },
  { key: 'university', label: 'Universidad' },
  { key: 'professional_email', label: 'Email profesional' },
  { key: 'languages_extra', label: 'Idiomas adicionales (más allá de español)' },
] as const;

interface DoctorProfileForBanner {
  consultation_fee?: number | null;
  biography?: string | null;
  years_experience?: number | null;
  university?: string | null;
  professional_email?: string | null;
  languages?: string[] | null;
}

function isFieldFilled(key: string, profile: DoctorProfileForBanner): boolean {
  switch (key) {
    case 'consultation_fee':
      return typeof profile.consultation_fee === 'number' && profile.consultation_fee > 0;
    case 'biography':
      return !!profile.biography && profile.biography.trim().length >= 20;
    case 'years_experience':
      return typeof profile.years_experience === 'number' && profile.years_experience > 0;
    case 'university':
      return !!profile.university && profile.university.trim().length > 0;
    case 'professional_email':
      return !!profile.professional_email && profile.professional_email.includes('@');
    case 'languages_extra':
      // Default es español; counts as "filled" only when more than 1.
      return Array.isArray(profile.languages) && profile.languages.length > 1;
    default:
      return false;
  }
}

function readDismissedAt(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    return raw ? Number.parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

function isDismissedRecently(): boolean {
  const ts = readDismissedAt();
  if (!ts) return false;
  const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - ts < cooldownMs;
}

interface ProfileCompletionBannerProps {
  userId: string;
}

export function ProfileCompletionBanner({ userId }: ProfileCompletionBannerProps) {
  const [profile, setProfile] = useState<DoctorProfileForBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<boolean>(() => isDismissedRecently());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('doctor_profiles')
        .select(
          'consultation_fee, biography, years_experience, university, professional_email, languages',
        )
        .eq('profile_id', userId)
        .maybeSingle();
      if (cancelled) return;
      setProfile(data ?? null);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const { percent, missingTop } = useMemo(() => {
    if (!profile) return { percent: 0, missingTop: [] as string[] };
    const filledCount = IMPORTANT_FIELDS.filter((f) => isFieldFilled(f.key, profile)).length;
    const total = IMPORTANT_FIELDS.length;
    const percent = Math.round((filledCount / total) * 100);
    const missingTop = IMPORTANT_FIELDS.filter((f) => !isFieldFilled(f.key, profile))
      .slice(0, 3)
      .map((f) => f.label);
    return { percent, missingTop };
  }, [profile]);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // localStorage unavailable — dismissal will not persist, banner returns on reload.
    }
    setDismissed(true);
  };

  // Don't render in any of these cases:
  // - still loading (avoid flash)
  // - profile fully complete
  // - user dismissed recently
  if (loading || dismissed || percent === 100) return null;

  return (
    <section
      aria-labelledby="profile-completion-title"
      className="relative rounded-2xl border border-border bg-card p-5 sm:p-6 overflow-hidden"
    >
      {/* Decorative gradient accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/30"
      />

      <div className="flex items-start gap-4">
        <div className="hidden sm:flex w-11 h-11 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="profile-completion-title"
                className="text-base sm:text-lg font-semibold text-foreground"
              >
                Completá tu perfil para ser más visible
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cuanto más completo tu perfil, más pacientes te encontrarán.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Ocultar este aviso por 7 días"
              className="shrink-0 -m-1.5 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Progreso del perfil</span>
              <span className="font-semibold text-primary tabular-nums">{percent}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Perfil completado ${percent} por ciento`}
              className="h-2 w-full rounded-full bg-muted overflow-hidden"
            >
              <div
                className="h-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Missing fields preview */}
          {missingTop.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Próximos a completar:
              </p>
              <ul className="space-y-1.5">
                {missingTop.map((label) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <CheckCircle2
                      className="w-4 h-4 text-muted-foreground/50 shrink-0"
                      aria-hidden="true"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="mt-5">
            <Link
              href="/dashboard/configuracion"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Completar mi perfil
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
