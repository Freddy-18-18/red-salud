/**
 * @file ProfileImpactMetrics.tsx
 * @description Visualización de métricas de impacto del perfil
 */

"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Eye,
  Shield,
  Target,
  Star,
  Award,
  Zap,
} from "lucide-react";
import { cn } from "@red-salud/core/utils";
import type { ProfileCompleteness, ProfileData, ProfileMetrics } from "./types";

interface ProfileImpactMetricsProps {
  completeness: ProfileCompleteness;
  profile: ProfileData;
}

export function ProfileImpactMetrics({
  completeness,
  profile,
}: ProfileImpactMetricsProps) {
  /**
   * Calcula las métricas de impacto basadas en el perfil
   */
  const calculateMetrics = (): ProfileMetrics => {
    let visibility = 0;
    let trustScore = 0;
    let conversionRate = 0;

    // Visibilidad (0-100)
    visibility = completeness.percentage;

    // Trust Score (0-100)
    if (profile.is_verified) trustScore += 40;
    if (profile.avatar_url) trustScore += 20;
    if (profile.biografia && profile.biografia.length >= 150) trustScore += 20;
    if (profile.especialidades_adicionales.length > 0) trustScore += 10;
    if (profile.telefono && profile.telefono.length > 5) trustScore += 10;

    // Conversion Rate (estimado basado en completitud)
    conversionRate = Math.min(100, completeness.percentage * 1.2);

    return {
      visibility,
      trustScore,
      completeness: completeness.percentage,
      conversionRate,
    };
  };

  const metrics = calculateMetrics();

  const getMetricColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getMetricBgColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const metricItems = [
    {
      icon: Eye,
      label: "Visibilidad",
      value: metrics.visibility,
      description: "Qué tan visible eres en búsquedas",
      tip: "Completa todos los campos para maximizar",
    },
    {
      icon: Shield,
      label: "Confianza",
      value: metrics.trustScore,
      description: "Nivel de confianza que generas",
      tip: "Verificación y foto aumentan la confianza",
    },
    {
      icon: Target,
      label: "Conversión",
      value: metrics.conversionRate,
      description: "Probabilidad de agendar cita",
      tip: "Biografía completa mejora conversión",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Impacto del Perfil
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Métricas en tiempo real
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        {metricItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", getMetricColor(item.value))} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                <span className={cn("text-sm font-bold", getMetricColor(item.value))}>
                  {Math.round(item.value)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={cn("h-full rounded-full", getMetricBgColor(item.value))}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Comparación con Promedio
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tu perfil</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(metrics.trustScore / 20)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {(metrics.trustScore / 20).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Promedio</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < 3 ? "text-gray-400 fill-gray-400" : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="font-medium text-gray-600 dark:text-gray-400">3.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Insights Rápidos
        </h4>

        {metrics.visibility < 80 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              <strong>Aumenta tu visibilidad:</strong> Completa los campos pendientes para aparecer en más búsquedas
            </p>
          </motion.div>
        )}

        {!profile.avatar_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Agrega una foto:</strong> Los perfiles con foto reciben 3x más citas
            </p>
          </motion.div>
        )}

        {profile.biografia.length < 150 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            <p className="text-xs text-purple-700 dark:text-purple-300">
              <strong>Mejora tu biografía:</strong> Una biografía completa aumenta la conversión hasta 40%
            </p>
          </motion.div>
        )}

        {metrics.trustScore >= 80 && metrics.visibility >= 80 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-start gap-2">
              <Award className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-700 dark:text-green-300">
                <strong>¡Excelente trabajo!</strong> Tu perfil está en el top 10% de la plataforma
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(metrics.visibility)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Visibilidad
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(metrics.trustScore)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Confianza
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              +{Math.round(metrics.conversionRate - 60)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              vs Promedio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
