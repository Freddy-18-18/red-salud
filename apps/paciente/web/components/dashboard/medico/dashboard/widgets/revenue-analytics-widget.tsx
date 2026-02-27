"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { WidgetWrapper } from "../widget-wrapper";
import { Card, CardContent } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3 } from "lucide-react";
import { Skeleton } from "@red-salud/design-system";

interface RevenueData {
  total_revenue: number;
  monthly_revenue: number;
  weekly_revenue: number;
  revenue_growth: number;
  projected_revenue: number;
  top_services: Array<{
    service: string;
    revenue: number;
    percentage: number;
  }>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    consultations: number;
  }>;
}

interface RevenueAnalyticsWidgetProps {
  doctorId?: string;
}

export function RevenueAnalyticsWidget({ doctorId }: RevenueAnalyticsWidgetProps) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos de ingresos del médico
      const { data: revenueData, error: revenueError } = await supabase
        .from("doctor_revenue_analytics")
        .select("*")
        .eq("doctor_id", doctorId)
        .single();

      if (revenueError && revenueError.code !== 'PGRST116') {
        throw revenueError;
      }

      // Si no hay datos, calcular desde consultas
      if (!revenueData) {
        const { data: consultations, error: consultationsError } = await supabase
          .from("consultas")
          .select(`
            precio_consulta,
            fecha_hora,
            tipo_cita,
            status
          `)
          .eq("doctor_id", doctorId)
          .eq("status", "completada")
          .gte("fecha_hora", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        if (consultationsError) throw consultationsError;

        // Calcular métricas básicas
        const totalRevenue = consultations?.reduce((sum, c) => sum + (c.precio_consulta || 0), 0) || 0;
        const monthlyRevenue = consultations
          ?.filter(c => new Date(c.fecha_hora) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, c) => sum + (c.precio_consulta || 0), 0) || 0;

        const weeklyRevenue = consultations
          ?.filter(c => new Date(c.fecha_hora) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((sum, c) => sum + (c.precio_consulta || 0), 0) || 0;

        // Calcular crecimiento (comparar con mes anterior)
        const lastMonthRevenue = consultations
          ?.filter(c => {
            const date = new Date(c.fecha_hora);
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return date >= lastMonth && date < thisMonth;
          })
          .reduce((sum, c) => sum + (c.precio_consulta || 0), 0) || 0;

        const revenueGrowth = lastMonthRevenue > 0
          ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

        setData({
          total_revenue: totalRevenue,
          monthly_revenue: monthlyRevenue,
          weekly_revenue: weeklyRevenue,
          revenue_growth: revenueGrowth,
          projected_revenue: monthlyRevenue * 12, // Proyección simple
          top_services: [],
          revenue_by_month: []
        });
      } else {
        setData(revenueData);
      }
    } catch (err) {
      console.error("Error loading revenue data:", err);
      setError("Error al cargar datos de ingresos");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (doctorId) {
      loadRevenueData();
    }
  }, [doctorId, loadRevenueData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <WidgetWrapper
        id="revenue-analytics"
        title="Análisis Financiero"
        icon={<BarChart3 className="h-4 w-4 text-primary" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </WidgetWrapper>
    );
  }

  if (error || !data) {
    return (
      <WidgetWrapper
        id="revenue-analytics"
        title="Análisis Financiero"
        icon={<BarChart3 className="h-4 w-4 text-primary" />}
      >
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-8">
          <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
          <p>{error || "No hay datos disponibles"}</p>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      id="revenue-analytics"
      title="Análisis Financiero"
      icon={<BarChart3 className="h-4 w-4 text-primary" />}
    >
      <div className="space-y-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3 w-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Este Mes
                </span>
              </div>
              <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                {formatCurrency(data.monthly_revenue)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {data.revenue_growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${data.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {Math.abs(data.revenue_growth).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Proyección Anual
                </span>
              </div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {formatCurrency(data.projected_revenue)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Basado en este mes
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico simple de tendencia */}
        <Card className="border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Tendencia Mensual</span>
              <Badge variant="secondary" className="text-xs">
                Últimos 6 meses
              </Badge>
            </div>
            <div className="flex items-end gap-1 h-12">
              {/* Simulación de barras de gráfico */}
              {[0.6, 0.8, 0.7, 0.9, 0.85, 1].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary/20 rounded-sm relative group"
                  style={{ height: `${height * 100}%` }}
                >
                  <div className="absolute inset-x-0 bottom-0 bg-primary rounded-sm transition-all group-hover:bg-primary/80"
                    style={{ height: '100%' }}>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Servicios principales */}
        {data.top_services && data.top_services.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Servicios Principales</span>
            <div className="space-y-1">
              {data.top_services.slice(0, 3).map((service, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{service.service}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatCurrency(service.revenue)}</span>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {service.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}
