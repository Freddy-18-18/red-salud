"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  Package,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { getCurrentPharmacyId } from "@/lib/services/settings-service";
import { getLatestExchangeRate } from "@/lib/services/exchange-rate-service";
import {
  getSalesMetrics,
  getSalesByPaymentMethod,
  getSalesByDay,
  getTopProducts,
  getInventoryMetrics,
  getExpiringProducts,
  getFinancialMetrics,
  getSalesByCategory,
  exportToCsv,
  type SalesMetrics,
  type SalesByPaymentMethod,
  type SalesByDay,
  type TopProduct,
  type InventoryMetrics,
  type ExpiringProduct,
  type FinancialMetrics,
  type CategorySales,
} from "@/lib/services/reports-service";

// ============================================================================
// Date Range Helpers
// ============================================================================

type DatePreset = "today" | "week" | "month" | "custom";

function getDateRange(preset: DatePreset): { from: string; to: string } {
  const today = new Date();
  const to = today.toISOString().split("T")[0];

  switch (preset) {
    case "today":
      return { from: to, to };
    case "week": {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { from: weekAgo.toISOString().split("T")[0], to };
    }
    case "month": {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: monthStart.toISOString().split("T")[0], to };
    }
    default:
      return { from: to, to };
  }
}

// ============================================================================
// CSS Charts
// ============================================================================

function PieChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Sin datos
      </div>
    );
  }

  let cumPercent = 0;
  const segments = data.map((d) => {
    const percent = (d.value / total) * 100;
    const start = cumPercent;
    cumPercent += percent;
    return { ...d, percent, start };
  });

  const gradientParts = segments.map(
    (s) => `${s.color} ${s.start}% ${s.start + s.percent}%`
  );

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-40 h-40 rounded-full shrink-0"
        style={{
          background: `conic-gradient(${gradientParts.join(", ")})`,
        }}
      />
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="truncate">{s.label}</span>
            <span className="font-medium ml-auto">{s.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({
  data,
  maxHeight = 160,
}: {
  data: { label: string; value: number }[];
  maxHeight?: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Sin datos
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1" style={{ height: maxHeight + 40 }}>
      {data.map((d, i) => {
        const height = (d.value / maxValue) * maxHeight;
        return (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0">
            <span className="text-[10px] font-medium mb-1">
              ${d.value.toFixed(0)}
            </span>
            <div
              className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors min-w-[8px]"
              style={{ height: Math.max(height, 2) }}
              title={`${d.label}: $${d.value.toFixed(2)}`}
            />
            <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Report Tabs
// ============================================================================

type ReportTab = "ventas" | "inventario" | "financiero" | "productos";

const PAYMENT_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  pago_movil: "Pago Movil",
  zelle: "Zelle",
  transferencia: "Transferencia",
  seguro: "Seguro",
  otro: "Otro",
};

function formatVeDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit" });
}

function fmtUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function fmtBs(n: number) {
  return `Bs. ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;
}

// ============================================================================
// Page Component
// ============================================================================

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(36);

  const [activeTab, setActiveTab] = useState<ReportTab>("ventas");
  const [datePreset, setDatePreset] = useState<DatePreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Sales data
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<SalesByPaymentMethod[]>([]);
  const [salesByDay, setSalesByDay] = useState<SalesByDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  // Inventory data
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics | null>(null);
  const [expiringProducts, setExpiringProducts] = useState<ExpiringProduct[]>([]);

  // Financial data
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [categoryData, setCategoryData] = useState<CategorySales[]>([]);

  const dateRange =
    datePreset === "custom"
      ? { from: customFrom, to: customTo }
      : getDateRange(datePreset);

  const loadData = useCallback(async () => {
    if (!pharmacyId || !dateRange.from || !dateRange.to) return;
    setLoading(true);

    try {
      if (activeTab === "ventas") {
        const [metrics, methods, daily, top] = await Promise.all([
          getSalesMetrics(pharmacyId, dateRange.from, dateRange.to),
          getSalesByPaymentMethod(pharmacyId, dateRange.from, dateRange.to),
          getSalesByDay(pharmacyId, dateRange.from, dateRange.to),
          getTopProducts(pharmacyId, dateRange.from, dateRange.to),
        ]);
        setSalesMetrics(metrics);
        setPaymentMethods(methods);
        setSalesByDay(daily);
        setTopProducts(top);
      } else if (activeTab === "inventario") {
        const [metrics, expiring] = await Promise.all([
          getInventoryMetrics(pharmacyId, exchangeRate),
          getExpiringProducts(pharmacyId),
        ]);
        setInventoryMetrics(metrics);
        setExpiringProducts(expiring);
      } else if (activeTab === "financiero") {
        const [metrics, cats] = await Promise.all([
          getFinancialMetrics(pharmacyId, dateRange.from, dateRange.to, exchangeRate),
          getSalesByCategory(pharmacyId, dateRange.from, dateRange.to),
        ]);
        setFinancialMetrics(metrics);
        setCategoryData(cats);
      } else if (activeTab === "productos") {
        const top = await getTopProducts(pharmacyId, dateRange.from, dateRange.to, 20);
        setTopProducts(top);
      }
    } catch (err) {
      console.error("Error loading report data:", err);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId, dateRange.from, dateRange.to, activeTab, exchangeRate]);

  useEffect(() => {
    async function init() {
      const pid = await getCurrentPharmacyId();
      setPharmacyId(pid);
      const rate = await getLatestExchangeRate();
      setExchangeRate(rate.rate);
    }
    init();
  }, []);

  useEffect(() => {
    if (pharmacyId) loadData();
  }, [pharmacyId, loadData]);

  // ---- Export handlers ----

  const exportSales = () => {
    if (!salesMetrics) return;
    const headers = [
      "Metodo Pago",
      "Cantidad Facturas",
      "Total USD",
      "Total Bs",
    ];
    const rows = paymentMethods.map((p) => [
      PAYMENT_LABELS[p.method] || p.method,
      p.count,
      p.total_usd.toFixed(2),
      p.total_bs.toFixed(2),
    ]);
    exportToCsv(headers, rows, `reporte-ventas-${dateRange.from}-${dateRange.to}`);
  };

  const exportInventory = () => {
    const headers = [
      "Producto",
      "Lote",
      "Fecha Vencimiento",
      "Cantidad",
      "Dias Restantes",
    ];
    const rows = expiringProducts.map((p) => [
      p.product_name,
      p.batch_number,
      p.expiry_date,
      p.quantity_available,
      p.days_until_expiry,
    ]);
    exportToCsv(headers, rows, `reporte-inventario-${new Date().toISOString().split("T")[0]}`);
  };

  const exportFinancial = () => {
    if (!financialMetrics) return;
    const headers = ["Categoria", "Total USD", "Cantidad Items"];
    const rows = categoryData.map((c) => [
      c.category,
      c.total_usd.toFixed(2),
      c.count,
    ]);
    exportToCsv(headers, rows, `reporte-financiero-${dateRange.from}-${dateRange.to}`);
  };

  const exportTopProducts = () => {
    const headers = ["Producto", "Cantidad Vendida", "Ingresos USD"];
    const rows = topProducts.map((p) => [
      p.name,
      p.quantity_sold,
      p.revenue_usd.toFixed(2),
    ]);
    exportToCsv(headers, rows, `top-productos-${dateRange.from}-${dateRange.to}`);
  };

  // ---- Loading ----

  if (!pharmacyId && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No se encontro la farmacia asociada a tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Reportes</h1>
              <p className="text-muted-foreground">
                Analisis detallado de tu farmacia
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Tab selector */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "ventas", label: "Ventas", icon: ShoppingCart },
              { key: "inventario", label: "Inventario", icon: Package },
              { key: "financiero", label: "Financiero", icon: DollarSign },
              { key: "productos", label: "Productos", icon: TrendingUp },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date range picker */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">Periodo:</span>
              {(
                [
                  { key: "today", label: "Hoy" },
                  { key: "week", label: "Esta semana" },
                  { key: "month", label: "Este mes" },
                  { key: "custom", label: "Personalizado" },
                ] as const
              ).map((p) => (
                <button
                  key={p.key}
                  onClick={() => setDatePreset(p.key)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    datePreset === p.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {datePreset === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="px-3 py-1.5 rounded border text-sm bg-background"
                  />
                  <span className="text-muted-foreground">a</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="px-3 py-1.5 rounded border text-sm bg-background"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Generando reporte...</p>
            </div>
          </div>
        ) : (
          <>
            {/* =================== VENTAS TAB =================== */}
            {activeTab === "ventas" && salesMetrics && (
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Ventas (USD)</p>
                      <p className="text-2xl font-bold text-green-600">
                        {fmtUsd(salesMetrics.total_sales_usd)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fmtBs(salesMetrics.total_sales_bs)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Facturas</p>
                      <p className="text-2xl font-bold">{salesMetrics.total_invoices}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {salesMetrics.voided_count} anuladas
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Promedio por Venta</p>
                      <p className="text-2xl font-bold">
                        {fmtUsd(salesMetrics.average_per_sale_usd)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Tasa BCV</p>
                      <p className="text-2xl font-bold">
                        Bs. {exchangeRate.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-4 w-4" />
                        Ventas por Metodo de Pago
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PieChart
                        data={paymentMethods.map((p, i) => ({
                          label: PAYMENT_LABELS[p.method] || p.method,
                          value: p.total_usd,
                          color: PAYMENT_COLORS[i % PAYMENT_COLORS.length],
                        }))}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4" />
                        Ventas por Dia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChart
                        data={salesByDay.map((d) => ({
                          label: formatVeDate(d.date),
                          value: d.total_usd,
                        }))}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Top Products Table */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Top 10 Productos Mas Vendidos
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={exportSales}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {topProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No hay datos de productos para este periodo
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium">#</th>
                              <th className="text-left py-2 font-medium">Producto</th>
                              <th className="text-right py-2 font-medium">Cantidad</th>
                              <th className="text-right py-2 font-medium">Ingresos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topProducts.map((p, i) => (
                              <tr key={p.product_id} className="border-b last:border-0">
                                <td className="py-2 text-muted-foreground">{i + 1}</td>
                                <td className="py-2 font-medium">{p.name}</td>
                                <td className="py-2 text-right">{p.quantity_sold}</td>
                                <td className="py-2 text-right font-medium text-green-600">
                                  {fmtUsd(p.revenue_usd)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* =================== INVENTARIO TAB =================== */}
            {activeTab === "inventario" && inventoryMetrics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Productos</p>
                      <p className="text-2xl font-bold">{inventoryMetrics.total_products}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Productos Activos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {inventoryMetrics.active_products}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Agotados</p>
                      <p className="text-2xl font-bold text-red-600">
                        {inventoryMetrics.out_of_stock}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Stock Bajo</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {inventoryMetrics.low_stock}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Inventory Value */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Valor del Inventario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Valor total (USD)</p>
                        <p className="text-3xl font-bold text-green-600">
                          {fmtUsd(inventoryMetrics.total_value_usd)}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Valor total (Bs)</p>
                        <p className="text-3xl font-bold">
                          {fmtBs(inventoryMetrics.total_value_bs)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expiring Products */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Productos Proximos a Vencer
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={exportInventory}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {expiringProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No hay productos proximos a vencer
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium">Producto</th>
                              <th className="text-left py-2 font-medium">Lote</th>
                              <th className="text-left py-2 font-medium">Vencimiento</th>
                              <th className="text-right py-2 font-medium">Cantidad</th>
                              <th className="text-right py-2 font-medium">Dias</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expiringProducts.map((p) => (
                              <tr key={p.id} className="border-b last:border-0">
                                <td className="py-2 font-medium">{p.product_name}</td>
                                <td className="py-2 text-muted-foreground">
                                  {p.batch_number}
                                </td>
                                <td className="py-2">
                                  {new Date(p.expiry_date).toLocaleDateString("es-VE")}
                                </td>
                                <td className="py-2 text-right">{p.quantity_available}</td>
                                <td className="py-2 text-right">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      p.days_until_expiry <= 30
                                        ? "bg-red-100 text-red-800"
                                        : p.days_until_expiry <= 60
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {p.days_until_expiry} dias
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* =================== FINANCIERO TAB =================== */}
            {activeTab === "financiero" && financialMetrics && (
              <div className="space-y-6">
                {/* Main Financial KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Ingresos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {fmtUsd(financialMetrics.total_revenue_usd)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fmtBs(financialMetrics.total_revenue_bs)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Costos</p>
                      <p className="text-2xl font-bold text-red-600">
                        {fmtUsd(financialMetrics.total_cost_usd)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fmtBs(financialMetrics.total_cost_bs)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Margen Bruto</p>
                      <p className="text-2xl font-bold text-green-600">
                        {fmtUsd(financialMetrics.gross_margin_usd)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Margen: {financialMetrics.gross_margin_percent.toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Margin visual bar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Ingresos vs Costos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Ingresos</span>
                          <span className="font-medium">
                            {fmtUsd(financialMetrics.total_revenue_usd)}
                          </span>
                        </div>
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Costos</span>
                          <span className="font-medium">
                            {fmtUsd(financialMetrics.total_cost_usd)}
                          </span>
                        </div>
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{
                              width: `${
                                financialMetrics.total_revenue_usd > 0
                                  ? (financialMetrics.total_cost_usd /
                                      financialMetrics.total_revenue_usd) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Margen</span>
                          <span className="font-medium">
                            {fmtUsd(financialMetrics.gross_margin_usd)}
                          </span>
                        </div>
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${financialMetrics.gross_margin_percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales by Category */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Ventas por Categoria</CardTitle>
                    <Button variant="outline" size="sm" onClick={exportFinancial}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {categoryData.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Sin datos para este periodo
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {categoryData.map((c, i) => {
                          const maxCat = categoryData[0]?.total_usd || 1;
                          const percent = (c.total_usd / maxCat) * 100;
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{c.category}</span>
                                <span>{fmtUsd(c.total_usd)} ({c.count} items)</span>
                              </div>
                              <div className="h-4 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor:
                                      PAYMENT_COLORS[i % PAYMENT_COLORS.length],
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* =================== PRODUCTOS TAB =================== */}
            {activeTab === "productos" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    Ranking de Productos ({topProducts.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={exportTopProducts}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No hay ventas de productos en este periodo
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.map((p, i) => {
                        const maxQty = topProducts[0]?.quantity_sold || 1;
                        const percent = (p.quantity_sold / maxQty) * 100;
                        return (
                          <div key={p.product_id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">
                                <span className="text-muted-foreground mr-2">
                                  #{i + 1}
                                </span>
                                {p.name}
                              </span>
                              <span>
                                {p.quantity_sold} uds. | {fmtUsd(p.revenue_usd)}
                              </span>
                            </div>
                            <div className="h-5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/70 rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
