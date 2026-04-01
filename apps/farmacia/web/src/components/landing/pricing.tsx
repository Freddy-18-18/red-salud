import { Check, Sparkles, ArrowRight, Building2, Zap } from 'lucide-react';

const tiers = [
  {
    name: 'Gratis',
    description: 'Para farmacias que quieren dar el primer paso hacia la digitalizacion.',
    price: '$0',
    period: '/mes',
    badge: null,
    cta: 'Empezar gratis',
    ctaHref: '/auth/register',
    highlight: false,
    features: [
      '1 sucursal',
      'Hasta 500 productos',
      'POS basico (efectivo y tarjeta)',
      'Tasa BCV automatica',
      'Control de vencimientos',
      'Reportes basicos',
      'Soporte por email',
    ],
  },
  {
    name: 'Profesional',
    description: 'Para farmacias que quieren el paquete completo y crecer sin limites.',
    price: '$29',
    period: '/mes',
    badge: 'Mas popular',
    cta: 'Empezar prueba gratis',
    ctaHref: '/auth/register?plan=pro',
    highlight: true,
    features: [
      'Productos ilimitados',
      'Todos los metodos de pago',
      'Recetas digitales',
      'Reportes avanzados y KPIs',
      'Programa de fidelizacion',
      'Entregas a domicilio',
      'Gestion de proveedores',
      'Gestion de personal',
      'Integracion con seguros',
      'Soporte prioritario 24/7',
    ],
  },
  {
    name: 'Enterprise',
    description: 'Para cadenas y farmacias con necesidades especificas de integracion.',
    price: 'Contactar',
    period: '',
    badge: null,
    cta: 'Contactar ventas',
    ctaHref: '#contacto',
    highlight: false,
    features: [
      'Multi-sucursal ilimitado',
      'API para integraciones',
      'Dashboard corporativo',
      'Transferencias entre sedes',
      'Reportes consolidados',
      'Soporte dedicado',
      'Onboarding personalizado',
      'SLA garantizado',
    ],
  },
];

export function Pricing() {
  return (
    <section id="precios" className="relative bg-gray-50/50 py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-[500px] w-[500px] rounded-full bg-emerald-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700">
            <Sparkles className="h-4 w-4" />
            Precios transparentes
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Un plan para cada{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              etapa de tu farmacia
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Empieza gratis y crece a tu ritmo. Sin contratos, sin sorpresas.
            Cancela cuando quieras.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ${
                tier.highlight
                  ? 'border-2 border-blue-500 bg-white shadow-xl shadow-blue-500/10 lg:scale-105 lg:z-10'
                  : 'border border-gray-200 bg-white shadow-sm hover:shadow-md'
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute right-4 top-4">
                  <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    <Zap className="h-3 w-3" />
                    {tier.badge}
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Tier icon and name */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-extrabold ${
                      tier.highlight
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'
                        : 'text-gray-900'
                    }`}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-gray-500">{tier.period}</span>
                  )}
                </div>

                {/* CTA */}
                <a
                  href={tier.ctaHref}
                  className={`group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>
              </div>

              {/* Features */}
              <div className={`flex-1 border-t px-8 py-6 ${tier.highlight ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'}`}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {tier.name === 'Enterprise' ? 'Todo en Profesional, mas:' : 'Incluye:'}
                </p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          tier.highlight ? 'text-blue-500' : 'text-emerald-500'
                        }`}
                      />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {tier.name === 'Profesional' && (
                <div className="border-t border-blue-100 bg-blue-50/30 px-8 py-4">
                  <p className="flex items-center gap-2 text-xs text-blue-600">
                    <Building2 className="h-3.5 w-3.5" />
                    14 dias de prueba gratis. Sin tarjeta de credito.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ-style note */}
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-sm text-gray-500">
            Todos los precios en USD. Puedes pagar en bolivares a tasa BCV del dia.
            <br />
            Necesitas algo diferente?{' '}
            <a href="#contacto" className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4">
              Hablemos
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
