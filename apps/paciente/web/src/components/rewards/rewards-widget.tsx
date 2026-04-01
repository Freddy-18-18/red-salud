"use client";

import { Trophy, Flame, ArrowRight } from "lucide-react";

interface RewardsWidgetProps {
  level: number;
  totalPoints: number;
  streakDays: number;
  progressPercent: number;
}

export function RewardsWidget({
  level,
  totalPoints,
  streakDays,
  progressPercent,
}: RewardsWidgetProps) {
  return (
    <a
      href="/dashboard/recompensas"
      className="block bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 hover:shadow-md hover:border-amber-300 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Nivel {level}</p>
            <p className="text-xs text-amber-600 font-medium">
              {totalPoints.toLocaleString()} pts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streakDays > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-semibold text-gray-600">
                {streakDays}d
              </span>
            </div>
          )}
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </a>
  );
}
