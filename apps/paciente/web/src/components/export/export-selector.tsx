"use client";

import {
  User,
  Calendar,
  FlaskConical,
  Pill,
  Syringe,
  HeartPulse,
  FileText,
  Check,
} from "lucide-react";

import {
  type ExportCategory,
  type ExportCategoryCount,
  EXPORT_CATEGORY_CONFIG,
} from "@/lib/services/export-service";

interface ExportSelectorProps {
  selected: ExportCategory[];
  counts: ExportCategoryCount[];
  onChange: (selected: ExportCategory[]) => void;
}

const CATEGORY_ICONS: Record<ExportCategory, typeof User> = {
  perfil: User,
  citas: Calendar,
  laboratorio: FlaskConical,
  recetas: Pill,
  vacunas: Syringe,
  vitales: HeartPulse,
  documentos: FileText,
};

const ALL_CATEGORIES: ExportCategory[] = [
  "perfil",
  "citas",
  "laboratorio",
  "recetas",
  "vacunas",
  "vitales",
  "documentos",
];

export function ExportSelector({
  selected,
  counts,
  onChange,
}: ExportSelectorProps) {
  const countsMap = new Map(counts.map((c) => [c.category, c.count]));

  const toggleCategory = (cat: ExportCategory) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  const toggleAll = () => {
    if (selected.length === ALL_CATEGORIES.length) {
      onChange([]);
    } else {
      onChange([...ALL_CATEGORIES]);
    }
  };

  const allSelected = selected.length === ALL_CATEGORIES.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">
          Categorias a exportar
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition"
        >
          {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ALL_CATEGORIES.map((cat) => {
          const config = EXPORT_CATEGORY_CONFIG[cat];
          const Icon = CATEGORY_ICONS[cat];
          const count = countsMap.get(cat) ?? 0;
          const isSelected = selected.includes(cat);
          const hasData = count > 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              disabled={!hasData}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : hasData
                    ? "border-gray-100 bg-white hover:border-gray-200"
                    : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-medium ${
                      isSelected ? "text-emerald-800" : "text-gray-900"
                    }`}
                  >
                    {config.label}
                  </p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {config.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
