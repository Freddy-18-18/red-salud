"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  Store,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ShoppingBag,
  Bell,
  Navigation,
  BadgeDollarSign,
  PackageCheck,
} from "lucide-react";

import {
  type PharmacyComparison,
  formatBs,
  formatUsd,
  haversineDistance,
} from "@/lib/services/medication-comparator-service";

// ─── Types ───────────────────────────────────────────────────────────

type SortOption = "price" | "distance" | "availability";

interface ComparisonResultsProps {
  results: PharmacyComparison[];
  bcvRate: number | null;
  loading?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  onSetAlert: (medicationName: string) => void;
  onOrderPharmacy: (pharmacyId: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────

export function ComparisonResults({
  results,
  bcvRate,
  loading,
  userLocation,
  onSetAlert,
  onOrderPharmacy,
}: ComparisonResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Compute distances if user location is available
  const resultsWithDistance = useMemo(() => {
    return results.map((r) => {
      let distance_km: number | undefined;
      if (
        userLocation &&
        r.pharmacy.lat != null &&
        r.pharmacy.lng != null
      ) {
        distance_km = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          r.pharmacy.lat,
          r.pharmacy.lng,
        );
      }
      return { ...r, distance_km };
    });
  }, [results, userLocation]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...resultsWithDistance];
    switch (sortBy) {
      case "price":
        arr.sort((a, b) => {
          if (a.all_available && !b.all_available) return -1;
          if (!a.all_available && b.all_available) return 1;
          return a.total_bs - b.total_bs;
        });
        break;
      case "distance":
        arr.sort((a, b) => {
          const da = a.distance_km ?? Infinity;
          const db = b.distance_km ?? Infinity;
          return da - db;
        });
        break;
      case "availability":
        arr.sort((a, b) => {
          if (a.all_available && !b.all_available) return -1;
          if (!a.all_available && b.all_available) return 1;
          return b.items_available - a.items_available;
        });
        break;
    }
    return arr;
  }, [resultsWithDistance, sortBy]);

  const bestPrice = sorted.length > 0 ? sorted[0] : null;

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white border border-gray-100 rounded-xl animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-6 w-32 bg-gray-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-24 bg-gray-200 rounded-full" />
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Store className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Sin resultados
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          No encontramos farmacias con estos medicamentos en inventario.
          Puedes configurar alertas de precio para recibir notificaciones.
        </p>
      </div>
    );
  }

  const sortOptions: { label: string; value: SortOption; icon: typeof ArrowUpDown }[] = [
    { label: "Precio", value: "price", icon: BadgeDollarSign },
    { label: "Distancia", value: "distance", icon: Navigation },
    { label: "Disponibilidad", value: "availability", icon: PackageCheck },
  ];

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-500 mr-1">Ordenar por:</span>
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition ${
              sortBy === opt.value
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <opt.icon className="h-3 w-3" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Results summary */}
      <p className="text-sm text-gray-500">
        {sorted.length} farmacia{sorted.length !== 1 ? "s" : ""} encontrada
        {sorted.length !== 1 ? "s" : ""}
      </p>

      {/* Pharmacy cards */}
      {sorted.map((item, index) => {
        const isBest =
          sortBy === "price" &&
          bestPrice &&
          item.pharmacy.id === bestPrice.pharmacy.id;
        const isExpanded = expandedId === item.pharmacy.id;
        const pharmacyName =
          item.pharmacy.full_name ?? "Farmacia";
        const availRatio = `${item.items_available}/${item.items_total}`;

        return (
          <div
            key={item.pharmacy.id}
            className={`bg-white border rounded-xl overflow-hidden transition-all ${
              isBest
                ? "border-emerald-200 shadow-md ring-1 ring-emerald-100"
                : "border-gray-100 hover:shadow-sm"
            }`}
          >
            {/* Header */}
            <button
              onClick={() =>
                setExpandedId(isExpanded ? null : item.pharmacy.id)
              }
              className="w-full p-4 text-left"
            >
              <div className="flex items-start gap-3">
                {/* Rank / Icon */}
                <div className="flex-shrink-0">
                  {isBest ? (
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-amber-500" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-400">
                        #{index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {isBest && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Mejor precio
                      </span>
                    )}
                    {item.distance_km != null && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3" />
                        {item.distance_km} km
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {pharmacyName}
                  </h3>

                  {/* Address */}
                  {item.pharmacy.address && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {item.pharmacy.address}
                      {item.pharmacy.city ? `, ${item.pharmacy.city}` : ""}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-1.5">
                    {item.total_usd > 0 && (
                      <span className="text-lg font-bold text-gray-900">
                        {formatUsd(item.total_usd)}
                      </span>
                    )}
                    <span
                      className={`text-sm ${
                        item.total_usd > 0
                          ? "text-gray-400"
                          : "text-lg font-bold text-gray-900"
                      }`}
                    >
                      {item.total_bs > 0 ? formatBs(item.total_bs) : ""}
                    </span>
                    {item.total_usd > 0 && bcvRate && bcvRate > 0 && (
                      <span className="text-xs text-gray-400">
                        ({formatBs(item.total_usd * bcvRate)})
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {item.all_available ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        Todo disponible ({availRatio})
                      </span>
                    ) : item.items_available > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="h-3 w-3" />
                        Parcial ({availRatio})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" />
                        Sin stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand toggle */}
                <div className="flex-shrink-0 pt-1">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-50">
                {/* Medication breakdown */}
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
                    Desglose de medicamentos
                  </p>
                  <div className="space-y-2">
                    {item.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2.5 rounded-lg ${
                          med.in_stock ? "bg-gray-50" : "bg-red-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {med.in_stock ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {med.medication_name}
                            </p>
                            {med.generic_name && (
                              <p className="text-xs text-gray-400 truncate">
                                {med.generic_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {med.in_stock ? (
                            <div className="text-right">
                              {med.price_usd != null && med.price_usd > 0 && (
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatUsd(med.price_usd)}
                                </p>
                              )}
                              {med.price_bs > 0 && (
                                <p className="text-xs text-gray-400">
                                  {formatBs(med.price_bs)}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                {med.quantity} en stock
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-red-500 font-medium">
                                No disponible
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSetAlert(med.medication_name);
                                }}
                                className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                                title="Crear alerta de precio"
                              >
                                <Bell className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Total ({item.items_available} de {item.items_total})
                    </span>
                    <div className="text-right">
                      {item.total_usd > 0 && (
                        <p className="text-base font-bold text-gray-900">
                          {formatUsd(item.total_usd)}
                        </p>
                      )}
                      {item.total_bs > 0 && (
                        <p className="text-xs text-gray-500">
                          {formatBs(item.total_bs)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pharmacy contact */}
                {(item.pharmacy.phone || item.pharmacy.address) && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                      {item.pharmacy.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span>
                            {item.pharmacy.address}
                            {item.pharmacy.city
                              ? `, ${item.pharmacy.city}`
                              : ""}
                            {item.pharmacy.state
                              ? `, ${item.pharmacy.state}`
                              : ""}
                          </span>
                        </div>
                      )}
                      {item.pharmacy.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <a
                            href={`tel:${item.pharmacy.phone}`}
                            className="text-emerald-600 hover:underline"
                          >
                            {item.pharmacy.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action */}
                {item.items_available > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => onOrderPharmacy(item.pharmacy.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Pedir en esta farmacia
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
