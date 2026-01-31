"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { UserPlus, Users } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { FiltersBar } from "@/components/dashboard/medico/patients/filters-bar";
import { PatientsTable } from "@/components/dashboard/medico/patients/patients-table";
import { PatientsGrid } from "@/components/dashboard/medico/patients/patients-grid";
import { usePatientsList } from "@/components/dashboard/medico/patients/hooks/usePatientsList";
import type { RegisteredPatient, OfflinePatient } from "@/components/dashboard/medico/patients/utils";
import { format } from "date-fns";
import { Skeleton } from "@red-salud/ui";

// Components
import { StatsCards } from "@/components/dashboard/medico/patients/stats-cards";
import { TodayAppointments } from "@/components/dashboard/medico/patients/today-appointments";
import { MetricsModal } from "@/components/dashboard/medico/patients/metrics-modal";

interface TodayAppointment {
  id: string;
  paciente_id: string | null;
  offline_patient_id: string | null;
  paciente_nombre: string;
  paciente_avatar: string | null;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string;
  status: string;
  tipo_cita: string;
  started_at: string | null;
  completed_at: string | null;
  patient_arrived_at: string | null;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { state, actions } = usePatientsList(userId);

  // Estados para secciones expandibles
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [avgConsultationTime, setAvgConsultationTime] = useState<number>(0);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricsData, setMetricsData] = useState<Record<string, unknown> | null>(null);

  const handleView = (p: RegisteredPatient | OfflinePatient) => {
    const isRegistered = "patient" in p;
    if (isRegistered) {
      const rp = p as RegisteredPatient;
      router.push(`/dashboard/medico/pacientes/${rp.patient_id}`);
    } else {
      const op = p as OfflinePatient;
      router.push(`/dashboard/medico/pacientes/offline/${op.id}`);
    }
  };

  const handleMessage = (p: RegisteredPatient) => {
    router.push(`/dashboard/medico/mensajeria?patient=${p.patient_id}`);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      setUserId(user.id);

      // Cargar tiempo promedio
      loadAverageTime(user.id);
    };
    init();
  }, [router]);

  const loadAverageTime = async (doctorId: string) => {
    try {
      // Consulta simplificada para evitar ambigüedad
      const { data, error } = await supabase
        .from("appointments")
        .select("duracion_minutos, motivo, completed_at")
        .eq("medico_id", doctorId)
        .eq("status", "completada")
        .not("completed_at", "is", null)
        .gte("completed_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error("Error loading average time:", error.message);
        return;
      }

      if (data && data.length > 0) {
        // Calcular promedio general
        const avgMinutes = Math.round(
          data.reduce((sum, c) => sum + (c.duracion_minutos || 0), 0) / data.length
        );

        // Calcular por motivo
        const byMotivo: Record<string, { count: number; total: number; avg_minutes: number }> = {};
        data.forEach((c) => {
          const motivo = c.motivo || "Sin especificar";
          if (!byMotivo[motivo]) {
            byMotivo[motivo] = { count: 0, total: 0, avg_minutes: 0 };
          }
          byMotivo[motivo].count++;
          byMotivo[motivo].total += c.duracion_minutos || 0;
        });

        // Calcular promedios por motivo
        Object.keys(byMotivo).forEach((motivo) => {
          byMotivo[motivo].avg_minutes = Math.round(
            byMotivo[motivo].total / byMotivo[motivo].count
          );
        });

        setAvgConsultationTime(avgMinutes);
        setMetricsData({
          avg_minutes: avgMinutes,
          total_consultations: data.length,
          by_motivo: byMotivo,
        });
      }
    } catch (err) {
      console.error("Error loading average time:", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleShowMetrics = () => {
    setShowMetricsModal(true);
  };

  const loadTodayAppointments = async () => {
    if (!userId) return;

    setLoadingToday(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase.rpc("get_today_appointments", {
        p_doctor_id: userId,
        p_date: today,
      });

      if (error) throw error;
      setTodayAppointments(data || []);
    } catch (err) {
      console.error("Error loading today appointments:", err);
    } finally {
      setLoadingToday(false);
    }
  };

  const toggleSection = async (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      if (section === "today" && todayAppointments.length === 0) {
        await loadTodayAppointments();
      }
    }
  };

  const handleStartConsultation = async (appointment: TodayAppointment) => {
    if (!userId) return;

    setActionLoading(appointment.id);
    try {
      // Si ya está en consulta, solo abrir el editor
      if (appointment.status === "en_consulta") {
        const params = new URLSearchParams({
          appointment_id: appointment.id,
          paciente_id: appointment.paciente_id || appointment.offline_patient_id || "",
          from: "today",
        });
        router.push(`/dashboard/medico/pacientes/consulta?${params.toString()}`);
        return;
      }

      // Si no está en consulta, cambiar estado primero
      const { data, error } = await supabase.rpc("change_appointment_status", {
        p_appointment_id: appointment.id,
        p_new_status: "en_consulta",
        p_user_id: userId,
        p_reason: null,
      });

      if (error) {
        console.error("Error RPC:", error);
        throw new Error(error.message || "Error al cambiar estado");
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "No se pudo cambiar el estado");
      }

      // Abrir editor de consulta
      const params = new URLSearchParams({
        appointment_id: appointment.id,
        paciente_id: appointment.paciente_id || appointment.offline_patient_id || "",
        from: "today",
      });

      router.push(`/dashboard/medico/pacientes/consulta?${params.toString()}`);
    } catch (err) {
      console.error("Error completo:", err);
      alert(err instanceof Error ? err.message : "Error al iniciar la consulta");
      setActionLoading(null);
    }
  };

  const completedToday = todayAppointments.filter(a => a.status === "completada").length;
  const waiting = todayAppointments.filter(a => a.status === "en_espera").length;

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Pacientes</h1>
            <p className="text-gray-600 mt-1">
              {state.loading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                `${state.patients.length + state.offlinePatients.length} paciente${(state.patients.length + state.offlinePatients.length) !== 1 ? "s" : ""} total${(state.patients.length + state.offlinePatients.length) !== 1 ? "es" : ""}`
              )}
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/medico/pacientes/nuevo")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Registrar Paciente
          </Button>
        </div>

        {/* Stats Cards */}
        <StatsCards
          loading={state.loading}
          todayCount={todayAppointments.length}
          completedToday={completedToday}
          waiting={waiting}
          totalPatients={state.patients.length + state.offlinePatients.length}
          registeredCount={state.patients.length}
          offlineCount={state.offlinePatients.length}
          newPatientsThisMonth={state.newPatientsThisMonth}
          avgConsultationTime={avgConsultationTime}
          expandedSection={expandedSection}
          onToggleSection={toggleSection}
          onShowMetrics={handleShowMetrics}
        />

        {/* Sección Expandible: Pacientes de Hoy */}
        {expandedSection === "today" && (
          <TodayAppointments
            appointments={todayAppointments}
            loading={loadingToday}
            actionLoading={actionLoading}
            onStartConsultation={handleStartConsultation}
          />
        )}

        {/* Sección Expandible: Todos los Pacientes */}
        {expandedSection === "all" && (
          <>
            <Card>
              <CardContent className="p-4">
                <FiltersBar
                  searchQuery={state.searchQuery}
                  onSearchChange={actions.setSearchQuery}
                  filterGender={state.filterGender}
                  onFilterGenderChange={actions.setFilterGender}
                  filterAgeRange={state.filterAgeRange}
                  onFilterAgeRangeChange={actions.setFilterAgeRange}
                  filterLastVisit={state.filterLastVisit}
                  onFilterLastVisitChange={actions.setFilterLastVisit}
                  sortBy={state.sortBy}
                  onSortByChange={actions.setSortBy}
                  viewMode={state.viewMode}
                  onViewModeChange={actions.setViewMode}
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {state.filteredPatients.length > 0 || state.loading ? (
                <>
                  {state.viewMode === "table" ? (
                    <PatientsTable
                      loading={state.loading}
                      patients={state.filteredPatients}
                      onView={handleView}
                      onMessage={handleMessage}
                    />
                  ) : (
                    <PatientsGrid
                      loading={state.loading}
                      patients={state.filteredPatients}
                      onView={handleView}
                      onMessage={handleMessage}
                    />
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {state.searchQuery ? "No se encontraron pacientes" : "Aún no tienes pacientes"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {state.searchQuery
                          ? "Intenta con otro término de búsqueda"
                          : "Los pacientes aparecerán aquí cuando los registres"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Modal de Métricas Detalladas */}
        <MetricsModal
          isOpen={showMetricsModal}
          onClose={() => setShowMetricsModal(false)}
          data={metricsData}
        />
      </div>
    </VerificationGuard>
  );
}
