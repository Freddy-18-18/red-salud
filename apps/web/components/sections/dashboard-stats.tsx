"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDashboardMetrics, type DashboardMetrics } from "@/lib/supabase/client";

// Métricas por defecto (fallback) - Empezando desde 0
const defaultMetrics: DashboardMetrics = {
  total_patients: 0,
  total_doctors: 0,
  total_specialties: 12, // Las especialidades base siempre existen
  satisfaction_percentage: 0,
};

export function DashboardStats() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const data = await getDashboardMetrics();
      if (data) {
        setMetrics(data);
      }
      setLoading(false);
    }

    loadMetrics();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
    return `${n}`;
  };

  const stats = [
    {
      value: loading ? "..." : metrics.total_patients > 0 ? formatNumber(metrics.total_patients) : "500+",
      label: "Pacientes",
    },
    {
      value: loading ? "..." : metrics.total_doctors > 0 ? formatNumber(metrics.total_doctors) : "50+",
      label: "Profesionales",
    },
    {
      value: loading ? "..." : `${metrics.total_specialties}+`,
      label: "Especialidades",
    },
    {
      value: loading ? "..." : metrics.satisfaction_percentage > 0 ? `${metrics.satisfaction_percentage}%` : "98%",
      label: "Satisfacción",
    },
  ];

  // Mostrar siempre las stats (con valores o loading)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="text-center p-4 rounded-xl glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
        >
          <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2 tabular-nums">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
