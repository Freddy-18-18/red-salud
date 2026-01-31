"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Shield, Zap, Users, Headphones, Lock, Award } from "lucide-react";

const advantages = [
  {
    icon: Shield,
    title: "Garantía de Calidad",
    description: "Todos nuestros profesionales pasan por un riguroso proceso de verificación. Certificados, licencias y antecedentes validados.",
    benefits: [
      "Verificación de credenciales en 48 horas",
      "Revisión de historial profesional",
      "Evaluación continua de desempeño",
    ],
    gradient: "from-blue-600 to-blue-700",
  },
  {
    icon: Zap,
    title: "Rapidez sin Compromisos",
    description: "La velocidad no significa sacrificar calidad. Obtén atención médica profesional en minutos, no en semanas.",
    benefits: [
      "Citas disponibles en menos de 24 horas",
      "Resultados de laboratorio en tiempo récord",
      "Recetas digitales al instante",
    ],
    gradient: "from-teal-600 to-teal-700",
  },
  {
    icon: Users,
    title: "Red de Especialistas",
    description: "Acceso a la red más amplia de profesionales de la salud en Venezuela, desde medicina general hasta especialidades complejas.",
    benefits: [
      "Más de 50 especialidades médicas",
      "Profesionales en todos los estados",
      "Segunda opinión médica disponible",
    ],
    gradient: "from-indigo-600 to-indigo-700",
  },
  {
    icon: Headphones,
    title: "Soporte Dedicado",
    description: "Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda o inconveniente técnico.",
    benefits: [
      "Chat en vivo disponible siempre",
      "Tiempo de respuesta menor a 5 minutos",
      "Soporte en español por venezolanos",
    ],
    gradient: "from-purple-600 to-purple-700",
  },
  {
    icon: Lock,
    title: "Privacidad Total",
    description: "Tu información médica es sagrada. Cumplimos con los más altos estándares internacionales de protección de datos.",
    benefits: [
      "Encriptación de extremo a extremo",
      "Servidores en ubicaciones seguras",
      "Control total sobre quién ve tu información",
    ],
    gradient: "from-pink-600 to-pink-700",
  },
  {
    icon: Award,
    title: "Precios Justos",
    description: "Transparencia total en costos. Sin sorpresas, sin letra pequeña, sin cargos ocultos. Pagas exactamente lo que ves.",
    benefits: [
      "Precios publicados antes de agendar",
      "Sin comisiones ocultas",
      "Planes flexibles de pago",
    ],
    gradient: "from-orange-600 to-orange-700",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white via-gray-50 to-white dark:from-background dark:via-slate-900/30 dark:to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-grid-gray-900/[0.04] dark:bg-grid-white/[0.02] bg-[size:32px_32px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-800"
          >
            Ventajas competitivas
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-foreground mb-6 leading-tight"
          >
            Más que una plataforma,{" "}
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              un compromiso
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 dark:text-muted-foreground leading-relaxed"
          >
            Descubre las ventajas que nos hacen la opción preferida por miles de venezolanos
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {advantages.map((advantage) => {
            const Icon = advantage.icon;
            return (
              <motion.div
                key={advantage.title}
                variants={fadeInUp}
                className="group"
              >
                <div className="h-full bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-blue-400 dark:hover:border-blue-600">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${advantage.gradient} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-3">
                    {advantage.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-muted-foreground leading-relaxed mb-6">
                    {advantage.description}
                  </p>

                  {/* Benefits List */}
                  <ul className="space-y-3">
                    {advantage.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${advantage.gradient} flex items-center justify-center`}>
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Decorative line */}
                  <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${advantage.gradient} transition-all duration-500 group-hover:w-full rounded-b-2xl`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
