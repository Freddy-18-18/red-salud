'use client';

import { UserCheck, Calendar, Video, FileText, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserCheck,
    number: '1',
    title: 'Crea tu perfil',
    description: 'Regístrate gratis en menos de 2 minutos. Solo necesitas correo y una contraseña segura.',
    details: ['Información personal', 'Historial médico básico', 'Contacto de emergencia'],
  },
  {
    icon: Calendar,
    number: '2',
    title: 'Busca tu médico',
    description: 'Encuentra médicos por especialidad, ubicación, disponibilidad y valoraciones.',
    details: ['Filtros avanzados', 'Ver horarios disponibles', 'Leer opiniones'],
  },
  {
    icon: Video,
    number: '3',
    title: 'Agenda tu cita',
    description: 'Elige la fecha y hora que mejor te convenga. Confirmación instantánea.',
    details: ['Cita flexible', 'Recordatorio automático', 'Cambio fácil'],
  },
  {
    icon: FileText,
    number: '4',
    title: 'Consulta y seguimiento',
    description: 'Videoconsulta con tu médico. Recibe receta digital y seguimiento.',
    details: ['Videollamada HD', 'Chat durante la consulta', 'Historial guardado'],
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 mb-6">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Proceso simple
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Cuatro pasos simples para comenzar tu camino hacia mejor salud
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="h-full bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group hover:shadow-lg">
                  {/* Step number badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                      {step.number}
                    </div>
                    {!isLast && (
                      <ArrowRight className="h-6 w-6 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {step.description}
                  </p>

                  {/* Details list */}
                  <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    {step.details.map((detail) => (
                      <div key={detail} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection line (visible on lg screens, hidden on last item) */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-400 to-transparent" />
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline for mobile/tablet */}
        <div className="lg:hidden">
          <div className="space-y-4">
            {steps.map((step, index) => {
              return (
                <div key={step.number} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {step.number}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-transparent mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-4 pt-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
