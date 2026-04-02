import type { Metadata } from 'next';
import {
  Lightbulb,
  ShieldCheck,
  Accessibility,
  Users,
  Heart,
  Stethoscope,
  Globe,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nosotros — Red Salud',
  description:
    'Conocé al equipo detrás de Red Salud. Estamos transformando la salud digital en Venezuela con tecnología que se adapta a cada especialidad médica.',
};

const values = [
  {
    icon: Lightbulb,
    title: 'Innovación',
    description:
      'Llevamos tecnología de punta al consultorio médico venezolano, con inteligencia artificial y herramientas diseñadas para cada especialidad.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad',
    description:
      'La información médica es sagrada. Cada dato está protegido con encriptación, aislamiento de datos y las mejores prácticas de la industria.',
  },
  {
    icon: Accessibility,
    title: 'Accesibilidad',
    description:
      'Una plataforma que funciona en cualquier dispositivo con conexión a internet. Sin instalaciones, sin hardware costoso.',
  },
  {
    icon: Users,
    title: 'Colaboración',
    description:
      'Conectamos médicos, pacientes, laboratorios, farmacias y especialistas en un ecosistema de salud integrado.',
  },
];

export default function NosotrosPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 mb-8">
            <Heart className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-teal-300">Nuestra historia</span>
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Transformando la salud digital en Venezuela
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Estamos construyendo la primera plataforma clínica que se adapta a cada especialidad
            médica. Porque cada médico trabaja diferente, y su herramienta digital debería
            entenderlo.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 mb-6">
                <Stethoscope className="h-6 w-6 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Nuestra misión</h2>
              <p className="text-zinc-400 leading-relaxed">
                Estamos construyendo la primera plataforma clínica que se adapta a cada especialidad
                médica. Un cardiólogo no trabaja igual que un odontólogo — y su software no debería
                ser genérico. Red Salud entiende tu especialidad y te da las herramientas exactas
                que necesitás.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 mb-6">
                <Globe className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">¿Por qué Venezuela?</h2>
              <p className="text-zinc-400 leading-relaxed">
                El sistema de salud venezolano merece herramientas digitales modernas. Nuestros
                médicos tienen el talento y la dedicación — lo que faltaba era una plataforma
                pensada para nuestra realidad: accesible, confiable, y diseñada desde Venezuela
                para Venezuela.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Nuestros valores</h2>
            <p className="mt-4 text-zinc-400">Los principios que guían cada decisión que tomamos.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-colors duration-200 hover:border-white/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/10 to-cyan-500/10 mb-4">
                  <value.icon className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team note */}
      <section className="py-16 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 p-8 sm:p-12 text-center">
            <Users className="h-10 w-10 text-teal-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Nuestro equipo</h2>
            <p className="text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Un equipo de desarrolladores y profesionales de la salud comprometidos con la medicina
              venezolana. Combinamos experiencia en tecnología con conocimiento profundo del sector
              salud para crear herramientas que realmente hacen la diferencia en el día a día del
              médico.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
