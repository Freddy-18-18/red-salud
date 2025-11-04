"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, User, Stethoscope, Building2, Pill, Microscope, Ambulance, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const roles = [
  {
    id: "paciente",
    name: "Paciente",
    description: "Accede a consultas médicas y gestiona tu salud",
    icon: User,
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
  },
  {
    id: "medico",
    name: "Médico",
    description: "Atiende pacientes y gestiona tu agenda profesional",
    icon: Stethoscope,
    gradient: "from-teal-500 to-teal-600",
    bgGradient: "from-teal-50 to-teal-100",
  },
  {
    id: "clinica",
    name: "Clínica",
    description: "Administra tu centro médico y equipo de profesionales",
    icon: Building2,
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
  },
  {
    id: "farmacia",
    name: "Farmacia",
    description: "Gestiona recetas y ventas de medicamentos",
    icon: Pill,
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-50 to-green-100",
  },
  {
    id: "laboratorio",
    name: "Laboratorio",
    description: "Procesa exámenes y resultados médicos",
    icon: Microscope,
    gradient: "from-orange-500 to-orange-600",
    bgGradient: "from-orange-50 to-orange-100",
  },
  {
    id: "ambulancia",
    name: "Ambulancia",
    description: "Servicio de emergencias y traslados médicos",
    icon: Ambulance,
    gradient: "from-red-500 to-red-600",
    bgGradient: "from-red-50 to-red-100",
  },
  {
    id: "seguro",
    name: "Seguro",
    description: "Administra pólizas y cobertura médica",
    icon: Shield,
    gradient: "from-indigo-500 to-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100",
  },
];

export default function RegisterPage() {
  return (
    <div className="h-screen flex items-center justify-center px-4 py-6 overflow-hidden">
      <motion.div
        className="w-full max-w-7xl h-full flex flex-col"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header compacto */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between mb-4">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </Link>
          
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2">
            <div className="bg-linear-to-br from-blue-600 to-teal-600 text-white px-2.5 py-1.5 rounded-lg font-bold text-lg">
              RS
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:inline">{APP_NAME}</span>
          </Link>
          
          <div className="w-16" /> {/* Spacer para centrar */}
        </motion.div>

        {/* Título compacto */}
        <motion.div variants={fadeInUp} className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Únete a Red-Salud
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Selecciona tu tipo de cuenta
          </p>
        </motion.div>

        {/* Grid responsivo - se ajusta al espacio disponible */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 max-h-full pb-4">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  variants={fadeInUp}
                  custom={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-full"
                >
                  <Link href={`/auth/register/${role.id}`} className="block h-full">
                    <Card className="h-full border-2 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center h-full text-center">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${role.gradient} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                          {role.name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 hidden sm:block">
                          {role.description}
                        </p>
                        <div className="mt-2 text-blue-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer compacto */}
        <motion.p variants={fadeInUp} className="mt-4 text-center text-xs sm:text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Inicia sesión
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
