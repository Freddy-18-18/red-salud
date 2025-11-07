import type { Metadata } from "next";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Video, 
  CreditCard,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios para Médicos",
  description: "Plataforma integral para profesionales de la salud. Gestiona consultas, pacientes y aumenta tus ingresos",
};

const features = [
  {
    icon: Calendar,
    title: "Agenda Digital",
    description: "Sistema de citas automatizado con recordatorios para tus pacientes"
  },
  {
    icon: Users,
    title: "Gestión de Pacientes",
    description: "Historial médico completo y seguimiento personalizado de cada paciente"
  },
  {
    icon: Video,
    title: "Videoconsultas HD",
    description: "Plataforma de telemedicina con calidad de video profesional"
  },
  {
    icon: FileText,
    title: "Recetas Digitales",
    description: "Emisión de prescripciones médicas con firma electrónica certificada"
  },
  {
    icon: CreditCard,
    title: "Pagos Seguros",
    description: "Cobros automáticos y transparentes con múltiples métodos de pago"
  },
  {
    icon: TrendingUp,
    title: "Análisis de Desempeño",
    description: "Métricas y reportes para optimizar tu práctica médica"
  },
];

const benefits = [
  "Amplía tu alcance a más pacientes",
  "Reduce costos operativos y de oficina",
  "Horarios flexibles desde cualquier lugar",
  "Ingresos adicionales fuera del consultorio",
  "Capacitación continua incluida",
  "Soporte técnico 24/7 especializado",
];

export default function MedicosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-teal-600 via-blue-700 to-blue-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              Para Profesionales de la Salud
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transforma tu práctica médica
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Únete a la plataforma líder en telemedicina y atiende a más pacientes 
              con herramientas profesionales diseñadas para ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
              >
                <Link href="/auth/register/medico">
                  Unirme como Médico
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="/precios">Ver Planes Profesionales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Herramientas profesionales a tu alcance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para ofrecer atención médica de calidad en el entorno digital
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="bg-linear-to-br from-blue-100 to-teal-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square rounded-2xl bg-linear-to-br from-blue-50 to-teal-50 p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-blue-600 mb-2">+5,000</div>
                  <p className="text-xl text-gray-700">Médicos Registrados</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-teal-600 mb-2">+30%</div>
                  <p className="text-xl text-gray-700">Aumento de Ingresos</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ventajas de unirte a Red-Salud
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Únete a miles de médicos que ya están transformando su práctica 
                profesional y aumentando sus ingresos con nuestra plataforma.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-teal-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comienza a atender pacientes hoy
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Proceso de registro simple. Comienza a usar la plataforma en menos de 24 horas
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
          >
            <Link href="/auth/register/medico">
              Registrarme Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
