"use client";

import { CheckCircle2 } from "lucide-react";

interface BenefitItem {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface BenefitsProps {
  data: BenefitItem[];
}

export function Benefits({ data }: BenefitsProps) {
  return (
    <section className="py-20 bg-white dark:bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950 p-12 flex flex-col items-center justify-center">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">+5,000</div>
                <p className="text-xl text-gray-700 dark:text-gray-300">Médicos Registrados</p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-teal-600 dark:text-teal-400 mb-2">+40%</div>
                <p className="text-xl text-gray-700 dark:text-gray-300">Aumento de Ingresos</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ventajas exclusivas para médicos
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Médicos de todas las especialidades están transformando su práctica 
              profesional y mejorando su calidad de vida con Red-Salud.
            </p>
            <div className="space-y-4">
              {data.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-teal-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">{benefit.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}