"use client";

import {
  Search,
  Calendar,
  Stethoscope,
  TestTube,
  Pill,
  Syringe,
  Ambulance,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";

import type { TimelineEventType, TimelineFilters as TFilters } from "@/lib/services/medical-history-service";

interface TimelineFiltersProps {
  filters: TFilters;
  onFiltersChange: (filters: TFilters) => void;
  doctors?: Array<{ id: string; name: string }>;
}

const EVENT_TYPE_OPTIONS: Array<{
  type: TimelineEventType;
  label: string;
  icon: typeof Stethoscope;
  activeColor: string;
}> = [
  { type: "appointment", label: "Consultas", icon: Stethoscope, activeColor: "bg-blue-50 text-blue-700 border-blue-200" },
  { type: "lab_result", label: "Laboratorio", icon: TestTube, activeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { type: "prescription", label: "Recetas", icon: Pill, activeColor: "bg-purple-50 text-purple-700 border-purple-200" },
  { type: "vaccination", label: "Vacunas", icon: Syringe, activeColor: "bg-orange-50 text-orange-700 border-orange-200" },
  { type: "emergency", label: "Emergencias", icon: Ambulance, activeColor: "bg-red-50 text-red-700 border-red-200" },
];

export function TimelineFilters({ filters, onFiltersChange, doctors }: TimelineFiltersProps) {
  const [showDateRange, setShowDateRange] = useState(false);

  const toggleType = useCallback(
    (type: TimelineEventType) => {
      const current = filters.types || [];
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      onFiltersChange({ ...filters, types: next.length > 0 ? next : undefined });
    },
    [filters, onFiltersChange],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, search: e.target.value || undefined });
    },
    [filters, onFiltersChange],
  );

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, dateFrom: e.target.value || undefined });
    },
    [filters, onFiltersChange],
  );

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, dateTo: e.target.value || undefined });
    },
    [filters, onFiltersChange],
  );

  const handleDoctorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ ...filters, doctorId: e.target.value || undefined });
    },
    [filters, onFiltersChange],
  );

  const clearAll = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters =
    (filters.types && filters.types.length > 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search ||
    filters.doctorId;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={filters.search || ""}
          onChange={handleSearchChange}
          placeholder="Buscar en tu historial..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
        />
      </div>

      {/* Event type toggles */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {EVENT_TYPE_OPTIONS.map(({ type, label, icon: Icon, activeColor }) => {
          const isActive = filters.types?.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                isActive
                  ? activeColor
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Date range & doctor filter row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowDateRange(!showDateRange)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
            filters.dateFrom || filters.dateTo
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Fechas
        </button>

        {doctors && doctors.length > 0 && (
          <select
            value={filters.doctorId || ""}
            onChange={handleDoctorChange}
            className="flex-1 min-w-0 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
          >
            <option value="">Todos los doctores</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.name}
              </option>
            ))}
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Expanded date range inputs */}
      {showDateRange && (
        <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Desde</label>
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={handleDateFromChange}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Hasta</label>
            <input
              type="date"
              value={filters.dateTo || ""}
              onChange={handleDateToChange}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
