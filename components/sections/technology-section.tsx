"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Shield, Lock, Zap, Database, Cloud, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Seguridad certificada",
    description: "Cumplimos con estándares internacionales de protección de datos médicos y privacidad.",
    gradient: "from-blue-600 to-blue-700",
  },
  {
    icon: Lock,
    title: "Encriptación extremo a extremo",
    description: "Tus datos están protegidos con tecnología de cifrado de nivel bancario.",
    gradient: "from-teal-600 to-teal-700",
  },
  {
    icon: Zap,
    title: "Tiempo real",
    description: "Actualizaciones instantáneas en todo el ecosistema de salud.",
    gradient: "from-indigo-600 to-indigo-700",
  },
  {
    icon: Database,
    title: "Historial unificado",
    description: "Toda tu información médica centralizada y accesible cuando la necesites.",
    gradient: "from-purple-600 to-purple-700",
  },
  {
    icon: Cloud,
    title: "Infraestructura cloud",
    description: "Alta disponibilidad y escalabilidad para soportar el crecimiento del sistema.",
    gradient: "from-pink-600 to-pink-700",
  },
  {
    icon: CheckCircle2,
    title: "Interoperabilidad",
    description: "Integramos con sistemas existentes para una transición sin fricciones.",
    gradient: "from-orange-600 to-orange-700",
  },
];

export function TechnologySection() {
  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

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
            className="inline-block px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-semibold mb-6 border border-primary/20 dark:border-primary/30"
          >
            Tecnología de vanguardia
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            Construido con{" "}
            <span className="gradient-text">
              tecnología moderna
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            Nuestra plataforma está diseñada desde cero con las mejores prácticas de
            seguridad, escalabilidad y experiencia de usuario.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group relative"
              >
                <div className="h-full bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/50 overflow-hidden relative">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative gradient line - con scale transform */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 glass-card rounded-full">
            <Shield className="h-6 w-6 text-primary" />
            <p className="text-foreground font-semibold">
              Certificados en seguridad y protección de datos médicos
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
