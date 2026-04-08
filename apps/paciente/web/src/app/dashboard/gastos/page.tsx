"use client";

import { Plus, Receipt, FileBarChart, X } from "lucide-react";
import { useState } from "react";

import { AnnualReport } from "@/components/expenses/annual-report";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { SpendingChart } from "@/components/expenses/spending-chart";
import { SummaryCards } from "@/components/expenses/summary-cards";
import {
  useExpenses,
  useAddExpense,
  useUpdateExpense,
  useDeleteExpense,
  useExpenseSummary,
  useAnnualReport,
} from "@/hooks/use-expenses";
import type {
  Expense,
  CreateExpenseData,
  ExpenseListParams,
} from "@/lib/services/expense-service";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ModalView = "none" | "add" | "edit" | "report";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GastosMedicosPage() {
  const currentYear = new Date().getFullYear();

  // State
  const [params, setParams] = useState<ExpenseListParams>({ page: 1, page_size: 20 });
  const [modalView, setModalView] = useState<ModalView>("none");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [reportYear, setReportYear] = useState(currentYear);

  // Queries
  const {
    data: expenseData,
    isLoading: expensesLoading,
  } = useExpenses(params);

  const {
    data: summary,
    isLoading: summaryLoading,
  } = useExpenseSummary(currentYear);

  const {
    data: report,
    isLoading: reportLoading,
  } = useAnnualReport(modalView === "report" ? reportYear : 0);

  // Mutations
  const { add, isPending: addPending } = useAddExpense();
  const { update, isPending: updatePending } = useUpdateExpense();
  const { remove, isPending: deletePending } = useDeleteExpense();

  // Handlers
  const handleAdd = async (data: CreateExpenseData) => {
    const result = await add(data);
    if (result.success) setModalView("none");
    return result;
  };

  const handleEdit = async (data: CreateExpenseData) => {
    if (!editingExpense) return { success: false };
    const result = await update(editingExpense.id, data);
    if (result.success) {
      setModalView("none");
      setEditingExpense(null);
    }
    return result;
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setModalView("edit");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <Receipt className="h-7 w-7 text-emerald-600" />
              Gastos Medicos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Controla y analiza tus gastos de salud
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalView(modalView === "report" ? "none" : "report")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                modalView === "report"
                  ? "bg-emerald-100 text-emerald-700"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FileBarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Reporte fiscal</span>
            </button>

            <button
              type="button"
              onClick={() => { setEditingExpense(null); setModalView("add"); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agregar gasto</span>
            </button>
          </div>
        </div>

        {/* Summary KPI cards */}
        <SummaryCards
          summary={summary}
          loading={summaryLoading}
          year={currentYear}
        />

        {/* Charts */}
        <SpendingChart summary={summary} loading={summaryLoading} />

        {/* Expense list OR Annual report */}
        {modalView === "report" ? (
          <AnnualReport
            report={report}
            loading={reportLoading}
            year={reportYear}
            onYearChange={setReportYear}
          />
        ) : (
          <ExpenseList
            expenses={expenseData?.data ?? []}
            pagination={
              expenseData?.pagination ?? { page: 1, page_size: 20, total: 0, total_pages: 0 }
            }
            totals={expenseData?.totals ?? { total_usd: 0, total_bs: 0 }}
            loading={expensesLoading}
            params={params}
            onParamsChange={setParams}
            onEdit={openEdit}
            onDelete={handleDelete}
            deleting={deletePending}
          />
        )}
      </div>

      {/* Side panel / modal for add/edit */}
      {(modalView === "add" || modalView === "edit") && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => { setModalView("none"); setEditingExpense(null); }}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              <ExpenseForm
                onSubmit={modalView === "edit" ? handleEdit : handleAdd}
                onCancel={() => { setModalView("none"); setEditingExpense(null); }}
                initialData={editingExpense}
                saving={addPending || updatePending}
              />
            </div>
          </div>
        </>
      )}

      {/* FAB for mobile */}
      {modalView === "none" && (
        <button
          type="button"
          onClick={() => { setEditingExpense(null); setModalView("add"); }}
          className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
