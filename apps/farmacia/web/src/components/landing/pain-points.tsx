import {
  BookOpen,
  MonitorSmartphone,
  AlertTriangle,
  Bell,
  Calculator,
  Zap,
  FileX,
  FileCheck2,
  PieChart,
  BarChart3,
  Receipt,
  CreditCard,
} from 'lucide-react';

const painPoints = [
  {
    before: {
      icon: BookOpen,
      title: 'Inventario en cuadernos o Excel',
      description: 'Registro manual propenso a errores, productos perdidos y diferencias de inventario.',
    },
    after: {
      icon: MonitorSmartphone,
      title: 'Digitalizacion completa',
      description: 'Inventario en tiempo real con codigo de barras, lotes y trazabilidad total.',
    },
  },
  {
    before: {
      icon: AlertTriangle,
      title: 'Sin control de vencimientos',
      description: 'Productos vencidos en estante, perdidas economicas y riesgo sanitario.',
    },
    after: {
      icon: Bell,
      title: 'Alertas automaticas FEFO',
      description: 'Sistema First Expired, First Out con alertas 30, 60 y 90 dias antes del vencimiento.',
    },
  },
  {
    before: {
      icon: Calculator,
      title: 'Tasa del dolar manual',
      description: 'Actualizar precios manualmente cada dia, riesgo de vender a perdida.',
    },
    after: {
      icon: Zap,
      title: 'Integracion BCV en tiempo real',
      description: 'Tasa oficial del BCV sincronizada automaticamente. Precios siempre actualizados.',
    },
  },
  {
    before: {
      icon: FileX,
      title: 'Recetas en papel',
      description: 'Recetas ilegibles, sin verificacion, imposible rastrear dispensaciones.',
    },
    after: {
      icon: FileCheck2,
      title: 'Recetas digitales verificables',
      description: 'Recepcion digital desde medicos de Red Salud. Verificacion y trazabilidad completa.',
    },
  },
  {
    before: {
      icon: PieChart,
      title: 'Sin reportes de negocio',
      description: 'Decisiones a ciegas, sin saber que productos rotan mas ni cuanto vende cada turno.',
    },
    after: {
      icon: BarChart3,
      title: 'Dashboard con KPIs en tiempo real',
      description: 'Reportes de ventas, inventario, financieros y operativos. Data para decidir mejor.',
    },
  },
  {
    before: {
      icon: Receipt,
      title: 'Facturacion manual',
      description: 'Proceso lento, errores de calculo, colas largas y clientes frustrados.',
    },
    after: {
      icon: CreditCard,
      title: 'POS moderno multi-pago',
      description: 'Punto de venta rapido con efectivo, tarjeta, Pago Movil, Zelle y transferencia.',
    },
  },
];

export function PainPoints() {
  return (
    <section id="problemas" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">
            <AlertTriangle className="h-4 w-4" />
            Problemas que resolvemos
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Deja atras lo{' '}
            <span className="text-red-500 line-through decoration-red-300">manual</span>{' '}
            y abraza lo{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              digital
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Cada dia sin digitalizarte es dinero que pierdes. Estos son los problemas
            mas comunes de las farmacias venezolanas que resolvemos.
          </p>
        </div>

        {/* Pain points grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-100"
            >
              {/* Before */}
              <div className="mb-5 rounded-xl bg-red-50/70 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                    <point.before.icon className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                    Antes
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {point.before.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  {point.before.description}
                </p>
              </div>

              {/* Arrow divider */}
              <div className="flex items-center justify-center my-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 shadow-md shadow-blue-500/20">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                    />
                  </svg>
                </div>
              </div>

              {/* After */}
              <div className="mt-3 rounded-xl bg-emerald-50/70 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                    <point.after.icon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                    Con Red Salud
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {point.after.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  {point.after.description}
                </p>
              </div>

              {/* Hover accent */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
