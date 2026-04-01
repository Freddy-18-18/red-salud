import Link from "next/link";
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  CircleDollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import {
  getDashboardStats,
  getPharmacyForUser,
  getRecentSales,
  getRecentAlerts,
  getSalesLast7Days,
  getTopProducts,
} from "@/lib/services/dashboard-service";
import {
  getLatestExchangeRate,
  formatUsd,
  formatBs,
  formatRelativeTime,
} from "@/lib/services/exchange-rate-service";
import { redirect } from "next/navigation";

// ---------- Payment method display ----------

const PAYMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  pago_movil: Smartphone,
  zelle: CircleDollarSign,
  transferencia: CreditCard,
};

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  pago_movil: "Pago Movil",
  zelle: "Zelle",
  transferencia: "Transferencia",
};

// ---------- Severity styles ----------

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  high: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

// ---------- Page ----------

export default async function DashboardPage() {
  const pharmacy = await getPharmacyForUser();
  if (!pharmacy) redirect("/onboarding");

  const exchangeRate = await getLatestExchangeRate();
  const bcvRate = exchangeRate.rate;

  // Parallel data fetching
  const [stats, recentSales, recentAlerts, salesLast7Days, topProducts] =
    await Promise.all([
      getDashboardStats(pharmacy.id),
      getRecentSales(pharmacy.id, 5),
      getRecentAlerts(pharmacy.id, 5),
      getSalesLast7Days(pharmacy.id),
      getTopProducts(pharmacy.id, 5),
    ]);

  // Compute chart bar heights
  const maxDailySales = Math.max(...salesLast7Days.map((d) => d.totalUsd), 1);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Resumen de tu farmacia &mdash;{" "}
            {new Date().toLocaleDateString("es-VE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          Tasa BCV: Bs. {bcvRate.toFixed(2)}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales today */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Ventas Hoy
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatUsd(stats.salesTodayUsd)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatBs(stats.salesTodayBs || stats.salesTodayUsd * bcvRate)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-slate-400">
                {stats.salesTodayCount} ventas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active products */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Productos Activos
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.activeProducts}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              de {stats.totalProducts} total
            </p>
            {stats.lowStockProducts > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <ArrowDownRight className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-amber-600">
                  {stats.lowStockProducts} stock bajo
                </span>
              </div>
            )}
            {stats.outOfStockProducts > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-medium text-red-600">
                  {stats.outOfStockProducts} agotados
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unread alerts */}
        <Card
          className={cn(
            "border-l-4",
            stats.criticalAlerts > 0
              ? "border-l-red-500"
              : "border-l-amber-500",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Alertas Sin Leer
            </CardTitle>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                stats.criticalAlerts > 0 ? "bg-red-100" : "bg-amber-100",
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-4 w-4",
                  stats.criticalAlerts > 0
                    ? "text-red-600"
                    : "text-amber-600",
                )}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.unreadAlerts}
            </div>
            {stats.criticalAlerts > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-red-600">
                  {stats.criticalAlerts} criticas
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              {stats.expiringSoonBatches > 0 && (
                <span>{stats.expiringSoonBatches} por vencer</span>
              )}
              {stats.expiredBatches > 0 && (
                <span className="text-red-500">
                  {stats.expiredBatches} vencidos
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* BCV Rate */}
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Tasa BCV
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <TrendingUp className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              Bs. {bcvRate.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              1 USD = Bs. {bcvRate.toFixed(4)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-slate-400">
                {exchangeRate.source === "fallback"
                  ? "Sin datos recientes"
                  : `Actualizado: ${new Date(exchangeRate.validDate).toLocaleDateString("es-VE", { day: "2-digit", month: "short" })}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Top Products row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart (last 7 days) — CSS-only bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Ventas - Ultimos 7 Dias
            </CardTitle>
            <Link
              href="/dashboard/reportes"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver reportes
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {salesLast7Days.every((d) => d.totalUsd === 0) ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                Sin ventas registradas en los ultimos 7 dias
              </div>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {salesLast7Days.map((day) => {
                  const heightPct = maxDailySales > 0
                    ? (day.totalUsd / maxDailySales) * 100
                    : 0;
                  const dayLabel = new Date(day.date + "T12:00:00").toLocaleDateString(
                    "es-VE",
                    { weekday: "short" },
                  );
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      {/* Amount label */}
                      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                        {day.totalUsd > 0 ? `$${day.totalUsd.toFixed(0)}` : ""}
                      </span>
                      {/* Bar */}
                      <div className="w-full flex justify-center">
                        <div
                          className="w-8 sm:w-10 rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                          style={{
                            height: `${Math.max(heightPct, 2)}%`,
                            maxHeight: "160px",
                            minHeight: day.totalUsd > 0 ? "8px" : "2px",
                          }}
                        />
                      </div>
                      {/* Day label */}
                      <span className="text-[11px] text-slate-400 capitalize">
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Monthly summary */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500">Total del mes</span>
              <div className="text-right">
                <span className="font-bold text-slate-900">
                  {formatUsd(stats.salesMonthUsd)}
                </span>
                <span className="text-slate-400 text-xs ml-2">
                  ({stats.salesMonthCount} ventas)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Productos Top
            </CardTitle>
            <span className="text-[11px] text-slate-400">Ultimos 30 dias</span>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                Sin datos de ventas
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, i) => {
                  const maxQty = topProducts[0]?.totalQuantity || 1;
                  const pct = (product.totalQuantity / maxQty) * 100;
                  return (
                    <div key={product.productId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-slate-400 w-4 shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-700 truncate">
                            {product.productName}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 shrink-0 ml-2">
                          {formatUsd(product.totalUsd)}
                        </span>
                      </div>
                      <div className="ml-6">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {product.totalQuantity} unidades vendidas
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-slate-500" />
              Ventas Recientes
            </CardTitle>
            <Link
              href="/dashboard/ventas"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver todas
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No hay ventas registradas
              </div>
            ) : (
              <div className="space-y-2">
                {recentSales.map((sale) => {
                  const PaymentIcon =
                    PAYMENT_ICONS[sale.paymentMethod] || CreditCard;
                  return (
                    <div
                      key={sale.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                        <PaymentIcon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {sale.invoiceNumber}
                        </p>
                        <p className="text-xs text-slate-400">
                          {PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}{" "}
                          &middot; {sale.itemCount} items &middot;{" "}
                          {formatRelativeTime(sale.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-600">
                          {formatUsd(sale.totalUsd)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatBs(sale.totalBs || sale.totalUsd * bcvRate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-500" />
              Alertas Recientes
            </CardTitle>
            <Link
              href="/dashboard/alertas"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver todas
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No hay alertas activas
              </div>
            ) : (
              <div className="space-y-2">
                {recentAlerts.map((alert) => {
                  const styles =
                    SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.low;
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        styles.bg,
                        styles.border,
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              styles.text,
                            )}
                          >
                            {alert.title}
                          </p>
                          {alert.message && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {alert.message}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] shrink-0 capitalize",
                            styles.badge,
                          )}
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        {alert.type} &middot;{" "}
                        {formatRelativeTime(alert.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Accesos Rapidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/dashboard/caja"
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Nueva Venta
              </span>
            </Link>

            <Link
              href="/dashboard/productos"
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Agregar Producto
              </span>
            </Link>

            <Link
              href="/dashboard/recetas"
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 hover:border-violet-300 hover:shadow-md transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors">
                <FileText className="h-6 w-6 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Ver Recetas
              </span>
            </Link>

            <Link
              href="/dashboard/reportes"
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Ver Reportes
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
