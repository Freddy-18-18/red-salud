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
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import type {
  Expense,
  ExpenseCategory,
  ExpenseListParams,
} from "@/lib/services/expense-service";
import { formatUsd, formatBs, getCategoryLabel } from "@/lib/services/expense-service";

/* ------------------------------------------------------------------ */
/*  Category icon mapping                                              */
/* ------------------------------------------------------------------ */

const CATEGORY_ICONS: Record<ExpenseCategory, { icon: LucideIcon; color: string; bg: string }> = {
  consulta: { icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50" },
  examen_lab: { icon: TestTubes, color: "text-purple-600", bg: "bg-purple-50" },
  medicamento: { icon: Pill, color: "text-green-600", bg: "bg-green-50" },
  cirugia: { icon: Scissors, color: "text-red-600", bg: "bg-red-50" },
  hospitalizacion: { icon: BedDouble, color: "text-orange-600", bg: "bg-orange-50" },
  seguro_prima: { icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
  seguro_copago: { icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  otro: { icon: Receipt, color: "text-gray-600", bg: "bg-gray-50" },
};

const ALL_CATEGORIES: ExpenseCategory[] = [
  "consulta", "examen_lab", "medicamento", "cirugia",
  "hospitalizacion", "seguro_prima", "seguro_copago", "otro",
];

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ExpenseListProps {
  expenses: Expense[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  totals: { total_usd: number; total_bs: number };
  loading: boolean;
  params: ExpenseListParams;
  onParamsChange: (params: ExpenseListParams) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ExpenseList({
  expenses,
  pagination,
  totals,
  loading,
  params,
  onParamsChange,
  onEdit,
  onDelete,
  deleting,
}: ExpenseListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCategoryFilter = (cat: ExpenseCategory | "") => {
    onParamsChange({
      ...params,
      category: cat || undefined,
      page: 1,
    });
  };

  const handleDateFilter = (field: "from" | "to", value: string) => {
    onParamsChange({
      ...params,
      [field]: value || undefined,
      page: 1,
    });
  };

  const handlePage = (page: number) => {
    onParamsChange({ ...params, page });
  };

  const handleDeleteConfirm = (id: string) => {
    onDelete(id);
    setConfirmDelete(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Historial de gastos</h3>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showFilters || params.category || params.from || params.to
              ? "bg-emerald-50 text-emerald-700"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtrar
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 space-y-3">
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleCategoryFilter("")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !params.category
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Todas
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    params.category === cat
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              );
            })}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="date"
              value={params.from ?? ""}
              onChange={(e) => handleDateFilter("from", e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-emerald-400 outline-none"
              placeholder="Desde"
            />
            <span className="text-xs text-gray-400">a</span>
            <input
              type="date"
              value={params.to ?? ""}
              onChange={(e) => handleDateFilter("to", e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-emerald-400 outline-none"
              placeholder="Hasta"
            />
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">Sin gastos registrados</p>
          <p className="text-xs text-gray-400 mt-1">
            Agrega tu primer gasto medico para comenzar
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {expenses.map((expense) => {
            const catMeta = CATEGORY_ICONS[expense.category];
            const CatIcon = catMeta.icon;

            return (
              <div
                key={expense.id}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group"
              >
                {/* Category icon */}
                <div className={`shrink-0 w-10 h-10 rounded-xl ${catMeta.bg} flex items-center justify-center`}>
                  <CatIcon className={`h-5 w-5 ${catMeta.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                    {expense.provider_name && (
                      <>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs text-gray-400 truncate">{expense.provider_name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatUsd(expense.amount_usd)}
                  </p>
                  {expense.amount_bs != null && expense.amount_bs > 0 && (
                    <p className="text-xs text-gray-400">{formatBs(expense.amount_bs)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {confirmDelete === expense.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteConfirm(expense.id)}
                      disabled={deleting}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Eliminar"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(expense.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: totals + pagination */}
      {expenses.length > 0 && (
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          {/* Running total */}
          <div className="text-sm">
            <span className="text-gray-500">Total filtrado: </span>
            <span className="font-semibold text-gray-900">{formatUsd(totals.total_usd)}</span>
            {totals.total_bs > 0 && (
              <span className="text-gray-400 ml-2">({formatBs(totals.total_bs)})</span>
            )}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => handlePage(pagination.page - 1)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-500">
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => handlePage(pagination.page + 1)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
