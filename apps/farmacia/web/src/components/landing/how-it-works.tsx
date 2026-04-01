import { Building2, PackagePlus, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Building2,
    title: 'Registra tu farmacia',
    description:
      'Crea tu cuenta en minutos. Solo necesitas los datos basicos de tu farmacia, RIF y direccion. Sin papeleos innecesarios.',
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
    ringColor: 'ring-blue-100',
  },
  {
    number: '02',
    icon: PackagePlus,
    title: 'Carga tu inventario',
    description:
      'Importa desde Excel o escanea con codigo de barras. Nuestro sistema reconoce automaticamente los productos mas comunes del mercado venezolano.',
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    ringColor: 'ring-emerald-100',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Empieza a vender',
    description:
      'Tu punto de venta esta listo. Empieza a facturar con multiples metodos de pago, tasa BCV automatica y recetas digitales desde el dia uno.',
    color: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    iconColor: 'text-purple-600',
    ringColor: 'ring-purple-100',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <Rocket className="h-4 w-4" />
            Facil y rapido
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Operativo en{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              tres pasos
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            No necesitas ser experto en tecnologia. Si sabes usar un telefono, puedes
            usar Red Salud.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-20">
          {/* Connection line - desktop */}
          <div className="absolute left-0 right-0 top-24 hidden h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 lg:block" />

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                {/* Step number */}
                <div className="relative mx-auto mb-8">
                  <div
                    className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${step.bgLight} ring-8 ${step.ringColor} transition-transform duration-300 hover:scale-105`}
                  >
                    <step.icon className={`h-9 w-9 ${step.iconColor}`} />
                  </div>
                  <div
                    className={`absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-xs font-bold text-white shadow-lg`}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/30"
          >
            Empieza ahora — es gratis
            <Rocket className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
