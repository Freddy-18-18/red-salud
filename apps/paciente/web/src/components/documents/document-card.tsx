"use client";

import {
  FileText,
  FlaskConical,
  Pill,
  Hospital,
  CreditCard,
  Syringe,
  Receipt,
  File,
  Download,
  Share2,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";

import {
  type PatientDocument,
  type DocumentCategory,
  getCategoryLabel,
  formatFileSize,
  isImageFile,
} from "@/lib/services/documents-service";

const CATEGORY_ICONS: Record<DocumentCategory, typeof FileText> = {
  laboratorio: FlaskConical,
  receta: Pill,
  informe: Hospital,
  seguro: CreditCard,
  vacuna: Syringe,
  factura: Receipt,
  otro: File,
};

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  laboratorio: "bg-purple-50 text-purple-600",
  receta: "bg-blue-50 text-blue-600",
  informe: "bg-emerald-50 text-emerald-600",
  seguro: "bg-amber-50 text-amber-600",
  vacuna: "bg-teal-50 text-teal-600",
  factura: "bg-orange-50 text-orange-600",
  otro: "bg-gray-100 text-gray-600",
};

interface DocumentCardProps {
  document: PatientDocument;
  onView?: (doc: PatientDocument) => void;
  onShare?: (doc: PatientDocument) => void;
  onDownload?: (doc: PatientDocument) => void;
  onDelete?: (doc: PatientDocument) => void;
}

export function DocumentCard({
  document: doc,
  onView,
  onShare,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = CATEGORY_ICONS[doc.document_type] || FileText;
  const colorClass = CATEGORY_COLORS[doc.document_type] || CATEGORY_COLORS.otro;

  const formattedDate = new Date(doc.created_at).toLocaleDateString(
    "es-VE",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  return (
    <div className="relative p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all group">
      <div className="flex items-start gap-3">
        {/* Thumbnail / Icon */}
        <div className="flex-shrink-0">
          {isImageFile(doc.file_type) ? (
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={doc.file_url}
                alt={doc.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`w-14 h-14 rounded-lg flex items-center justify-center ${colorClass}`}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {doc.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${colorClass}`}
            >
              {getCategoryLabel(doc.document_type)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span>{formattedDate}</span>
            {doc.provider_name && (
              <>
                <span className="text-gray-300">|</span>
                <span className="truncate">{doc.provider_name}</span>
              </>
            )}
            <span className="text-gray-300">|</span>
            <span>{formatFileSize(doc.file_size)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 animate-fade-in">
                {onView && (
                  <button
                    onClick={() => {
                      onView(doc);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                    Ver documento
                  </button>
                )}
                {onDownload && (
                  <button
                    onClick={() => {
                      onDownload(doc);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 text-gray-400" />
                    Descargar
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={() => {
                      onShare(doc);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4 text-gray-400" />
                    Compartir con doctor
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(doc);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
