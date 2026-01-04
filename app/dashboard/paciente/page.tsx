"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchProfile } from "@/lib/redux/profileSlice";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDashboardStats } from "./hooks/use-dashboard-stats";
import { useDashboardData } from "./hooks/use-dashboard-data";
import { StatsGrid } from "./components/stats-grid";
import { UpcomingAppointmentsSection } from "./components/appointment-section";
import { RecentActivitySection } from "./components/recent-activity-section";
import { HealthMetricsSection } from "./components/health-metrics-section";
import { MedicationsSection } from "./components/medications-section";
import { QuickAccessSection } from "./components/quick-access-section";

export default function DashboardPacientePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const profileState = useSelector((state: RootState) => state.profile);
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();

  // Hooks para datos del dashboard
  const { stats, loadAllStats } = useDashboardStats(userId);
  const {
    recentActivities,
    upcomingAppointments,
    latestMetrics,
    activeMedications,
    loadAllData,
  } = useDashboardData(userId);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Cargar perfil desde Redux si no está cargado
      if (profileState.status === "idle") {
        dispatch(fetchProfile(user.id));
      }

      // Cargar datos en paralelo
      await Promise.all([loadAllStats(user.id), loadAllData(user.id)]);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, profileState.status, loadAllStats, loadAllData, router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8 space-y-6">
      {/* Header con Bienvenida */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("dashboard.greeting").replace(
              "{name}",
              profileState.data?.nombre?.split(" ")[0] || "Paciente"
            )}{" "}
            👋
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/paciente/citas/nueva")}>
          <Plus className="h-4 w-4 mr-2" />
          {t("dashboard.scheduleAppointment")}
        </Button>
      </div>

      {/* Estadísticas */}
      <StatsGrid stats={stats} />

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Próximas Citas y Alerta de Telemedicina */}
          <UpcomingAppointmentsSection
            appointments={upcomingAppointments}
            activeTelemed={stats.activeTelemed}
          />

          {/* Actividad Reciente */}
          <RecentActivitySection activities={recentActivities} />
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Métricas de Salud */}
          <HealthMetricsSection metrics={latestMetrics} />

          {/* Medicamentos Activos */}
          <MedicationsSection medications={activeMedications} />

          {/* Accesos Rápidos */}
          <QuickAccessSection />
        </div>
      </div>
    </div>
  );
}
