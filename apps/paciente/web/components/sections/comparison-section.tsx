"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Check } from "lucide-react";

const comparisons = [
  {
    feature: "Verificación de profesionales",
    traditional: "Limitada o inexistente",
    redSalud: "100% verificados",
  },
  {
    feature: "Tiempo de espera para cita",
    traditional: "2-4 semanas",
    redSalud: "Menos de 24 horas",
  },
  {
    feature: "Transparencia de precios",
    traditional: "Desconocido hasta la consulta",
    redSalud: "Visible antes de agendar",
  },
  {
    feature: "Acceso a especialistas",
    traditional: "Solo en tu ciudad",
    redSalud: "En todo Venezuela",
  },
  {
    feature: "Historial médico unificado",
    traditional: "Papeles dispersos",
    redSalud: "Digital y centralizado",
  },
  {
    feature: "Recetas médicas",
    traditional: "Solo en papel",
    redSalud: "Digitales e integradas",
  },
  {
    feature: "Resultados de laboratorio",
    traditional: "Ir a buscarlos físicamente",
    redSalud: "Notificación automática",
  },
  {
    feature: "Soporte al paciente",
    traditional: "Horario de oficina",
    redSalud: "24/7 disponible",
  },
];

export function ComparisonSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900/50 dark:to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-800"
          >
            Comparación
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-foreground mb-6 leading-tight"
          >
            Red-Salud vs{" "}
            <span className="bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
              Sistemas tradicionales
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 dark:text-muted-foreground leading-relaxed"
          >
            Descubre por qué miles de venezolanos están eligiendo la salud digital
          </motion.p>
        </motion.div>

        <motion.div
          className="max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-border bg-white dark:bg-card shadow-xl">
            <div className="grid grid-cols-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6">
              <div className="font-bold text-lg">Característica</div>
              <div className="font-bold text-lg text-center">Sistema Tradicional</div>
              <div className="font-bold text-lg text-center">Red-Salud</div>
            </div>
            {comparisons.map((comparison, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`grid grid-cols-3 p-6 items-center ${
                  index % 2 === 0 ? "bg-gray-50/50 dark:bg-slate-900/20" : "bg-white dark:bg-card"
                } transition-all duration-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20`}
              >
                <div className="font-semibold text-gray-900 dark:text-foreground pr-4">
                  {comparison.feature}
                </div>
                <div className="text-center text-gray-600 dark:text-gray-400">
                  {comparison.traditional}
                </div>
                <div className="text-center flex items-center justify-center gap-2">
                  <Check className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold text-teal-700 dark:text-teal-300">
                    {comparison.redSalud}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {comparisons.map((comparison, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-2xl p-6 shadow-lg"
              >
                <h3 className="font-bold text-gray-900 dark:text-foreground mb-4 text-lg">
                  {comparison.feature}
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Sistema Tradicional
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {comparison.traditional}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-border">
                    <div className="text-sm text-teal-600 dark:text-teal-400 mb-1 font-semibold">
                      Con Red-Salud
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <span className="font-semibold text-teal-700 dark:text-teal-300">
                        {comparison.redSalud}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
                ¿Listo para el cambio?
              </div>
              <div className="text-gray-600 dark:text-muted-foreground">
                Únete a los miles que ya están experimentando la diferencia
              </div>
            </div>
            <a
              href="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              Crear cuenta gratis
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
