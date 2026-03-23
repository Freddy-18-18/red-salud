"use client";

import type { LeaderboardEntry } from "@/lib/services/referral-service";
import { Trophy, Medal } from "lucide-react";

const RANK_ICONS: Record<number, { emoji: string; color: string }> = {
  1: { emoji: "1", color: "bg-amber-400 text-white" },
  2: { emoji: "2", color: "bg-gray-300 text-gray-700" },
  3: { emoji: "3", color: "bg-amber-600 text-white" },
};

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Trophy className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">
          Todavia no hay ranking este mes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const rankConfig = RANK_ICONS[entry.rank];
        const initials = entry.nombre_completo
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              entry.is_current_user
                ? "bg-emerald-50 border-emerald-200"
                : "bg-white border-gray-100"
            }`}
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                rankConfig ? rankConfig.color : "bg-gray-100 text-gray-500"
              }`}
            >
              {rankConfig ? rankConfig.emoji : entry.rank}
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {entry.avatar_url ? (
                <img
                  src={entry.avatar_url}
                  alt={entry.nombre_completo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-emerald-600">
                  {initials}
                </span>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  entry.is_current_user ? "text-emerald-800" : "text-gray-900"
                }`}
              >
                {entry.nombre_completo}
                {entry.is_current_user && (
                  <span className="text-xs text-emerald-600 ml-1">(vos)</span>
                )}
              </p>
            </div>

            {/* Count */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Medal className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-gray-900">
                {entry.referral_count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
