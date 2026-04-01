"use client";

import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  Trash2,
  Calendar,
  Building,
  Tag,
  FileText,
  StickyNote,
} from "lucide-react";

import {
  type PatientDocument,
  getCategoryLabel,
  formatFileSize,
  isImageFile,
  isPdfFile,
} from "@/lib/services/documents-service";

interface DocumentViewerProps {
  document: PatientDocument;
  onBack: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export function DocumentViewer({
  document: doc,
  onBack,
  onDownload,
  onShare,
  onDelete,
}: DocumentViewerProps) {
  const formattedDate = new Date(
    doc.document_date + "T00:00:00"
  ).toLocaleDateString("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    // Fallback: open in new tab
    window.open(doc.file_url, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Descargar"
          >
            <Download className="h-5 w-5" />
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Compartir"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handlePrint}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Imprimir"
          >
            <Printer className="h-5 w-5" />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Document title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{doc.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {formatFileSize(doc.file_size)} - {doc.file_name}
        </p>
      </div>

      {/* Document preview */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {isImageFile(doc.file_type) ? (
          <div className="flex items-center justify-center bg-gray-50 p-4">
            <img
              src={doc.file_url}
              alt={doc.title}
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          </div>
        ) : isPdfFile(doc.file_type) ? (
          <iframe
            src={doc.file_url}
            className="w-full h-[60vh] border-0"
            title={doc.title}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Vista previa no disponible
            </p>
            <button
              onClick={handleDownload}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
            >
              <Download className="h-4 w-4" />
              Descargar archivo
            </button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Detalles del documento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5">
            <Tag className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Categoria</p>
              <p className="text-sm font-medium text-gray-900">
                {getCategoryLabel(doc.category)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {formattedDate}
              </p>
            </div>
          </div>

          {doc.provider_name && (
            <div className="flex items-center gap-2.5">
              <Building className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Proveedor</p>
                <p className="text-sm font-medium text-gray-900">
                  {doc.provider_name}
                </p>
              </div>
            </div>
          )}

          {doc.notes && (
            <div className="flex items-start gap-2.5 sm:col-span-2">
              <StickyNote className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Notas</p>
                <p className="text-sm text-gray-700">{doc.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
