"use client";

import React from "react";
import {
  UserCheck,
  Settings,
  Calendar,
  BarChart3,
} from "lucide-react";

interface ProcessStep {
  title: string;
  description: string;
  step: number;
  icon: string;
}

interface ProcessProps {
  data: ProcessStep[];
}

// Mapa de iconos disponibles
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  Settings,
  Calendar,
  BarChart3,
};

export function Process({ data }: ProcessProps) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comienza a atender pacientes en línea en menos de 48 horas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {data.map((step, index) => {
            const IconComponent = iconMap[step.icon] || UserCheck;

            return (
              <div
                key={index}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <IconComponent className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}