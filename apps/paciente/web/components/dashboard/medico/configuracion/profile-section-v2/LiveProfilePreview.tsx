/**
 * @file LiveProfilePreview.tsx
 * @description Vista previa en tiempo real de cómo los pacientes ven el perfil del médico
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  MessageCircle,
  Calendar,
  Monitor,
  Smartphone,
  CheckCircle,
  Clock,
  Award,
  Languages,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import type { ProfileData } from "./types";

interface LiveProfilePreviewProps {
  profile: ProfileData;
}

type ViewMode = "desktop" | "mobile";

export function LiveProfilePreview({ profile }: LiveProfilePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  // Datos simulados para la preview
  const mockData = {
    rating: 4.8,
    reviewCount: 124,
    responseTime: "~2 horas",
    experience: "15 años",
    languages: ["Español", "Inglés"],
    location: "Caracas, Venezuela",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Vista Previa en Vivo
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Como lo ven tus pacientes
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode("desktop")}
            className={cn(
              "p-2 rounded transition-colors",
              viewMode === "desktop"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={cn(
              "p-2 rounded transition-colors",
              viewMode === "mobile"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "mx-auto transition-all duration-300",
          viewMode === "mobile" ? "max-w-[375px]" : "w-full"
        )}
      >
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
          {/* Doctor Card Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
            {/* Header with Avatar */}
            <div className="p-6 border-b dark:border-gray-800">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
                      {getInitials(profile.nombre_completo || "MD")}
                    </AvatarFallback>
                  </Avatar>
                  {profile.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-900">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 break-words line-clamp-2">
                        {profile.nombre_completo || "Nombre del Médico"}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {profile.especialidad || "Especialidad"}
                      </p>
                    </div>
                    {profile.is_verified && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs flex-shrink-0">
                        Verificado
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4",
                            i < Math.floor(mockData.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      {mockData.rating}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      ({mockData.reviewCount} reseñas)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="p-4 sm:p-6 space-y-2 sm:space-y-3 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{mockData.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <span>Responde en {mockData.responseTime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <span>{mockData.experience} de experiencia</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{mockData.languages.join(", ")}</span>
              </div>
            </div>

            {/* Biography */}
            {profile.biografia && (
              <div className="p-4 sm:p-6 border-t dark:border-gray-800">
                <h5 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Sobre el médico
                </h5>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-4 break-words">
                  {profile.biografia}
                </p>
              </div>
            )}

            {/* Specialties */}
            {profile.especialidades_adicionales.length > 0 && (
              <div className="p-4 sm:p-6 border-t dark:border-gray-800">
                <h5 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Especialidades adicionales
                </h5>
                <div className="flex flex-wrap gap-2">
                  {profile.especialidades_adicionales.map((esp, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs break-words max-w-full"
                    >
                      {esp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="p-4 sm:p-6 border-t dark:border-gray-800 space-y-3">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Cita
              </Button>
              <Button variant="outline" className="w-full text-sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
            </div>
          </div>

          {/* Preview Label */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vista previa • Los cambios se reflejan en tiempo real
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
