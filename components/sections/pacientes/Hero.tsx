'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export function Hero({ stats }: { stats?: { patients: number } }) {
  const patientCount = stats?.patients || 0;
  const hasEnoughData = patientCount > 50;
  const displayCount = patientCount > 1000 
    ? `${(patientCount / 1000).toFixed(1)}K+` 
    : patientCount.toString();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Content Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Salud Digital Reimaginada
              </span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Tu Bienestar, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                  Sin Fronteras
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Accede a consultas médicas de primer nivel, gestiona tu historial y conecta con especialistas certificados. Todo desde la comodidad de tu hogar.
                <span className="block mt-2 font-semibold text-teal-600 dark:text-teal-400">100% Gratuito para pacientes.</span>
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Link href="/auth/register?tipo=paciente">
                  Empezar Ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 mb-4">
                {hasEnoughData ? (
                  <>Confían en nosotros más de <span className="font-bold text-slate-900 dark:text-white">{displayCount}</span> pacientes</>
                ) : (
                  <span className="font-bold text-slate-900 dark:text-white">Sé de los primeros en unirte y disfrutar los beneficios</span>
                )}
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-8">
                {['Atención 24/7', 'Médicos Certificados', 'Datos Seguros'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-teal-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Visual Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 aspect-[4/3] group">
              {/* Abstract UI Representation */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800" />
              
              {/* Animated Floating Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute top-10 right-10 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">Dr</div>
                  <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded mb-1" />
                <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-10 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-[220px] z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Cita Confirmada</div>
                    <div className="text-xs text-slate-500">Hoy, 15:30 PM</div>
                  </div>
                </div>
              </motion.div>

              {/* Main Center Piece (Glassmorphism) */}
              <div className="absolute inset-x-12 inset-y-24 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl flex items-center justify-center">
                 <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-teal-500 rounded-2xl mx-auto mb-4 shadow-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Red Salud</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Conectando pacientes con los mejores especialistas.</p>
                 </div>
              </div>
            </div>
            
            {/* Background Blob behind image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl opacity-20 blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
