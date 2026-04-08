"use client";

import {
  FileText,
  Download,
  Printer,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useRef, useState } from "react";

import type {
  AnnualReport as AnnualReportType,
  ExpenseCategory,
} from "@/lib/services/expense-service";
import {
  formatUsd,
  formatBs,
  getCategoryLabel,
  EXPENSE_CATEGORIES,
  MONTH_LABELS_FULL,
} from "@/lib/services/expense-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface AnnualReportProps {
  report: AnnualReportType | undefined;
  loading: boolean;
  year: number;
  onYearChange: (year: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AnnualReport({ report, loading, year, onYearChange }: AnnualReportProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Fiscal ${year} - Red Salud</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; color: #111; }
          table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
          th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.8rem; }
          th { background: #f9fafb; font-weight: 600; }
          .text-right { text-align: right; }
          .font-bold { font-weight: 700; }
          h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
          h2 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #059669; }
          .subtitle { color: #6b7280; font-size: 0.85rem; }
          .total-row { background: #f0fdf4; font-weight: 700; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .stat-box { background: #f9fafb; border-radius: 8px; padding: 1rem; }
          .stat-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
          .stat-value { font-size: 1.1rem; font-weight: 700; margin-top: 0.25rem; }
          @media print { body { padding: 1cm; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleExportCSV = () => {
    if (!report) return;

    const categoryHeaders = EXPENSE_CATEGORIES.map((c) => c.label);
    const csvHeader = ["Mes", ...categoryHeaders, "Total USD", "Total Bs."].join(",");

    const csvRows = report.monthly_breakdown.map((m) => {
      const catValues = EXPENSE_CATEGORIES.map((c) =>
        (m.by_category[c.value] ?? 0).toFixed(2),
      );
      return [m.label, ...catValues, m.total_usd.toFixed(2), m.total_bs.toFixed(2)].join(",");
    });

    // Totals row
    const totalCatValues = EXPENSE_CATEGORIES.map((c) => {
      const cat = report.category_totals.find((ct) => ct.category === c.value);
      return (cat?.total_usd ?? 0).toFixed(2);
    });
    const totalsRow = [
      "TOTAL",
      ...totalCatValues,
      report.grand_total_usd.toFixed(2),
      report.grand_total_bs.toFixed(2),
    ].join(",");

    const csv = [csvHeader, ...csvRows, totalsRow].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-fiscal-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="ml-3 text-sm text-gray-500">Generando reporte...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-500">Selecciona un ano para generar el reporte</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Reporte Fiscal</h3>

          {/* Year picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowYearPicker(!showYearPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {year}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showYearPicker && (
              <div className="absolute top-full mt-1 left-0 bg-white rounded-xl border border-gray-100 shadow-lg z-10 py-1">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => { onYearChange(y); setShowYearPicker(false); }}
                    className={`block w-full px-4 py-1.5 text-sm text-left hover:bg-gray-50 ${
                      y === year ? "text-emerald-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Printable report */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Report header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
          <h1 className="text-xl font-bold text-gray-900">
            Reporte Fiscal de Gastos Medicos - {year}
          </h1>
          <p className="subtitle text-sm text-gray-500 mt-1">
            Red Salud | Generado el{" "}
            {new Date().toLocaleDateString("es-VE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Summary stats */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="grid-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-box bg-gray-50 rounded-xl p-4">
              <p className="stat-label text-xs text-gray-500 uppercase tracking-wide">Total anual</p>
              <p className="stat-value text-lg font-bold text-gray-900 mt-1">
                {formatUsd(report.grand_total_usd)}
              </p>
              <p className="text-xs text-gray-400">{formatBs(report.grand_total_bs)}</p>
            </div>
            <div className="stat-box bg-gray-50 rounded-xl p-4">
              <p className="stat-label text-xs text-gray-500 uppercase tracking-wide">Transacciones</p>
              <p className="stat-value text-lg font-bold text-gray-900 mt-1">{report.expense_count}</p>
            </div>
            <div className="stat-box bg-gray-50 rounded-xl p-4">
              <p className="stat-label text-xs text-gray-500 uppercase tracking-wide">Promedio mensual</p>
              <p className="stat-value text-lg font-bold text-gray-900 mt-1">
                {formatUsd(report.average_monthly_usd)}
              </p>
            </div>
            <div className="stat-box bg-gray-50 rounded-xl p-4">
              <p className="stat-label text-xs text-gray-500 uppercase tracking-wide">Categoria principal</p>
              <p className="stat-value text-lg font-bold text-gray-900 mt-1">
                {report.top_category
                  ? getCategoryLabel(report.top_category as ExpenseCategory)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly breakdown table */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
            Desglose mensual por categoria
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Mes</th>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <th
                      key={c.value}
                      className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.monthly_breakdown.map((m) => (
                  <tr key={m.month} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-3 py-2 text-xs font-medium text-gray-700">{m.label}</td>
                    {EXPENSE_CATEGORIES.map((c) => {
                      const val = m.by_category[c.value as ExpenseCategory] ?? 0;
                      return (
                        <td
                          key={c.value}
                          className={`px-3 py-2 text-xs text-right ${
                            val > 0 ? "text-gray-700" : "text-gray-300"
                          }`}
                        >
                          {val > 0 ? formatUsd(val) : "-"}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-xs text-right font-semibold text-gray-900">
                      {m.total_usd > 0 ? formatUsd(m.total_usd) : "-"}
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="total-row bg-emerald-50/50 font-bold">
                  <td className="px-3 py-2.5 text-xs font-bold text-gray-900">TOTAL</td>
                  {EXPENSE_CATEGORIES.map((c) => {
                    const cat = report.category_totals.find((ct) => ct.category === c.value);
                    const val = cat?.total_usd ?? 0;
                    return (
                      <td key={c.value} className="px-3 py-2.5 text-xs text-right font-bold text-gray-900">
                        {val > 0 ? formatUsd(val) : "-"}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-xs text-right font-bold text-emerald-700">
                    {formatUsd(report.grand_total_usd)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Provider breakdown */}
        {report.provider_summary.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
              Desglose por proveedor
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Proveedor</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600">Transacciones</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600">Total USD</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600">Total Bs.</th>
                </tr>
              </thead>
              <tbody>
                {report.provider_summary.map((p) => (
                  <tr key={p.provider_name} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-xs font-medium text-gray-700">{p.provider_name}</td>
                    <td className="px-3 py-2 text-xs text-right text-gray-500">{p.count}</td>
                    <td className="px-3 py-2 text-xs text-right text-gray-700">{formatUsd(p.total_usd)}</td>
                    <td className="px-3 py-2 text-xs text-right text-gray-500">{formatBs(p.total_bs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Insurance coverage */}
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
            Cobertura de seguro
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">
                Gastos de seguro (primas + copagos)
              </p>
              <p className="text-lg font-bold text-amber-800 mt-1">
                {formatUsd(report.insurance_split.insurance_usd)}
              </p>
              <p className="text-xs text-amber-600">
                {formatBs(report.insurance_split.insurance_bs)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">
                Gastos de bolsillo
              </p>
              <p className="text-lg font-bold text-blue-800 mt-1">
                {formatUsd(report.insurance_split.out_of_pocket_usd)}
              </p>
              <p className="text-xs text-blue-600">
                {formatBs(report.insurance_split.out_of_pocket_bs)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
