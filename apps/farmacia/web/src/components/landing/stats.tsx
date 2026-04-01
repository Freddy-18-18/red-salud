import {
  MapPin,
  DollarSign,
  ShieldCheck,
  Headphones,
} from 'lucide-react';

const stats = [
  {
    icon: MapPin,
    title: 'Hecho para Venezuela',
    description: 'Disenado desde cero para las necesidades unicas de las farmacias venezolanas.',
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: DollarSign,
    title: 'Integracion BCV',
    description: 'Tasa oficial del Banco Central de Venezuela sincronizada en tiempo real.',
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: ShieldCheck,
    title: 'Regulaciones SUNAHIP',
    description: 'Cumple con las regulaciones sanitarias y farmaceuticas vigentes.',
    gradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Equipo de soporte venezolano disponible cuando lo necesites. WhatsApp, chat o telefono.',
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export function Stats() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 sm:py-32">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Construido{' '}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              por venezolanos
            </span>
            , para venezolanos
          </h2>
          <p className="mt-4 text-lg text-blue-200/60">
            Entendemos tu realidad porque la vivimos. Red Salud no es un software
            generico adaptado — fue creado desde cero para tu contexto.
          </p>
        </div>

        {/* Stats grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
            >
              {/* Icon */}
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 transition-transform duration-300 group-hover:scale-110">
                <stat.icon className="h-7 w-7 text-blue-300" />
              </div>

              {/* Text */}
              <h3 className="mb-2 text-lg font-bold text-white">
                {stat.title}
              </h3>
              <p className="text-sm leading-relaxed text-blue-200/50">
                {stat.description}
              </p>

              {/* Hover accent */}
              <div
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
            </div>
          ))}
        </div>

        {/* Big number callouts */}
        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: '500+', label: 'Productos gratis' },
            { value: '5 min', label: 'Para empezar' },
            { value: '24/7', label: 'Soporte activo' },
            { value: '99.9%', label: 'Disponibilidad' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                {item.value}
              </div>
              <div className="mt-2 text-sm text-blue-200/50">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
