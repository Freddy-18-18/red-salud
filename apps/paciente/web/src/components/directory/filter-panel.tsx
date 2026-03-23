"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  X,
  Star,
  Shield,
  Clock,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ProviderType, DirectoryFilters } from "@/lib/services/directory-service";

interface FilterPanelProps {
  filters: DirectoryFilters;
  providerType: ProviderType | "all";
  specialties: { id: string; name: string }[];
  onUpdate: (key: keyof DirectoryFilters, value: unknown) => void;
  onReset: () => void;
  /** Mobile: whether the panel is open */
  open: boolean;
  onToggle: () => void;
  /** Render mode: mobile-only shows trigger + bottom sheet, desktop-only shows sidebar */
  mode?: "mobile-only" | "desktop-only" | "both";
}

export function FilterPanel({
  filters,
  providerType,
  specialties,
  onUpdate,
  onReset,
  open,
  onToggle,
  mode = "both",
}: FilterPanelProps) {
  const hasActiveFilters = Boolean(
    filters.city ||
      filters.state ||
      filters.specialtyId ||
      filters.minRating ||
      filters.acceptsInsurance ||
      filters.openNow ||
      filters.hasDelivery ||
      filters.maxPrice
  );

  const activeCount = [
    filters.city,
    filters.state,
    filters.specialtyId,
    filters.minRating,
    filters.acceptsInsurance,
    filters.openNow,
    filters.hasDelivery,
    filters.maxPrice,
  ].filter(Boolean).length;

  const showMobile = mode === "mobile-only" || mode === "both";
  const showDesktop = mode === "desktop-only" || mode === "both";

  return (
    <>
      {/* Mobile trigger button */}
      {showMobile && (
        <button
          onClick={onToggle}
          className={`lg:hidden flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition ${
            hasActiveFilters
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>
      )}

      {/* Mobile bottom sheet */}
      {showMobile && open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onToggle}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Filtros</h3>
              <button
                onClick={onToggle}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent
                filters={filters}
                providerType={providerType}
                specialties={specialties}
                onUpdate={onUpdate}
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-2">
              <button
                onClick={onReset}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Limpiar
              </button>
              <button
                onClick={onToggle}
                className="flex-1 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {showDesktop && (
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-xl p-4 sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Filtros</h3>
              {hasActiveFilters && (
                <button
                  onClick={onReset}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Limpiar
                </button>
              )}
            </div>
            <FilterContent
              filters={filters}
              providerType={providerType}
              specialties={specialties}
              onUpdate={onUpdate}
            />
          </div>
        </div>
      )}
    </>
  );
}

// --- Internal filter content ---

function FilterContent({
  filters,
  providerType,
  specialties,
  onUpdate,
}: {
  filters: DirectoryFilters;
  providerType: ProviderType | "all";
  specialties: { id: string; name: string }[];
  onUpdate: (key: keyof DirectoryFilters, value: unknown) => void;
}) {
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const visibleSpecialties = showAllSpecialties
    ? specialties
    : specialties.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* City */}
      <FilterGroup label="Ciudad">
        <input
          type="text"
          value={filters.city || ""}
          onChange={(e) => onUpdate("city", e.target.value || undefined)}
          placeholder="Ej: Caracas"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </FilterGroup>

      {/* State */}
      <FilterGroup label="Estado">
        <input
          type="text"
          value={filters.state || ""}
          onChange={(e) => onUpdate("state", e.target.value || undefined)}
          placeholder="Ej: Miranda"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </FilterGroup>

      {/* Specialty (visible for doctors or all) */}
      {(providerType === "all" || providerType === "doctor") &&
        specialties.length > 0 && (
          <FilterGroup label="Especialidad">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                onClick={() => onUpdate("specialtyId", undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                  !filters.specialtyId
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Todas
              </button>
              {visibleSpecialties.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onUpdate("specialtyId", s.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                    filters.specialtyId === s.id
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s.name}
                </button>
              ))}
              {specialties.length > 8 && (
                <button
                  onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                  className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  {showAllSpecialties ? (
                    <>
                      <ChevronUp className="h-3 w-3" /> Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" /> Ver todas (
                      {specialties.length})
                    </>
                  )}
                </button>
              )}
            </div>
          </FilterGroup>
        )}

      {/* Min rating */}
      <FilterGroup label="Rating minimo">
        <div className="flex gap-1">
          {[0, 3, 3.5, 4, 4.5].map((val) => (
            <button
              key={val}
              onClick={() =>
                onUpdate("minRating", val === 0 ? undefined : val)
              }
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                (filters.minRating || 0) === val
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {val === 0 ? (
                "Todos"
              ) : (
                <>
                  <Star className="h-3 w-3 text-amber-400 fill-current" />
                  {val}+
                </>
              )}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Toggle filters */}
      <FilterGroup label="Opciones">
        <div className="space-y-2">
          {(providerType === "all" || providerType === "doctor") && (
            <ToggleFilter
              icon={Shield}
              label="Acepta seguro"
              checked={filters.acceptsInsurance || false}
              onChange={(v) => onUpdate("acceptsInsurance", v || undefined)}
            />
          )}
          <ToggleFilter
            icon={Clock}
            label="Abierto ahora"
            checked={filters.openNow || false}
            onChange={(v) => onUpdate("openNow", v || undefined)}
          />
          {(providerType === "all" ||
            providerType === "pharmacy" ||
            providerType === "laboratory") && (
            <ToggleFilter
              icon={Truck}
              label="Delivery disponible"
              checked={filters.hasDelivery || false}
              onChange={(v) => onUpdate("hasDelivery", v || undefined)}
            />
          )}
        </div>
      </FilterGroup>

      {/* Max price (for doctors) */}
      {(providerType === "all" || providerType === "doctor") && (
        <FilterGroup label="Precio maximo">
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={filters.maxPrice || 500}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdate("maxPrice", val >= 500 ? undefined : val);
              }}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span className="font-medium text-gray-700">
                {filters.maxPrice != null && filters.maxPrice < 500
                  ? `$${filters.maxPrice}`
                  : "Sin limite"}
              </span>
              <span>$500+</span>
            </div>
          </div>
        </FilterGroup>
      )}
    </div>
  );
}

// --- Sub-components ---

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </h4>
      {children}
    </div>
  );
}

function ToggleFilter({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: typeof Shield;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={`relative w-9 h-5 rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-gray-200"
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <div className="flex items-center gap-1.5 text-sm text-gray-700 group-hover:text-gray-900">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        {label}
      </div>
    </label>
  );
}
