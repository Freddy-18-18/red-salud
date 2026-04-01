import { ArrowRight, Pill, CheckCircle2 } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-16 sm:px-12 sm:py-24 lg:px-20">
          {/* Background elements */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-emerald-500/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            {/* Icon */}
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Pill className="h-8 w-8 text-blue-300" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Empieza a digitalizar{' '}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                tu farmacia hoy
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-lg text-blue-200/60">
              Unete a las farmacias que ya estan dando el salto a la gestion digital.
              Tu competencia no va a esperar.
            </p>

            {/* Quick benefits */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                'Sin tarjeta de credito',
                'Gratis para empezar',
                'Listo en 5 minutos',
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-blue-200/70"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {benefit}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="/auth/register"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-blue-700 shadow-xl shadow-black/10 transition-all duration-300 hover:bg-blue-50 hover:shadow-2xl"
              >
                Registrar Mi Farmacia
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#precios"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-blue-100 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10"
              >
                Ver planes y precios
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
