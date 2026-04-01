import type { Metadata } from 'next';
import Link from 'next/link';
import { pricingTiers } from '@/lib/data/pricing-data';
import { Check, HelpCircle, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Precios — Red Salud',
  description:
    'Planes flexibles para tu práctica médica. Comenzá gratis y escalá cuando lo necesites.',
};

const faqs = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer:
      'Sí, podés actualizar o cambiar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se ajusta el cobro proporcionalmente.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer:
      'Absolutamente. Usamos encriptación de grado médico, cumplimos con estándares de protección de datos de salud y toda la información se almacena en servidores seguros.',
  },
  {
    question: '¿Necesito instalar algo?',
    answer:
      'No. Red Salud funciona completamente en tu navegador web. Accedé desde cualquier dispositivo con conexión a internet.',
  },
  {
    question: '¿Qué pasa con mis datos si cancelo?',
    answer:
      'Tus datos te pertenecen. Podés exportarlos en cualquier momento y mantenemos tu información por 90 días después de la cancelación.',
  },
  {
    question: '¿Ofrecen descuentos para residentes o médicos rurales?',
    answer:
      'Sí, tenemos programas especiales con descuentos significativos para médicos residentes, profesionales en zonas rurales y organizaciones sin fines de lucro. Contactanos para más información.',
  },
];

export default function PreciosPage() {
  return (
    <div className="pt-24">
      {/* Header */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Planes para cada práctica
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Comenzá gratis y escalá cuando tu consultorio lo necesite. Sin contratos, sin
            compromisos.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 backdrop-blur-sm transition-colors duration-300 ${
                  tier.highlighted
                    ? 'border-teal-500/50 bg-teal-500/5 shadow-xl shadow-teal-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-1 text-xs font-semibold text-white">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                    {tier.period && (
                      <span className="text-zinc-500">{tier.period}</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">{tier.description}</p>
                </div>

                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400'
                      : 'border border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-teal-400" />
              <h2 className="text-2xl font-bold text-white">Preguntas frecuentes</h2>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 text-sm font-medium text-white list-none">
                  {faq.question}
                  <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
