"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-700 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Comienza a atender pacientes hoy
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Únete a miles de médicos que ya están creciendo profesional y económicamente
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            asChild
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
          >
            <Link href="/auth/register?tipo=medico">
              Registrarme Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            asChild
            className="border-2 border-white text-white hover:bg-white/10"
          >
            <Link href="/contacto">Agendar Demo Personalizada</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}