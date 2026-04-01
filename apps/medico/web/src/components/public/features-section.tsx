import { features } from '@/lib/data/features-data';
import {
  CalendarClock,
  Stethoscope,
  Pill,
  ClipboardList,
  BrainCircuit,
  Calendar,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  CalendarClock,
  Stethoscope,
  Pill,
  ClipboardList,
  BrainCircuit,
  Calendar,
  BarChart3,
  ShieldCheck,
};

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Todo lo que necesitás para tu consultorio
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Herramientas clínicas diseñadas por médicos, para médicos. Cada módulo se integra
            perfectamente con el resto.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = iconMap[feature.iconName];
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-teal-500/30 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-400 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-colors duration-300">
                  {Icon && <Icon className="h-6 w-6" />}
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
