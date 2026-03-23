"use client";

import {
  FlaskConical,
  Pill,
  Hospital,
  CreditCard,
  Syringe,
  Receipt,
  File,
  type LucideIcon,
} from "lucide-react";
import {
  type DocumentCategory,
  type CategoryCount,
  DOCUMENT_CATEGORIES,
} from "@/lib/services/documents-service";

const CATEGORY_ICONS: Record<DocumentCategory, LucideIcon> = {
  laboratorio: FlaskConical,
  receta: Pill,
  informe: Hospital,
  seguro: CreditCard,
  vacuna: Syringe,
  factura: Receipt,
  otro: File,
};

const CATEGORY_COLORS: Record<DocumentCategory, { bg: string; icon: string; badge: string }> = {
  laboratorio: {
    bg: "bg-purple-50 hover:bg-purple-100 border-purple-100",
    icon: "text-purple-600",
    badge: "bg-purple-100 text-purple-700",
  },
  receta: {
    bg: "bg-blue-50 hover:bg-blue-100 border-blue-100",
    icon: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  informe: {
    bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-100",
    icon: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
  seguro: {
    bg: "bg-amber-50 hover:bg-amber-100 border-amber-100",
    icon: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
  },
  vacuna: {
    bg: "bg-teal-50 hover:bg-teal-100 border-teal-100",
    icon: "text-teal-600",
    badge: "bg-teal-100 text-teal-700",
  },
  factura: {
    bg: "bg-orange-50 hover:bg-orange-100 border-orange-100",
    icon: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
  },
  otro: {
    bg: "bg-gray-50 hover:bg-gray-100 border-gray-200",
    icon: "text-gray-600",
    badge: "bg-gray-200 text-gray-700",
  },
};

interface CategoryGridProps {
  categoryCounts: CategoryCount[];
  selectedCategory?: DocumentCategory;
  onSelectCategory: (category: DocumentCategory | undefined) => void;
}

export function CategoryGrid({
  categoryCounts,
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {DOCUMENT_CATEGORIES.map((cat) => {
        const count =
          categoryCounts.find((c) => c.category === cat.value)?.count ?? 0;
        const Icon = CATEGORY_ICONS[cat.value];
        const colors = CATEGORY_COLORS[cat.value];
        const isSelected = selectedCategory === cat.value;

        return (
          <button
            key={cat.value}
            onClick={() =>
              onSelectCategory(isSelected ? undefined : cat.value)
            }
            className={`relative p-4 rounded-xl border transition-all text-left ${
              isSelected
                ? `${colors.bg} border-2 ring-2 ring-emerald-200 shadow-sm`
                : `${colors.bg} border`
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/60`}
              >
                <Icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
              {count > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${colors.badge}`}
                >
                  {count}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {cat.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
