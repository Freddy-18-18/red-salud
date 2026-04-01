"use client";

import { X, Lock, Award, Heart, Users, Target } from "lucide-react";
import { useState } from "react";

import type { Badge, PatientBadge } from "@/lib/services/rewards-service";

interface BadgeGridProps {
  allBadges: Badge[];
  earnedMap: PatientBadge[];
}

// Badge category icons
const CATEGORY_ICONS: Record<string, typeof Award> = {
  health: Heart,
  engagement: Target,
  community: Users,
  milestone: Award,
};

function getBadgeCondition(badge: Badge): string {
  switch (badge.name) {
    case "Primera Cita":
      return "Completa tu primera cita medica";
    case "Perfil Completo":
      return "Completa toda la informacion de tu perfil";
    case "Familia Unida":
      return "Agrega un familiar a tu cuenta";
    case "Constante":
      return "Mantene una racha de 7 dias";
    case "Saludable":
      return "Mantene una racha de 30 dias";
    case "Preventivo":
      return "Realiza un chequeo preventivo";
    case "Comunicador":
      return "Envia 5 mensajes a tus doctores";
    case "Embajador":
      return "Referi a 3 personas a Red-Salud";
    case "Nivel 5":
      return "Alcanza el nivel 5";
    case "Nivel 10":
      return "Alcanza el nivel 10";
    default:
      return badge.description || `Requiere ${badge.points_required} puntos`;
  }
}

interface BadgeDetailModalProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: string;
  onClose: () => void;
}

function BadgeDetailModal({ badge, earned, earnedAt, onClose }: BadgeDetailModalProps) {
  const CategoryIcon = CATEGORY_ICONS[badge.category] || Award;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          {/* Badge Icon */}
          <div
            className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              earned
                ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-200"
                : "bg-gray-100"
            }`}
          >
            {earned ? (
              <span className="text-3xl">{badge.icon || "🏅"}</span>
            ) : (
              <Lock className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {badge.name}
          </h3>

          <div className="flex items-center justify-center gap-1.5 mb-3">
            <CategoryIcon className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 capitalize">
              {badge.category === "health"
                ? "Salud"
                : badge.category === "engagement"
                  ? "Participacion"
                  : badge.category === "community"
                    ? "Comunidad"
                    : "Hito"}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {getBadgeCondition(badge)}
          </p>

          {earned && earnedAt && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
              <Award className="h-3.5 w-3.5" />
              Obtenida el{" "}
              {new Date(earnedAt).toLocaleDateString("es-VE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}

          {!earned && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full text-xs font-medium">
              <Lock className="h-3.5 w-3.5" />
              No obtenida
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BadgeGrid({ allBadges, earnedMap }: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const earnedBadgeMap = new Map<string, PatientBadge>();
  (earnedMap || []).forEach((pb) => earnedBadgeMap.set(pb.badge_id, pb));

  const earnedCount = earnedBadgeMap.size;
  const totalCount = allBadges.length;

  const selectedIsEarned = selectedBadge
    ? earnedBadgeMap.has(selectedBadge.id)
    : false;
  const selectedEarnedAt = selectedBadge
    ? earnedBadgeMap.get(selectedBadge.id)?.earned_at
    : undefined;

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Insignias</h3>
          <span className="text-xs text-gray-400 font-medium">
            {earnedCount}/{totalCount}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeMap.has(badge.id);
            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all hover:scale-105 ${
                  isEarned
                    ? "bg-amber-50 hover:bg-amber-100"
                    : "bg-gray-50 hover:bg-gray-100 opacity-50"
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                    isEarned
                      ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm"
                      : "bg-gray-200"
                  }`}
                >
                  {isEarned ? (
                    <span className="text-lg sm:text-xl">
                      {badge.icon || "🏅"}
                    </span>
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${
                    isEarned ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {badge.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          earned={selectedIsEarned}
          earnedAt={selectedEarnedAt}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </>
  );
}
