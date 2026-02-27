/**
 * @file ProfileCompletionRing.tsx
 * @description Progress ring circular animado que muestra la completitud del perfil
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@red-salud/core/utils";
import type { ProfileLevel } from "./types";

interface ProfileCompletionRingProps {
  percentage: number;
  level: ProfileLevel;
  size?: "sm" | "md" | "lg";
}

const LEVEL_CONFIG = {
  basic: {
    color: "text-gray-500",
    gradient: "from-gray-400 to-gray-600",
    label: "Básico",
  },
  complete: {
    color: "text-blue-500",
    gradient: "from-blue-400 to-blue-600",
    label: "Completo",
  },
  professional: {
    color: "text-indigo-500",
    gradient: "from-indigo-400 to-indigo-600",
    label: "Profesional",
  },
  elite: {
    color: "text-purple-500",
    gradient: "from-purple-400 to-purple-600",
    label: "Elite",
  },
};

const SIZE_CONFIG = {
  sm: { ring: 60, stroke: 4, text: "text-sm" },
  md: { ring: 80, stroke: 6, text: "text-base" },
  lg: { ring: 100, stroke: 8, text: "text-lg" },
};

export function ProfileCompletionRing({
  percentage,
  level,
  size = "md",
}: ProfileCompletionRingProps) {
  const config = LEVEL_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];

  const radius = (sizeConfig.ring - sizeConfig.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG Ring */}
      <svg
        width={sizeConfig.ring}
        height={sizeConfig.ring}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={sizeConfig.ring / 2}
          cy={sizeConfig.ring / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={sizeConfig.stroke}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Progress circle */}
        <motion.circle
          cx={sizeConfig.ring / 2}
          cy={sizeConfig.ring / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={sizeConfig.stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={cn("stop-color", config.gradient.split(" ")[0])} />
            <stop offset="100%" className={cn("stop-color", config.gradient.split(" ")[1])} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className={cn("font-bold", config.color, sizeConfig.text)}
        >
          {Math.round(percentage)}%
        </motion.span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {config.label}
        </span>
      </div>

      {/* Glow effect for elite level */}
      {level === "elite" && (
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
