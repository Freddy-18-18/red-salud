/**
 * @file how-it-works.tsx
 * @description Sección "Proceso Simplificado" rediseñada con scroll-timeline y animaciones premium.
 * Implementa un efecto sticky donde la explicación general acompaña el scroll de las tarjetas.
 */

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { UserCircle, Settings, Share2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    id: 1,
    title: "Crea tu Cuenta",
    subtitle: "El inicio de tu ecosistema",
    description: "Accede a la plataforma unificada de salud. Un solo registro te conecta con todo lo que necesitas, ya seas paciente que busca atención o especialista que ofrece sus servicios.",
    icon: UserCircle,
    color: "from-blue-500 to-cyan-400",
    shadow: "shadow-blue-500/20",
    features: ["Registro unificado", "Verificación segura", "Acceso inmediato"]
  },
  {
    id: 2,
    title: "Personaliza tu Experiencia",
    subtitle: "Adaptado a tus necesidades",
    description: "Configura tu perfil según tu rol. Los pacientes definen sus preferencias de búsqueda y los médicos establecen sus horarios y especialidades con herramientas flexibles.",
    icon: Settings,
    color: "from-violet-500 to-fuchsia-400",
    shadow: "shadow-violet-500/20",
    features: ["Ajustes flexibles", "Interfaz intuitiva", "Control total"]
  },
  {
    id: 3,
    title: "Conecta y Gestiona",
    subtitle: "Interacción sin límites",
    description: "Comienza a interactuar. Agenda citas, gestiona consultas y mantén el control total de tu salud o práctica médica desde un dashboard centralizado e inteligente.",
    icon: Share2,
    color: "from-emerald-500 to-teal-400",
    shadow: "shadow-emerald-500/20",
    features: ["Gestión centralizada", "Comunicación fluida", "Soporte constante"]
  }
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const springScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} className="relative bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">

          {/* Sticky Header Section */}
          <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 py-12 lg:py-0 flex flex-col justify-center z-10 transition-all duration-300">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 w-fit">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Proceso Simplificado</span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-tight text-foreground">
                  Empieza en <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-teal-500">
                    3 simples pasos
                  </span>
                </h2>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-10">
                  Hemos simplificado la experiencia de salud digital.
                  Sin burocracia, sin esperas y con la tecnología más avanzada
                  trabajando para ti.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full px-8 text-base h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                    <Link href="/auth/register">
                      Comenzar Ahora
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base h-12">
                    <Link href="/about">
                      Más Información
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Decorative Line on Desktop */}
              <div className="hidden lg:block absolute -left-8 top-1/2 -translate-y-1/2 h-3/4 w-[1px] bg-border/50">
                <motion.div
                  style={{ height: springScroll, scaleY: scrollYProgress }}
                  className="absolute top-0 left-0 w-full bg-primary origin-top"
                />
              </div>
            </div>
          </div>

          {/* Scrolling Steps Section */}
          <div className="lg:w-1/2 py-12 lg:py-32 flex flex-col gap-32 lg:gap-[50vh] relative z-0">
            {steps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: typeof steps[0], index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
      className={cn(
        "relative rounded-3xl p-8 md:p-12 overflow-hidden border border-white/10 dark:border-white/5",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl",
        step.shadow
      )}
    >
      {/* Background Gradient */}
      <div className={cn(
        "absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
        step.color
      )} />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
            step.color
          )}>
            <step.icon className="w-8 h-8" />
          </div>
          <span className="text-8xl font-black text-foreground/5 font-serif absolute -top-4 right-0 pointer-events-none select-none">
            0{step.id}
          </span>
        </div>

        <h3 className="text-3xl font-bold mb-2">{step.title}</h3>
        <p className={cn("text-lg font-medium mb-6 bg-gradient-to-r bg-clip-text text-transparent w-fit", step.color)}>
          {step.subtitle}
        </p>

        <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
          {step.description}
        </p>

        <div className="space-y-3">
          {step.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle2 className={cn("w-5 h-5", step.id === 1 ? "text-blue-500" : step.id === 2 ? "text-violet-500" : "text-emerald-500")} />
              <span className="text-sm font-medium text-foreground/80">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
