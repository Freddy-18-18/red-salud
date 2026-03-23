"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PharmacyComparisonCard } from "@/components/pharmacy/pharmacy-comparison-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList, Skeleton } from "@/components/ui/skeleton";
import {
  Pill,
  ChevronLeft,
  Store,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import {
  comparePrices,
  type FulfillmentOption,
} from "@/lib/services/pharmacy-comparator-service";

type SortOption = "price" | "availability" | "delivery";

function FarmaciasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prescriptionId = searchParams.get("prescription_id");

  const [userId, setUserId] = useState<string>();
  const [options, setOptions] = useState<FulfillmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [filterDelivery, setFilterDelivery] = useState(false);
  const [filterAllAvailable, setFilterAllAvailable] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      if (!prescriptionId) {
        setLoading(false);
        return;
      }

      const result = await comparePrices(prescriptionId);
      if (result.success) {
        setOptions(result.data);
      }
      setLoading(false);
    };

    init();
  }, [prescriptionId]);

  // Apply filters and sort
  let filteredOptions = [...options];

  if (filterDelivery) {
    filteredOptions = filteredOptions.filter((o) => o.offers_delivery);
  }
  if (filterAllAvailable) {
    filteredOptions = filteredOptions.filter((o) => o.all_available);
  }

  filteredOptions.sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.total_price_bs - b.total_price_bs;
      case "availability":
        return b.items_available - a.items_available;
      case "delivery":
        if (a.offers_delivery && !b.offers_delivery) return -1;
        if (!a.offers_delivery && b.offers_delivery) return 1;
        return a.total_price_bs - b.total_price_bs;
      default:
        return 0;
    }
  });

  const handleOrderDelivery = (option: FulfillmentOption) => {
    router.push(
      `/dashboard/farmacias/orden?prescription_id=${prescriptionId}&pharmacy_id=${option.pharmacy_id}&delivery=true`
    );
  };

  const handleOrderPickup = (option: FulfillmentOption) => {
    router.push(
      `/dashboard/farmacias/orden?prescription_id=${prescriptionId}&pharmacy_id=${option.pharmacy_id}&delivery=false`
    );
  };

  // Medication count from first option
  const medicationCount =
    options.length > 0 ? options[0].items_total : 0;

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
          Comparar Farmacias
        </h1>
        <p className="text-gray-500 mt-1">
          Encuentra el mejor precio para tus medicamentos
        </p>
      </div>

      {/* Prescription summary */}
      {!loading && options.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Pill className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Tu receta: {medicationCount} medicamento
              {medicationCount !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {filteredOptions.length} farmacia
              {filteredOptions.length !== 1 ? "s" : ""} con disponibilidad
            </p>
          </div>
        </div>
      )}

      {/* Sort and filter controls */}
      {!loading && options.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {/* Sort */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="price">Menor precio</option>
              <option value="availability">Mayor disponibilidad</option>
              <option value="delivery">Con delivery</option>
            </select>
          </div>

          {/* Filters */}
          <button
            onClick={() => setFilterDelivery(!filterDelivery)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filterDelivery
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Con delivery
          </button>

          <button
            onClick={() => setFilterAllAvailable(!filterAllAvailable)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filterAllAvailable
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Todo disponible
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <SkeletonList count={3} />
        </div>
      ) : !prescriptionId ? (
        <EmptyState
          icon={Pill}
          title="Selecciona una receta"
          description="Ve a Post-Consulta para comparar precios de tus recetas medicas"
          action={{
            label: "Ir a Post-Consulta",
            href: "/dashboard/post-consulta",
          }}
        />
      ) : filteredOptions.length > 0 ? (
        <div className="space-y-4">
          {filteredOptions.map((option, index) => (
            <PharmacyComparisonCard
              key={option.id}
              option={option}
              rank={index + 1}
              onOrderDelivery={handleOrderDelivery}
              onOrderPickup={handleOrderPickup}
            />
          ))}
        </div>
      ) : options.length > 0 ? (
        /* Filters removed all results */
        <EmptyState
          icon={Store}
          title="Sin resultados con los filtros aplicados"
          description="Prueba ajustando los filtros para ver mas opciones"
        />
      ) : (
        <EmptyState
          icon={Store}
          title="No hay farmacias disponibles"
          description="Aun no hay farmacias registradas con disponibilidad para tu receta. Intenta mas tarde."
          action={{
            label: "Volver a Post-Consulta",
            href: "/dashboard/post-consulta",
          }}
        />
      )}
    </div>
  );
}

export default function FarmaciasPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <SkeletonList count={3} />
        </div>
      }
    >
      <FarmaciasPageContent />
    </Suspense>
  );
}
