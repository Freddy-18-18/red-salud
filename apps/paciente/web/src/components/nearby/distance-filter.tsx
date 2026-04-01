"use client";

import {
  Stethoscope,
  Pill,
  Building2,
  FlaskConical,
} from "lucide-react";

import {
  type ProviderType,
  PROVIDER_TYPE_CONFIG,
} from "@/lib/services/nearby-service";

interface DistanceFilterProps {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  selectedTypes: ProviderType[];
  onTypesChange: (types: ProviderType[]) => void;
}

const TYPE_ICONS: Record<ProviderType, typeof Stethoscope> = {
  medico: Stethoscope,
  farmacia: Pill,
  clinica: Building2,
  laboratorio: FlaskConical,
};

const ALL_TYPES: ProviderType[] = ["medico", "farmacia", "clinica", "laboratorio"];

const RADIUS_PRESETS = [1, 3, 5, 10, 25, 50];

export function DistanceFilter({
  radiusKm,
  onRadiusChange,
  selectedTypes,
  onTypesChange,
}: DistanceFilterProps) {
  const toggleType = (type: ProviderType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        onTypesChange(selectedTypes.filter((t) => t !== type));
      }
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Type filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {ALL_TYPES.map((type) => {
          const config = PROVIDER_TYPE_CONFIG[type];
          const Icon = TYPE_ICONS[type];
          const isActive = selectedTypes.includes(type);

          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border whitespace-nowrap transition ${
                isActive
                  ? `${config.bgColor} ${config.color} border-current`
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {config.plural}
            </button>
          );
        })}
      </div>

      {/* Radius slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Radio de busqueda
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            {radiusKm} km
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={50}
          step={1}
          value={radiusKm}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
        />

        {/* Quick presets */}
        <div className="flex gap-1.5">
          {RADIUS_PRESETS.map((km) => (
            <button
              key={km}
              onClick={() => onRadiusChange(km)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition ${
                radiusKm === km
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
