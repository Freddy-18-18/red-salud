'use client';

import { Eye, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

/**
 * /dashboard/perfil-publico
 *
 * Stub — preview of how patients see the doctor in the public directory.
 * The full implementation (real-time preview iframe of the patient app's
 * doctor profile view) lands in a dedicated session along with the
 * paciente-app integration.
 *
 * For now we surface a link to the public doctor URL (slug-based) when
 * available, plus a "coming soon" preview area.
 */
export default function PerfilPublicoPage() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('doctor_profiles')
        .select('slug')
        .eq('profile_id', user.id)
        .maybeSingle();
      if (data?.slug) setSlug(data.slug);
    }
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
          <Eye className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Tu perfil público
          </h1>
          <p className="text-sm text-muted-foreground">
            Así te ven los pacientes cuando te buscan en Red-Salud.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </Link>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col items-center text-center py-10 px-4 border-2 border-dashed border-border rounded-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <Eye className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Vista previa del perfil público — próximamente
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-md">
            Vas a poder ver una previsualización en vivo de cómo aparece tu
            ficha en la app de pacientes: foto, biografía, especialidad,
            tarifa, seguros aceptados, horarios y reseñas.
          </p>

          {slug ? (
            <a
              href={`https://red-salud.com/medico/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Ver mi perfil en producción
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              Tu URL pública se genera cuando completás los datos esenciales
              del perfil.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
