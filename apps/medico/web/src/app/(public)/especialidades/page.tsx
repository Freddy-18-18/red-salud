import type { Metadata } from 'next';
import Link from 'next/link';
import { specialtyCategories } from '@/lib/data/specialties-public';
import { CtaSection } from '@/components/public/cta-section';
import {
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Bone,
  Baby,
  HeartPulse,
  Eye,
  Fingerprint,
  Droplet,
  SmilePlus,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Especialidades — Red Salud',
  description:
    'Más de 132 especialidades médicas soportadas. Cada una con módulos, formularios y KPIs específicos para tu área.',
};

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Bone,
  Baby,
  HeartPulse,
  Eye,
  Fingerprint,
  Droplet,
  SmilePlus,
};

const colorBgMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-400',
  red: 'bg-red-500/10 text-red-400',
  purple: 'bg-purple-500/10 text-purple-400',
  orange: 'bg-orange-500/10 text-orange-400',
  sky: 'bg-sky-500/10 text-sky-400',
  pink: 'bg-pink-500/10 text-pink-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  teal: 'bg-teal-500/10 text-teal-400',
  violet: 'bg-violet-500/10 text-violet-400',
};

const colorTextMap: Record<string, string> = {
  blue: 'text-blue-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  sky: 'text-sky-400',
  pink: 'text-pink-400',
  cyan: 'text-cyan-400',
  teal: 'text-teal-400',
  violet: 'text-violet-400',
};

export default function EspecialidadesPage() {
  return (
    <div className="pt-24">
      {/* Header */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            132+ Especialidades Médicas
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Cada especialidad activa sus propios módulos, formularios, KPIs y flujos de trabajo.
            Encontrá la tuya y descubrí cómo Red Salud se adapta a vos.
          </p>
          <p className="mt-3 text-base text-zinc-500">
            Hacé clic en cualquier especialidad para ver sus módulos, métricas y flujos de trabajo en detalle.
          </p>
        </div>
      </section>

      {/* Categories and specialties */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {specialtyCategories.map((category) => (
            <div key={category.id}>
              <h2 className="text-2xl font-bold text-white mb-6">{category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.specialties.map((spec) => {
                  const Icon = iconMap[spec.iconName] ?? Stethoscope;
                  const colorClasses = colorBgMap[spec.accentColor] ?? colorBgMap.teal;
                  const textColor = colorTextMap[spec.accentColor] ?? colorTextMap.teal;
                  const hasDetailPage = !!spec.heroTitle;

                  const CardContent = (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{spec.name}</h3>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                        {spec.shortDescription}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {spec.keyModules.map((mod) => (
                          <span
                            key={mod}
                            className="inline-flex rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-zinc-400"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                      {hasDetailPage && (
                        <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${textColor} group-hover:underline`}>
                          Ver detalle
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      )}
                    </>
                  );

                  if (hasDetailPage) {
                    return (
                      <Link
                        key={spec.slug}
                        href={`/especialidades/${spec.slug}`}
                        className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 block"
                      >
                        {CardContent}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={spec.slug}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                    >
                      {CardContent}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaSection />
    </div>
  );
}
