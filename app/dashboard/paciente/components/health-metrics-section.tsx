"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useI18n } from "@/lib/hooks/use-i18n";

interface HealthMetricsProps {
  metrics: any[];
}

export function HealthMetricsSection({ metrics }: HealthMetricsProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("dashboard.healthMetrics")}</CardTitle>
            <CardDescription>{t("dashboard.lastMeasurements")}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/paciente/metricas")}
          >
            {t("dashboard.viewAll")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {metric.metric_type?.nombre}
                  </span>
                  <Badge variant="outline">
                    {format(new Date(metric.fecha_medicion), "dd/MM")}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.valor}
                    {metric.valor_secundario && `/${metric.valor_secundario}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {metric.metric_type?.unidad_medida}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">
              {t("dashboard.noMetrics")}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push("/dashboard/paciente/metricas/registrar")
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("dashboard.registerMetric")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
