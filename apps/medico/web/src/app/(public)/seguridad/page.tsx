import type { Metadata } from 'next';
import {
  Lock,
  ShieldCheck,
  DatabaseZap,
  KeyRound,
  ServerCrash,
  CloudCog,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Seguridad — Red Salud',
  description:
    'Conocé cómo protegemos tu información médica. Encriptación, aislamiento de datos y las mejores prácticas de seguridad para tu consultorio.',
};

const securityFeatures = [
  {
    icon: Lock,
    title: 'Encriptación de datos en tránsito y en reposo',
    description:
      'Toda la comunicación entre tu navegador y nuestros servidores está protegida con TLS 1.3. Los datos almacenados están encriptados con AES-256.',
  },
  {
    icon: DatabaseZap,
    title: 'Row Level Security (RLS) en todas las tablas',
    description:
      'Cada registro en la base de datos tiene políticas de acceso granulares. Solo vos podés acceder a los datos de tus pacientes — ni siquiera otros médicos en la plataforma.',
  },
  {
    icon: KeyRound,
    title: 'Autenticación segura con Supabase Auth',
    description:
      'Sistema de autenticación probado por miles de empresas. Contraseñas hasheadas con bcrypt, tokens JWT con expiración corta, y soporte para autenticación de dos factores.',
  },
  {
    icon: EyeOff,
    title: 'Sin acceso a datos entre consultorios',
    description:
      'Aislamiento completo entre dominios. Los datos de tu consultorio son invisibles para otros consultorios, farmacias o laboratorios dentro de la plataforma.',
  },
  {
    icon: ServerCrash,
    title: 'Backups automáticos',
    description:
      'Respaldos automáticos diarios de toda la información. En caso de cualquier incidente, tus datos están protegidos y pueden ser restaurados rápidamente.',
  },
  {
    icon: CloudCog,
    title: 'Infraestructura en la nube con alta disponibilidad',
    description:
      'Servidores distribuidos con redundancia geográfica. Monitoreo 24/7 y escalado automático para garantizar que la plataforma esté siempre disponible.',
  },
];

export default function SeguridadPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 mb-8">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-teal-300">Seguridad</span>
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Tu información médica está protegida
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            La seguridad de los datos médicos no es opcional — es la base de todo lo que
            construimos. Cada capa de Red Salud fue diseñada con la protección de datos como
            prioridad.
          </p>
        </div>
      </section>

      {/* Security features grid */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {securityFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-colors duration-200 hover:border-white/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/10 to-cyan-500/10 mb-4">
                  <feature.icon className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance note */}
      <section className="py-16 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 p-8 sm:p-12">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                <CheckCircle2 className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-3">
                  Compromiso con las mejores prácticas
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  Red Salud fue diseñado siguiendo las mejores prácticas de protección de datos de
                  salud. Implementamos controles técnicos y organizacionales para asegurar la
                  confidencialidad, integridad y disponibilidad de la información médica.
                </p>
                <ul className="space-y-2">
                  {[
                    'Principio de mínimo privilegio en todos los accesos',
                    'Auditoría de acceso a datos sensibles',
                    'Actualización continua de dependencias y parches de seguridad',
                    'Pruebas de seguridad periódicas',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
