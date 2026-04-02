import type { Metadata } from 'next';
import { Mail, Clock, Send, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contacto — Red Salud',
  description:
    'Contactanos para cualquier consulta sobre Red Salud. Respondemos en menos de 24 horas.',
};

export default function ContactoPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 mb-8">
            <MessageSquare className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-teal-300">Contacto</span>
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Hablemos</h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            ¿Tenés preguntas sobre Red Salud? ¿Querés una demo personalizada? ¿Necesitás ayuda con
            tu cuenta? Estamos acá para ayudarte.
          </p>
        </div>
      </section>

      {/* Contact form + info */}
      <section className="py-16 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
                <h2 className="text-xl font-bold text-white mb-6">Envianos un mensaje</h2>
                <form className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-zinc-300 mb-1.5"
                    >
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Dr. Juan Pérez"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors duration-200 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-zinc-300 mb-1.5"
                    >
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="doctor@ejemplo.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors duration-200 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-zinc-300 mb-1.5"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Contanos cómo podemos ayudarte..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors duration-200 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-medium text-white hover:from-teal-400 hover:to-cyan-400 transition-all duration-200 shadow-lg shadow-teal-500/20"
                  >
                    <Send className="h-4 w-4" />
                    Enviar mensaje
                  </button>
                </form>
              </div>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 mb-4">
                  <Mail className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Correo de soporte</h3>
                <Link
                  href="mailto:soporte@redsalud.com"
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors duration-200"
                >
                  soporte@redsalud.com
                </Link>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 mb-4">
                  <Clock className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Tiempo de respuesta</h3>
                <p className="text-sm text-zinc-400">Respondemos en menos de 24 horas.</p>
              </div>

              {/* Social links placeholder */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Redes sociales</h3>
                <p className="text-sm text-zinc-500">Próximamente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
