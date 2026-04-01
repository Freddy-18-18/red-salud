"use client";

import {
  MapPin,
  Star,
  Phone,
  Clock,
  ChevronRight,
  Stethoscope,
  Pill,
  Building2,
  FlaskConical,
} from "lucide-react";

import {
  type NearbyProvider,
  type ProviderType,
  formatDistance,
  getProviderTypeConfig,
} from "@/lib/services/nearby-service";

interface ProviderListViewProps {
  providers: NearbyProvider[];
  onSelect: (provider: NearbyProvider) => void;
}

const TYPE_ICONS: Record<ProviderType, typeof Stethoscope> = {
  medico: Stethoscope,
  farmacia: Pill,
  clinica: Building2,
  laboratorio: FlaskConical,
};

export function ProviderListView({
  providers,
  onSelect,
}: ProviderListViewProps) {
  if (providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
          <MapPin className="h-7 w-7 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-900">
          Sin proveedores cercanos
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Intenta aumentar el radio de busqueda o ajustar los filtros
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {providers.map((provider) => {
        const typeConfig = getProviderTypeConfig(provider.type);
        const Icon = TYPE_ICONS[provider.type] ?? MapPin;

        return (
          <button
            key={`${provider.type}-${provider.id}`}
            onClick={() => onSelect(provider)}
            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 text-left transition"
          >
            {/* Avatar / Icon */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.bgColor}`}
            >
              {provider.avatar_url ? (
                <img
                  src={provider.avatar_url}
                  alt={provider.name}
                  className="w-11 h-11 rounded-xl object-cover"
                />
              ) : (
                <Icon className={`h-5 w-5 ${typeConfig.color}`} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {provider.name}
                </p>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${typeConfig.bgColor} ${typeConfig.color}`}
                >
                  {typeConfig.label}
                </span>
              </div>

              {provider.specialty && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {provider.specialty}
                </p>
              )}

              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-0.5 font-medium text-emerald-600">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(provider.distance_km)}
                </span>

                {provider.rating != null && (
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    {provider.rating.toFixed(1)}
                    {provider.review_count > 0 && (
                      <span className="text-gray-400">
                        ({provider.review_count})
                      </span>
                    )}
                  </span>
                )}

                {provider.is_available && (
                  <span className="flex items-center gap-0.5 text-emerald-500">
                    <Clock className="h-3 w-3" />
                    Disponible
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
