import type { Metadata } from "next";
import { 
  CheckCircle2, 
  Clock, 
  Shield, 
  Video, 
  FileText, 
  Heart,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios para Pacientes",
  description: "Consultas médicas en línea, historial médico digital y atención personalizada 24/7",
};

const features = [
  {
    icon: Video,
    title: "Videoconsultas",
    description: "Conecta con médicos certificados desde la comodidad de tu hogar"
  },
  {
    icon: Clock,
    title: "Atención 24/7",
    description: "Disponibilidad de profesionales de salud las 24 horas del día"
  },
  {
    icon: FileText,
    title: "Historial Digital",
    description: "Accede a tu historial médico completo desde cualquier dispositivo"
  },
  {
    icon: Shield,
    title: "Datos Seguros",
    description: "Encriptación de extremo a extremo para proteger tu información"
  },
  {
    icon: Heart,
    title: "Seguimiento Personalizado",
    description: "Planes de tratamiento adaptados a tus necesidades específicas"
  },
];

const benefits = [
  "Sin tiempos de espera prolongados",
  "Prescripciones médicas digitales",
  "Recordatorios de medicamentos",
  "Análisis de laboratorio en línea",
  "Segunda opinión médica",
  "Historial médico compartido con especialistas",
];

export default function PacientesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Tu salud, a un clic de distancia
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Consultas médicas en línea con profesionales certificados. 
              Cuida tu salud sin salir de casa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
              >
                <Link href="/auth/register/paciente">
                  Registrarse Gratis
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
              Todo lo que necesitas para cuidar tu salud
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa diseñada para facilitarte el acceso a servicios de salud de calidad
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
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
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Beneficios exclusivos para ti
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Únete a miles de pacientes que ya están disfrutando de una experiencia 
                de salud moderna, accesible y personalizada.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-linear-to-br from-blue-100 to-teal-100 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">24/7</div>
                  <p className="text-xl text-gray-700">Atención disponible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-blue-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Regístrate hoy y obtén tu primera consulta con descuento especial
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
          >
            <Link href="/auth/register/paciente">
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
