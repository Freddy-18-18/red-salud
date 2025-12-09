"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Sparkles, ChevronDown, MessageCircle, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AUTH_ROUTES, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const organizations = [
  {
    name: "Farmacia",
    icon: "💊",
    slug: "farmacias",
    features: ["Recetas electrónicas", "Inventario", "Conexión con médicos"],
  },
  {
    name: "Laboratorio",
    icon: "🔬",
    slug: "laboratorios",
    features: ["Resultados digitales", "Notificaciones", "Historial de pacientes"],
  },
  {
    name: "Clínica",
    icon: "🏥",
    slug: "clinicas",
    features: ["Múltiples médicos", "Gestión centralizada", "Dashboard admin"],
  },
  {
    name: "Ambulancia",
    icon: "🚑",
    slug: "ambulancias",
    features: ["Solicitudes en tiempo real", "Geolocalización", "Coordinación"],
  },
  {
    name: "Seguro",
    icon: "🛡️",
    slug: "seguros",
    features: ["Verificación de cobertura", "Autorizaciones", "Reportes"],
  },
];

const faqs = [
  {
    q: "¿Es realmente gratis para pacientes?",
    a: "Sí. Acceso completo sin costo: historial, citas, recetas, telemedicina y más. Sin límites ni funciones bloqueadas.",
  },
  {
    q: "¿Qué incluye la prueba gratis para médicos?",
    a: "30 días con todas las funcionalidades sin restricciones. No necesitas tarjeta de crédito para comenzar.",
  },
  {
    q: "¿Cómo funciona el plan anual?",
    a: "Pagas $240/año en lugar de $360. El mes te sale a $20 en vez de $30, ahorrando $120 al año.",
  },
  {
    q: "¿Las secretarias pagan?",
    a: "No. Las cuentas de secretaria son gratuitas. Solo necesitan vincularse a un médico con suscripción activa.",
  },
  {
    q: "¿Cómo son los planes empresariales?",
    a: "Personalizados según el tamaño y necesidades de tu organización. Todos incluyen 1 mes gratis para probar la plataforma.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Sin contratos de permanencia ni penalizaciones. Cancela desde tu panel de configuración en cualquier momento.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Cumplimos con estándares de seguridad médica internacionales. Toda la información está encriptada y protegida.",
  },
];

function OrganizationCard({ org }: { org: typeof organizations[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
    >
      <motion.div
        className={cn(
          "p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center transition-all duration-300 overflow-hidden",
          isHovered && "border-teal-500 dark:border-teal-500 shadow-lg"
        )}
        animate={{ height: isHovered ? "auto" : "140px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <span className="text-3xl mb-3 block">{org.icon}</span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-3">
          {org.name}
        </span>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="pt-3 border-t border-zinc-100 dark:border-zinc-800"
            >
              <ul className="space-y-1.5 mb-4">
                {org.features.map((feature) => (
                  <li key={feature} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <Check className="w-3 h-3 text-teal-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full text-xs h-8"
                >
                  <Link href={`/servicios/${org.slug}`}>
                    Ver más
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full border-zinc-300 dark:border-zinc-700 rounded-full text-xs h-8"
                >
                  <Link href={ROUTES.CONTACTO}>
                    Contactar
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function FAQItem({ faq, isOpen, onToggle }: { faq: typeof faqs[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-medium text-zinc-900 dark:text-white pr-4 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {faq.q}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PreciosPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero minimalista */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 mb-6">
              <Sparkles className="w-4 h-4" />
              Precios transparentes
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              Simple y directo
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Sin sorpresas. Sin letras pequeñas. Gratis para pacientes, accesible para profesionales.
            </p>
          </motion.div>

          {/* Toggle elegante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-10 inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                !isAnnual
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2",
                isAnnual
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              Anual
              <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">
                -33%
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Planes principales */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid lg:grid-cols-3 gap-4 lg:gap-0"
          >
            {/* Paciente */}
            <div className="relative p-8 lg:p-10 rounded-3xl lg:rounded-r-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Paciente
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-zinc-900 dark:text-white">Gratis</span>
                </div>
                <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm">
                  Todo lo que necesitas para gestionar tu salud
                </p>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  "Historial médico digital",
                  "Agendar citas médicas",
                  "Recetas electrónicas",
                  "Resultados de laboratorio",
                  "Telemedicina por video",
                  "Mensajería con médicos",
                  "Métricas de salud",
                  "Recordatorios",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-teal-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full h-12"
              >
                <Link href={AUTH_ROUTES.REGISTER}>
                  Crear cuenta gratis
                </Link>
              </Button>
            </div>

            {/* Médico - Destacado */}
            <div className="relative p-8 lg:p-10 rounded-3xl bg-zinc-900 dark:bg-white border-2 border-zinc-900 dark:border-white lg:scale-105 lg:z-10 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-teal-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                  Más popular
                </span>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                  Médico
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white dark:text-zinc-900">
                    ${isAnnual ? "20" : "30"}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500">/mes</span>
                </div>
                {isAnnual && (
                  <p className="mt-2 text-teal-400 dark:text-teal-600 text-sm font-medium">
                    $240/año · Ahorras $120
                  </p>
                )}
                <p className="mt-4 text-zinc-400 dark:text-zinc-500 text-sm">
                  Herramientas completas para tu práctica
                </p>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  "Pacientes ilimitados",
                  "Agenda en línea",
                  "Historial clínico digital",
                  "Recetas electrónicas",
                  "Telemedicina integrada",
                  "Mensajería con pacientes",
                  "Reportes y estadísticas",
                  "Soporte prioritario",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300 dark:text-zinc-600">
                    <Check className="w-4 h-4 text-teal-400 dark:text-teal-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full h-12"
              >
                <Link href={AUTH_ROUTES.REGISTER}>
                  Prueba 30 días gratis
                </Link>
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-3">
                Sin tarjeta de crédito
              </p>
            </div>

            {/* Secretaria */}
            <div className="relative p-8 lg:p-10 rounded-3xl lg:rounded-l-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Secretaria
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-zinc-900 dark:text-white">Gratis</span>
                </div>
                <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm">
                  Gestiona la agenda de tu médico
                </p>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  "Gestión de agenda",
                  "Coordinación de citas",
                  "Comunicación con pacientes",
                  "Recordatorios automáticos",
                  "Acceso al calendario",
                  "Gestión de documentos",
                  "Reportes básicos",
                  "Vinculación con médico",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-teal-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant="outline"
                className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full h-12"
              >
                <Link href={AUTH_ROUTES.REGISTER}>
                  Crear cuenta gratis
                </Link>
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-3">
                Requiere médico suscrito
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Empresas - Cards interactivas */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Para organizaciones
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Planes personalizados con 1 mes de prueba gratis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {organizations.map((org) => (
              <OrganizationCard key={org.slug} org={org} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 text-center"
          >
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Precios según tus necesidades. Comienza con una prueba gratuita.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full h-12 px-8"
              >
                <Link href={ROUTES.CONTACTO}>
                  Contactar ventas
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700 rounded-full h-12 px-8"
              >
                <Link href={AUTH_ROUTES.REGISTER}>
                  Iniciar prueba gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Accordion + Soporte */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-zinc-900 dark:text-white mb-12 text-center"
          >
            Preguntas frecuentes
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </motion.div>

          {/* Bloque de soporte */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 text-center">
              ¿Necesitas más ayuda?
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center mb-8">
              Nuestro equipo está listo para asistirte
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href={ROUTES.CONTACTO}
                className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-3 group-hover:bg-teal-500 transition-colors">
                  <MessageCircle className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Chat en vivo</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Respuesta inmediata</span>
              </Link>

              <Link
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'soporte@red-salud.com'}`}
                className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Email</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Respuesta en 24h</span>
              </Link>

              <Link
                href={ROUTES.SOPORTE}
                className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-colors">
                  <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Centro de ayuda</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Guías y tutoriales</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
            Comienza hoy
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Únete a miles de profesionales y pacientes que ya confían en Red-Salud.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-teal-500 hover:bg-teal-600 text-white rounded-full h-14 px-10 text-base"
          >
            <Link href={AUTH_ROUTES.REGISTER}>
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
