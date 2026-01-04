import type { Metadata } from "next";
import { 
  Pill, 
  Package, 
  Truck, 
  Clock, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios para Farmacias",
  description: "Gestión integral de farmacias. Inventario, recetas digitales y entregas a domicilio",
};

const features = [
  {
    icon: Package,
    title: "Inventario Inteligente",
    description: "Control automático de stock con alertas de reposición"
  },
  {
    icon: Pill,
    title: "Recetas Electrónicas",
    description: "Validación y despacho de prescripciones médicas digitales"
  },
  {
    icon: Truck,
    title: "Delivery Integrado",
    description: "Sistema de entregas a domicilio con seguimiento en tiempo real"
  },
  {
    icon: Smartphone,
    title: "App para Clientes",
    description: "Tus pacientes pueden pedir medicamentos desde su móvil"
  },
  {
    icon: Shield,
    title: "Control de Vencimientos",
    description: "Seguimiento automático de fechas de caducidad y lotes"
  },
  {
    icon: Clock,
    title: "Ventas 24/7",
    description: "Recibe pedidos online las 24 horas del día"
  },
];

const benefits = [
  "Aumenta ventas hasta un 35%",
  "Reduce pérdidas por vencimientos",
  "Integración con mayoristas",
  "Facturación electrónica",
  "Programa de fidelización",
  "Reportes de ventas en tiempo real",
];

export default function FarmaciasPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-rose-600 via-pink-600 to-purple-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              Para Farmacias
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Tu farmacia, siempre conectada
            </h1>
            <p className="text-xl md:text-2xl text-rose-100 mb-8 leading-relaxed">
              Plataforma completa para modernizar tu farmacia y ampliar 
              tu alcance con ventas online y entregas a domicilio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-rose-600 hover:bg-rose-50 shadow-xl"
              >
                <Link href="/register/farmacia">
                  Empezar Gratis
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
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Todo para gestionar tu farmacia
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para farmacias modernas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-rose-200"
              >
                <div className="bg-linear-to-br from-rose-100 to-pink-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Crece con la tecnología
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Farmacias líderes están usando nuestra plataforma para expandir 
                su negocio y mejorar la experiencia del cliente.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-linear-to-br from-rose-50 to-pink-50 p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-rose-600 mb-2">+35%</div>
                  <p className="text-xl text-gray-700 dark:text-gray-300">Aumento en Ventas</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-pink-600 mb-2">+500</div>
                  <p className="text-xl text-gray-700 dark:text-gray-300">Farmacias Activas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-rose-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Digitaliza tu farmacia hoy
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Comienza a vender online y llega a más clientes
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-rose-600 hover:bg-rose-50 shadow-xl"
          >
            <Link href="/register/farmacia">
              Registrar Farmacia
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}


