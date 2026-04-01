"use client";

import {
  FileJson,
  FileSpreadsheet,
  FileText,
  Calendar,
  Database,
  Loader2,
} from "lucide-react";

import {
  type ExportCategory,
  type ExportFormat,
  type ExportCategoryCount,
  EXPORT_CATEGORY_CONFIG,
  EXPORT_FORMAT_LABELS,
} from "@/lib/services/export-service";

interface ExportPreviewProps {
  categories: ExportCategory[];
  counts: ExportCategoryCount[];
  format: ExportFormat;
  dateFrom?: string;
  dateTo?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const FORMAT_ICONS: Record<ExportFormat, typeof FileJson> = {
  json: FileJson,
  csv: FileSpreadsheet,
  pdf: FileText,
};

export function ExportPreview({
  categories,
  counts,
  format,
  dateFrom,
  dateTo,
  onConfirm,
  onCancel,
  loading = false,
}: ExportPreviewProps) {
  const countsMap = new Map(counts.map((c) => [c.category, c.count]));
  const FormatIcon = FORMAT_ICONS[format] ?? FileText;

  const totalRecords = categories.reduce(
    (sum, cat) => sum + (countsMap.get(cat) ?? 0),
    0
  );

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-4">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-emerald-600" />
        <h3 className="text-base font-semibold text-gray-900">
          Resumen de exportacion
        </h3>
      </div>

      {/* Categories summary */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Categorias incluidas
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const config = EXPORT_CATEGORY_CONFIG[cat];
            const count = countsMap.get(cat) ?? 0;
            return (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg"
              >
                {config.label}
                <span className="text-emerald-500">({count})</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Format & Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Formato</p>
          <div className="flex items-center gap-1.5">
            <FormatIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {EXPORT_FORMAT_LABELS[format]}
            </span>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Registros</p>
          <p className="text-sm font-medium text-gray-900">
            ~{totalRecords} registro{totalRecords !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Date range */}
      {(dateFrom || dateTo) && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {dateFrom && dateTo
              ? `${formatDate(dateFrom)} — ${formatDate(dateTo)}`
              : dateFrom
                ? `Desde ${formatDate(dateFrom)}`
                : `Hasta ${formatDate(dateTo!)}`}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            "Generar exportacion"
          )}
        </button>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
