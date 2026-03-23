"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Heart,
  Shield,
  Star,
  ArrowRight,
  Stethoscope,
  Brain,
  Eye,
  Baby,
  Bone,
  Pill,
  Activity,
  Smile,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";

const FEATURED_SPECIALTIES = [
  { name: "Medicina General", icon: Stethoscope, color: "bg-emerald-50 text-emerald-600" },
  { name: "Cardiologia", icon: Activity, color: "bg-red-50 text-red-600" },
  { name: "Neurologia", icon: Brain, color: "bg-purple-50 text-purple-600" },
  { name: "Oftalmologia", icon: Eye, color: "bg-blue-50 text-blue-600" },
  { name: "Pediatria", icon: Baby, color: "bg-pink-50 text-pink-600" },
  { name: "Traumatologia", icon: Bone, color: "bg-amber-50 text-amber-600" },
  { name: "Dermatologia", icon: Smile, color: "bg-cyan-50 text-cyan-600" },
  { name: "Ginecologia", icon: Pill, color: "bg-rose-50 text-rose-600" },
];

const TESTIMONIALS = [
  {
    name: "Maria G.",
    text: "Encontre a mi doctor en minutos. La plataforma es muy facil de usar y pude agendar mi cita en el mismo dia.",
    rating: 5,
    city: "Caracas",
  },
  {
    name: "Carlos R.",
    text: "Excelente servicio. Pude ver todas las opciones de medicos disponibles, sus precios y horarios. Muy transparente.",
    rating: 5,
    city: "Valencia",
  },
  {
    name: "Ana L.",
    text: "La comunicacion con mi doctor por mensajes es muy practica. Ya no tengo que llamar por telefono para consultas rapidas.",
    rating: 5,
    city: "Maracaibo",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Busca tu medico",
    description: "Explora doctores por especialidad, ubicacion, precios y disponibilidad. Consulta valoraciones de otros pacientes.",
  },
  {
    icon: Calendar,
    title: "Agenda tu cita",
    description: "Selecciona el horario que mejor te convenga. Recibe confirmacion inmediata y recordatorios automaticos.",
  },
  {
    icon: Heart,
    title: "Cuida tu salud",
    description: "Accede a tu historial medico, recetas, resultados de laboratorio y comunicacion directa con tu doctor.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/buscar-medico?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/dashboard/buscar-medico");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Red Salud</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Iniciar Sesion
              </a>
              <a
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition"
              >
                Crear Cuenta
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Tu salud, en un{" "}
            <span className="text-emerald-500">solo lugar</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Encuentra al medico ideal, agenda tu cita en segundos y gestiona toda tu
            salud desde una sola plataforma.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por especialidad, nombre de doctor..."
                className="w-full pl-12 pr-32 py-4 text-base border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Doctores verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>Citas en minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>100% gratuito para pacientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En tres simples pasos puedes agendar tu cita con el mejor especialista
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <step.icon className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="w-8 h-8 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Specialties */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Especialidades destacadas
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra al especialista que necesitas
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {FEATURED_SPECIALTIES.map((specialty) => (
              <a
                key={specialty.name}
                href="/dashboard/buscar-medico"
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${specialty.color} group-hover:scale-110 transition-transform`}>
                  <specialty.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {specialty.name}
                </span>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="/dashboard/buscar-medico"
              className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition"
            >
              Ver todas las especialidades
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-emerald-500">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">500+</div>
              <div className="text-emerald-100 text-sm">Doctores verificados</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">130+</div>
              <div className="text-emerald-100 text-sm">Especialidades</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-emerald-100 text-sm">Pacientes atendidos</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">4.8</div>
              <div className="text-emerald-100 text-sm flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-current" /> Satisfaccion
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros pacientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-emerald-600">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-500">{testimonial.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Users className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comienza a cuidar tu salud hoy
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Crea tu cuenta gratuita y accede a los mejores doctores de Venezuela
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition text-center"
            >
              Crear Cuenta Gratis
            </a>
            <a
              href="/dashboard/buscar-medico"
              className="w-full sm:w-auto px-8 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-center"
            >
              Explorar Doctores
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Red Salud</span>
              </div>
              <p className="text-sm leading-relaxed">
                Tu salud en un solo lugar. La plataforma que conecta pacientes con los mejores
                doctores de Venezuela.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Para Pacientes</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/dashboard/buscar-medico" className="hover:text-white transition">Buscar Medico</a></li>
                <li><a href="/auth/register" className="hover:text-white transition">Crear Cuenta</a></li>
                <li><a href="/auth/login" className="hover:text-white transition">Iniciar Sesion</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Especialidades</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/dashboard/buscar-medico" className="hover:text-white transition">Medicina General</a></li>
                <li><a href="/dashboard/buscar-medico" className="hover:text-white transition">Cardiologia</a></li>
                <li><a href="/dashboard/buscar-medico" className="hover:text-white transition">Pediatria</a></li>
                <li><a href="/dashboard/buscar-medico" className="hover:text-white transition">Ginecologia</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Terminos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition">Politica de Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Soporte</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Red Salud. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
