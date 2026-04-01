import {
  CalendarClock,
  Stethoscope,
  Pill,
  ClipboardList,
  BrainCircuit,
  Calendar,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FeatureDetailed } from '@/lib/data/features-data';
import { HighlightCard } from './highlight-card';

const featureIconMap: Record<string, LucideIcon> = {
  CalendarClock,
  Stethoscope,
  Pill,
  ClipboardList,
  BrainCircuit,
  Calendar,
  BarChart3,
  ShieldCheck,
};

const accentStyles: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    tagBg: string;
    tagText: string;
    sectionBg: string;
    glowFrom: string;
    glowTo: string;
    border: string;
    specBg: string;
    specText: string;
  }
> = {
  teal: {
    iconBg: 'bg-teal-500/20',
    iconText: 'text-teal-400',
    tagBg: 'bg-teal-500/10 border-teal-500/20',
    tagText: 'text-teal-300',
    sectionBg: '',
    glowFrom: 'bg-teal-500/8',
    glowTo: 'bg-cyan-500/5',
    border: 'border-teal-500/20',
    specBg: 'bg-teal-500/10',
    specText: 'text-teal-300',
  },
  cyan: {
    iconBg: 'bg-cyan-500/20',
    iconText: 'text-cyan-400',
    tagBg: 'bg-cyan-500/10 border-cyan-500/20',
    tagText: 'text-cyan-300',
    sectionBg: 'bg-zinc-900/30',
    glowFrom: 'bg-cyan-500/8',
    glowTo: 'bg-blue-500/5',
    border: 'border-cyan-500/20',
    specBg: 'bg-cyan-500/10',
    specText: 'text-cyan-300',
  },
  violet: {
    iconBg: 'bg-violet-500/20',
    iconText: 'text-violet-400',
    tagBg: 'bg-violet-500/10 border-violet-500/20',
    tagText: 'text-violet-300',
    sectionBg: '',
    glowFrom: 'bg-violet-500/8',
    glowTo: 'bg-purple-500/5',
    border: 'border-violet-500/20',
    specBg: 'bg-violet-500/10',
    specText: 'text-violet-300',
  },
  blue: {
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    tagBg: 'bg-blue-500/10 border-blue-500/20',
    tagText: 'text-blue-300',
    sectionBg: 'bg-zinc-900/30',
    glowFrom: 'bg-blue-500/8',
    glowTo: 'bg-indigo-500/5',
    border: 'border-blue-500/20',
    specBg: 'bg-blue-500/10',
    specText: 'text-blue-300',
  },
  purple: {
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    tagBg: 'bg-purple-500/10 border-purple-500/20',
    tagText: 'text-purple-300',
    sectionBg: '',
    glowFrom: 'bg-purple-500/8',
    glowTo: 'bg-fuchsia-500/5',
    border: 'border-purple-500/20',
    specBg: 'bg-purple-500/10',
    specText: 'text-purple-300',
  },
  orange: {
    iconBg: 'bg-orange-500/20',
    iconText: 'text-orange-400',
    tagBg: 'bg-orange-500/10 border-orange-500/20',
    tagText: 'text-orange-300',
    sectionBg: 'bg-zinc-900/30',
    glowFrom: 'bg-orange-500/8',
    glowTo: 'bg-amber-500/5',
    border: 'border-orange-500/20',
    specBg: 'bg-orange-500/10',
    specText: 'text-orange-300',
  },
  sky: {
    iconBg: 'bg-sky-500/20',
    iconText: 'text-sky-400',
    tagBg: 'bg-sky-500/10 border-sky-500/20',
    tagText: 'text-sky-300',
    sectionBg: '',
    glowFrom: 'bg-sky-500/8',
    glowTo: 'bg-blue-500/5',
    border: 'border-sky-500/20',
    specBg: 'bg-sky-500/10',
    specText: 'text-sky-300',
  },
  emerald: {
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    tagBg: 'bg-emerald-500/10 border-emerald-500/20',
    tagText: 'text-emerald-300',
    sectionBg: 'bg-zinc-900/30',
    glowFrom: 'bg-emerald-500/8',
    glowTo: 'bg-green-500/5',
    border: 'border-emerald-500/20',
    specBg: 'bg-emerald-500/10',
    specText: 'text-emerald-300',
  },
};

interface FeatureSectionProps {
  feature: FeatureDetailed;
  index: number;
}

export function FeatureSection({ feature, index }: FeatureSectionProps) {
  const Icon = featureIconMap[feature.iconName] ?? CalendarClock;
  const styles = accentStyles[feature.accentColor] ?? accentStyles.teal;
  const isReversed = index % 2 !== 0;

  return (
    <section
      id={feature.slug}
      className={`relative scroll-mt-32 overflow-hidden py-20 sm:py-28 ${styles.sectionBg}`}
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute ${isReversed ? 'right-0 top-1/4' : 'left-0 top-1/3'} h-[500px] w-[500px] rounded-full ${styles.glowFrom} blur-[160px]`}
        />
        <div
          className={`absolute ${isReversed ? 'left-1/4 bottom-0' : 'right-1/4 bottom-1/4'} h-[300px] w-[300px] rounded-full ${styles.glowTo} blur-[120px]`}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header: icon, title, tagline */}
        <div
          className={`flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:gap-8 ${isReversed ? 'lg:flex-row-reverse' : ''}`}
        >
          {/* Left column: text content */}
          <div className="flex-1">
            {/* Icon + badge */}
            <div className="mb-6 flex items-center gap-4">
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${styles.iconBg}`}
              >
                <Icon className={`h-7 w-7 ${styles.iconText}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {feature.title}
                </h2>
                <p className={`mt-0.5 text-sm font-medium ${styles.iconText}`}>
                  {feature.tagline}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
              {feature.longDescription}
            </p>

            {/* Specialty examples */}
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className={`h-4 w-4 ${styles.iconText}`} />
                <span className="text-sm font-medium text-zinc-300">
                  Adaptado por especialidad
                </span>
              </div>
              <div className="space-y-3">
                {feature.specialtyExamples.map((example) => (
                  <div
                    key={example.specialty}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.specBg} ${styles.specText}`}
                    >
                      {example.specialty}
                    </span>
                    <p className="mt-1.5 text-sm text-zinc-400">
                      {example.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: highlights grid */}
          <div className="w-full lg:w-[480px] xl:w-[520px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {feature.highlights.map((highlight) => (
                <HighlightCard
                  key={highlight.title}
                  highlight={highlight}
                  accentColor={feature.accentColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
