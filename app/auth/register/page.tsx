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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-6xl"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp} className="mb-6">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-center mb-12">
          <Link href={ROUTES.HOME} className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="bg-linear-to-br from-blue-600 to-teal-600 text-white px-3 py-2 rounded-lg font-bold text-xl">
              RS
            </div>
            <span className="font-bold text-2xl text-gray-900">{APP_NAME}</span>
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-3 font-(family-name:--font-poppins)">
            Únete a Red-Salud
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                variants={fadeInUp}
                custom={index}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/auth/register/${role.id}`}>
                  <Card className="h-full border-2 hover:border-blue-400 transition-all duration-300 cursor-pointer group overflow-hidden">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-xl bg-linear-to-br ${role.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {role.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {role.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                        Registrarse
                        <motion.span
                          className="ml-1"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.p variants={fadeInUp} className="mt-8 text-center text-gray-600">
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
