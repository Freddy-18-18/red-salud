"use client";

/**
 * @file technology-section.tsx
 * @description Premium Bento Grid section showcasing the platform's technology stack.
 * Features glassmorphism, gradient accents, and Framer Motion animations.
 *
 * @example
 * <TechnologySection />
 */

import { motion } from "framer-motion";
import { Shield, Lock, Zap, Database, Cloud, CheckCircle2, Fingerprint, Server } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Animation Variants ---
const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// --- Reusable Bento Card Component ---
interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Base Bento Card with glassmorphism.
 * @param children - Card content.
 * @param className - Additional Tailwind classes for grid positioning.
 */
function BentoCard({ children, className }: BentoCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "group relative overflow-hidden rounded-3xl p-6 md:p-8",
        "bg-card/60 dark:bg-card/40 backdrop-blur-xl",
        "border border-border/50 dark:border-white/10",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        "transition-all duration-500 ease-out",
        "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// --- Icon Wrapper with Glow ---
interface GlowIconProps {
  icon: React.ElementType<{ className?: string }>;
  colorClass: string;
}

function GlowIcon({ icon: Icon, colorClass }: GlowIconProps) {
  return (
    <div className="relative inline-flex">
      {/* Glow effect */}
      <div className={cn("absolute inset-0 blur-xl opacity-40 rounded-full", colorClass)} />
      <div className={cn("relative p-3 rounded-2xl", colorClass)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}

// --- Main Section Component ---
export function TechnologySection() {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--primary)/0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-semibold mb-6 border border-primary/20"
          >
            <Zap className="w-4 h-4" />
            Infraestructura de clase mundial
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Tecnología que{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              inspira confianza
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Nuestra plataforma está construida sobre una base sólida de seguridad, rendimiento y escalabilidad,
            diseñada para el futuro de la salud digital en Venezuela.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Card 1: Hero - Seguridad (Spans 2 cols, 2 rows on lg) */}
          <BentoCard className="lg:col-span-2 lg:row-span-2 flex flex-col justify-between min-h-[300px] lg:min-h-[400px]">
            <div>
              <GlowIcon icon={Shield} colorClass="bg-gradient-to-br from-sky-500 to-blue-600" />
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mt-6 mb-3">
                Seguridad de nivel bancario
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                Cumplimos con los más altos estándares internacionales de protección de datos médicos (HIPAA) y
                privacidad, garantizando la confidencialidad de tu información.
              </p>
            </div>
            {/* Decorative element */}
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              {["HIPAA", "ISO 27001", "SOC 2"].map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {badge}
                </span>
              ))}
            </div>
          </BentoCard>

          {/* Card 2: Encriptación */}
          <BentoCard className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <GlowIcon icon={Lock} colorClass="bg-gradient-to-br from-teal-500 to-emerald-600" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Encriptación extremo a extremo</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Tus datos están protegidos con cifrado AES-256 en tránsito y en reposo, el mismo estándar utilizado
                  por instituciones financieras.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Card 3: Tiempo Real */}
          <BentoCard>
            <GlowIcon icon={Zap} colorClass="bg-gradient-to-br from-amber-500 to-orange-600" />
            <h3 className="text-lg font-bold text-foreground mt-4 mb-2">Tiempo real</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Actualizaciones instantáneas en todo el ecosistema. Tu historial siempre sincronizado.
            </p>
          </BentoCard>

          {/* Card 4: Historial Unificado */}
          <BentoCard>
            <GlowIcon icon={Database} colorClass="bg-gradient-to-br from-violet-500 to-purple-600" />
            <h3 className="text-lg font-bold text-foreground mt-4 mb-2">Historial unificado</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Toda tu información médica centralizada y accesible cuando la necesites.
            </p>
          </BentoCard>

          {/* Card 5: Infraestructura Cloud (Wide) */}
          <BentoCard className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <GlowIcon icon={Cloud} colorClass="bg-gradient-to-br from-pink-500 to-rose-600" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Infraestructura cloud escalable</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Alta disponibilidad (99.99% uptime) y escalabilidad automática para soportar millones de usuarios
                  concurrentes sin interrupciones.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Card 6: Interoperabilidad */}
          <BentoCard>
            <GlowIcon icon={Server} colorClass="bg-gradient-to-br from-cyan-500 to-sky-600" />
            <h3 className="text-lg font-bold text-foreground mt-4 mb-2">Interoperabilidad</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Integramos con sistemas existentes (HL7, FHIR) para una transición sin fricciones.
            </p>
          </BentoCard>

          {/* Card 7: Autenticación */}
          <BentoCard>
            <GlowIcon icon={Fingerprint} colorClass="bg-gradient-to-br from-indigo-500 to-blue-600" />
            <h3 className="text-lg font-bold text-foreground mt-4 mb-2">Autenticación segura</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Multi-factor, biometría y verificación de identidad para proteger tu cuenta.
            </p>
          </BentoCard>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-16 lg:mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/80 dark:bg-white/5 backdrop-blur-lg border border-border/50 shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-foreground font-medium text-sm lg:text-base">
              Plataforma verificada y certificada en seguridad de datos médicos
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
