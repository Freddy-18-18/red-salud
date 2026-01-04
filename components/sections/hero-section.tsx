"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Activity,
  Star,
  ArrowRight,
  LogIn,
  Search,
  Bell,
  Calendar,
  Home,
  User,
  Menu,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { Counter } from "@/components/ui/counter";
import { getDashboardMetrics, type DashboardMetrics } from "@/lib/supabase/client";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const floatAnimation = (delay: number) => ({
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: [0.4, 0, 0.2, 1] as const,
      delay: delay,
    },
  },
});

const defaultMetrics: DashboardMetrics = {
  total_patients: 0,
  total_doctors: 0,
  total_specialties: 0,
  satisfaction_percentage: 0,
};

export function HeroSection() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    async function loadMetrics() {
      const data = await getDashboardMetrics();
      if (data) setMetrics(data);
      setLoading(false);
    }
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-blue-50/90 via-teal-50/60 to-slate-50 dark:from-background dark:via-background/95 dark:to-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-200/30 dark:bg-primary/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-200/30 dark:bg-secondary/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-indigo-200/20 dark:bg-purple-500/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.4] dark:opacity-[0.03] bg-center [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)]" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center">

          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Ecosistema de Salud Integral
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
            >
              Gestión de salud <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-secondary">
                inteligente y conectada
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed"
            >
              Centralizamos tu bienestar. Agenda citas al instante, accede a tu historial clínico y conecta con especialistas certificados en una plataforma diseñada para ti.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <a href={user ? "/dashboard/paciente/citas/nueva" : AUTH_ROUTES.REGISTER}>
                  {user ? "Ir al Dashboard" : "Crear Cuenta Gratis"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg rounded-full border-primary/20 hover:bg-primary/5 transition-all duration-300"
              >
                <a href={AUTH_ROUTES.LOGIN}>
                  <LogIn className="mr-2 h-5 w-5" />
                  Acceso Doctores
                </a>
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      <Users className="h-4 w-4 opacity-50" />
                    </div>
                  ))}
                </div>
                <div className="ml-2">
                  <strong className="text-foreground"><Counter value={metrics.total_patients} /></strong> Pacientes confían en Red-Salud
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visuals - 3D Interface */}
          <motion.div
            style={{ y: yRange }}
            className="relative w-full flex justify-center lg:justify-center perspective-1000"
          >
            {/* Interactive Composition Wrapper - Constrains the stats to the phone area */}
            <div className="relative w-[300px] sm:w-[340px] h-[650px] mx-auto">

              {/* Central Phone Mockup */}
              <motion.div
                initial={{ opacity: 0, rotateY: -10, rotateX: 5 }}
                animate={{ opacity: 1, rotateY: 0, rotateX: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-20 w-full h-full bg-background rounded-[3rem] border-[10px] border-muted-foreground/10 shadow-2xl overflow-hidden ring-1 ring-border/50"
              >
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-2xl z-30" />

                {/* Simulated App UI */}
                <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col relative font-sans">

                  {/* App Header */}
                  <div className="pt-12 px-6 pb-6 bg-white dark:bg-slate-900/50 backdrop-blur-md shadow-sm z-10 sticky top-0">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Bienvenido,</div>
                          <div className="text-sm font-bold text-foreground">Carlos A.</div>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="h-12 w-full bg-muted/50 rounded-2xl flex items-center px-4 gap-3 border border-border/50">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Buscar especialidad...</span>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="p-6 space-y-6 flex-1 overflow-y-hidden relative">
                    {/* Gradient Fade Overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

                    {/* Next Appointment Card */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-foreground">Próxima Cita</h3>
                        <span className="text-xs text-primary font-medium">Ver todo</span>
                      </div>
                      <div className="w-full bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                          <Calendar className="h-32 w-32" />
                        </div>
                        <div className="space-y-4 relative z-10">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-blue-100 text-xs font-medium mb-1">Mañana, 09:30 AM</div>
                              <div className="text-lg font-bold">Dr. Roberto G.</div>
                              <div className="text-blue-100 text-xs">Cardiología</div>
                            </div>
                            <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Stethoscope className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <Button size="sm" variant="secondary" className="w-full rounded-xl bg-white/20 hover:bg-white/30 text-white border-none h-9 text-xs font-semibold backdrop-blur-sm">
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Services Grid */}
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-3">Servicios Rápidos</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 text-center">
                          <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-rose-500" />
                          </div>
                          <span className="text-xs font-medium">Resultados</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 text-center">
                          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Star className="h-5 w-5 text-amber-500" />
                          </div>
                          <span className="text-xs font-medium">Favoritos</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Fake Lines */}
                    <div className="space-y-3 opacity-50">
                      <div className="h-14 w-full bg-muted/30 rounded-2xl" />
                      <div className="h-14 w-full bg-muted/30 rounded-2xl" />
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="h-20 bg-white dark:bg-slate-900 border-t border-border flex justify-around items-center px-6 pb-2">
                    <div className="flex flex-col items-center gap-1">
                      <Home className="h-6 w-6 text-primary" />
                      <span className="text-[10px] font-medium text-primary">Inicio</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50">
                      <Calendar className="h-6 w-6" />
                      <span className="text-[10px] font-medium">Agenda</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50">
                      <Menu className="h-6 w-6" />
                      <span className="text-[10px] font-medium">Menú</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Stats Orbits - Tighter Positioning relative to wrapper */}

              {/* Stat 1: Patients (Top Left) */}
              <motion.div
                variants={floatAnimation(0)}
                initial="initial" animate="animate"
                className="absolute top-[12%] -left-[14%] sm:-left-[18%] z-30"
              >
                <div className="glass-card p-3 sm:p-4 rounded-2xl border border-white/20 shadow-xl backdrop-blur-md flex items-center gap-3 sm:gap-4 py-3 pr-6 min-w-[150px]">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold tabular-nums flex items-baseline">
                      <Counter value={metrics.total_patients} />
                      <span className="text-xs ml-0.5 text-blue-500">+</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pacientes</div>
                  </div>
                </div>
              </motion.div>

              {/* Stat 2: Doctors (Bottom Right) */}
              <motion.div
                variants={floatAnimation(1)}
                initial="initial" animate="animate"
                className="absolute bottom-[22%] -right-[12%] sm:-right-[18%] z-30"
              >
                <div className="glass-card p-3 sm:p-4 rounded-2xl border border-white/20 shadow-xl backdrop-blur-md flex items-center gap-3 sm:gap-4 py-3 pr-6 min-w-[150px]">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold tabular-nums flex items-baseline">
                      <Counter value={metrics.total_doctors} />
                      <span className="text-xs ml-0.5 text-green-500">+</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Doctores</div>
                  </div>
                </div>
              </motion.div>

              {/* Stat 3: Satisfaction (Top Right) */}
              <motion.div
                variants={floatAnimation(2)}
                initial="initial" animate="animate"
                className="absolute top-[20%] -right-[8%] sm:-right-[12%] z-20"
              >
                <div className="glass-card p-3 rounded-xl border border-white/20 shadow-lg backdrop-blur-md flex flex-col items-center gap-1 min-w-[90px]">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />)}
                  </div>
                  <div className="text-sm font-bold">
                    <Counter value={metrics.satisfaction_percentage} />%
                  </div>
                  <div className="text-[10px] text-muted-foreground">Satisfacción</div>
                </div>
              </motion.div>

              {/* Stat 4: Specialties (Bottom Left) */}
              <motion.div
                variants={floatAnimation(1.5)}
                initial="initial" animate="animate"
                className="absolute bottom-[28%] -left-[8%] sm:-left-[12%] z-20"
              >
                <div className="glass-card p-3 rounded-xl border border-white/20 shadow-lg backdrop-blur-md flex flex-col items-center gap-1 min-w-[90px]">
                  <Activity className="h-5 w-5 text-rose-500" />
                  <div className="text-sm font-bold">
                    <Counter value={metrics.total_specialties} />+
                  </div>
                  <div className="text-[10px] text-muted-foreground">Esp.</div>
                </div>
              </motion.div>

              {/* Floating Blobs behind Mockup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full blur-[60px] -z-10 animate-blob" />

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
