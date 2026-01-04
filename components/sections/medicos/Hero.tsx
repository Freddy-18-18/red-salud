"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  stats: {
    doctors: number;
    consultations: number;
    satisfaction: string;
    incomeIncrease: string;
    lastUpdated: string;
  };
}

export function Hero({ stats }: HeroProps) {
  const statItems = [
    { value: `+${stats.doctors.toLocaleString()}`, label: "Médicos Activos" },
    { value: `+${stats.consultations.toLocaleString()}`, label: "Consultas Realizadas" },
    { value: stats.satisfaction, label: "Satisfacción" },
    { value: stats.incomeIncrease, label: "Aumento Ingresos Promedio" }
  ];

  return (
    <section className="relative bg-gradient-to-br from-teal-600 via-blue-700 to-blue-800 text-white py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            Para Profesionales de la Salud
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Transforma tu práctica médica con telemedicina
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Únete a más de {stats.doctors.toLocaleString()} médicos que están atendiendo más pacientes, 
            aumentando sus ingresos y trabajando con flexibilidad total desde cualquier lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
            >
              <Link href="/auth/register?tipo=medico">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="border-2 border-white text-white hover:bg-white/10"
            >
              <Link href="#planes">Ver Planes y Precios</Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/20">
            {statItems.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}