"use client";

import { Star, MapPin, Clock, Shield, Loader2 } from "lucide-react";
import type { ReviewerDoctor } from "@/lib/services/second-opinion-service";

interface ReviewerSelectorProps {
  doctors: ReviewerDoctor[];
  loading: boolean;
  selected: ReviewerDoctor | null;
  onSelect: (doctor: ReviewerDoctor) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function ReviewerSelector({
  doctors,
  loading,
  selected,
  onSelect,
  onContinue,
  onBack,
}: ReviewerSelectorProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Buscando especialistas disponibles...</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Selecciona un especialista
          </h2>
          <p className="text-gray-500 text-sm">
            Elige el doctor que revisara tu diagnostico
          </p>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">
            No hay especialistas disponibles para esta especialidad
          </p>
          <p className="text-sm text-gray-400">
            Intenta seleccionar otra especialidad
          </p>
        </div>

        <div className="flex justify-start pt-2">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Selecciona un especialista
        </h2>
        <p className="text-gray-500 text-sm">
          Elige el doctor que revisara tu diagnostico ({doctors.length}{" "}
          disponible{doctors.length !== 1 ? "s" : ""})
        </p>
      </div>

      <div className="space-y-3">
        {doctors.map((doctor) => {
          const isSelected = selected?.id === doctor.id;
          const initials = doctor.profile.nombre_completo
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <button
              key={doctor.id}
              onClick={() => onSelect(doctor)}
              className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
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
                      alt={doctor.profile.nombre_completo}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
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
                      <h3 className="font-semibold text-gray-900">
                        Dr. {doctor.profile.nombre_completo}
                      </h3>
                    </div>
                    {doctor.verified && (
                      <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                        <Shield className="h-3 w-3" />
                        <span className="hidden sm:inline">Verificado</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600">
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

                    {doctor.anos_experiencia && doctor.anos_experiencia > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{doctor.anos_experiencia} anos exp.</span>
                      </div>
                    )}

                    {(doctor.profile.ciudad || doctor.profile.estado) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>
                          {[doctor.profile.ciudad, doctor.profile.estado]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {doctor.consultation_fee !== null && (
                    <div className="mt-2">
                      <span className="text-lg font-bold text-emerald-700">
                        ${doctor.consultation_fee.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        por consulta
                      </span>
                    </div>
                  )}

                  {doctor.biografia && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {doctor.biografia}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
        >
          Volver
        </button>
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
