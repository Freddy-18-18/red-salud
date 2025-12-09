'use client';

import { Video, FileText, Clock, Heart, Lock, Zap, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Videoconsultas HD',
    description: 'Conecta con médicos certificados mediante videollamadas de alta definición con tecnología de encriptación end-to-end.',
    highlights: ['Sin tiempo de espera', 'Grabación opcional', 'Chat integrado'],
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: FileText,
    title: 'Historial Digital',
    description: 'Tu historial médico completo en un solo lugar. Accesible desde cualquier dispositivo, siempre protegido.',
    highlights: ['Sincronización automática', 'Acceso compartido', 'Búsqueda avanzada'],
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    icon: Clock,
    title: 'Disponibilidad 24/7',
    description: 'Médicos disponibles a cualquier hora del día. Desde consultas urgentes hasta citas programadas.',
    highlights: ['Emergencias cubiertas', 'Citas programadas', 'Espera mínima'],
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: Heart,
    title: 'Seguimiento Personalizado',
    description: 'Planes de tratamiento adaptados a tus necesidades específicas con seguimiento continuo.',
    highlights: ['Recordatorios automáticos', 'Métricas de salud', 'Evolución monitoreada'],
    gradient: 'from-rose-500 to-rose-600',
  },
  {
    icon: Lock,
    title: 'Seguridad Máxima',
    description: 'Tus datos médicos están protegidos con encriptación de nivel HIPAA y cumplimiento normativo completo.',
    highlights: ['Encriptación extremo a extremo', 'Cumplimiento legal', 'Auditoría de acceso'],
    gradient: 'from-green-500 to-green-600',
  },
  {
    icon: Zap,
    title: 'Integración Completa',
    description: 'Conecta con laboratorios, farmacias y especialistas. Todo integrado en una plataforma.',
    highlights: ['Recetas digitales', 'Resultados de laboratorio', 'Red de farmacias'],
    gradient: 'from-indigo-500 to-indigo-600',
  },
];


export function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Todo lo que necesitas para cuidar tu salud
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Una plataforma completa diseñada para facilitarte el acceso a servicios de salud de calidad, 
            seguridad y profesionalismo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300 overflow-hidden"
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full blur-3xl opacity-10`} />
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 relative z-10 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2">
                    {feature.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Border accent */}
                <div className={`absolute inset-0 border-2 border-transparent bg-gradient-to-br ${feature.gradient} bg-clip-padding opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
