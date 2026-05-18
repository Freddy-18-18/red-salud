'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  Stethoscope,
  Hash,
  Calendar,
  Info,
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';

interface SacsProfile {
  full_name: string | null;
  national_id: string | null;
  sacs_verified: boolean;
  sacs_name: string | null;
  sacs_license: string | null;
  sacs_specialty: string | null;
  sacs_verified_at: string | null;
}

/**
 * /dashboard/verificacion
 *
 * Surface the doctor's SACS verification state with the underlying data that
 * was captured during onboarding. Shows a status banner (verified / pending),
 * the verified data block, the verification timestamp, and an action to
 * re-verify (calls the same /api/sacs/verify endpoint the onboarding wizard
 * uses).
 */
export default function VerificacionPage() {
  const [profile, setProfile] = useState<SacsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);
  const [reverifyError, setReverifyError] = useState<string | null>(null);
  const [reverifyOk, setReverifyOk] = useState(false);

  const loadProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select(
        'full_name, national_id, sacs_verified, sacs_name, sacs_license, sacs_specialty, sacs_verified_at',
      )
      .eq('id', user.id)
      .maybeSingle();

    if (data) setProfile(data as SacsProfile);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleReverify = useCallback(async () => {
    if (!profile?.national_id) return;
    setReverifying(true);
    setReverifyError(null);
    setReverifyOk(false);

    try {
      // national_id stored as "V-12345678" — split prefix and number.
      const match = profile.national_id.match(/^([VE])-?(\d+)$/i);
      if (!match) {
        setReverifyError('Tu cédula no tiene el formato esperado.');
        setReverifying(false);
        return;
      }
      const [, prefix, number] = match;

      const response = await fetch('/api/sacs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: number,
          tipo_documento: prefix.toUpperCase(),
        }),
      });

      const result = await response.json();
      if (result.success && result.verified) {
        setReverifyOk(true);
        // Refresh local state after the API updates the profile row.
        await loadProfile();
        setTimeout(() => setReverifyOk(false), 4000);
      } else {
        setReverifyError(
          result.razon_rechazo ??
            result.error ??
            'SACS no devolvió un resultado verificado. Intentá más tarde.',
        );
      }
    } catch {
      setReverifyError('No pudimos consultar el SACS. Verificá tu conexión.');
    } finally {
      setReverifying(false);
    }
  }, [profile?.national_id, loadProfile]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl border border-border bg-card" />
        <div className="h-64 rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  const isVerified = !!profile?.sacs_verified;
  const verifiedAt = profile?.sacs_verified_at
    ? new Date(profile.sacs_verified_at).toLocaleString('es-VE', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* ─── Page header ──────────────────────────────────────────────────── */}
      <header className="flex items-start gap-3">
        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Verificación SACS
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu registro en el Sistema Autónomo de Contraloría Sanitaria.
          </p>
        </div>
      </header>

      {/* ─── Status banner ────────────────────────────────────────────────── */}
      <section
        className={[
          'rounded-2xl border p-5 sm:p-6 flex items-start gap-4',
          isVerified
            ? 'border-success/30 bg-success/5'
            : 'border-warning/30 bg-warning/5',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-11 w-11 items-center justify-center rounded-xl shrink-0',
            isVerified
              ? 'bg-success/15 text-success'
              : 'bg-warning/15 text-warning',
          ].join(' ')}
        >
          {isVerified ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            {isVerified ? 'Verificado por SACS' : 'Verificación pendiente'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isVerified
              ? 'Tus pacientes ven el badge verificado en tu perfil público.'
              : 'Tu cuenta funciona en modo manual hasta completar la verificación.'}
          </p>
          {verifiedAt && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Última verificación: <span className="font-medium text-foreground">{verifiedAt}</span>
            </p>
          )}
        </div>

        {profile?.national_id && (
          <button
            type="button"
            onClick={handleReverify}
            disabled={reverifying}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shrink-0',
              'border border-border bg-background text-foreground',
              'hover:bg-muted transition-colors motion-reduce:transition-none',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            {reverifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Consultando…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Re-verificar
              </>
            )}
          </button>
        )}
      </section>

      {/* ─── Feedback toasts (inline) ─────────────────────────────────────── */}
      {reverifyOk && (
        <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          Datos del SACS actualizados correctamente.
        </div>
      )}
      {reverifyError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          {reverifyError}
        </div>
      )}

      {/* ─── Datos verificados ────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Datos provistos por el SACS
          </h2>
          <p className="text-sm text-muted-foreground">
            Información oficial del Ministerio de Salud. No se puede modificar
            desde la app.
          </p>
        </header>
        <div className="p-5 grid sm:grid-cols-2 gap-x-6 gap-y-5">
          <DataRow
            icon={FileText}
            label="Nombre registrado en SACS"
            value={profile?.sacs_name ?? profile?.full_name ?? '—'}
          />
          <DataRow
            icon={Hash}
            label="Cédula profesional"
            value={profile?.national_id ?? '—'}
          />
          <DataRow
            icon={Stethoscope}
            label="Especialidad"
            value={profile?.sacs_specialty ?? '—'}
          />
          <DataRow
            icon={Hash}
            label="Matrícula MPPS"
            value={profile?.sacs_license ?? '—'}
          />
          {verifiedAt && (
            <DataRow
              icon={Calendar}
              label="Fecha de verificación"
              value={verifiedAt}
            />
          )}
        </div>
      </section>

      {/* ─── Info card ────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              ¿Por qué los datos del SACS son inmutables?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Estos datos vienen del Sistema Autónomo de Contraloría Sanitaria,
              el registro oficial de profesionales de la salud en Venezuela.
              Para mantener la integridad del sistema y evitar suplantación,
              ningún usuario puede cambiarlos directamente. Si detectás un
              error,{' '}
              <a
                href="mailto:soporte@red-salud.com"
                className="font-medium text-primary hover:underline"
              >
                contactá a soporte
              </a>{' '}
              y vamos a re-verificar tu identidad.
            </p>
            <a
              href="https://sacs.mpps.gob.ve/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1"
            >
              Sitio oficial del SACS
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function DataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
