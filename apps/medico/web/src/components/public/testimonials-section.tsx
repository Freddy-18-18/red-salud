import {
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  Users,
} from 'lucide-react';

const trustPoints = [
  {
    icon: Stethoscope,
    title: 'Diseñado por médicos venezolanos',
    description:
      'Cada módulo fue pensado desde la realidad del consultorio venezolano. No es un software genérico traducido — es una herramienta hecha por y para profesionales de la salud en Venezuela.',
  },
  {
    icon: ShieldCheck,
    title: 'Integración SACS real',
    description:
      'Verificación directa contra el Sistema Autónomo de Certificación Sanitaria. Tu registro profesional validado, tu identidad médica protegida.',
  },
  {
    icon: HeartPulse,
    title: 'Especialidades, no genéricos',
    description:
      'Cada especialidad activa módulos, formularios y KPIs propios. Un cardiólogo no ve lo mismo que un odontólogo — porque no trabajan igual.',
  },
  {
    icon: Users,
    title: 'Construido con feedback médico',
    description:
      'Cada funcionalidad se desarrolla en colaboración con profesionales de la salud que validan los flujos de trabajo antes de implementarlos.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Construido con la medicina venezolana en mente
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            No es un software extranjero adaptado. Es una plataforma pensada desde cero
            para cómo trabajan los médicos en Venezuela.
          </p>
        </div>

        {/* Trust grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-teal-500/20 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{point.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{point.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
