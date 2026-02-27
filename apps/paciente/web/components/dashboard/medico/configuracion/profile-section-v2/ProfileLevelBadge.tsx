/**
 * @file ProfileLevelBadge.tsx
 * @description Badge que muestra el nivel actual del perfil con animaciones
 */

"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Award, Crown } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import type { ProfileLevel } from "./types";

interface ProfileLevelBadgeProps {
  level: ProfileLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const LEVEL_CONFIG = {
  basic: {
    icon: Star,
    label: "Perfil Básico",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    iconColor: "text-gray-500",
    description: "Completa tu perfil para destacar",
  },
  complete: {
    icon: Award,
    label: "Perfil Completo",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    iconColor: "text-blue-500",
    description: "¡Buen trabajo! Sigue mejorando",
  },
  professional: {
    icon: Trophy,
    label: "Perfil Profesional",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    iconColor: "text-indigo-500",
    description: "Perfil destacado y confiable",
  },
  elite: {
    icon: Crown,
    label: "Perfil Elite",
    color: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300",
    iconColor: "text-purple-500",
    description: "¡Excelencia profesional!",
  },
};

const SIZE_CONFIG = {
  sm: { icon: "h-3 w-3", text: "text-xs", padding: "px-2 py-1" },
  md: { icon: "h-4 w-4", text: "text-sm", padding: "px-3 py-1.5" },
  lg: { icon: "h-5 w-5", text: "text-base", padding: "px-4 py-2" },
};

export function ProfileLevelBadge({
  level,
  showLabel = true,
  size = "md",
}: ProfileLevelBadgeProps) {
  const config = LEVEL_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-medium",
        config.color,
        sizeConfig.padding
      )}
    >
      <motion.div
        animate={level === "elite" ? {
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: level === "elite" ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <Icon className={cn(sizeConfig.icon, config.iconColor)} />
      </motion.div>

      {showLabel && (
        <span className={sizeConfig.text}>
          {config.label}
        </span>
      )}

      {/* Sparkle effect for elite */}
      {level === "elite" && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
        </motion.div>
      )}
    </motion.div>
  );
}
