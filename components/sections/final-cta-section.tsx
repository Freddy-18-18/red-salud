'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 dark:from-blue-900 dark:via-blue-800 dark:to-teal-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Comienza tu viaje hacia mejor salud
              </h2>
              <p className="text-xl text-blue-50 leading-relaxed">
                Únete a miles de pacientes que ya confían en Red Salud para cuidar su salud.
                <span className="font-semibold"> 100% Gratis para pacientes.</span>
              </p>
            </div>

            {/* Benefits checklist */}
            <div className="space-y-3">
              {[
                'Acceso inmediato a médicos certificados',
                'Tu historial médico seguro en la nube',
                'Consultas desde la comodidad de tu hogar',
                'Soporte 24/7 en español',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/auth/register?tipo=paciente">
                  Registrarse Gratis Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-white text-white hover:bg-white/10 transition-colors"
              >
                <Link href="/precios">Ver Planes Disponibles</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <p className="text-sm text-blue-100">
              ✓ Encriptación de nivel bancario • ✓ Cumplimiento HIPAA • ✓ 100% Confidencial
            </p>
          </div>

          {/* Visual side */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 space-y-6">
                {/* Welcome message */}
                <div className="space-y-2">
                  <p className="text-white/80 text-sm">¡Bienvenido a Red Salud!</p>
                  <p className="text-white text-lg font-semibold">Tu salud es nuestra prioridad</p>
                </div>

                {/* Quick steps */}
                <div className="space-y-4">
                  {[
                    { number: '1', text: 'Crea tu cuenta gratis', icon: '👤' },
                    { number: '2', text: 'Completa tu perfil médico', icon: '📋' },
                    { number: '3', text: 'Encuentra un médico', icon: '👨‍⚕️' },
                    { number: '4', text: 'Agenda tu primera cita', icon: '📅' },
                  ].map((step) => (
                    <div key={step.number} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                        {step.number}
                      </div>
                      <span className="text-white/90">{step.text}</span>
                      <span className="text-xl ml-auto">{step.icon}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <Button
                  size="sm"
                  asChild
                  className="w-full bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Link href="/auth/register?tipo=paciente">Comenzar Ahora →</Link>
                </Button>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-400 rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg">
                ✓
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white/20 rounded-full w-20 h-20 flex items-center justify-center text-2xl">
                🏥
              </div>
            </div>
          </div>
        </div>

        {/* Bottom message */}
        <div className="mt-16 text-center border-t border-white/20 pt-8">
          <p className="text-white/80 mb-4">
            ¿Preguntas? Nuestro equipo está disponible 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-white/90 text-sm">
            <a href="mailto:soporte@redsalud.com" className="hover:text-white transition-colors">
              📧 soporte@redsalud.com
            </a>
            <a href="tel:+5812123456789" className="hover:text-white transition-colors">
              📱 +58 (212) 123-4567
            </a>
            <a href="#" className="hover:text-white transition-colors">
              💬 Chat en Vivo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
