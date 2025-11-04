"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const faqs = [
  { q: "¿Cómo puedo agendar una consulta?", a: "Puedes agendar una consulta a través de nuestra plataforma en línea, eligiendo el especialista, fecha y hora que prefieras." },
  { q: "¿Cuánto tiempo dura una consulta virtual?", a: "Las consultas virtuales generalmente duran entre 15 a 30 minutos, dependiendo de la complejidad del caso." },
  { q: "¿Qué necesito para una teleconsulta?", a: "Solo necesitas un dispositivo con cámara, conexión a internet estable y la aplicación de Red-Salus instalada." },
  { q: "¿Puedo cancelar o reprogramar mi cita?", a: "Sí, puedes cancelar o reprogramar tu cita hasta 2 horas antes sin costo adicional." },
  { q: "¿Los médicos están certificados?", a: "Todos nuestros profesionales están certificados y cuentan con licencias vigentes en sus especialidades." },
  { q: "¿Cómo accedo a mi historial médico?", a: "Puedes acceder a tu historial médico completo desde tu perfil en la plataforma, disponible 24/7." },
  { q: "¿Aceptan seguros médicos?", a: "Trabajamos con las principales aseguradoras. Consulta la lista completa en nuestra sección de Precios." },
  { q: "¿Qué hago en caso de emergencia?", a: "En casos de emergencia, llama al 911 inmediatamente. Nuestro servicio es para consultas no urgentes." },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[50px_50px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6 font-(family-name:--font-poppins)">Preguntas Frecuentes</motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-blue-100">Encuentra respuestas rápidas a las preguntas más comunes</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold hover:text-blue-600">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
