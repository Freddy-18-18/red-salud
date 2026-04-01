import { howItWorksContent } from '@/lib/data/public-content';
import { UserPlus, Settings, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  UserPlus,
  Settings,
  Rocket,
};

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {howItWorksContent.heading}
          </h2>
          <p className="mt-4 text-lg text-zinc-400">{howItWorksContent.subtitle}</p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-teal-500/40 via-cyan-500/40 to-blue-500/40" />

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {howItWorksContent.steps.map((step) => {
              const Icon = iconMap[step.iconName];
              return (
                <div key={step.number} className="relative text-center">
                  {/* Number + Icon */}
                  <div className="relative mx-auto mb-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20">
                      {Icon && <Icon className="h-7 w-7 text-teal-400" />}
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-xs font-bold text-white ring-4 ring-zinc-950">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
