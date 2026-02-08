"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowUpDown,
  Laptop,
  WifiOff,
  Stethoscope,
  ChevronDown,
  Building2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Toast, type ToastType } from "@red-salud/ui";
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
import { Pagination } from "@/components/dashboard/medico/patients/pagination";

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
    };
    init();
  }, [router]);

  // Re-run loadAverageTime when selectedOfficeId changes
  useEffect(() => {
    if (userId) {
      loadAverageTime(userId, state.selectedOfficeId);
    }
  }, [userId, state.selectedOfficeId]);

  const loadAverageTime = async (doctorId: string, officeId?: string | null) => {
    try {
      let query = supabase
        .from("appointments")
        .select("duracion_minutos, motivo, completed_at")
        .eq("medico_id", doctorId)
        .eq("status", "completada")
        .not("completed_at", "is", null)
        .gte("completed_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (officeId) {
        query = query.eq("location_id", officeId);
      }

      const { data, error } = await query;

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
          const mData = byMotivo[motivo];
          if (mData && mData.count > 0) {
            mData.avg_minutes = Math.round(mData.total / mData.count);
          }
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

  // Filter today appointments by office if needed
  const displayedTodayAppointments = state.officeAppointmentIds
    ? todayAppointments.filter(apt => state.officeAppointmentIds!.has(apt.id))
    : todayAppointments;

  const completedToday = displayedTodayAppointments.filter(a => a.status === "completada").length;
  const waiting = displayedTodayAppointments.filter(a => a.status === "en_espera").length;

  // Calculate office-filtered stats for StatsCards
  const getFilteredStats = () => {
    if (!state.officePatientIds) {
      // No office filter, show all
      return {
        totalPatients: state.patients.length + state.offlinePatients.length,
        registeredCount: state.patients.length,
        offlineCount: state.offlinePatients.length,
        newPatientsThisMonth: state.newPatientsThisMonth,
      };
    }

    const filteredRegistered = state.patients.filter(p => state.officePatientIds!.has(p.patient.id));
    const filteredOffline = state.offlinePatients.filter(p => state.officePatientIds!.has(p.id));

    // Calculate new this month for filtered
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newOfFiltered = [...filteredRegistered, ...filteredOffline].filter(p => {
      const createdAtStr = "patient" in p ? (p as RegisteredPatient).created_at : (p as OfflinePatient).created_at;
      if (!createdAtStr) return false;
      return new Date(createdAtStr) >= startOfMonth;
    }).length;

    return {
      totalPatients: filteredRegistered.length + filteredOffline.length,
      registeredCount: filteredRegistered.length,
      offlineCount: filteredOffline.length,
      newPatientsThisMonth: newOfFiltered,
    };
  };

  const officeStats = getFilteredStats();



  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const handleRegisterPatient = () => {
    if (!state.selectedOfficeId) {
      showToast("Debes seleccionar un consultorio específico arriba para registrar un paciente", "warning");
      return;
    }
    router.push("/dashboard/medico/pacientes/nuevo");
  };

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header Premium */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl" />
            <div className="absolute -top-4 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                      Mis Pacientes
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-0.5">
                      {state.loading ? (
                        <Skeleton className="h-5 w-40" />
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          <span className="text-sm">
                            {officeStats.totalPatients} paciente{officeStats.totalPatients !== 1 ? "s" : ""} {state.selectedOfficeId ? "en este consultorio" : "en tu práctica"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRegisterPatient}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <UserPlus className="h-4 w-4 mr-2" />
                Registrar Paciente
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards
            loading={state.loading}
            todayCount={displayedTodayAppointments.length}
            completedToday={completedToday}
            waiting={waiting}
            totalPatients={officeStats.totalPatients}
            registeredCount={officeStats.registeredCount}
            offlineCount={officeStats.offlineCount}
            newPatientsThisMonth={officeStats.newPatientsThisMonth}
            avgConsultationTime={avgConsultationTime}
            expandedSection={expandedSection}
            onToggleSection={toggleSection}
            onShowMetrics={handleShowMetrics}
          />

          {/* Sección Expandible: Pacientes de Hoy */}
          {expandedSection === "today" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <TodayAppointments
                appointments={displayedTodayAppointments}
                loading={loadingToday}
                actionLoading={actionLoading}
                onStartConsultation={handleStartConsultation}
              />
            </div>
          )}

          {/* Sección Expandible: Todos los Pacientes */}
          {expandedSection === "all" && (
            <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
              <Card className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                        patients={state.paginatedPatients}
                        onView={handleView}
                        onMessage={handleMessage}
                      />
                    ) : (
                      <PatientsGrid
                        loading={state.loading}
                        patients={state.paginatedPatients}
                        onView={handleView}
                        onMessage={handleMessage}
                      />
                    )}

                    {!state.loading && (
                      <Pagination
                        currentPage={state.currentPage}
                        totalPages={state.totalPages}
                        totalResults={state.totalResults}
                        pageSize={state.pageSize}
                        onPageChange={actions.setCurrentPage}
                        className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800"
                      />
                    )}
                  </>
                ) : (
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="py-16">
                      <div className="text-center">
                        <div className="relative mx-auto w-20 h-20 mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
                          <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                            {state.searchQuery ? (
                              <Search className="h-10 w-10 text-gray-400" />
                            ) : (
                              <Users className="h-10 w-10 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {state.searchQuery ? "No se encontraron pacientes" : "Aún no tienes pacientes"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          {state.searchQuery
                            ? "Intenta con otro término de búsqueda o ajusta los filtros"
                            : "Los pacientes aparecerán aquí cuando los registres o te asignen citas"}
                        </p>
                        {!state.searchQuery && (
                          <Button
                            onClick={() => router.push("/dashboard/medico/pacientes/nuevo")}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Registrar primer paciente
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Mensaje inicial cuando no hay sección expandida */}
          {!expandedSection && !state.loading && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-sm">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl blur-lg animate-pulse" />
                    <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Selecciona una sección para explorar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Haz clic en cualquiera de las tarjetas de estadísticas para ver más detalles sobre tus pacientes y citas de hoy.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modal de Métricas Detalladas */}
          <MetricsModal
            isOpen={showMetricsModal}
            onClose={() => setShowMetricsModal(false)}
            data={metricsData}
          />
        </div>
      </div>
    </VerificationGuard>
  );
}
