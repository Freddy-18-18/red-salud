"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  UserCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Hospital,
  Shield,
  Ambulance,
  UserCog,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ROLE_CONFIG, USER_ROLES, type UserRole, ROUTES } from "@/lib/constants";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { fadeInUp, staggerContainer } from "@/lib/animations";

/**
 * Página de selección de rol para Registro
 * Rediseñada para soportar modo oscuro y consistencia visual con la página de login
 */

// Mapa de iconos
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Hospital,
  Shield,
  Ambulance,
  UserCog,
};

const roles = [
  {
    id: "paciente",
    name: "Paciente",
    description: "Accede a consultas médicas y gestiona tu salud",
    icon: "UserCircle",
  },
  {
    id: "medico",
    name: "Médico",
    description: "Atiende pacientes y gestiona tu agenda profesional",
    icon: "Stethoscope",
  },
  {
    id: "clinica",
    name: "Clínica",
    description: "Administra tu centro médico y equipo de profesionales",
    icon: "Hospital",
  },
  {
    id: "farmacia",
    name: "Farmacia",
    description: "Gestiona recetas y ventas de medicamentos",
    icon: "Pill",
  },
  {
    id: "laboratorio",
    name: "Laboratorio",
    description: "Procesa exámenes y resultados médicos",
    icon: "FlaskConical",
  },
  {
    id: "ambulancia",
    name: "Ambulancia",
    description: "Servicio de emergencias y traslados médicos",
    icon: "Ambulance",
  },
  {
    id: "seguro",
    name: "Seguro",
    description: "Administra pólizas y cobertura médica",
    icon: "Shield",
  },
  {
    id: "secretaria",
    name: "Secretaria Médica",
    description: "Gestiona agenda y pacientes del médico",
    icon: "UserCog",
  },
];

export default function RegisterPage() {
  const roleObjects = roles.map((role) => ({
    ...role,
    config: ROLE_CONFIG[role.id as UserRole],
  }));
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-purple-500/30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <Link href={ROUTES.HOME} className="hover:opacity-80 transition-opacity">
          <Logo size="lg" />
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Crear Cuenta
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecciona tu tipo de cuenta para registrarte en la plataforma integral de servicios de salud
          </p>
        </div>

        {/* Grid de roles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {roleObjects.map((role) => {
            const Icon = iconMap[role.icon];

            return (
              <Link key={role.id} href={`/register/${role.id}`} className="block h-full group">
                <Card className="h-full p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 bg-card/50 backdrop-blur-sm border-muted/40">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icono */}
                    <div className="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors text-primary ring-1 ring-primary/20 group-hover:ring-primary/40">
                      {Icon && (
                        <Icon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {role.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-snug">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer - Link a login */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <p className="text-muted-foreground text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
