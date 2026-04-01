"use client";

import {
  FlaskConical,
  Activity,
  ArrowRight,
  FileSearch,
} from "lucide-react";
import { useEffect, useState } from "react";

import { OrderCard } from "@/components/lab/order-card";
import { ParameterCard } from "@/components/lab/parameter-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";
import { useLabOrders, useMonitoredParameters } from "@/hooks/use-lab-results";
import { supabase } from "@/lib/supabase/client";

export default function LaboratorioPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const { orders, loading: ordersLoading } = useLabOrders(userId);
  const { parameters, loading: paramsLoading } = useMonitoredParameters(userId);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <FlaskConical className="h-7 w-7 text-indigo-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mis Resultados de Laboratorio
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Revisa tus examenes y monitorea tus valores de salud
        </p>
      </div>

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Ordenes recientes
          </h2>
        </div>

        {ordersLoading ? (
          <SkeletonList count={3} />
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileSearch}
            title="No tienes ordenes de laboratorio"
            description="Tus ordenes de examenes apareceran aqui cuando tu medico las solicite"
            action={{
              label: "Buscar Medico",
              href: "/dashboard/buscar-medico",
            }}
          />
        )}
      </section>

      {/* Monitored Parameters */}
      {!paramsLoading && parameters.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Parametros monitoreados
            </h2>
            <a
              href="/dashboard/laboratorio/tendencias"
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
            >
              Ver tendencias <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parameters.map((param) => (
              <ParameterCard key={param.parameter_name} parameter={param} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
