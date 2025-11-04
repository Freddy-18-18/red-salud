"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoBackground } from "@/components/video/video-background";
import { AUTH_ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { DashboardStats } from "./dashboard-stats";

const features = [
  "Atención médica 24/7",
  "Profesionales certificados",
  "Tecnología de vanguardia",
  "Resultados inmediatos",
];

export function HeroSection() {
  const handleScrollDown = () => {
    const nextSection = document.querySelector('#next-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <VideoBackground
        src="/videos/doctors-bg.mp4"
        overlay
        overlayOpacity={0.7}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Innovación en Salud Digital
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="font-bold text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight font-(family-name:--font-poppins)"
          >
            Tu Salud,{" "}
            <span className="bg-linear-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Nuestra Prioridad
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Conectamos pacientes con profesionales de la salud de manera rápida,
            segura y eficiente. La mejor atención médica al alcance de tus manos.
          </motion.p>

          {/* Features List */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-6 mb-12"
          >
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-white/90"
              >
                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                <span className="text-sm sm:text-base font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="bg-linear-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 text-lg px-8 py-6 group min-w-[200px]"
            >
              <Link href={AUTH_ROUTES.REGISTER}>
                <UserPlus className="mr-2 h-5 w-5" />
                Registrarse
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6 min-w-[200px]"
            >
              <Link href={AUTH_ROUTES.LOGIN}>
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar Sesión
              </Link>
            </Button>
          </motion.div>

          {/* Stats - Ahora dinámicos desde Supabase */}
          <motion.div variants={fadeInUp}>
            <DashboardStats />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={handleScrollDown}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-sm">Descubre más</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
