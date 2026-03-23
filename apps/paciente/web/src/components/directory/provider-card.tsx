"use client";

import {
  MapPin,
  Phone,
  Stethoscope,
  Pill,
  Building2,
  FlaskConical,
  Shield,
  Truck,
  Smartphone,
  BedDouble,
  Clock,
  DollarSign,
} from "lucide-react";
import { RatingDisplay } from "@/components/directory/rating-display";
import type { ProviderResult, ProviderType } from "@/lib/services/directory-service";

interface ProviderCardProps {
  provider: ProviderResult;
  onViewProfile: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}

const TYPE_CONFIG: Record<
  ProviderType,
  {
    icon: typeof Stethoscope;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  doctor: {
    icon: Stethoscope,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    label: "Doctor",
  },
  pharmacy: {
    icon: Pill,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Farmacia",
  },
  clinic: {
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Clinica",
  },
  laboratory: {
    icon: FlaskConical,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: "Laboratorio",
  },
};

function getPrimaryAction(type: ProviderType): {
  label: string;
  defaultHref?: string;
} {
  switch (type) {
    case "doctor":
      return { label: "Agendar cita" };
    case "pharmacy":
      return { label: "Llamar" };
    case "clinic":
      return { label: "Contactar" };
    case "laboratory":
      return { label: "Agendar turno" };
  }
}

export function ProviderCard({
  provider,
  onViewProfile,
  onPrimaryAction,
  primaryActionLabel,
}: ProviderCardProps) {
  const config = TYPE_CONFIG[provider.type];
  const TypeIcon = config.icon;
  const defaultAction = getPrimaryAction(provider.type);

  const initials = provider.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const location = [provider.city, provider.state].filter(Boolean).join(", ");

  return (
    <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0 overflow-hidden`}
        >
          {provider.avatarUrl ? (
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <span className={`text-xl font-semibold ${config.color}`}>
              {initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {provider.type === "doctor" ? "Dr. " : ""}
                  {provider.name}
                </h3>
                {provider.type === "doctor" && provider.acceptsInsurance && (
                  <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>
              {/* Type badge + specialty */}
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                >
                  <TypeIcon className="h-3 w-3" />
                  {config.label}
                </span>
                {provider.specialty && (
                  <span className="text-xs text-gray-500 truncate">
                    {provider.specialty}
                  </span>
                )}
              </div>
            </div>

            {/* Price for doctors */}
            {provider.consultationFee != null && (
              <span className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600 whitespace-nowrap">
                <DollarSign className="h-3.5 w-3.5" />
                {provider.consultationFee.toFixed(2)}
              </span>
            )}
          </div>

          {/* Meta info row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            <RatingDisplay
              rating={provider.avgRating}
              reviewCount={provider.reviewCount}
            />

            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}

            {provider.officeHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{provider.officeHours}</span>
              </div>
            )}

            {/* Doctor-specific */}
            {provider.yearsExperience != null &&
              provider.yearsExperience > 0 && (
                <span>{provider.yearsExperience} anos exp.</span>
              )}

            {/* Pharmacy-specific */}
            {provider.type === "pharmacy" &&
              provider.acceptsDigitalPrescriptions && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Recetas digitales</span>
                </div>
              )}

            {/* Clinic-specific */}
            {provider.bedCount != null && provider.bedCount > 0 && (
              <div className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                <span>{provider.bedCount} camas</span>
              </div>
            )}
            {provider.specialties && provider.specialties.length > 0 && (
              <span>
                {provider.specialties.length} especialidad
                {provider.specialties.length > 1 ? "es" : ""}
              </span>
            )}

            {/* Lab-specific */}
            {provider.avgDeliveryTimeHours != null && (
              <div className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                <span>Resultados en {provider.avgDeliveryTimeHours}h</span>
              </div>
            )}
            {provider.type === "laboratory" &&
              provider.acceptsDigitalOrders && (
                <div className="flex items-center gap-1 text-amber-600">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Digital</span>
                </div>
              )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onViewProfile}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Ver perfil
            </button>
            {onPrimaryAction && (
              <button
                onClick={onPrimaryAction}
                className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition"
              >
                {primaryActionLabel || defaultAction.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
