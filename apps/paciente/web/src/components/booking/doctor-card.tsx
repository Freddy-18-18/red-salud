"use client";

import { Star, MapPin, Shield, Clock } from "lucide-react";

import type { DoctorProfile } from "@/lib/services/booking-service";

interface DoctorCardProps {
  doctor: DoctorProfile;
  isSelected: boolean;
  onSelect: () => void;
}

export function DoctorCard({ doctor, isSelected, onSelect }: DoctorCardProps) {
  const initials = doctor.profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 sm:p-5 border-2 rounded-xl text-left transition-all ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/50 shadow-md"
          : "border-gray-100 hover:border-emerald-200 hover:shadow-sm"
      }`}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {doctor.profile.avatar_url ? (
            <img
              src={doctor.profile.avatar_url}
              alt={doctor.profile.full_name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg font-bold ${
                isSelected
                  ? "bg-emerald-200 text-emerald-700"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                Dr. {doctor.profile.full_name}
              </h3>
              <p className="text-sm text-gray-500">{doctor.specialty.name}</p>
            </div>

            {doctor.verified && (
              <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline">Verificado</span>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600">
            {/* Rating */}
            {doctor.avg_rating !== null && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-medium text-gray-900">
                  {doctor.avg_rating}
                </span>
                <span className="text-gray-400">
                  ({doctor.review_count})
                </span>
              </div>
            )}

            {/* Experience */}
            {doctor.years_experience && doctor.years_experience > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span>{doctor.years_experience} anos exp.</span>
              </div>
            )}

            {/* Location */}
            {(doctor.profile.city || doctor.profile.state) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span>
                  {[doctor.profile.city, doctor.profile.state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Fee */}
          {doctor.consultation_fee !== null && (
            <div className="mt-2">
              <span className="text-lg font-bold text-emerald-700">
                ${doctor.consultation_fee.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 ml-1">por consulta</span>
            </div>
          )}

          {/* Bio preview */}
          {doctor.biografia && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {doctor.biografia}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
