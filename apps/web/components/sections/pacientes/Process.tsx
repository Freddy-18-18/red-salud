'use client';

import { motion } from 'framer-motion';
import { UserPlus, Search, CalendarCheck, Video, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  UserPlus, 
  Search, 
  CalendarCheck, 
  Video
};

interface ProcessStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

const defaultSteps: ProcessStep[] = [
  {
    icon: UserPlus,
    title: "Crea tu Cuenta",
    description: "Regístrate gratis en menos de 2 minutos. Solo necesitas tu correo electrónico.",
  },
  {
    icon: Search,
    title: "Encuentra tu Especialista",
    description: "Busca por especialidad, ubicación o nombre. Filtra por disponibilidad inmediata.",
  },
  {
    icon: CalendarCheck,
    title: "Agenda tu Cita",
    description: "Elige el horario que mejor se adapte a ti. Recibirás recordatorios automáticos.",
  },
  {
    icon: Video,
    title: "Consulta",
    description: "Conéctate a tu videoconsulta o asiste al consultorio. Todo queda registrado en tu historial.",
  }
];

export function Process({ data }: { data?: ProcessStep[] }) {
  const stepsToDisplay = data && data.length > 0 ? data : defaultSteps;

  return (
    <section id="como-funciona" className="py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
            Tu Salud en 4 Simples Pasos
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Hemos simplificado el proceso para que puedas enfocarte en lo más importante: sentirte bien.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {stepsToDisplay.map((step, index) => {
              const Icon = typeof step.icon === 'string' 
                ? iconMap[step.icon] || UserPlus 
                : step.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center"
                >
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/20 relative z-10">
                    <Icon className="w-8 h-8" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-950">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
