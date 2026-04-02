import type { Metadata } from 'next';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { PricingCards } from '@/components/public/pricing-cards';

export const metadata: Metadata = {
  title: 'Precios — Red Salud',
  description:
    'Plan gratuito o profesional a $40/mes para tu consultorio médico. 30% de descuento con plan anual.',
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
            Un precio simple para tu consultorio
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Comenzá gratis y pasá al plan Profesional cuando estés listo. Sin contratos, sin
            compromisos.
          </p>
        </div>
      </section>

      {/* Pricing toggle + cards (client component) */}
      <section className="pb-24">
        <PricingCards />
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
