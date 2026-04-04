'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  getSpecialtyExperienceConfig,
  type SpecialtyConfig,
} from '@/lib/specialties';
import { isModuleRegistered } from '@/components/modules/module-registry';
import {
  Puzzle,
  CheckCircle2,
  Lock,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  Activity,
  Heart,
  TrendingUp,
  Syringe,
  Stethoscope,
  FlaskConical,
  FileText,
  Scan,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// ICON MAP
// ============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Heart,
  TrendingUp,
  Syringe,
  Stethoscope,
  FlaskConical,
  FileText,
  Scan,
  Puzzle,
  Sparkles,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Puzzle;
}

// ============================================================================
// TYPES
// ============================================================================

interface ModuleCardData {
  key: string;
  label: string;
  icon: string;
  description?: string;
  group: string;
  enabled: boolean;
  registered: boolean;
  route: string;
}

// ============================================================================
// GROUP LABELS
// ============================================================================

const GROUP_LABELS: Record<string, string> = {
  clinical: 'Clínica',
  financial: 'Finanzas',
  lab: 'Laboratorio',
  technology: 'Tecnología',
  communication: 'Comunicación',
  growth: 'Crecimiento',
  administrative: 'Administración',
  education: 'Educación',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ModulosPage() {
  const [specialtyConfig, setSpecialtyConfig] = useState<SpecialtyConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: details } = await supabase
        .from('doctor_profiles')
        .select(`
          especialidad:specialties(name, slug),
          profile:profiles!doctor_profiles_profile_id_fkey(
            sacs_especialidad
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

      const config = getSpecialtyExperienceConfig({
        specialtySlug: especialidad?.slug ?? undefined,
        specialtyName: especialidad?.name ?? undefined,
        sacsEspecialidad: profileData?.sacs_especialidad ?? undefined,
      });

      setSpecialtyConfig(config);
      setLoading(false);
    }

    init();
  }, []);

  // Collect all modules from the specialty config
  const { enabledModules, disabledModules } = useMemo(() => {
    if (!specialtyConfig) return { enabledModules: [] as ModuleCardData[], disabledModules: [] as ModuleCardData[] };

    const enabled: ModuleCardData[] = [];
    const disabled: ModuleCardData[] = [];

    for (const [groupKey, modules] of Object.entries(specialtyConfig.modules)) {
      if (!modules) continue;
      for (const mod of modules) {
        const card: ModuleCardData = {
          key: mod.key,
          label: mod.label,
          icon: mod.icon,
          description: mod.settings?.description as string | undefined,
          group: groupKey,
          enabled: mod.enabledByDefault !== false,
          registered: isModuleRegistered(mod.key),
          route: `/dashboard/modulos/${mod.key}`,
        };

        if (card.enabled) {
          enabled.push(card);
        } else {
          disabled.push(card);
        }
      }
    }

    return { enabledModules: enabled, disabledModules: disabled };
  }, [specialtyConfig]);

  const themeColor = specialtyConfig?.theme?.primaryColor ?? '#3B82F6';

  if (loading) {
    return <ModulosPageSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-gray-700 transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="font-medium text-gray-700">Módulos</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Módulos de {specialtyConfig?.name ?? 'tu especialidad'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Herramientas especializadas disponibles para tu práctica médica
        </p>
      </div>

      {/* Enabled modules */}
      {enabledModules.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" style={{ color: themeColor }} />
            Módulos activos
            <span className="text-sm font-normal text-gray-400">
              ({enabledModules.length})
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledModules.map((mod) => (
              <ModuleCard
                key={mod.key}
                module={mod}
                themeColor={themeColor}
              />
            ))}
          </div>
        </section>
      )}

      {/* Disabled / explore modules */}
      {disabledModules.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Explorar más módulos
            <span className="text-sm font-normal text-gray-400">
              ({disabledModules.length})
            </span>
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Módulos adicionales disponibles para tu especialidad que puedes activar
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {disabledModules.map((mod) => (
              <ModuleCard
                key={mod.key}
                module={mod}
                themeColor={themeColor}
                isExplore
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {enabledModules.length === 0 && disabledModules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Puzzle className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            No hay módulos configurados para tu especialidad
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Contacta al administrador para habilitar módulos
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE CARD
// ============================================================================

function ModuleCard({
  module: mod,
  themeColor,
  isExplore = false,
}: {
  module: ModuleCardData;
  themeColor: string;
  isExplore?: boolean;
}) {
  const Icon = getIcon(mod.icon);
  const groupLabel = GROUP_LABELS[mod.group] ?? mod.group;

  const cardContent = (
    <div
      className={`
        relative bg-white rounded-xl border p-5 transition-all duration-150
        ${isExplore
          ? 'border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
        ${mod.registered ? 'cursor-pointer' : 'opacity-60'}
      `}
    >
      {/* Status badge */}
      <div className="absolute top-3 right-3">
        {mod.enabled && mod.registered ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Activo
          </span>
        ) : !mod.registered ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            <Lock className="h-3 w-3" />
            Próximamente
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Disponible
          </span>
        )}
      </div>

      {/* Icon + name */}
      <div className="flex items-start gap-3 mb-3 pr-20">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: isExplore ? '#f3f4f6' : `${themeColor}15`,
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color: isExplore ? '#9ca3af' : themeColor }}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {mod.label}
          </h3>
          <p className="text-xs text-gray-400">{groupLabel}</p>
        </div>
      </div>

      {/* Description */}
      {mod.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{mod.description}</p>
      )}
    </div>
  );

  if (mod.registered) {
    return (
      <Link href={mod.route} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

// ============================================================================
// SKELETON
// ============================================================================

function ModulosPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div>
        <div className="h-7 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-80 bg-gray-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
