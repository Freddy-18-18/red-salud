"use client";

import { useEffect, useState } from "react";

import type { ScoreLevel } from "@/lib/services/health-score-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ScoreRingProps {
  score: number;
  level: ScoreLevel;
  size?: number;
  strokeWidth?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const LEVEL_LABELS: Record<ScoreLevel, string> = {
  excelente: "Excelente",
  bueno: "Bueno",
  regular: "Regular",
  "necesita-atencion": "Necesita atención",
};

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald-500
  if (score >= 60) return "#eab308"; // yellow-500
  if (score >= 40) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

function scoreBgClass(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ScoreRing({
  score,
  level,
  size = 200,
  strokeWidth = 12,
}: ScoreRingProps) {
  const [animatedOffset, setAnimatedOffset] = useState(1);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(score, 100)) / 100;

  useEffect(() => {
    // Animate from 0 to target value
    const timer = setTimeout(() => {
      setAnimatedOffset(1 - progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * animatedOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-5xl font-bold tabular-nums ${scoreBgClass(score)}`}
          >
            {score}
          </span>
          <span className="text-sm text-gray-400 font-medium mt-0.5">
            de 100
          </span>
        </div>
      </div>

      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
          score >= 80
            ? "bg-emerald-50 text-emerald-700"
            : score >= 60
              ? "bg-yellow-50 text-yellow-700"
              : score >= 40
                ? "bg-orange-50 text-orange-700"
                : "bg-red-50 text-red-700"
        }`}
      >
        {LEVEL_LABELS[level]}
      </span>
    </div>
  );
}
