import type { Metadata } from "next";
import { 
  Ambulance, 
  MapPin, 
  Clock, 
  Phone, 
  Shield, 
  Radio,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios para Ambulancias",
  description: "Sistema de despacho y gestión para servicios de ambulancias y emergencias médicas",
};

const features = [
  {
    icon: MapPin,
    title: "GPS en Tiempo Real",
    description: "Rastreo y optimización de rutas para tiempos de respuesta mínimos"
  },
  {
    icon: Phone,
    title: "Despacho Inteligente",
    description: "Sistema automatizado de asignación según disponibilidad y ubicación"
  },
  {
    icon: Clock,
    title: "Gestión de Turnos",
    description: "Administración eficiente de personal y vehículos disponibles"
  },
  {
    icon: Radio,
    title: "Comunicación Central",
    description: "Coordinación en tiempo real con hospitales y personal médico"
  },
  {
    icon: Shield,
    title: "Historial de Servicios",
    description: "Registro completo de cada servicio prestado con evidencias"
  },
  {
    icon: Ambulance,
    title: "Mantenimiento Preventivo",
    description: "Control de revisiones y mantenimiento de unidades"
  },
];

const benefits = [
  "Reduce tiempos de respuesta 40%",
  "Optimiza uso de recursos",
  "Facturación automática por servicio",
  "Integración con seguros médicos",
  "Reportes de desempeño",
  "App para conductores y paramédicos",
];

export default function AmbulanciasPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-red-600 via-orange-600 to-amber-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              Para Servicios de Emergencia
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Respuesta rápida, vidas salvadas
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8 leading-relaxed">
              Sistema profesional de gestión y despacho para servicios de 
              ambulancias con tecnología de última generación.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-red-600 hover:bg-red-50 shadow-xl"
              >
                <Link href="/auth/register/ambulancia">
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
              Tecnología que salva vidas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sistema integral para la gestión profesional de servicios de emergencia
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200"
              >
                <div className="bg-linear-to-br from-red-100 to-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-red-600" />
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
              <div className="aspect-square rounded-2xl bg-linear-to-br from-red-50 to-orange-50 p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-red-600 mb-2">-40%</div>
                  <p className="text-xl text-gray-700">Tiempo de Respuesta</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-600 mb-2">100%</div>
                  <p className="text-xl text-gray-700">Trazabilidad</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Eficiencia en emergencias
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Servicios de ambulancias profesionales confían en nuestra tecnología 
                para optimizar operaciones y salvar más vidas.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Moderniza tu servicio de emergencias
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Solicita una demostración y descubre cómo mejorar tus tiempos de respuesta
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-red-600 hover:bg-red-50 shadow-xl"
          >
            <Link href="/auth/register/ambulancia">
              Agendar Demostración
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
