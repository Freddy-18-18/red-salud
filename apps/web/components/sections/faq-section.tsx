'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@red-salud/ui";
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Cómo Funciona',
    items: [
      {
        question: '¿Cómo funciona una videoconsulta?',
        answer: 'Una videoconsulta es una cita médica virtual a través de videollamada HD. Simplemente accedes a tu cuenta, entras a la videosala a la hora acordada, y conectas con tu médico. El proceso es exactamente igual que una consulta presencial: describes tus síntomas, el médico te examina usando herramientas disponibles, y recibes diagnóstico y tratamiento. Toda la consulta queda registrada en tu historial digital.',
      },
      {
        question: '¿Qué necesito para una videoconsulta?',
        answer: 'Solo necesitas un dispositivo con cámara y micrófono (computadora, tablet o smartphone), conexión a internet estable (mínimo 2Mbps), y la app de Red Salud o acceso web. No necesitas descargar programas adicionales. Recomendamos hacer la consulta en un lugar privado y tranquilo.',
      },
      {
        question: '¿Cuánto tiempo dura una consulta?',
        answer: 'Nuestras videoconsultas tienen una duración promedio de 15-20 minutos para consultas generales y 20-30 minutos para especialidades. El tiempo es flexible según la complejidad de tu caso. Si necesitas más tiempo, el médico puede extender la consulta.',
      },
    ],
  },
  {
    category: 'Precios y Pagos',
    items: [
      {
        question: '¿Cuánto cuesta una consulta?',
        answer: 'Los precios varían según la especialidad y el médico. En promedio, una consulta de medicina general cuesta entre $10-$20 USD, mientras que especialistas pueden costar entre $20-$50 USD. Todos los precios están claramente indicados en la plataforma antes de que agendes tu cita. Además, ofrecemos planes de suscripción con descuentos de hasta 40%.',
      },
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos múltiples métodos: tarjetas de crédito/débito (Visa, Mastercard), transferencias bancarias, y billeteras digitales. Todos los pagos son procesados de forma segura con encriptación de nivel bancario. Recibiendo un recibo digital automáticamente.',
      },
      {
        question: '¿Puedo usar mi seguro médico?',
        answer: 'Sí, trabajamos con varias aseguradoras en Venezuela. Si tienes póliza con alguna de nuestras aseguradoras aliadas, puedes usar tu cobertura. Verifica con tu aseguradora qué coberturas tienes en telemedicina y confirma con nosotros antes de agendar.',
      },
    ],
  },
  {
    category: 'Seguridad y Privacidad',
    items: [
      {
        question: '¿Mis datos médicos están seguros?',
        answer: 'Absolutamente. Utilizamos encriptación AES-256 de grado militar, cumplimos con estándares HIPAA, ISO 27001 y regulaciones locales de protección de datos. Tu historial está protegido por múltiples capas de seguridad y acceso controlado. Solo los médicos que tratas pueden ver tu información con tu consentimiento.',
      },
      {
        question: '¿Quién puede ver mi historial médico?',
        answer: 'Solo tú y los médicos con los que consultas pueden acceder a tu historial. Tú tienes control total sobre qué información compartir. Puedes permitir que especialistas vean información anterior, pero siempre bajo tu consentimiento explícito. Hay un registro de auditoría de quién accedió a tus datos.',
      },
      {
        question: '¿Qué pasa con mis datos después de cerrar mi cuenta?',
        answer: 'Tu historial médico se mantiene almacenado según requisitos legales de retención. Puedes solicitar la exportación de tus datos en cualquier momento. Si deseas eliminación completa de tu cuenta, procederemos con la eliminación segura de tus datos personales mientras mantenemos registros históricos según la ley.',
      },
    ],
  },
  {
    category: 'Atención Médica',
    items: [
      {
        question: '¿Las recetas digitales son válidas?',
        answer: 'Sí, completamente válidas. Nuestras recetas médicas digitales tienen firma electrónica certificada y son reconocidas por todas las farmacias afiliadas a nuestra red. Puedes descargarlas en PDF, guardarlas en tu teléfono o enviarlas directamente a tu farmacia de confianza.',
      },
      {
        question: '¿Qué hago si necesito exámenes de laboratorio?',
        answer: 'Si el médico lo indica, puedes agendar los exámenes directamente desde la plataforma con nuestros laboratorios afiliados. Recibes un voucher digital, acudes al laboratorio (o solicitamos toma domiciliaria), y los resultados se suben automáticamente a tu historial en 24-48 horas.',
      },
      {
        question: '¿Puedo obtener una segunda opinión?',
        answer: 'Claro, es tu derecho. Puedes consultar con otros médicos para obtener una segunda opinión. Todos tus archivos anteriores están disponibles para compartir. Algunos especialistas incluso ofrecen paquetes específicos de segunda opinión.',
      },
    ],
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 mb-6">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Preguntas Frecuentes
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Respondemos tus dudas
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Encuentra respuestas rápidas a las preguntas más comunes sobre nuestro servicio
          </p>
        </div>

        {/* FAQ by Category */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {faqs.map((category) => (
            <div key={category.category}>
              {/* Category Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-teal-500 rounded-full" />
                {category.category}
              </h3>

              {/* Accordion */}
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, index) => {
                  const itemId = `faq-${category.category.toLowerCase().replace(/\s+/g, '-')}-${index}`;
                  return (
                    <AccordionItem
                      key={itemId}
                      value={itemId}
                      id={itemId}
                      className="border border-gray-200 dark:border-slate-700 rounded-lg mb-3 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors data-[state=open]:bg-blue-50 dark:data-[state=open]:bg-blue-900/20">
                        <span className="text-left font-semibold text-gray-900 dark:text-white">
                          {item.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ¿Aún tienes dudas?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Nuestro equipo de soporte está disponible 24/7 para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Contactar Soporte
            </a>
            <a
              href="#"
              className="px-6 py-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Ver Centro de Ayuda
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
