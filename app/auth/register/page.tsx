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
    <div className="h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-linear-to-br from-gray-50 to-blue-50">
      <motion.div
        className="w-full max-w-7xl h-full flex flex-col"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between mb-4">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          
          <p className="text-base sm:text-lg text-gray-600">
            Selecciona tu tipo de cuenta
          </p>
          
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2">
            <div className="bg-linear-to-br from-blue-600 to-teal-600 text-white px-3 py-2 rounded-lg font-bold text-xl">
              RS
            </div>
            <span className="font-bold text-2xl text-gray-900 hidden sm:inline">{APP_NAME}</span>
          </Link>
        </motion.div>

        {/* Grid responsivo - máximo 4 columnas */}
        <div className="flex-1 px-2 flex items-center justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-6xl w-full">
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
                    <Card className="h-full border-2 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center h-full text-center gap-3">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br ${role.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          {role.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3 hidden sm:block">
                          {role.description}
                        </p>
                        <div className="mt-auto pt-2 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                          Continuar →
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <motion.p variants={fadeInUp} className="mt-6 text-center text-sm sm:text-base text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Inicia sesión
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
