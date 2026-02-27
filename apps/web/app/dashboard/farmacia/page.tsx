"use client";

import { useEffect, useState } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Pill,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

function KPICard({ title, value, icon, trend, color }: KPICardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", color)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface AlertItem {
  id: string;
  tipo: string;
  titulo: string;
  prioridad: string;
}

interface SaleItem {
  id: string;
  total: number;
  fecha: string;
}

export default function DashboardFarmaciaPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKPIs] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    productosBajos: 0,
    productosVencidos: 0,
    recetasPendientes: 0,
    clientesActivos: 0,
  });
  const [ventasRecientes, setVentasRecientes] = useState<SaleItem[]>([]);
  const [alertas, setAlertas] = useState<AlertItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch data from API routes
      const [salesResponse, inventoryResponse] = await Promise.all([
        fetch(`/api/pharmacy/reports?type=sales&date_from=${today}&date_to=${today}`),
        fetch(`/api/pharmacy/inventory?low_stock=true`)
      ]);

      const salesData = salesResponse.ok ? await salesResponse.json() : { data: { invoices: [], metrics: {} } };
      const inventoryData = inventoryResponse.ok ? await inventoryResponse.json() : { data: { batches: [], metrics: {} } };

      // Calculate KPIs
      const ventasHoy = salesData.data?.metrics?.total_sales_usd || 0;
      const ventasMes = salesData.data?.metrics?.total_sales_usd || 0; // Would need separate query for month
      const productosBajos = inventoryData.data?.metrics?.low_stock_count || 0;
      const productosVencidos = inventoryData.data?.metrics?.expiring_soon_count || 0;

      // Mock data for other KPIs (would need proper endpoints)
      const recetasPendientes = 0;
      const clientesActivos = 0;

      setKPIs({
        ventasHoy,
        ventasMes,
        productosBajos,
        productosVencidos,
        recetasPendientes,
        clientesActivos,
      });

      // Set recent sales
      setVentasRecientes(
        salesData.data?.invoices?.slice(0, 5).map((inv: { id: string; total_usd: number; created_at: string }) => ({
          id: inv.id,
          total: inv.total_usd,
          fecha: inv.created_at,
        })) || []
      );

      // Generate alerts from inventory data
      const alertasGeneradas: AlertItem[] = [];

      if (productosVencidos > 0) {
        alertasGeneradas.push({
          id: 'alert-1',
          tipo: 'Vencimiento',
          titulo: `${productosVencidos} productos por vencer`,
          prioridad: 'critica',
        });
      }

      if (productosBajos > 0) {
        alertasGeneradas.push({
          id: 'alert-2',
          tipo: 'Stock Bajo',
          titulo: `${productosBajos} productos con stock bajo`,
          prioridad: productosBajos > 10 ? 'alta' : 'media',
        });
      }

      setAlertas(alertasGeneradas);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard de Farmacia</h1>
              <p className="text-muted-foreground">
                Gestión integral de tu farmacia
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleDateString("es-VE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <KPICard
            title="Ventas Hoy"
            value={`$${kpis.ventasHoy.toFixed(2)}`}
            icon={<DollarSign />}
            color="border-green-500/20"
          />
          <KPICard
            title="Ventas del Mes"
            value={`$${kpis.ventasMes.toFixed(2)}`}
            icon={<TrendingUp />}
            color="border-blue-500/20"
          />
          <KPICard
            title="Productos Stock Bajo"
            value={kpis.productosBajos}
            icon={<Package />}
            color="border-yellow-500/20"
          />
          <KPICard
            title="Productos Vencidos"
            value={kpis.productosVencidos}
            icon={<AlertTriangle />}
            color="border-red-500/20"
          />
          <KPICard
            title="Recetas Pendientes"
            value={kpis.recetasPendientes}
            icon={<Pill />}
            color="border-purple-500/20"
          />
          <KPICard
            title="Clientes Activos"
            value={kpis.clientesActivos}
            icon={<Users />}
            color="border-cyan-500/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Ventas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ventasRecientes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay ventas registradas
                </p>
              ) : (
                <div className="space-y-3">
                  {ventasRecientes.map((venta) => (
                    <div
                      key={venta.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          Venta #{venta.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(venta.fecha).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                      <p className="font-bold text-green-600">
                        ${venta.total.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay alertas activas
                </p>
              ) : (
                <div className="space-y-3">
                  {alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className={`p-3 rounded-lg border ${alerta.prioridad === "critica"
                        ? "bg-red-50 border-red-200"
                        : alerta.prioridad === "alta"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-blue-50 border-blue-200"
                        }`}
                    >
                      <p className="font-medium">{alerta.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {alerta.tipo}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/dashboard/farmacia/inventario"
                className="flex flex-col items-center p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Package className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">Inventario</span>
              </a>
              <a
                href="/dashboard/farmacia/caja"
                className="flex flex-col items-center p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
              >
                <ShoppingCart className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">Caja POS</span>
              </a>
              <a
                href="/dashboard/farmacia/recetas"
                className="flex flex-col items-center p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Pill className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">Recetas</span>
              </a>
              <a
                href="/dashboard/farmacia/ventas"
                className="flex flex-col items-center p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
              >
                <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">Ventas</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
