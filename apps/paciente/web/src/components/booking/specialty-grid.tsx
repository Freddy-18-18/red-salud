"use client";

import {
  Search,
  Heart,
  Brain,
  Eye,
  Baby,
  Bone,
  Stethoscope,
  Activity,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { Specialty } from "@/lib/services/booking-service";

// Map specialty names to icons
function getSpecialtyIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("cardio")) return Heart;
  if (lower.includes("neuro") || lower.includes("psiq")) return Brain;
  if (lower.includes("oftalm")) return Eye;
  if (lower.includes("pediatr")) return Baby;
  if (lower.includes("traumat") || lower.includes("ortop")) return Bone;
  if (lower.includes("general") || lower.includes("intern")) return Stethoscope;
  return Activity;
}

// Popular specialties shown first
const POPULAR_NAMES = [
  "medicina general",
  "pediatria",
  "cardiologia",
  "dermatologia",
  "ginecologia",
  "traumatologia",
  "oftalmologia",
  "neurologia",
];

interface SpecialtyGridProps {
  specialties: Specialty[];
  loading: boolean;
  selected: { id: string; name: string } | null;
  onSelect: (specialty: { id: string; name: string }) => void;
  onContinue: () => void;
}

export function SpecialtyGrid({
  specialties,
  loading,
  selected,
  onSelect,
  onContinue,
}: SpecialtyGridProps) {
  const [search, setSearch] = useState("");

  const { popular, filtered } = useMemo(() => {
    const q = search.toLowerCase().trim();

    // Split popular vs rest
    const pop = specialties.filter((s) =>
      POPULAR_NAMES.some((p) => s.name.toLowerCase().includes(p))
    );

    if (!q) {
      // No search: show popular first, then rest
      const rest = specialties.filter(
        (s) => !POPULAR_NAMES.some((p) => s.name.toLowerCase().includes(p))
      );
      return { popular: pop, filtered: rest };
    }

    // With search: filter all, no popular section
    const all = specialties.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
    return { popular: [], filtered: all };
  }, [specialties, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Cargando especialidades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Que especialidad necesitas?
        </h2>
        <p className="text-gray-500 text-sm">
          Selecciona el tipo de consulta que necesitas
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar especialidad (ej: Cardiologia, Pediatria...)"
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Popular specialties */}
      {popular.length > 0 && !search && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Mas buscadas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {popular.map((s) => {
              const Icon = getSpecialtyIcon(s.name);
              const isSelected = selected?.id === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => onSelect({ id: s.id, name: s.name })}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 ${
                      isSelected
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {s.name}
                  </h4>
                  {s.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* All / filtered specialties */}
      {filtered.length > 0 && (
        <div>
          {!search && popular.length > 0 && (
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Todas las especialidades
            </h3>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((s) => {
              const Icon = getSpecialtyIcon(s.name);
              const isSelected = selected?.id === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => onSelect({ id: s.id, name: s.name })}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 ${
                      isSelected
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {s.name}
                  </h4>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {search && filtered.length === 0 && popular.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">
            No se encontraron especialidades para &quot;{search}&quot;
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Ver todas las especialidades
          </button>
        </div>
      )}

      {/* Continue button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onContinue}
          disabled={!selected}
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
