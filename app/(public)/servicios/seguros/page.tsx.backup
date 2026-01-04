import type { Metadata } from "next";
import { 
  FileCheck, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  BarChart,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios para Seguros",
  description: "Plataforma de gestión para aseguradoras de salud. Autorización digital y control de pólizas",
};

const features = [
  {
    icon: FileCheck,
    title: "Autorizaciones Digitales",
    description: "Procesamiento automático de solicitudes y aprobaciones en minutos"
  },
  {
    icon: Users,
    title: "Red de Proveedores",
    description: "Gestión centralizada de clínicas, médicos y laboratorios afiliados"
  },
  {
    icon: Shield,
    title: "Gestión de Pólizas",
    description: "Control completo de planes, coberturas y exclusiones por asegurado"
  },
  {
    icon: BarChart,
    title: "Análisis de Siniestralidad",
    description: "Reportes detallados para optimizar costos y detectar fraudes"
  },
  {
    icon: Clock,
    title: "Tiempos de Respuesta",
    description: "SLA automatizados para autorizaciones y reembolsos"
  },
  {
    icon: TrendingUp,
    title: "Dashboard Ejecutivo",
    description: "Métricas en tiempo real de operación y rentabilidad"
  },
];

const benefits = [
  "Reduce tiempo de autorización 80%",
  "Detecta fraudes automáticamente",
  "Integración con red de proveedores",
  "Portal para asegurados",
  "Facturación electrónica",
  "Cumplimiento normativo automático",
];

export default function SegurosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              Para Aseguradoras de Salud
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Gestión inteligente de seguros
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 leading-relaxed">
              Plataforma integral para modernizar procesos, reducir costos operativos 
              y mejorar la experiencia de tus asegurados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl"
              >
                <Link href="/register/seguro">
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
                <Link href="/precios">Ver Planes Corporativos</Link>
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
              Solución empresarial completa
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnología diseñada para aseguradoras que buscan eficiencia y rentabilidad
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200"
              >
                <div className="bg-linear-to-br from-indigo-100 to-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-indigo-600" />
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
                Optimiza tu operación
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Las principales aseguradoras de salud están transformando sus operaciones 
                con nuestra plataforma tecnológica.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-linear-to-br from-indigo-50 to-blue-50 p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-indigo-600 mb-2">-80%</div>
                  <p className="text-xl text-gray-700">Tiempo de Autorización</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">+60%</div>
                  <p className="text-xl text-gray-700">Eficiencia Operativa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-indigo-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Transforma tu aseguradora
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Agenda una demostración personalizada con nuestro equipo
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl"
          >
            <Link href="/register/seguro">
              Agendar Demostración
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
