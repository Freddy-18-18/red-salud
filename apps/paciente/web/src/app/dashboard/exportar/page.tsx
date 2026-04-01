"use client";

import { useState } from "react";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Calendar,
} from "lucide-react";

import { ExportSelector } from "@/components/export/export-selector";
import { ExportPreview } from "@/components/export/export-preview";
import { ExportHistory } from "@/components/export/export-history";
import { SkeletonList } from "@/components/ui/skeleton";

import {
  useExportCounts,
  useExportHistory,
  useCreateExport,
} from "@/hooks/use-export";

import {
  type ExportCategory,
  type ExportFormat,
  EXPORT_FORMAT_LABELS,
} from "@/lib/services/export-service";

type StepValue = "select" | "preview" | "done";

const FORMAT_OPTIONS: {
  format: ExportFormat;
  icon: typeof FileJson;
  description: string;
}[] = [
  { format: "json", icon: FileJson, description: "Datos estructurados para sistemas" },
  { format: "csv", icon: FileSpreadsheet, description: "Compatible con Excel y hojas de calculo" },
  { format: "pdf", icon: FileText, description: "Documento legible para impresion" },
];

export default function ExportarPage() {
  const [step, setStep] = useState<StepValue>("select");
  const [selectedCategories, setSelectedCategories] = useState<ExportCategory[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [lastExportId, setLastExportId] = useState<string | null>(null);

  const { counts, loading: countsLoading } = useExportCounts();
  const { exports: exportHistory, loading: historyLoading, refresh: refreshHistory } = useExportHistory();
  const { createExport, loading: creating } = useCreateExport();

  const totalSelected = selectedCategories.length;
  const canProceed = totalSelected > 0;

  const handleGenerate = async () => {
    const result = await createExport({
      categories: selectedCategories,
      format: selectedFormat,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });

    if (result.success && result.record) {
      setLastExportId(result.record.id);
      setStep("done");
      refreshHistory();
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelectedCategories([]);
    setSelectedFormat("json");
    setDateFrom("");
    setDateTo("");
    setLastExportId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Exportar Datos
        </h1>
        <p className="text-gray-500 mt-1">
          Descarga tu historial medico en el formato que prefieras
        </p>
      </div>

      {/* ── Done Step ── */}
      {step === "done" && (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Exportacion generada
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Tu archivo ha sido generado exitosamente. Puedes descargarlo desde
            el historial de exportaciones.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Nueva exportacion
            </button>
          </div>
        </div>
      )}

      {/* ── Preview Step ── */}
      {step === "preview" && (
        <ExportPreview
          categories={selectedCategories}
          counts={counts}
          format={selectedFormat}
          dateFrom={dateFrom || undefined}
          dateTo={dateTo || undefined}
          onConfirm={handleGenerate}
          onCancel={() => setStep("select")}
          loading={creating}
        />
      )}

      {/* ── Select Step ── */}
      {step === "select" && (
        <div className="space-y-6">
          {/* Category selector */}
          {countsLoading ? (
            <SkeletonList count={3} />
          ) : (
            <ExportSelector
              selected={selectedCategories}
              counts={counts}
              onChange={setSelectedCategories}
            />
          )}

          {/* Format selection */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">
              Formato de exportacion
            </p>
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = selectedFormat === opt.format;
                return (
                  <button
                    key={opt.format}
                    type="button"
                    onClick={() => setSelectedFormat(opt.format)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-emerald-600" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-emerald-800" : "text-gray-900"
                      }`}
                    >
                      {EXPORT_FORMAT_LABELS[opt.format]}
                    </span>
                    <span className="text-[10px] text-gray-500 line-clamp-1">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-semibold text-gray-900">
                Rango de fechas{" "}
                <span className="font-normal text-gray-400">(opcional)</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Proceed button */}
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => setStep("preview")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Continuar ({totalSelected} categoria
            {totalSelected !== 1 ? "s" : ""})
          </button>
        </div>
      )}

      {/* Export history */}
      <div className="pt-4 border-t border-gray-100">
        <ExportHistory exports={exportHistory} loading={historyLoading} />
      </div>
    </div>
  );
}
