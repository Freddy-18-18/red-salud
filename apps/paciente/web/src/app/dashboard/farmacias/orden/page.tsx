"use client";

import { PartyPopper } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import { OrderForm } from "@/components/pharmacy/order-form";
import { OrderTracker } from "@/components/pharmacy/order-tracker";
import { SkeletonList, Skeleton } from "@/components/ui/skeleton";
import {
  comparePrices,
  createOrder,
  type FulfillmentOption,
  type CreateOrderData,
  type PharmacyOrder,
} from "@/lib/services/pharmacy-comparator-service";
import { supabase } from "@/lib/supabase/client";

function OrdenPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prescriptionId = searchParams.get("prescription_id");
  const pharmacyId = searchParams.get("pharmacy_id");
  const isDelivery = searchParams.get("delivery") === "true";

  const [userId, setUserId] = useState<string>();
  const [option, setOption] = useState<FulfillmentOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<PharmacyOrder | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      if (!prescriptionId || !pharmacyId) {
        setLoading(false);
        return;
      }

      // Get all options and find the selected pharmacy
      const result = await comparePrices(prescriptionId);
      if (result.success) {
        const selected = result.data.find(
          (o) => o.pharmacy_id === pharmacyId
        );
        if (selected) {
          setOption(selected);
        }
      }
      setLoading(false);
    };

    init();
  }, [prescriptionId, pharmacyId]);

  const handleSubmit = async (orderData: CreateOrderData) => {
    const result = await createOrder(orderData);
    if (result.success && result.data) {
      setOrder(result.data);
      setOrderSuccess(true);
    } else {
      // TODO: Show error toast
      console.error("Error creating order:", result.error);
    }
  };

  const handleBack = () => {
    router.push(
      `/dashboard/farmacias?prescription_id=${prescriptionId}`
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <SkeletonList count={4} />
      </div>
    );
  }

  // Missing params
  if (!prescriptionId || !pharmacyId || !option || !userId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Parametros invalidos. Vuelve a intentar.</p>
        <a
          href="/dashboard/post-consulta"
          className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
        >
          Volver a Post-Consulta
        </a>
      </div>
    );
  }

  // Order placed successfully - show tracker
  if (orderSuccess && order) {
    return (
      <div className="space-y-6">
        {/* Success banner */}
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <PartyPopper className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Pedido confirmado
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Tu pedido ha sido enviado a la farmacia. Te notificaremos de cada
              paso.
            </p>
          </div>
        </div>

        {/* Order tracker */}
        <OrderTracker
          order={order}
          onOrderUpdate={(updated) => setOrder(updated)}
        />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/dashboard/pedidos"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
          >
            Ver Mis Pedidos
          </a>
          <a
            href="/dashboard/post-consulta"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Volver a Post-Consulta
          </a>
        </div>
      </div>
    );
  }

  // Order form
  return (
    <OrderForm
      option={option}
      deliveryType={isDelivery ? "delivery" : "pickup"}
      patientId={userId}
      onSubmit={handleSubmit}
      onBack={handleBack}
    />
  );
}

export default function OrdenPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <SkeletonList count={4} />
        </div>
      }
    >
      <OrdenPageContent />
    </Suspense>
  );
}
