"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SecretariaDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    completedToday: 0,
  });
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/secretaria");
        return;
      }

      // Obtener el doctor_id de la secretaria
      const savedDoctorId = localStorage.getItem("secretary_current_doctor_id");
      
      if (!savedDoctorId) {
        const { data: relation } = await supabase
          .from("doctor_secretaries")
          .select("doctor_id")
          .eq("secretary_id", user.id)
          .eq("status", "active")
          .single();

        if (relation) {
          setDoctorId(relation.doctor_id);
          localStorage.setItem("secretary_current_doctor_id", relation.doctor_id);
        }
      } else {
        setDoctorId(savedDoctorId);
      }

      if (!savedDoctorId && !doctorId) return;

      const currentDoctorId = savedDoctorId || doctorId;

      // Obtener estadísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Citas de hoy
      const { count: todayCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("medico_id", currentDoctorId)
        .gte("fecha_hora", today.toISOString())
        .lt("fecha_hora", tomorrow.toISOString());

      // Citas pendientes
      const { count: pendingCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("medico_id", currentDoctorId)
        .eq("status", "pendiente");

      // Citas completadas hoy
      const { count: completedCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("medico_id", currentDoctorId)
        .eq("status", "completada")
        .gte("fecha_hora", today.toISOString())
        .lt("fecha_hora", tomorrow.toISOString());

      // Total de pacientes
      const { count: patientsCount } = await supabase
        .from("doctor_patients")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", currentDoctorId)
        .eq("status", "active");

      setStats({
        todayAppointments: todayCount || 0,
        pendingAppointments: pendingCount || 0,
        totalPatients: patientsCount || 0,
        completedToday: completedCount || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard de Secretaria
        </h1>
        <p className="text-gray-600 mt-1">
          Gestiona la agenda y pacientes del médico
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Citas programadas para hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Citas por confirmar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Citas completadas hoy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push("/dashboard/secretaria/agenda")}
            className="w-full"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Ver Agenda
          </Button>
          <Button
            onClick={() => router.push("/dashboard/secretaria/agenda/nueva")}
            variant="outline"
            className="w-full"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
          <Button
            onClick={() => router.push("/dashboard/secretaria/pacientes")}
            variant="outline"
            className="w-full"
          >
            <Users className="mr-2 h-4 w-4" />
            Ver Pacientes
          </Button>
        </CardContent>
      </Card>

      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle>Bienvenida</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Como secretaria médica, tienes acceso a gestionar la agenda, pacientes
            y comunicaciones del médico. Usa el menú lateral para navegar entre
            las diferentes secciones.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Si trabajas con múltiples médicos, puedes
              cambiar entre ellos usando el selector en la parte superior del menú.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
