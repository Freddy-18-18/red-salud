"use client";

import { useState } from "react";
import { Bell, DollarSign, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────

interface PriceAlertFormProps {
  medicationName: string;
  prescriptionId?: string;
  onSubmit: (data: {
    medication_name: string;
    target_price_usd: number;
    prescription_id?: string;
  }) => Promise<{ success: boolean }>;
  onCancel: () => void;
  loading?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

export function PriceAlertForm({
  medicationName,
  prescriptionId,
  onSubmit,
  onCancel,
  loading,
}: PriceAlertFormProps) {
  const [targetPrice, setTargetPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      setError("Ingresa un precio valido mayor a 0");
      return;
    }

    const result = await onSubmit({
      medication_name: medicationName,
      target_price_usd: price,
      prescription_id: prescriptionId,
    });

    if (!result.success) {
      setError("Error al crear la alerta. Intenta de nuevo.");
    }
  };

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Bell className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            Alerta de precio
          </h4>
          <p className="text-xs text-gray-500">
            Te notificaremos cuando baje el precio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Medication name (read-only) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Medicamento
          </label>
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
            {medicationName}
          </div>
        </div>

        {/* Target price */}
        <div>
          <label
            htmlFor="target-price"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Precio objetivo (USD)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="target-price"
              type="number"
              step="0.01"
              min="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            Notificarme cuando baje
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
