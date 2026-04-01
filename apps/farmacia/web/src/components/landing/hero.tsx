import {
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Glow effect behind */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-blue-500/20 blur-2xl" />

      {/* Main window */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />
          </div>
          <div className="ml-3 flex-1 rounded-md bg-white/10 px-3 py-1 text-xs text-blue-200/70">
            farmacia.redsalud.ve/dashboard
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 sm:p-5">
          {/* Top KPIs */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Ventas Hoy', value: '$2,847', icon: ShoppingCart, trend: '+12%', color: 'text-emerald-300' },
              { label: 'Productos', value: '1,234', icon: Package, trend: '98% stock', color: 'text-blue-300' },
              { label: 'Recetas', value: '47', icon: FileText, trend: '+8 hoy', color: 'text-purple-300' },
              { label: 'Tasa BCV', value: 'Bs 36.50', icon: DollarSign, trend: 'Actual', color: 'text-yellow-300' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl bg-white/10 p-3 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  <span className="text-[10px] text-emerald-300">{kpi.trend}</span>
                </div>
                <p className="mt-2 text-lg font-bold text-white">{kpi.value}</p>
                <p className="text-[10px] text-blue-200/60">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="rounded-xl bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-blue-200/70">Ventas Semanales</span>
              <div className="flex items-center gap-1 text-emerald-300">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[10px]">+23%</span>
              </div>
            </div>
            {/* Simple bar chart */}
            <div className="flex items-end gap-1.5 h-20">
              {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-blue-500/60 to-emerald-400/60 transition-all duration-700"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[8px] text-blue-200/40">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-blue-300" />
                <span className="text-[10px] text-blue-200/70">Top Productos</span>
              </div>
              <div className="space-y-1.5">
                {['Losartan 50mg', 'Omeprazol 20mg', 'Metformina 850mg'].map((name, i) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400"
                        style={{ width: `${90 - i * 20}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-blue-200/50 whitespace-nowrap">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                <span className="text-[10px] text-blue-200/70">Alertas</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { text: '3 productos por vencer', color: 'bg-yellow-400/20 text-yellow-300' },
                  { text: '5 bajo stock minimo', color: 'bg-red-400/20 text-red-300' },
                  { text: '2 pedidos en camino', color: 'bg-blue-400/20 text-blue-300' },
                ].map((alert) => (
                  <div key={alert.text} className={`rounded-md px-2 py-1 text-[9px] ${alert.color}`}>
                    {alert.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-screen items-center gap-12 py-24 lg:grid-cols-2 lg:gap-16 lg:py-0">
          {/* Left - Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-blue-200">
                Plataforma 100% venezolana
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              La plataforma que{' '}
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                digitaliza
              </span>{' '}
              tu farmacia
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-blue-200/70 sm:text-xl">
              Gestion de inventario, punto de venta, recetas digitales, integracion
              BCV y mucho mas. Todo lo que necesitas para modernizar tu farmacia en
              una sola plataforma.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
              {[
                'Tasa BCV automatica',
                'Recetas digitales',
                'Multi-pago',
                'FEFO automatico',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm text-blue-200/80 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="/auth/register"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition-all duration-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-2xl hover:shadow-blue-500/30"
              >
                Registrar Mi Farmacia
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-blue-100 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
              >
                Ver como funciona
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-8 text-sm text-blue-300/40">
              Sin tarjeta de credito. Gratis para comenzar. Listo en 5 minutos.
            </p>
          </div>

          {/* Right - Dashboard mockup */}
          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
