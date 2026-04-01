"use client";

import {
  Package,
  ChevronLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { OrderTracker, OrderTrackerCompact } from "@/components/pharmacy/order-tracker";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList, Skeleton } from "@/components/ui/skeleton";
import {
  getMyOrders,
  subscribeToAllOrderUpdates,
  type PharmacyOrder,
  type OrderStatus,
} from "@/lib/services/pharmacy-comparator-service";
import { supabase } from "@/lib/supabase/client";

type TabValue = "active" | "completed" | "all";

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
];

export default function PedidosPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>();
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("active");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async (uid: string) => {
    const result = await getMyOrders(uid);
    if (result.success) {
      setOrders(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await loadOrders(user.id);
    };

    init();
  }, [loadOrders]);

  // Subscribe to realtime order updates
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToAllOrderUpdates(userId, (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
      );
    });

    return () => unsubscribe();
  }, [userId]);

  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status)
  );
  const completedOrders = orders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled"
  );

  const displayedOrders =
    activeTab === "active"
      ? activeOrders
      : activeTab === "completed"
        ? completedOrders
        : orders;

  const tabs: { label: string; value: TabValue; count: number; icon: typeof Clock }[] = [
    { label: "Activos", value: "active", count: activeOrders.length, icon: Clock },
    {
      label: "Completados",
      value: "completed",
      count: completedOrders.length,
      icon: CheckCircle2,
    },
    { label: "Todos", value: "all", count: orders.length, icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => router.push("/dashboard/post-consulta")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a post-consulta
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Mis Pedidos
        </h1>
        <p className="text-gray-500 mt-1">
          Seguimiento de tus pedidos de farmacia
        </p>
      </div>

      {/* Stats */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-gray-100 rounded-xl text-center">
            <p className="text-2xl font-bold text-gray-900">
              {activeOrders.length}
            </p>
            <p className="text-xs text-gray-500">Activos</p>
          </div>
          <div className="p-3 bg-white border border-gray-100 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {completedOrders.filter((o) => o.status === "delivered").length}
            </p>
            <p className="text-xs text-gray-500">Entregados</p>
          </div>
          <div className="p-3 bg-white border border-gray-100 rounded-xl text-center">
            <p className="text-2xl font-bold text-gray-400">
              {completedOrders.filter((o) => o.status === "cancelled").length}
            </p>
            <p className="text-xs text-gray-500">Cancelados</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!loading && orders.length > 0 && (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setExpandedOrderId(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <SkeletonList count={3} />
        </div>
      ) : displayedOrders.length > 0 ? (
        <div className="space-y-4">
          {displayedOrders.map((order) =>
            expandedOrderId === order.id ? (
              <div key={order.id} className="space-y-3">
                <button
                  onClick={() => setExpandedOrderId(null)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Ver todos los pedidos
                </button>
                <OrderTracker
                  order={order}
                  onOrderUpdate={(updated) => {
                    setOrders((prev) =>
                      prev.map((o) =>
                        o.id === updated.id ? { ...o, ...updated } : o
                      )
                    );
                  }}
                />
              </div>
            ) : (
              <OrderTrackerCompact
                key={order.id}
                order={order}
                onClick={() => setExpandedOrderId(order.id)}
              />
            )
          )}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title={
            activeTab === "active"
              ? "No tienes pedidos activos"
              : activeTab === "completed"
                ? "No tienes pedidos completados"
                : "No tienes pedidos"
          }
          description="Cuando hagas un pedido en una farmacia, podras hacer seguimiento aqui"
          action={{
            label: "Ir a Post-Consulta",
            href: "/dashboard/post-consulta",
          }}
        />
      )}
    </div>
  );
}
