"use client";

import {
  Trophy,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useState } from "react";

import { MedicationLineItem } from "./medication-line-item";

import {
  formatBs,
  formatUsd,
  type FulfillmentOption,
} from "@/lib/services/pharmacy-comparator-service";


interface PharmacyComparisonCardProps {
  option: FulfillmentOption;
  rank: number;
  onOrderDelivery: (option: FulfillmentOption) => void;
  onOrderPickup: (option: FulfillmentOption) => void;
}

export function PharmacyComparisonCard({
  option,
  rank,
  onOrderDelivery,
  onOrderPickup,
}: PharmacyComparisonCardProps) {
  const [expanded, setExpanded] = useState(rank === 1);

  const isBestPrice = rank === 1;
  const availabilityRatio = `${option.items_available}/${option.items_total}`;
  const hasDelivery = option.offers_delivery;
  const freeDelivery =
    hasDelivery && (!option.delivery_fee || option.delivery_fee === 0);

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition-all ${
        isBestPrice
          ? "border-emerald-200 shadow-md ring-1 ring-emerald-100"
          : "border-gray-100 hover:shadow-sm"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          {/* Rank badge / pharmacy avatar */}
          <div className="flex-shrink-0">
            {isBestPrice ? (
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {isBestPrice && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Mejor precio
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-gray-900 truncate">
              {option.pharmacy_name}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-gray-900">
                {formatBs(option.total_price_bs)}
              </span>
              {option.total_price_usd != null && option.total_price_usd > 0 && (
                <span className="text-sm text-gray-400">
                  ({formatUsd(option.total_price_usd)})
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Availability */}
              {option.all_available ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  {availabilityRatio} disponibles
                </span>
              ) : option.items_available > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  {availabilityRatio} disponibles
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                  <XCircle className="h-3 w-3" />
                  Sin stock
                </span>
              )}

              {/* Delivery */}
              {hasDelivery ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  <Truck className="h-3 w-3" />
                  {freeDelivery
                    ? "Delivery gratis"
                    : `Delivery: ${formatBs(option.delivery_fee || 0)}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                  <XCircle className="h-3 w-3" />
                  Sin delivery
                </span>
              )}
            </div>
          </div>

          {/* Expand toggle */}
          <div className="flex-shrink-0 pt-1">
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-50">
          {/* Medication breakdown */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
              Desglose de precios
            </p>
            <div className="space-y-1">
              {option.items.map((med, idx) => (
                <MedicationLineItem key={idx} medication={med} compact />
              ))}
            </div>

            {/* Subtotal line */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-600">
                Subtotal ({option.items_available} items)
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatBs(option.total_price_bs)}
              </span>
            </div>

            {hasDelivery && option.delivery_fee != null && option.delivery_fee > 0 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-gray-500">Delivery</span>
                <span className="text-sm text-gray-700">
                  {formatBs(option.delivery_fee)}
                </span>
              </div>
            )}
          </div>

          {/* Pharmacy info */}
          {option.pharmacy && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                {option.pharmacy.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span>{option.pharmacy.address}</span>
                    {option.pharmacy.city && (
                      <span>, {option.pharmacy.city}</span>
                    )}
                  </div>
                )}
                {option.pharmacy.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <a
                      href={`tel:${option.pharmacy.phone}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {option.pharmacy.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {option.items_available > 0 && (
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
              {hasDelivery && (
                <button
                  onClick={() => onOrderDelivery(option)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Truck className="h-4 w-4" />
                  Pedir con delivery
                </button>
              )}
              <button
                onClick={() => onOrderPickup(option)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  hasDelivery
                    ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                Reservar y retirar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
