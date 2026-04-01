import {
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  ChevronDown,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Soporte y Ayuda | Red-Salud',
  description:
    'Centro de ayuda de Red-Salud. Encuentra respuestas a tus preguntas frecuentes y contacta a nuestro equipo de soporte.',
}

const faqItems = [
  {
    question: 'Como agendo una cita?',
    answer:
      'Busca un medico por especialidad o nombre en la seccion "Buscar Doctores". Selecciona el profesional de tu preferencia, elige un horario disponible y confirma tu cita. Recibiras una confirmacion por correo electronico y notificacion en la plataforma.',
  },
  {
    question: 'Es gratis para pacientes?',
    answer:
      'Si, Red-Salud es completamente gratuito para pacientes. Puedes buscar medicos, agendar citas, ver tu historial medico y comunicarte con tus doctores sin ningun costo. Los unicos pagos son las consultas medicas directamente al profesional.',
  },
  {
    question: 'Como verifico mi cuenta?',
    answer:
      'Al registrarte, recibiras un correo de verificacion. Haz clic en el enlace del correo para activar tu cuenta. Si no recibes el correo, revisa tu carpeta de spam o solicita un nuevo correo de verificacion desde la pagina de inicio de sesion.',
  },
  {
    question: 'Puedo cancelar una cita?',
    answer:
      'Si, puedes cancelar una cita desde la seccion "Mis Citas" en tu panel. Te recomendamos cancelar con al menos 24 horas de anticipacion por cortesia con el profesional. Las cancelaciones recurrentes pueden afectar tu perfil en la plataforma.',
  },
  {
    question: 'Como me comunico con mi medico?',
    answer:
      'Una vez que tengas una cita confirmada con un medico, podras enviarle mensajes a traves de la seccion de "Mensajeria" en tu panel. Tambien puedes compartir documentos, resultados de laboratorio y fotos de manera segura.',
  },
  {
    question: 'Mis datos estan seguros?',
    answer:
      'Absolutamente. Utilizamos encriptacion de extremo a extremo, seguridad a nivel de filas en nuestra base de datos (Row Level Security) y cumplimos con los mas altos estandares de privacidad. Solo tu y tus medicos autorizados pueden ver tu informacion medica. Consulta nuestra pagina de Seguridad para mas detalles.',
  },
  {
    question: 'Que especialidades estan disponibles?',
    answer:
      'Contamos con una amplia variedad de especialidades medicas incluyendo Medicina General, Cardiologia, Dermatologia, Ginecologia, Pediatria, Traumatologia, Oftalmologia, Neurologia y muchas mas. Puedes ver el listado completo en la seccion de Especialidades.',
  },
  {
    question: 'Como funciona la telemedicina?',
    answer:
      'La telemedicina te permite tener consultas medicas por videollamada directamente desde la plataforma. Al agendar una cita, selecciona la opcion "Consulta virtual". El dia de tu cita recibiras un enlace para conectarte. Solo necesitas una conexion a internet estable y una camara.',
  },
  {
    question: 'Puedo ver mi historial medico?',
    answer:
      'Si, en la seccion "Historial Medico" de tu panel puedes ver todas tus consultas pasadas, diagnosticos, prescripciones y resultados de laboratorio. Tu historial se construye automaticamente con cada consulta que realizas a traves de Red-Salud.',
  },
  {
    question: 'Que hago en caso de emergencia?',
    answer:
      'Red-Salud NO es un servicio de emergencia. En caso de emergencia medica, llama inmediatamente al 911 o acude al centro de salud mas cercano. Nuestra plataforma esta disenada para consultas programadas y seguimiento medico.',
  },
] as const

export default function SoportePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <HelpCircle className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
          Centro de <span className="text-emerald-500">Ayuda</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
          Encuentra respuestas a las preguntas mas frecuentes o contacta a
          nuestro equipo de soporte.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Preguntas Frecuentes
        </h2>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Las respuestas a lo que mas nos preguntan.
        </p>

        <div className="mt-8 space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-[hsl(var(--card-foreground))] [&::-webkit-details-marker]:hidden">
                <span className="pr-4 font-medium">{item.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="border-t border-[hsl(var(--border))] px-6 py-4">
                <p className="leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="mt-20">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Contactanos
        </h2>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          No encontraste lo que buscabas? Nuestro equipo esta listo para
          ayudarte.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Email */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-[hsl(var(--card-foreground))]">
              Correo Electronico
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Respondemos en menos de 24 horas.
            </p>
            <div className="mt-4 flex flex-col gap-1">
              <a
                href="mailto:soporte@red-salud.org"
                className="inline-block text-sm font-medium text-emerald-500 transition-colors hover:text-emerald-600"
              >
                soporte@red-salud.org
              </a>
              <a
                href="mailto:info@red-salud.org"
                className="inline-block text-sm font-medium text-emerald-500 transition-colors hover:text-emerald-600"
              >
                info@red-salud.org
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <MessageCircle className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold text-[hsl(var(--card-foreground))]">
              WhatsApp
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Chat directo con nuestro equipo.
            </p>
            <div
              className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-green-500/40 px-4 py-2 text-sm font-medium text-white/70"
              aria-disabled="true"
            >
              <MessageCircle className="h-4 w-4" />
              +58 412 516 0382
            </div>
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              Proximamente
            </p>
          </div>

          {/* Phone */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Phone className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-semibold text-[hsl(var(--card-foreground))]">
              Telefono
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Lunes a Viernes, 8am - 6pm.
            </p>
            <a
              href="tel:+584125160382"
              className="mt-4 inline-block text-sm font-medium text-emerald-500 transition-colors hover:text-emerald-600"
            >
              +58 412 516 0382
            </a>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mt-20">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-8 text-center">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
            Tambien te puede interesar
          </h2>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/seguridad"
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--surface-elevated))]"
            >
              Seguridad y Privacidad
            </Link>
            <Link
              href="/para-profesionales"
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--surface-elevated))]"
            >
              Para Profesionales
            </Link>
            <Link
              href="/nosotros"
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--surface-elevated))]"
            >
              Sobre Nosotros
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
