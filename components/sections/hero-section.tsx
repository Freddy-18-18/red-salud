"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield, Clock, Users, CalendarDays, LogIn, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { DashboardStats } from "./dashboard-stats";
import { useAuth } from "@/hooks/use-auth";

// More sophisticated highlights
const highlights = [
  { icon: CheckCircle2, text: "Profesionales Verificados" },
  { icon: Clock, text: "Atención Inmediata" },
  { icon: Shield, text: "Datos Encriptados" },
];

export function HeroSection() {
  const { user } = useAuth();

  const handleScrollDown = () => {
    const heroSection = document.querySelector('[data-testid="hero-section"]');
    if (heroSection) {
      const nextElement = heroSection.nextElementSibling;
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-12 overflow-hidden"
    >
      {/* Dynamic Background with Mesh Gradient concept */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px] animate-pulse-slow delay-2000" />
      </div>

      {/* Modern Grid Overlay */}
      <div
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium backdrop-blur-sm shadow-sm hover:bg-primary/10 transition-colors cursor-default">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Innovación en Salud
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-balance">
              Tu salud, <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-x">
                simplificada y potente.
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.div variants={fadeInUp} className="mb-10">
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance font-light">
              La plataforma integral que conecta pacientes con los mejores especialistas.
              Gestión clínica avanzada, citas instantáneas y resultados en tiempo real.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <a href={user ? "/dashboard/paciente/citas/nueva" : AUTH_ROUTES.REGISTER}>
                {user ? "Agendar Ahora" : "Empezar Gratis"}
                <CalendarDays className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              <a href={AUTH_ROUTES.LOGIN}>
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </a>
            </Button>
          </motion.div>

          {/* Social Proof / Stats */}
          <motion.div variants={fadeInUp} className="border-t border-border/40 pt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center mb-10">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground/80">
                  <item.icon className="h-5 w-5 text-primary/70" />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Dashboard Mockup or Stats */}
            <DashboardStats />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
