'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-16 sm:px-16 sm:py-24 text-center shadow-2xl">
          {/* Background Patterns */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿Listo para priorizar tu salud?
            </h2>
            <p className="text-lg text-blue-50">
              Únete a miles de pacientes que ya disfrutan de una atención médica moderna, accesible y sin complicaciones.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  asChild
                  className="bg-white text-blue-600 hover:bg-blue-50 border-0 h-14 px-8 rounded-full text-lg shadow-lg"
                >
                  <Link href="/auth/register?tipo=paciente">
                    Registrarme Gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
            
            <p className="text-sm text-blue-100 opacity-80">
              No requiere tarjeta de crédito • Cancelación en cualquier momento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
