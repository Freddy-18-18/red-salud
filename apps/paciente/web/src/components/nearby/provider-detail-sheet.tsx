"use client";

import {
  X,
  MapPin,
  Star,
  Phone,
  Clock,
  Navigation,
  Calendar,
  Stethoscope,
  Pill,
  Building2,
  FlaskConical,
  ExternalLink,
} from "lucide-react";

import {
  type NearbyProvider,
  type ProviderType,
  formatDistance,
  getProviderTypeConfig,
} from "@/lib/services/nearby-service";

interface ProviderDetailSheetProps {
  provider: NearbyProvider;
  onClose: () => void;
}

const TYPE_ICONS: Record<ProviderType, typeof Stethoscope> = {
  medico: Stethoscope,
  farmacia: Pill,
  clinica: Building2,
  laboratorio: FlaskConical,
};

export function ProviderDetailSheet({
  provider,
  onClose,
}: ProviderDetailSheetProps) {
  const typeConfig = getProviderTypeConfig(provider.type);
  const Icon = TYPE_ICONS[provider.type] ?? MapPin;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const callPhone = () => {
    if (provider.phone) {
      window.open(`tel:${provider.phone}`, "_self");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 p-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.bgColor}`}
          >
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <Icon className={`h-7 w-7 ${typeConfig.color}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {provider.name}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full mt-0.5 ${typeConfig.bgColor} ${typeConfig.color}`}
                >
                  {typeConfig.label}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-4 pb-4 space-y-3">
          {/* Specialty */}
          {provider.specialty && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stethoscope className="h-4 w-4 text-gray-400" />
              {provider.specialty}
            </div>
          )}

          {/* Distance */}
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <MapPin className="h-4 w-4" />
            A {formatDistance(provider.distance_km)} de ti
          </div>

          {/* Rating */}
          {provider.rating != null && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold">{provider.rating.toFixed(1)}</span>
              <span className="text-gray-400">
                ({provider.review_count} opinion
                {provider.review_count !== 1 ? "es" : ""})
              </span>
            </div>
          )}

          {/* Address */}
          {provider.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{provider.address}</span>
            </div>
          )}

          {/* Phone */}
          {provider.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              {provider.phone}
            </div>
          )}

          {/* Opening hours */}
          {provider.opening_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              {provider.opening_hours}
            </div>
          )}

          {/* Availability badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                provider.is_available
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  provider.is_available ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {provider.is_available ? "Disponible" : "No disponible"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-gray-100">
          {provider.phone && (
            <button
              onClick={callPhone}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Phone className="h-4 w-4" />
              Llamar
            </button>
          )}
          <button
            onClick={openGoogleMaps}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition"
          >
            <Navigation className="h-4 w-4" />
            Como llegar
          </button>
          {provider.type === "medico" && (
            <a
              href={`/dashboard/directorio/doctor/${provider.id}`}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
            >
              <Calendar className="h-4 w-4" />
              Agendar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
