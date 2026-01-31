'use client';

import { motion } from 'framer-motion';
import { FileDigit, MessageSquare, Shield, LucideIcon } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  color: string;
  bgColor: string;
  benefits?: string[];
}

const features: Feature[] = [
  {
    title: "Expediente Médico Universal",
    description: "Olvídate de cargar carpetas con exámenes. Tu historial médico viaja contigo, accesible de forma segura desde cualquier dispositivo cuando lo necesites.",
    icon: FileDigit,
    image: "/images/features/medical-records.svg", // Placeholder
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20"
  },
  {
    title: "Comunicación Directa",
    description: "Resuelve dudas rápidas mediante nuestro chat seguro post-consulta. Mantén una línea de comunicación abierta con tu especialista para un mejor seguimiento.",
    icon: MessageSquare,
    image: "/images/features/doctor-chat.svg", // Placeholder
    color: "text-teal-600",
    bgColor: "bg-teal-100 dark:bg-teal-900/20"
  },
  {
    title: "Privacidad Garantizada",
    description: "Cumplimos con estándares internacionales de protección de datos. Tu información de salud es confidencial y solo tú decides quién puede verla.",
    icon: Shield,
    image: "/images/features/security.svg", // Placeholder
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20"
  }
];

export function Features({ data }: { data?: Feature[] }) {
  // Use data from props if available, otherwise use default features but we need to map icons
  // Since icons are components, we need a way to map string names to components if data comes from DB
  // For now, let's assume the order matches or use the default features as structure and override content
  
  const featuresToDisplay = data && data.length > 0 ? data.map((item, index) => ({
    ...item,
    // Keep the hardcoded icon/style for now based on index, as DB only has text
    icon: features[index % features.length].icon,
    color: features[index % features.length].color,
    bgColor: features[index % features.length].bgColor,
    image: features[index % features.length].image,
  })) : features;

  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {featuresToDisplay.map((feature, index) => (
          <div key={index} className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1 space-y-6"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
              {feature.benefits && feature.benefits.length > 0 && (
                <ul className="space-y-3 pt-4">
                  {feature.benefits.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
              {/* Fallback if no benefits array in data object but we are using default features array structure */}
              {!feature.benefits && (
                 <ul className="space-y-3 pt-4">
                  {[1, 2, 3].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>Beneficio clave o característica detallada {item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Visual/Image Placeholder */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1 w-full"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl group">
                 {/* Abstract representation since we don't have real images yet */}
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <feature.icon className="w-32 h-32" />
                 </div>
                 
                 {/* Decorative elements */}
                 <div className="absolute top-4 left-4 w-20 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />
                 <div className="absolute top-8 left-4 w-12 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
