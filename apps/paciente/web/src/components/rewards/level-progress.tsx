"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Sparkles } from "lucide-react";

interface LevelProgressProps {
  level: number;
  totalPoints: number;
  progressPercent: number;
  progressPoints: number;
  progressNeeded: number;
  pointsToNextLevel: number;
}

export function LevelProgress({
  level,
  totalPoints,
  progressPercent,
  progressPoints,
  progressNeeded,
  pointsToNextLevel,
}: LevelProgressProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    // Animate the progress bar
    const timer = setTimeout(() => {
      setAnimatedPercent(progressPercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
      {/* Level Up Celebration */}
      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-500/20 backdrop-blur-sm z-10 animate-fade-in">
          <div className="text-center animate-bounce-in">
            <Sparkles className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-amber-700">Subiste de nivel!</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        {/* Level Badge */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-200">
            <div className="text-center">
              <Trophy className="h-5 w-5 text-white mx-auto" />
              <span className="text-white text-xs font-bold">Nv.{level}</span>
            </div>
          </div>
          {/* Star decoration */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-300 rounded-full flex items-center justify-center">
            <Star className="h-3 w-3 text-amber-700 fill-amber-700" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-bold text-gray-900">
              Nivel {level}
            </h3>
            <span className="text-sm text-amber-600 font-semibold">
              {totalPoints.toLocaleString()} pts
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {pointsToNextLevel > 0
              ? `${pointsToNextLevel} puntos para el siguiente nivel`
              : "Nivel maximo alcanzado!"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400 font-medium">
            {progressPoints}/{progressNeeded} pts
          </span>
          <span className="text-xs text-amber-600 font-medium">
            Nv. {level + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
