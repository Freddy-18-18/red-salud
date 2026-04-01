"use client";

import {
  Download,
  Clock,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  type ExportRecord,
  type ExportFormat,
  type ExportStatus,
  EXPORT_CATEGORY_CONFIG,
  EXPORT_FORMAT_LABELS,
  EXPORT_STATUS_CONFIG,
  formatExportDate,
  formatFileSize,
} from "@/lib/services/export-service";

interface ExportHistoryProps {
  exports: ExportRecord[];
  loading?: boolean;
}

const FORMAT_ICONS: Record<ExportFormat, typeof FileJson> = {
  json: FileJson,
  csv: FileSpreadsheet,
  pdf: FileText,
};

const STATUS_ICONS: Record<ExportStatus, typeof CheckCircle2> = {
  pending: Clock,
  generating: Loader2,
  completed: CheckCircle2,
  failed: AlertCircle,
};

export function ExportHistory({
  exports: exportList,
  loading = false,
}: ExportHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-white border border-gray-100 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  if (exportList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
          <Clock className="h-7 w-7 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-900">
          Sin exportaciones previas
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Tus exportaciones anteriores apareceran aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-900">
        Exportaciones anteriores
      </p>

      {exportList.map((exp) => {
        const FormatIcon = FORMAT_ICONS[exp.format] ?? FileText;
        const StatusIcon = STATUS_ICONS[exp.status] ?? Clock;
        const statusConfig = EXPORT_STATUS_CONFIG[exp.status];

        const categoryLabels = exp.categories
          .map((c) => EXPORT_CATEGORY_CONFIG[c]?.label ?? c)
          .join(", ");

        return (
          <div
            key={exp.id}
            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <FormatIcon className="h-5 w-5 text-gray-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {EXPORT_FORMAT_LABELS[exp.format]} &middot;{" "}
                  {exp.record_count} registro
                  {exp.record_count !== 1 ? "s" : ""}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                >
                  <StatusIcon
                    className={`h-2.5 w-2.5 ${
                      exp.status === "generating" ? "animate-spin" : ""
                    }`}
                  />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {categoryLabels}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                <span>{formatExportDate(exp.created_at)}</span>
                {exp.file_size_bytes && (
                  <span>&middot; {formatFileSize(exp.file_size_bytes)}</span>
                )}
              </div>
            </div>

            {exp.status === "completed" && exp.file_url && (
              <a
                href={exp.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
                title="Descargar"
              >
                <Download className="h-4 w-4 text-gray-500" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
