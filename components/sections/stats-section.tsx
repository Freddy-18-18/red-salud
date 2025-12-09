'use client';

import { usePatientServiceMetrics } from '@/hooks/use-patient-service-metrics';
import { Users, Stethoscope, Zap, Award } from 'lucide-react';

export function StatsSection() {
  const metrics = usePatientServiceMetrics();

  const stats = [
    {
      icon: Users,
      label: 'Pacientes Activos',
      value: metrics.totalPatients,
      unit: '+',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: Stethoscope,
      label: 'Médicos Certificados',
      value: metrics.totalDoctors,
      unit: '+',
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    },
    {
      icon: Zap,
      label: 'Especialidades',
      value: metrics.totalSpecialties,
      unit: '',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      icon: Award,
      label: 'Satisfacción',
      value: metrics.satisfactionPercentage,
      unit: '%',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Números que hablan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Estamos creciendo cada día, conectando pacientes con los mejores profesionales de salud
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isLoading = metrics.isLoading;

            return (
              <div
                key={stat.label}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-blue-50 group-hover:to-teal-50 dark:group-hover:from-blue-900/10 dark:group-hover:to-teal-900/10 transition-all duration-300" />

                {/* Icon container */}
                <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <Icon className={`h-7 w-7 ${stat.color}`} />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-3">
                    {isLoading ? (
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                    ) : (
                      <p className={`text-4xl font-bold ${stat.color}`}>
                        {stat.value.toLocaleString('es-ES')}
                        <span className="text-lg ml-1">{stat.unit}</span>
                      </p>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                </div>

                {/* Bottom accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.bgColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </div>
            );
          })}
        </div>

        {/* Loading state message */}
        {metrics.isLoading && (
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">Cargando datos reales...</p>
          </div>
        )}
      </div>
    </section>
  );
}
