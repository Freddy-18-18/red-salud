"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  UserX,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { DoctorCard } from "./doctor-card";
import type { DoctorProfile, DoctorFilters } from "@/lib/services/booking-service";

interface DoctorListProps {
  doctors: DoctorProfile[];
  loading: boolean;
  selected: DoctorProfile | null;
  specialtyName: string;
  filters: DoctorFilters;
  onFiltersChange: (filters: DoctorFilters) => void;
  onSelect: (doctor: DoctorProfile) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function DoctorList({
  doctors,
  loading,
  selected,
  specialtyName,
  filters,
  onFiltersChange,
  onSelect,
  onBack,
  onContinue,
}: DoctorListProps) {
  const [showFilters, setShowFilters] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Buscando doctores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar especialidad
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Selecciona tu doctor
        </h2>
        <p className="text-gray-500 text-sm">
          {doctors.length} doctor{doctors.length !== 1 ? "es" : ""} disponible
          {doctors.length !== 1 ? "s" : ""} en {specialtyName}
        </p>
      </div>

      {/* Filters toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Sort */}
        <select
          value={filters.sortBy || "relevance"}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              sortBy: e.target.value as DoctorFilters["sortBy"],
            })
          }
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="relevance">Relevancia</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="rating">Mejor valorados</option>
        </select>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={filters.city || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, city: e.target.value || undefined })
                }
                placeholder="Filtrar por ciudad"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Genero del doctor
              </label>
              <select
                value={filters.gender || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    gender: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Cualquiera</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.accepts_insurance || false}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      accepts_insurance: e.target.checked || undefined,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600">
                  Acepta seguro medico
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Doctor list */}
      {doctors.length > 0 ? (
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              isSelected={selected?.id === doctor.id}
              onSelect={() => onSelect(doctor)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <UserX className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No hay doctores disponibles
          </h3>
          <p className="text-gray-500 mb-4">
            Aun no hay medicos verificados en esta especialidad
          </p>
          <button
            onClick={onBack}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Elegir otra especialidad
          </button>
        </div>
      )}

      {/* Navigation */}
      {doctors.length > 0 && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Atras
          </button>
          <button
            onClick={onContinue}
            disabled={!selected}
            className="flex-1 py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
