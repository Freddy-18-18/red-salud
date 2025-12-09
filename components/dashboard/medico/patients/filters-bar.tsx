"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, LayoutList, Search } from "lucide-react";
import type { ViewMode } from "./hooks/usePatientsList";

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filterGender: string;
  onFilterGenderChange: (v: string) => void;
  filterAgeRange: string;
  onFilterAgeRangeChange: (v: string) => void;
  filterLastVisit: string;
  onFilterLastVisitChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}

export function FiltersBar({
  searchQuery,
  onSearchChange,
  filterGender,
  onFilterGenderChange,
  filterAgeRange,
  onFilterAgeRangeChange,
  filterLastVisit,
  onFilterLastVisitChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}: FiltersBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, cédula, email o teléfono..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select value={filterGender} onValueChange={onFilterGenderChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Género" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="M">Masculino</SelectItem>
            <SelectItem value="F">Femenino</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAgeRange} onValueChange={onFilterAgeRangeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Edad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="0-18">0 - 18 años</SelectItem>
            <SelectItem value="19-60">19 - 60 años</SelectItem>
            <SelectItem value="60+">60+ años</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterLastVisit} onValueChange={onFilterLastVisitChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Última Consulta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier fecha</SelectItem>
            <SelectItem value="recent">Menos de 1 mes</SelectItem>
            <SelectItem value="medium">1 - 6 meses</SelectItem>
            <SelectItem value="long">Más de 6 meses</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
            <SelectItem value="consultations">Más consultas</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value: string) => {
            if (value === "table" || value === "grid") {
              onViewModeChange(value);
            }
          }}
        >
          <ToggleGroupItem value="table" aria-label="Vista de tabla">
            <LayoutList className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Vista de tarjetas">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

