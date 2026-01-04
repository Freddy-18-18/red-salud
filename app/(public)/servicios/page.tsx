"use client";

import { motion } from "framer-motion";
import {
  Stethoscope,
  Brain,
  Heart,
  Activity,
  Eye,
  Baby,
  Bone,
  Pill,
  Syringe,
  Microscope,
  Smile,
  RadioTower,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const services = [
  {
    icon: Stethoscope,
    title: "Medicina General",
    description: "Consultas médicas generales, diagnósticos y tratamientos para enfermedades comunes.",
    features: ["Consultas virtuales", "Recetas electrónicas", "Seguimiento continuo"],
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Heart,
    title: "Cardiología",
    description: "Especialistas en salud cardiovascular, prevención y tratamiento de enfermedades del corazón.",
    features: ["Electrocardiogramas", "Monitoreo cardíaco", "Planes preventivos"],
    gradient: "from-red-500 to-rose-600",
  },
  {
    icon: Brain,
    title: "Neurología",
    description: "Diagnóstico y tratamiento de trastornos del sistema nervioso y cerebro.",
    features: ["Consultas especializadas", "Estudios neurológicos", "Terapias avanzadas"],
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: Baby,
    title: "Pediatría",
    description: "Atención médica especializada para niños desde recién nacidos hasta adolescentes.",
    features: ["Control de niño sano", "Vacunación", "Emergencias pediátricas"],
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Eye,
    title: "Oftalmología",
    description: "Cuidado integral de la salud visual y tratamiento de enfermedades oculares.",
    features: ["Exámenes visuales", "Cirugía refractiva", "Tratamiento de cataratas"],
    gradient: "from-teal-500 to-green-600",
  },
  {
    icon: Bone,
    title: "Traumatología",
    description: "Especialistas en lesiones, fracturas y enfermedades del sistema musculoesquelético.",
    features: ["Evaluación de lesiones", "Rehabilitación", "Cirugía ortopédica"],
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Activity,
    title: "Medicina Deportiva",
    description: "Prevención, diagnóstico y tratamiento de lesiones relacionadas con el deporte.",
    features: ["Evaluación física", "Planes de entrenamiento", "Recuperación deportiva"],
    gradient: "from-lime-500 to-green-600",
  },
  {
    icon: Smile,
    title: "Odontología",
    description: "Cuidado dental completo, desde prevención hasta tratamientos estéticos.",
    features: ["Limpieza dental", "Ortodoncia", "Implantes dentales"],
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: Pill,
    title: "Farmacología",
    description: "Asesoría sobre medicamentos, interacciones y terapias farmacológicas.",
    features: ["Consultas farmacéuticas", "Gestión de medicamentos", "Programas adherencia"],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Microscope,
    title: "Laboratorio Clínico",
    description: "Análisis clínicos y pruebas diagnósticas con resultados rápidos y precisos.",
    features: ["Análisis de sangre", "Pruebas genéticas", "Estudios especializados"],
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: Syringe,
    title: "Vacunación",
    description: "Programas de inmunización para todas las edades con vacunas certificadas.",
    features: ["Vacunas infantiles", "Vacunas de viaje", "Inmunización adultos"],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: RadioTower,
    title: "Telemedicina",
    description: "Consultas médicas remotas con tecnología de última generación.",
    features: ["Videoconsultas HD", "Chat médico 24/7", "Expediente digital"],
    gradient: "from-cyan-500 to-blue-600",
  },
];

export default function ServiciosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[50px_50px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-6"
            >
              Servicios Médicos Especializados
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-(family-name:--font-poppins)"
            >
              Atención Médica{" "}
              <span className="bg-linear-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Integral
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Más de 50 especialidades médicas a tu disposición, con profesionales
              certificados y tecnología de vanguardia para cuidar tu salud.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6"
              >
                <Link href={ROUTES.CONTACTO}>Agendar Consulta</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.title} variants={fadeInUp}>
                  <Card className="h-full group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200 overflow-hidden">
                    {/* Gradient bar */}
                    <div className={`h-2 bg-linear-to-r ${service.gradient}`} />

                    <CardHeader className="pb-4">
                      <div
                        className={`inline-flex p-3 rounded-xl bg-linear-to-br ${service.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 font-(family-name:--font-poppins)">
                        {service.title}
                      </h3>
                    </CardHeader>

                    <CardContent>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {service.description}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <svg
                              className="h-5 w-5 text-green-500 shrink-0 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors"
                      >
                        <Link href={ROUTES.CONTACTO}>Más Información</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-linear-to-r from-blue-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 font-(family-name:--font-poppins)">
              ¿No encuentras el servicio que buscas?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Contáctanos y te ayudaremos a encontrar el especialista adecuado para ti.
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white text-blue-600 hover:bg-blue-50 border-0 text-lg px-8 py-6"
            >
              <Link href={ROUTES.CONTACTO}>Contactar Soporte</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

