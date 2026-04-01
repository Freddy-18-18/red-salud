"use client";

import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Home,
  XCircle,
  Phone,
  MapPin,
  Store,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  formatBs,
  subscribeToOrderUpdates,
  getOrderStatus,
  type PharmacyOrder,
  type OrderStatus,
} from "@/lib/services/pharmacy-comparator-service";

interface OrderTrackerProps {
  order: PharmacyOrder;
  onOrderUpdate?: (order: PharmacyOrder) => void;
}

interface StepConfig {
  key: OrderStatus;
  label: string;
  icon: typeof Clock;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    key: "pending",
    label: "Pedido recibido",
    icon: Clock,
    description: "Tu pedido ha sido enviado a la farmacia",
  },
  {
    key: "confirmed",
    label: "Confirmado",
    icon: CheckCircle2,
    description: "La farmacia confirmo tu pedido",
  },
  {
    key: "preparing",
    label: "Preparando",
    icon: Package,
    description: "Estan preparando tus medicamentos",
  },
  {
    key: "out_for_delivery",
    label: "En camino",
    icon: Truck,
    description: "Tu pedido esta en camino",
  },
  {
    key: "delivered",
    label: "Entregado",
    icon: Home,
    description: "Pedido entregado exitosamente",
  },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

function getStepStatus(
  stepIndex: number,
  currentIndex: number
): "completed" | "active" | "upcoming" {
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

export function OrderTracker({ order: initialOrder, onOrderUpdate }: OrderTrackerProps) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    // Subscribe to realtime updates
    const unsubscribe = subscribeToOrderUpdates(order.id, (updated) => {
      setOrder(updated);
      onOrderUpdate?.(updated);
    });

    // Also poll every 30s as fallback
    const pollInterval = setInterval(async () => {
      const result = await getOrderStatus(order.id);
      if (result.success && result.data) {
        setOrder(result.data);
        onOrderUpdate?.(result.data);
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [order.id, onOrderUpdate]);

  const isCancelled = order.status === "cancelled";
  const currentIndex = STATUS_ORDER[order.status];

  if (isCancelled) {
    return (
      <div className="bg-white border border-red-100 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <XCircle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Pedido cancelado
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Este pedido ha sido cancelado. Si tienes preguntas, contacta a la
          farmacia.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.created_at).toLocaleDateString("es-VE", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span className="text-sm font-bold text-emerald-600">
            {formatBs(order.total_bs)}
          </span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="p-4">
        <div className="space-y-0">
          {STEPS.map((step, index) => {
            const status = getStepStatus(index, currentIndex);
            const StepIcon = step.icon;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step.key} className="flex gap-3">
                {/* Step indicator + connector line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      status === "completed"
                        ? "bg-emerald-500"
                        : status === "active"
                          ? "bg-emerald-500 ring-4 ring-emerald-100"
                          : "bg-gray-100"
                    }`}
                  >
                    <StepIcon
                      className={`h-4 w-4 ${
                        status === "completed" || status === "active"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    />
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-[24px] my-1 ${
                        status === "completed" ? "bg-emerald-500" : "bg-gray-100"
                      }`}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                  <p
                    className={`text-sm font-medium ${
                      status === "active"
                        ? "text-emerald-700"
                        : status === "completed"
                          ? "text-gray-900"
                          : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {status === "active" && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pharmacy info */}
      {order.pharmacy && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-100 flex-shrink-0">
              <Store className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {order.pharmacy.full_name}
              </p>
              {order.pharmacy.address && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {order.pharmacy.address}
                </p>
              )}
            </div>
            {order.pharmacy.phone && (
              <a
                href={`tel:${order.pharmacy.phone}`}
                className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                title="Llamar farmacia"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Delivery info */}
      {order.delivery_type === "delivery" && order.delivery_address && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Direccion de entrega</p>
              <p className="mt-0.5">{order.delivery_address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-medium mb-2">
          {order.items.length} medicamento{order.items.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-1.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{item.medication_name}</span>
              <span className="text-gray-900 font-medium tabular-nums">
                {formatBs(item.price_bs)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Compact variant for lists ───────────────────────────────────────

interface OrderTrackerCompactProps {
  order: PharmacyOrder;
  onClick?: () => void;
}

export function OrderTrackerCompact({
  order,
  onClick,
}: OrderTrackerCompactProps) {
  const isCancelled = order.status === "cancelled";
  const currentIndex = STATUS_ORDER[order.status];
  const totalSteps = STEPS.length;
  const progress = isCancelled ? 0 : ((currentIndex + 1) / totalSteps) * 100;

  const currentStep = isCancelled
    ? { label: "Cancelado", icon: XCircle }
    : STEPS[currentIndex] || STEPS[0];
  const CurrentIcon = currentStep.icon;

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all text-left"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isCancelled ? "bg-red-50" : "bg-emerald-50"
          }`}
        >
          <CurrentIcon
            className={`h-5 w-5 ${
              isCancelled ? "text-red-500" : "text-emerald-600"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {order.pharmacy?.full_name || "Farmacia"}
            </h3>
            <span className="text-sm font-bold text-gray-900 flex-shrink-0">
              {formatBs(order.total_bs)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-medium ${
                isCancelled ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {currentStep.label}
            </span>
            <span className="text-xs text-gray-400">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Mini progress bar */}
          {!isCancelled && (
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
      </div>
    </button>
  );
}
