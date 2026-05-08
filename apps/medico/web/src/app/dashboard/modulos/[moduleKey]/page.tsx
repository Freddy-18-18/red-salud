'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getSpecialtyExperienceConfig, type SpecialtyConfig } from '@/lib/specialties';
import { ModuleRenderer } from '@/components/modules/module-renderer';
import { isModuleRegistered } from '@/components/modules/module-registry';
import { PageHeader } from '@/components/shell';
import { Puzzle, AlertTriangle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface DoctorContext {
  userId: string;
  specialtySlug: string;
  specialtyConfig: SpecialtyConfig;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ModulePage() {
  const params = useParams<{ moduleKey: string }>();
  const searchParams = useSearchParams();
  const moduleKey = params.moduleKey;
  const patientId = searchParams.get('patientId') ?? undefined;

  const [ctx, setCtx] = useState<DoctorContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('No se pudo obtener la sesión del usuario.');
          setLoading(false);
          return;
        }

        const { data: details } = await supabase
          .from('doctor_profiles')
          .select(`
            especialidad:specialties(name, slug),
            profile:profiles!doctor_details_profile_id_fkey(
              sacs_specialty
            )
          `)
          .eq('profile_id', user.id)
          .maybeSingle();

        const especialidad = Array.isArray(details?.especialidad)
          ? details.especialidad[0]
          : details?.especialidad;
        const profileData = Array.isArray(details?.profile)
          ? details.profile[0]
          : details?.profile;

        const specialtySlug = especialidad?.slug ?? 'medicina-general';

        const specialtyConfig = getSpecialtyExperienceConfig({
          specialtySlug: especialidad?.slug ?? undefined,
          specialtyName: especialidad?.name ?? undefined,
          sacsEspecialidad: profileData?.sacs_specialty ?? undefined,
        });

        setCtx({
          userId: user.id,
          specialtySlug,
          specialtyConfig,
        });
      } catch {
        setError('Error al cargar el contexto del módulo.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Find module label from the specialty config
  const moduleLabel = (() => {
    if (!ctx) return moduleKey;
    for (const group of Object.values(ctx.specialtyConfig.modules)) {
      if (!group) continue;
      for (const mod of group) {
        if (mod.key === moduleKey) return mod.label;
      }
    }
    return moduleKey;
  })();

  const themeColor = ctx?.specialtyConfig.theme?.primaryColor ?? '#3B82F6';

  if (loading) {
    return <ModulePageSkeleton />;
  }

  if (error || !ctx) {
    return (
      <div className="space-y-4">
        <PageHeader>
          <PageHeader.Breadcrumb
            items={[
              { label: 'Inicio', href: '/dashboard' },
              { label: 'Módulos', href: '/dashboard/modulos' },
              { label: moduleKey ?? 'Módulo' },
            ]}
          />
          <PageHeader.Title>{moduleKey ?? 'Módulo'}</PageHeader.Title>
        </PageHeader>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-400 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            {error ?? 'No se pudo cargar el módulo'}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!isModuleRegistered(moduleKey)) {
    return (
      <div className="space-y-4">
        <PageHeader>
          <PageHeader.Breadcrumb
            items={[
              { label: 'Inicio', href: '/dashboard' },
              { label: 'Módulos', href: '/dashboard/modulos' },
              { label: moduleKey ?? 'Módulo' },
            ]}
          />
          <PageHeader.Title>{moduleKey ?? 'Módulo'}</PageHeader.Title>
        </PageHeader>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Puzzle className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">Módulo no disponible</p>
          <p className="text-xs text-gray-400 mt-1">
            &quot;{moduleKey}&quot; no está registrado en el sistema
          </p>
          <Link
            href="/dashboard/modulos"
            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Ver módulos disponibles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader>
        <PageHeader.Breadcrumb
          items={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Módulos', href: '/dashboard/modulos' },
            { label: moduleLabel ?? 'Módulo' },
          ]}
        />
        <PageHeader.Title>{moduleLabel ?? 'Módulo'}</PageHeader.Title>
      </PageHeader>

      <ModuleRenderer
        moduleKey={moduleKey}
        doctorId={ctx.userId}
        patientId={patientId}
        specialtySlug={ctx.specialtySlug}
        themeColor={themeColor}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ModulePageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-100 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            <div className="h-5 w-48 bg-gray-200 rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
