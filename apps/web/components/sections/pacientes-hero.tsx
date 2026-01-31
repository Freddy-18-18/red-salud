'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from "@red-salud/ui";
import Link from 'next/link';

export function PacientesHero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />
      
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-teal-200 dark:bg-teal-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenido */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                ✓ Servicio disponible 24/7
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 dark:from-blue-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Tu Salud
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  A un Clic
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-6 leading-relaxed max-w-xl">
                Conecta con médicos certificados en segundos. Videoconsultas, historial médico digital y seguimiento personalizado. 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> 100% Gratis</span> para pacientes.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                asChild
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/auth/register?tipo=paciente">
                  Registrarse Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Link href="#como-funciona">
                  Ver Cómo Funciona
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Confían en nosotros:
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">50K+</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pacientes activos</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">2K+</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Médicos certificados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800/50">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent dark:via-slate-800 opacity-50" />
              
              {/* Device mockup */}
              <div className="absolute inset-4 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Phone header */}
                <div className="h-8 bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Red Salud</span>
                </div>
                
                {/* Phone content */}
                <div className="flex-1 p-4 space-y-4">
                  <div className="h-12 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-3 pt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -bottom-12 -left-12 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 max-w-xs border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Consulta confirmada</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Hoy a las 3:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
