'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { allShowcaseSpecialties, type PublicSpecialty } from '@/lib/data/specialties-public';
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
  ChevronRight,
  Layers,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

const colorMap: Record<string, { bg: string; text: string; border: string; pill: string; ring: string }> = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    pill: 'bg-blue-500/20 text-blue-300',
    ring: 'ring-blue-500/30',
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    pill: 'bg-red-500/20 text-red-300',
    ring: 'ring-red-500/30',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    pill: 'bg-purple-500/20 text-purple-300',
    ring: 'ring-purple-500/30',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    pill: 'bg-orange-500/20 text-orange-300',
    ring: 'ring-orange-500/30',
  },
  sky: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    pill: 'bg-sky-500/20 text-sky-300',
    ring: 'ring-sky-500/30',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    pill: 'bg-pink-500/20 text-pink-300',
    ring: 'ring-pink-500/30',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    pill: 'bg-cyan-500/20 text-cyan-300',
    ring: 'ring-cyan-500/30',
  },
  teal: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
    pill: 'bg-teal-500/20 text-teal-300',
    ring: 'ring-teal-500/30',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    pill: 'bg-violet-500/20 text-violet-300',
    ring: 'ring-violet-500/30',
  },
};

function getColors(accentColor: string) {
  return colorMap[accentColor] ?? colorMap.teal;
}

function SpecialtyDetail({ specialty }: { specialty: PublicSpecialty }) {
  const colors = getColors(specialty.accentColor);
  const Icon = iconMap[specialty.iconName] ?? Stethoscope;

  return (
    <div className="rs-fade-in-up">
      <div className={`rounded-2xl border ${colors.border} bg-white/5 p-8 backdrop-blur-sm`}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${colors.bg}`}>
                <Icon className={`h-7 w-7 ${colors.text}`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{specialty.name}</h3>
                <span className={`text-sm ${colors.text}`}>{specialty.category}</span>
              </div>
            </div>
            <p className="text-zinc-400 leading-relaxed mb-6">{specialty.shortDescription}</p>

            {/* KPIs */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className={`h-4 w-4 ${colors.text}`} />
                <span className="text-sm font-medium text-zinc-300">KPIs que seguís</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialty.keyKPIs.map((kpi) => (
                  <span
                    key={kpi}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${colors.pill}`}
                  >
                    {kpi}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Modules */}
          <div className="lg:w-80">
            <div className="flex items-center gap-2 mb-4">
              <Layers className={`h-4 w-4 ${colors.text}`} />
              <span className="text-sm font-medium text-zinc-300">Módulos incluidos</span>
            </div>
            <div className="space-y-2">
              {specialty.keyModules.map((mod) => (
                <div
                  key={mod}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <ChevronRight className={`h-4 w-4 ${colors.text} shrink-0`} />
                  <span className="text-sm text-zinc-300">{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpecialtyShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const active = allShowcaseSpecialties[activeIndex];

  useEffect(() => {
    if (scrollRef.current) {
      const activeButton = scrollRef.current.children[activeIndex] as HTMLElement | undefined;
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <section id="especialidades" className="py-24 sm:py-32 bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Se adapta a <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">TU</span> especialidad
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            No es un sistema genérico. Cada especialidad activa sus propios módulos, formularios,
            KPIs y flujos de trabajo. Así trabaja un médico de verdad.
          </p>
        </div>

        {/* Specialty pills */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide snap-x"
        >
          {allShowcaseSpecialties.map((spec, i) => {
            const colors = getColors(spec.accentColor);
            const Icon = iconMap[spec.iconName] ?? Stethoscope;
            const isActive = i === activeIndex;
            return (
              <button
                key={spec.slug}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 snap-start inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `${colors.pill} ring-1 ${colors.ring}`
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {spec.name}
              </button>
            );
          })}
        </div>

        {/* Active specialty detail */}
        {active && (
          <SpecialtyDetail key={active.slug} specialty={active} />
        )}

        {/* Link to all specialties */}
        <div className="mt-10 text-center">
          <Link
            href="/especialidades"
            className="group inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors duration-200"
          >
            Ver todas las 130+ especialidades
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
