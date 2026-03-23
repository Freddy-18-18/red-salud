"use client";

import { CheckCircle2, XCircle, Pill } from "lucide-react";
import { formatBs, type PharmacyMedicationPrice } from "@/lib/services/pharmacy-comparator-service";

interface MedicationLineItemProps {
  medication: PharmacyMedicationPrice;
  compact?: boolean;
}

export function MedicationLineItem({
  medication,
  compact = false,
}: MedicationLineItemProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between py-1.5 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          {medication.in_stock ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
          )}
          <span
            className={`truncate ${
              medication.in_stock ? "text-gray-700" : "text-gray-400 line-through"
            }`}
          >
            {medication.medication_name}
          </span>
        </div>
        <span
          className={`font-medium tabular-nums flex-shrink-0 ml-2 ${
            medication.in_stock ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {medication.in_stock ? formatBs(medication.price_bs) : "No disp."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          medication.in_stock ? "bg-emerald-50" : "bg-red-50"
        }`}
      >
        <Pill
          className={`h-4 w-4 ${
            medication.in_stock ? "text-emerald-500" : "text-red-400"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={`text-sm font-medium ${
              medication.in_stock ? "text-gray-900" : "text-gray-400 line-through"
            }`}
          >
            {medication.medication_name}
          </h4>
          {medication.in_stock ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <span className="text-xs text-red-500 font-medium">No disponible</span>
          )}
        </div>
        {medication.generic_name && (
          <p className="text-xs text-gray-400 mt-0.5">
            Generico: {medication.generic_name}
          </p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        {medication.in_stock ? (
          <>
            <p className="text-sm font-semibold text-gray-900">
              {formatBs(medication.price_bs)}
            </p>
            {medication.price_usd != null && medication.price_usd > 0 && (
              <p className="text-xs text-gray-400">
                ~${medication.price_usd.toFixed(2)} USD
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">--</p>
        )}
      </div>
    </div>
  );
}
