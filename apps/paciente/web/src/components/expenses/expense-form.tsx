"use client";

import {
  Stethoscope,
  TestTubes,
  Pill,
  Scissors,
  BedDouble,
  Shield,
  ShieldCheck,
  Receipt,
  X,
  Loader2,
  ImagePlus,
} from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";

import type { CreateExpenseData, ExpenseCategory, Expense } from "@/lib/services/expense-service";
import { getOfficialDollar } from "@/lib/services/currency-service";

/* ------------------------------------------------------------------ */
/*  Category grid config                                               */
/* ------------------------------------------------------------------ */

const CATEGORY_OPTIONS: {
  value: ExpenseCategory;
  label: string;
  icon: typeof Stethoscope;
  color: string;
  ring: string;
  bg: string;
}[] = [
  { value: "consulta", label: "Consulta", icon: Stethoscope, color: "text-blue-600", ring: "ring-blue-400", bg: "bg-blue-50" },
  { value: "examen_lab", label: "Laboratorio", icon: TestTubes, color: "text-purple-600", ring: "ring-purple-400", bg: "bg-purple-50" },
  { value: "medicamento", label: "Medicamento", icon: Pill, color: "text-green-600", ring: "ring-green-400", bg: "bg-green-50" },
  { value: "cirugia", label: "Cirugia", icon: Scissors, color: "text-red-600", ring: "ring-red-400", bg: "bg-red-50" },
  { value: "hospitalizacion", label: "Hospital", icon: BedDouble, color: "text-orange-600", ring: "ring-orange-400", bg: "bg-orange-50" },
  { value: "seguro_prima", label: "Prima seguro", icon: Shield, color: "text-amber-600", ring: "ring-amber-400", bg: "bg-amber-50" },
  { value: "seguro_copago", label: "Copago", icon: ShieldCheck, color: "text-amber-600", ring: "ring-amber-400", bg: "bg-amber-50" },
  { value: "otro", label: "Otro", icon: Receipt, color: "text-gray-600", ring: "ring-gray-400", bg: "bg-gray-50" },
];

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseData) => Promise<{ success: boolean }>;
  onCancel: () => void;
  initialData?: Expense | null;
  saving?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ExpenseForm({ onSubmit, onCancel, initialData, saving }: ExpenseFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>(initialData?.category ?? "consulta");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [amountUsd, setAmountUsd] = useState(initialData?.amount_usd?.toString() ?? "");
  const [amountBs, setAmountBs] = useState(initialData?.amount_bs?.toString() ?? "");
  const [bcvRate, setBcvRate] = useState<number | null>(initialData?.bcv_rate ?? null);
  const [date, setDate] = useState(initialData?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [providerName, setProviderName] = useState(initialData?.provider_name ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(initialData?.receipt_url ?? null);

  // Fetch BCV rate on mount
  useEffect(() => {
    if (bcvRate) return;
    getOfficialDollar()
      .then((rate) => {
        setBcvRate(rate.rate);
        // Auto-calculate Bs if USD already set
        if (amountUsd) {
          setAmountBs((parseFloat(amountUsd) * rate.rate).toFixed(2));
        }
      })
      .catch(() => {
        // BCV unavailable — user enters manually
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-calculate Bs when USD changes
  const handleUsdChange = (val: string) => {
    setAmountUsd(val);
    const n = parseFloat(val);
    if (!isNaN(n) && bcvRate) {
      setAmountBs((n * bcvRate).toFixed(2));
    } else {
      setAmountBs("");
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const data: CreateExpenseData = {
      category,
      description,
      amount_usd: parseFloat(amountUsd),
      date,
    };

    if (amountBs) data.amount_bs = parseFloat(amountBs);
    if (bcvRate) data.bcv_rate = bcvRate;
    if (providerName.trim()) data.provider_name = providerName.trim();
    if (notes.trim()) data.notes = notes.trim();
    if (receiptPreview && receiptPreview !== initialData?.receipt_url) {
      data.receipt_url = receiptPreview;
    }

    await onSubmit(data);
  };

  const isValid = category && description.trim() && amountUsd && parseFloat(amountUsd) > 0 && date;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {initialData ? "Editar gasto" : "Registrar gasto medico"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Category grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORY_OPTIONS.map((opt) => {
            const selected = category === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory(opt.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                  selected
                    ? `${opt.bg} ${opt.color} border-current ring-2 ${opt.ring} ring-offset-1`
                    : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <opt.icon className="h-5 w-5" />
                <span className="truncate w-full text-center">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="exp-desc" className="block text-sm font-medium text-gray-700 mb-1">
          Descripcion *
        </label>
        <input
          id="exp-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Consulta cardiologia Dr. Martinez"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
        />
      </div>

      {/* Amount row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="exp-usd" className="block text-sm font-medium text-gray-700 mb-1">
            Monto (USD) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <input
              id="exp-usd"
              type="number"
              step="0.01"
              min="0.01"
              value={amountUsd}
              onChange={(e) => handleUsdChange(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 pl-7 pr-4 py-2.5 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label htmlFor="exp-bs" className="block text-sm font-medium text-gray-700 mb-1">
            Monto (Bs.)
            {bcvRate && (
              <span className="ml-1 text-xs text-gray-400">
                Tasa: {bcvRate.toFixed(2)}
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Bs.</span>
            <input
              id="exp-bs"
              type="number"
              step="0.01"
              min="0"
              value={amountBs}
              onChange={(e) => setAmountBs(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm text-gray-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Date & Provider */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="exp-date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha *
          </label>
          <input
            id="exp-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
          />
        </div>
        <div>
          <label htmlFor="exp-provider" className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor / Medico
          </label>
          <input
            id="exp-provider"
            type="text"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="Ej: Dr. Martinez"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="exp-notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas adicionales
        </label>
        <textarea
          id="exp-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Detalles opcionales..."
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
        />
      </div>

      {/* Receipt upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante</label>
        {receiptPreview ? (
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptPreview}
              alt="Comprobante"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setReceiptPreview(null)}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
            <ImagePlus className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">Subir imagen</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleReceiptChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isValid || saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? "Guardar cambios" : "Registrar gasto"}
        </button>
      </div>
    </form>
  );
}
