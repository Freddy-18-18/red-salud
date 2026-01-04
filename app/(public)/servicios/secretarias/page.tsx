import type { Metadata } from "next";
import { 
  Calendar, 
  Users, 
  Phone, 
  FileText, 
  Clock, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Star,
  UserCheck,
  Video,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Servicios para Secretarias Médicas",
  description: "Sistema completo de gestión de agenda médica, citas y pacientes para secretarias profesionales",
};

const features = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Sistema avanzado de gestión de citas con recordatorios automáticos y sincronización en tiempo real"
  },
  {
    icon: Users,
    title: "Gestión de Pacientes",
    description: "Base de datos completa con historial de citas, contactos y notas médicas"
  },
  {
    icon: Phone,
    title: "Confirmaciones Automáticas",
    description: "Envío automático de recordatorios por SMS, email y WhatsApp"
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    description: "Comunicación directa con pacientes y médicos desde la plataforma"
  },
  {
    icon: FileText,
    title: "Gestión de Documentos",
    description: "Organiza recetas, órdenes médicas y resultados de laboratorio"
  },
  {
    icon: Clock,
    title: "Control de Disponibilidad",
    description: "Administra horarios, ausencias y disponibilidad de múltiples médicos"
  },
];

const benefits = [
  "Reduce llamadas telefónicas hasta 70%",
  "Elimina doble agendamiento",
  "Dashboard con vista de toda la agenda",
  "Reportes de citas y cancelaciones",
  "Acceso desde cualquier dispositivo",
  "Capacitación y soporte incluido",
];

const howItWorks = [
  {
    icon: UserCheck,
    title: "1. Vinculación con médico",
    description: "El médico te invita a unirte a su equipo con permisos personalizados."
  },
  {
    icon: Settings,
    title: "2. Configura la agenda",
    description: "Establece horarios, duraciones de consulta y disponibilidad del médico."
  },
  {
    icon: Calendar,
    title: "3. Gestiona citas",
    description: "Agenda, reprograma y cancela citas con confirmación automática."
  },
  {
    icon: Users,
    title: "4. Administra pacientes",
    description: "Mantén actualizada la información de contacto y preferencias de cada paciente."
  },
];

const testimonials = [
  {
    name: "Laura Martínez",
    role: "Secretaria Consultorio Cardiología",
    location: "Caracas",
    rating: 5,
    comment: "Increíble herramienta. Ahora puedo manejar la agenda de 3 médicos sin estrés. Los recordatorios automáticos redujeron las ausencias en un 60%."
  },
  {
    name: "Carmen Rojas",
    role: "Asistente Médica",
    location: "Valencia",
    rating: 5,
    comment: "La plataforma es muy intuitiva. Me ahorra horas al día y los pacientes están encantados con los recordatorios automáticos."
  },
  {
    name: "Isabel Torres",
    role: "Coordinadora Clínica",
    location: "Maracaibo",
    rating: 5,
    comment: "Perfecto para gestionar múltiples consultorios. El sistema de reportes me ayuda a optimizar los horarios constantemente."
  },
];

const faqs = [
  {
    question: "¿Necesito experiencia técnica para usar la plataforma?",
    answer: "No. La plataforma está diseñada para ser muy intuitiva y fácil de usar. Incluimos capacitación inicial gratuita y videos tutoriales. La mayoría de las secretarias aprenden a usar todas las funciones en menos de 1 día."
  },
  {
    question: "¿Puedo gestionar la agenda de varios médicos?",
    answer: "Sí, puedes gestionar las agendas de múltiples médicos desde una sola cuenta. Cada médico puede tener sus propios horarios, configuraciones y tipos de consulta. El sistema te permite cambiar fácilmente entre diferentes agendas."
  },
  {
    question: "¿Cómo funcionan los recordatorios automáticos?",
    answer: "El sistema envía recordatorios automáticos a los pacientes 24 horas antes de su cita por SMS, email o WhatsApp (según preferencia). Los pacientes pueden confirmar, cancelar o reprogramar directamente desde el recordatorio."
  },
  {
    question: "¿Qué pasa si necesito cancelar o reprogramar una cita?",
    answer: "Puedes cancelar o reprogramar cualquier cita con un solo clic. El sistema notificará automáticamente al paciente sobre el cambio y le ofrecerá alternativas de horarios disponibles."
  },
  {
    question: "¿Puedo acceder al sistema desde mi teléfono?",
    answer: "Sí, la plataforma es 100% responsive. Puedes acceder desde computadora, tablet o smartphone. También tenemos app nativa para iOS y Android para mayor comodidad."
  },
  {
    question: "¿El médico puede ver todo lo que hago en el sistema?",
    answer: "El médico puede configurar los permisos que otorga a cada secretaria. Generalmente, las secretarias tienen acceso completo a agenda, pacientes y documentos, pero los permisos son personalizables según las necesidades de cada consultorio."
  },
];

export default function SecretariasPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              Para Secretarias Médicas
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Gestiona agendas médicas como una profesional
            </h1>
            <p className="text-xl md:text-2xl text-violet-100 mb-8 leading-relaxed">
              Herramientas profesionales para secretarias y asistentes médicos. 
              Organiza citas, pacientes y documentos en una sola plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-violet-600 hover:bg-violet-50 shadow-xl"
              >
                <Link href="/auth/register?tipo=secretaria">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="#caracteristicas">Ver Características</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="caracteristicas" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Todo lo que necesitas para gestionar consultorios
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para secretarias médicas profesionales
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-600"
              >
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-violet-600 dark:text-violet-400" />
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
                Trabaja más eficiente, sin estrés
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Secretarias profesionales están transformando su trabajo diario con 
                nuestra plataforma, ahorrando tiempo y mejorando la experiencia del paciente.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-violet-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-violet-600 dark:text-violet-400 mb-2">-70%</div>
                  <p className="text-xl text-gray-700 dark:text-gray-300">Menos Llamadas</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">+1000</div>
                  <p className="text-xl text-gray-700 dark:text-gray-300">Secretarias Activas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comienza a gestionar agendas médicas en minutos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step) => (
              <div 
                key={step.title}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <step.icon className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Lo que dicen las secretarias
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Profesionales que ya están trabajando más eficientemente
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-violet-100 dark:bg-violet-900 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-violet-600 dark:text-violet-400 font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Resolvemos tus dudas sobre la plataforma
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 data-[state=open]:bg-violet-50 dark:data-[state=open]:bg-gray-700 data-[state=open]:border-violet-200 dark:data-[state=open]:border-violet-600"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comienza a trabajar más eficiente
          </h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Únete a más de 1,000 secretarias que ya están optimizando su trabajo diario
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-white text-violet-600 hover:bg-violet-50 shadow-xl"
            >
              <Link href="/auth/register?tipo=secretaria">
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
              <Link href="/contacto">Solicitar Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
