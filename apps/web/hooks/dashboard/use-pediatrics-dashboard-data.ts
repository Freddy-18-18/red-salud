// ============================================
// PEDIATRICS DASHBOARD DATA HOOK
// Fetches and processes pediatrics-specific dashboard data
// ============================================

"use client";

import { useState, useEffect, useCallback } from 'react';

interface PatientStatus {
  active: number;
  activeTrend: number;
  followUp: number;
  highPriority: number;
  newThisMonth: number;
  nutritionAlerts: number;
}

interface VaccinationData {
  vaccineName: string;
  completed: number;
  scheduled: number;
  coverage: number;
}

interface GrowthAlert {
  id: string;
  patientName: string;
  age: string;
  alert: string;
  severity: "high" | "medium" | "low";
}

interface WellChildAppointment {
  patientName: string;
  age: string;
  visitType: string;
  scheduledTime: string;
}

interface PediatricsDashboardData {
  patientStatus: PatientStatus;
  vaccinations: VaccinationData[];
  growthAlerts: GrowthAlert[];
  wellChildSchedule: WellChildAppointment[];
  upcomingVaccines: Array<{
    patientName: string;
    vaccine: string;
    scheduledDate: string;
  }>;
  refreshedAt: string | null;
}

/**
 * Hook for pediatrics dashboard data
 */
export function usePediatricsDashboardData(doctorId?: string) {
  const [data, setData] = useState<PediatricsDashboardData>({
    patientStatus: {
      active: 248,
      activeTrend: 8,
      followUp: 35,
      highPriority: 12,
      newThisMonth: 24,
      nutritionAlerts: 6,
    },
    vaccinations: [
      { vaccineName: "BCG", completed: 45, scheduled: 48, coverage: 94 },
      { vaccineName: "Hepatitis B", completed: 44, scheduled: 47, coverage: 94 },
      { vaccineName: "Pentavalente", completed: 42, scheduled: 46, coverage: 91 },
      { vaccineName: "Polio (IPV)", completed: 43, scheduled: 46, coverage: 93 },
      { vaccineName: "Rotavirus", completed: 40, scheduled: 45, coverage: 89 },
      { vaccineName: "Neumococo", completed: 38, scheduled: 42, coverage: 90 },
    ],
    growthAlerts: [
      {
        id: "alert1",
        patientName: "Valentina González",
        age: "8 meses",
        alert: "Peso por debajo del percentil 5",
        severity: "high",
      },
      {
        id: "alert2",
        patientName: "Mateo Rodríguez",
        age: "18 meses",
        alert: "Talla por debajo del percentil 10",
        severity: "high",
      },
      {
        id: "alert3",
        patientName: "Sofía Martínez",
        age: "3 años",
        alert: "Retraso en lenguaje (detecta 3 palabras)",
        severity: "medium",
      },
    ],
    wellChildSchedule: [
      { patientName: "Sofía Martínez", age: "2 meses", visitType: "2 meses", scheduledTime: "09:00" },
      { patientName: "Mateo Rodríguez", age: "4 meses", visitType: "4 meses", scheduledTime: "10:30" },
      { patientName: "Valentina Sánchez", age: "6 meses", visitType: "6 meses", scheduledTime: "11:00" },
      { patientName: "Daniel López", age: "9 meses", visitType: "9 meses", scheduledTime: "14:00" },
      { patientName: "Isabella González", age: "12 meses", visitType: "12 meses", scheduledTime: "15:30" },
    ],
    upcomingVaccines: [
      { patientName: "Lucía Fernández", vaccine: "MMR (12 meses)", scheduledDate: "Hoy" },
      { patientName: "Tomás González", vaccine: "Neumococo (18 meses)", scheduledDate: "Mañana" },
      { patientName: "Valentina Rodríguez", vaccine: "Varicela", scheduledDate: "En 2 días" },
    ],
    refreshedAt: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!doctorId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setData({ ...data, refreshedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    isLoading,
    error,
    refresh,
  };
}
