import {
  Package,
  ShoppingCart,
  FileText,
  Calendar,
  DollarSign,
  Truck,
  BarChart3,
  Star,
  Users,
  MapPin,
  Shield,
  Building2,
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Inventario Inteligente',
    description:
      'Codigo de barras, lotes, control FEFO automatico. Sabe exactamente que tienes, donde esta y cuando vence.',
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    icon: ShoppingCart,
    title: 'Punto de Venta',
    description:
      'POS rapido con Bs, USD, Zelle, Pago Movil y tarjetas. Multiples pagos en una sola transaccion.',
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: FileText,
    title: 'Recetas Digitales',
    description:
      'Recibe recetas directamente de medicos en Red Salud. Verifica, dispensa y rastrea todo digitalmente.',
    color: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    icon: Calendar,
    title: 'Control de Vencimientos',
    description:
      'Alertas automaticas a 30, 60 y 90 dias. Nunca mas vendas un producto vencido ni pierdas inventario.',
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: DollarSign,
    title: 'Tasa BCV Automatica',
    description:
      'Sincronizacion automatica con la tasa oficial del BCV. Precios actualizados sin mover un dedo.',
    color: 'from-yellow-500 to-yellow-600',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-600',
  },
  {
    icon: Truck,
    title: 'Proveedores y Pedidos',
    description:
      'Gestion de proveedores, ordenes de compra automaticas por stock minimo y seguimiento de entregas.',
    color: 'from-sky-500 to-sky-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
  {
    icon: BarChart3,
    title: 'Reportes y Analitica',
    description:
      'Dashboard con KPIs de ventas, inventario, financieros y operativos. Toma decisiones con data real.',
    color: 'from-indigo-500 to-indigo-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    icon: Star,
    title: 'Programa de Fidelizacion',
    description:
      'Sistema de puntos y tiers para tus clientes. Fideliza, premia y haz que vuelvan siempre.',
    color: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
  },
  {
    icon: Users,
    title: 'Gestion de Personal',
    description:
      'Turnos, permisos, roles y control de acceso. Cada empleado ve solo lo que necesita.',
    color: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    icon: MapPin,
    title: 'Entregas a Domicilio',
    description:
      'Tracking en tiempo real, zonas de cobertura, asignacion de repartidores y notificaciones al cliente.',
    color: 'from-red-500 to-red-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
  },
  {
    icon: Shield,
    title: 'Integracion con Seguros',
    description:
      'Conecta con aseguradoras para validar coberturas, procesar reclamaciones y agilizar el pago.',
    color: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    icon: Building2,
    title: 'Multi-Sucursal',
    description:
      'Gestion centralizada de multiples sucursales. Un solo panel para verlo todo, transferencias entre sedes.',
    color: 'from-slate-500 to-slate-600',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-600',
  },
];

export function FeaturesGrid() {
  return (
    <section id="funcionalidades" className="relative bg-gray-50/50 py-24 sm:py-32">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Package className="h-4 w-4" />
            Todo lo que necesitas
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            12 modulos.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Una plataforma.
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Cada aspecto de tu farmacia cubierto. Desde el inventario hasta las entregas,
            todo integrado en un ecosistema que funciona.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5"
            >
              {/* Icon */}
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgLight} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
              </div>

              {/* Text */}
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>

              {/* Hover gradient line at bottom */}
              <div
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
