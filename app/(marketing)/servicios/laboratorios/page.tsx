import type { Metadata } from "next";
import { 
  FlaskConical, 
  FileBarChart, 
  Zap, 
  Clock, 
  Shield, 
  Upload,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios para Laboratorios",
  description: "Digitaliza tu laboratorio clínico. Gestión de muestras, resultados y reportes en línea",
};

const features = [
  {
    icon: FlaskConical,
    title: "Gestión de Muestras",
    description: "Trazabilidad completa desde la toma hasta la entrega de resultados"
  },
  {
    icon: FileBarChart,
    title: "Resultados Digitales",
    description: "Entrega automática de resultados a pacientes y médicos"
  },
  {
    icon: Zap,
    title: "Procesamiento Rápido",
    description: "Workflow optimizado para reducir tiempos de entrega"
  },
  {
    icon: Upload,
    title: "Interfaz con Equipos",
    description: "Integración directa con analizadores y sistemas LIS"
  },
  {
    icon: Shield,
    title: "Certificaciones",
    description: "Cumple con normativas ISO 15189 y validación de resultados"
  },
  {
    icon: Clock,
    title: "Historial Completo",
    description: "Acceso a histórico de pacientes para análisis comparativos"
  },
];

const benefits = [
  "Reduce errores de transcripción",
  "Entrega resultados 50% más rápido",
  "Portal para médicos referentes",
  "Facturación automática por análisis",
  "Control de calidad integrado",
  "Reportes estadísticos avanzados",
];

export default function LaboratoriosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              Para Laboratorios Clínicos
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Laboratorio digital inteligente
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed">
              Automatiza procesos, mejora la precisión y entrega resultados 
              más rápido con nuestra plataforma especializada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl"
              >
                <Link href="/auth/register/laboratorio">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="/precios">Ver Planes</Link>
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
              Tecnología para tu laboratorio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Solución completa para la gestión moderna de laboratorios clínicos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200"
              >
                <div className="bg-linear-to-br from-emerald-100 to-teal-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-emerald-600" />
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
              <div className="aspect-square rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-emerald-600 mb-2">-50%</div>
                  <p className="text-xl text-gray-700">Tiempo de Entrega</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-teal-600 mb-2">99.9%</div>
                  <p className="text-xl text-gray-700">Precisión</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ventajas competitivas
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Laboratorios modernos eligen nuestra plataforma para optimizar 
                operaciones y mejorar la experiencia del paciente.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Moderniza tu laboratorio hoy
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Únete a la revolución digital de los laboratorios clínicos
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl"
          >
            <Link href="/auth/register/laboratorio">
              Registrar Laboratorio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
