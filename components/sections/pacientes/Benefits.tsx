'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Clock, FileText, UserCheck, HeartHandshake, Smartphone } from 'lucide-react';

const iconMap: Record<string, any> = {
  Clock, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  HeartHandshake, 
  Smartphone
};

const defaultBenefits = [
  {
    icon: Clock,
    title: "Atención 24/7",
    description: "Acceso a servicios médicos y programación de citas en cualquier momento, día o noche.",
    color: "bg-blue-500"
  },
  {
    icon: UserCheck,
    title: "Médicos Verificados",
    description: "Cada especialista en nuestra plataforma pasa por un riguroso proceso de validación.",
    color: "bg-teal-500"
  },
  {
    icon: FileText,
    title: "Historial Digital",
    description: "Tus recetas, diagnósticos y estudios centralizados en un solo lugar seguro.",
    color: "bg-indigo-500"
  },
  {
    icon: ShieldCheck,
    title: "100% Seguro",
    description: "Tus datos están encriptados y protegidos bajo los más altos estándares de privacidad.",
    color: "bg-purple-500"
  },
  {
    icon: HeartHandshake,
    title: "Sin Costo para Ti",
    description: "Nuestra plataforma es completamente gratuita para pacientes. Solo te preocupas por tu salud.",
    color: "bg-pink-500"
  },
  {
    icon: Smartphone,
    title: "Fácil de Usar",
    description: "Interfaz intuitiva diseñada para que cualquier persona pueda agendar en segundos.",
    color: "bg-orange-500"
  }
];

export function Benefits({ data }: { data?: any[] }) {
  const benefitsToDisplay = data && data.length > 0 ? data : defaultBenefits;

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4"
          >
            ¿Por qué elegir Red Salud?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            Diseñamos una experiencia centrada en el paciente, eliminando las barreras tradicionales de la atención médica.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefitsToDisplay.map((benefit, index) => {
            const Icon = typeof benefit.icon === 'string' 
              ? iconMap[benefit.icon] || Clock 
              : benefit.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${benefit.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${benefit.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
