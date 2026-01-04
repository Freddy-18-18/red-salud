import type { Metadata } from "next";
import { 
  Building2, 
  UserCheck, 
  BarChart3, 
  Settings, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios para Clínicas",
  description: "Sistema integral de gestión para centros médicos. Optimiza operaciones y mejora la experiencia del paciente",
};

const features = [
  {
    icon: UserCheck,
    title: "Gestión de Personal",
    description: "Administra médicos, enfermeros y personal con roles y permisos personalizados"
  },
  {
    icon: Building2,
    title: "Multi-sucursal",
    description: "Control centralizado de múltiples ubicaciones desde un solo panel"
  },
  {
    icon: BarChart3,
    title: "Reportes Avanzados",
    description: "Análisis detallados de rendimiento, finanzas y satisfacción del paciente"
  },
  {
    icon: Clock,
    title: "Turnos Optimizados",
    description: "Sistema inteligente de citas que maximiza la capacidad de atención"
  },
  {
    icon: Settings,
    title: "Integración Total",
    description: "Conecta con laboratorios, farmacias y sistemas de seguros"
  },
  {
    icon: Shield,
    title: "Cumplimiento Normativo",
    description: "Cumple con todas las regulaciones de salud y protección de datos"
  },
];

const benefits = [
  "Reduce tiempos de espera hasta un 40%",
  "Aumenta eficiencia operativa",
  "Facturación electrónica automatizada",
  "Inventario de medicamentos e insumos",
  "Portal para pacientes integrado",
  "Soporte y capacitación continua",
];

export default function ClinicasPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-purple-600 via-blue-600 to-blue-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              Para Centros Médicos
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Gestión moderna para tu clínica
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Sistema integral que digitaliza y optimiza todos los procesos 
              de tu centro médico en una sola plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
              >
                <Link href="/register/clinica">
                  Solicitar Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="/precios">Ver Planes Empresariales</Link>
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
              Todo lo que tu clínica necesita
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas empresariales diseñadas específicamente para centros de salud
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
              >
                <div className="bg-linear-to-br from-purple-100 to-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-purple-600" />
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
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Optimiza tu centro médico
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Clínicas líderes confían en nuestra plataforma para mejorar 
                la eficiencia operativa y la satisfacción del paciente.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-purple-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-linear-to-br from-purple-50 to-blue-50 p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-purple-600 mb-2">+200</div>
                  <p className="text-xl text-gray-700">Clínicas Activas</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">98%</div>
                  <p className="text-xl text-gray-700">Satisfacción</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Agenda una demostración personalizada
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Nuestro equipo te mostrará cómo la plataforma puede transformar tu clínica
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl"
          >
            <Link href="/register/clinica">
              Solicitar Demo Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
