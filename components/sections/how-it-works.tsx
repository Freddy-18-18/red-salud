"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  CheckCircle2,
  UserCircle,
  Pill,
  FlaskConical,
  Briefcase,
  UserCog,
  Hospital,
  HeartPulse,
  Ambulance
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Link from "next/link";

const steps = [
  {
    icon: UserCircle,
    number: "01",
    title: "Regístrate",
    description: "Crea tu cuenta y completa tu perfil en minutos.",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Conéctate",
    description: "Encuentra servicios, agenda citas o gestiona tu consulta.",
  },
  {
    icon: HeartPulse,
    number: "03",
    title: "Aprovecha",
    description: "Accede a todas las funciones de tu rol desde un solo lugar.",
  },
];

const roles = [
  { 
    id: "paciente", 
    name: "Paciente", 
    icon: Users, 
    color: "from-blue-600 to-blue-700",
    href: "/servicios/pacientes",
    description: "Agenda citas y gestiona tu salud"
  },
  { 
    id: "medico", 
    name: "Médico", 
    icon: Stethoscope, 
    color: "from-teal-600 to-teal-700",
    href: "/servicios/medicos",
    description: "Atiende pacientes y administra consultas"
  },
  { 
    id: "farmacia", 
    name: "Farmacia", 
    icon: Pill, 
    color: "from-green-600 to-green-700",
    href: "/servicios/farmacias",
    description: "Gestiona recetas y dispensación"
  },
  { 
    id: "laboratorio", 
    name: "Laboratorio", 
    icon: FlaskConical, 
    color: "from-purple-600 to-purple-700",
    href: "/servicios/laboratorios",
    description: "Procesa muestras y entrega resultados"
  },
  { 
    id: "aseguradora", 
    name: "Aseguradora", 
    icon: Briefcase, 
    color: "from-orange-600 to-orange-700",
    href: "/servicios/seguros",
    description: "Administra pólizas y reembolsos"
  },
  { 
    id: "secretaria", 
    name: "Secretaria", 
    icon: UserCog, 
    color: "from-pink-600 to-pink-700",
    href: "/servicios/secretarias",
    description: "Organiza agendas y apoya al médico"
  },
  { 
    id: "clinica", 
    name: "Clínica", 
    icon: Hospital, 
    color: "from-indigo-600 to-indigo-700",
    href: "/servicios/clinicas",
    description: "Coordina servicios hospitalarios"
  },
  { 
    id: "ambulancia", 
    name: "Ambulancias", 
    icon: Ambulance, 
    color: "from-red-600 to-red-700",
    href: "/servicios/ambulancias",
    description: "Servicio de emergencias médicas"
  },
];

export function HowItWorksSection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-background via-secondary/5 to-background dark:from-background dark:via-background dark:to-background relative overflow-hidden">
      {/* Fondo sutil animado */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-block px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-semibold mb-4 border border-primary/20 dark:border-primary/30"
          >
            Cómo funciona
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Solo{" "}
            <span className="gradient-text">
              3 pasos
            </span>
            {" "}para empezar
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            Un proceso simple para todos los roles de nuestra plataforma
          </motion.p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto mb-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="relative group"
              >
                {/* Línea conectora */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(100%-2rem)] w-[calc(100%+4rem)] h-0.5 bg-gradient-to-r from-primary/30 to-transparent dark:from-primary/20 dark:to-transparent z-0" />
                )}

                <div className="relative bg-card border border-border rounded-2xl p-8 transition-all duration-500 hover-lift hover:border-primary/50 h-full flex flex-col">
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  <div className="mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {step.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-border dark:border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                      <span>Rápido y seguro</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Selector de roles */}
        <motion.div
          className="max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              ¿Quieres ver el{" "}
              <span className="gradient-text">
                verdadero potencial
              </span>
              ?
            </h3>
            <p className="text-lg text-muted-foreground">
              Descubre cómo nuestra plataforma se adapta a tu rol
            </p>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <Link
                  key={role.id}
                  href={role.href}
                  onMouseEnter={() => setSelectedRole(role.id)}
                  onMouseLeave={() => setSelectedRole(null)}
                  className="group"
                >
                  <div className={`
                    relative p-6 rounded-2xl border transition-all duration-300 h-full
                    ${isSelected 
                      ? 'bg-gradient-to-br ' + role.color + ' border-transparent shadow-2xl scale-105' 
                      : 'bg-card border-border hover:border-primary/50 hover-lift'
                    }
                  `}>
                    <div className={`flex flex-col items-center gap-3 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-foreground'}`}>
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white/20' 
                          : 'bg-gradient-to-br ' + role.color + ' text-white'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm mb-1">{role.name}</div>
                        <div className={`text-xs transition-opacity duration-300 ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
