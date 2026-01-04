"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, DollarSign, Star, Clock } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

export default function DoctorEstadisticasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    total_patients: 0,
    total_consultations: 0,
    consultations_this_month: 0,
    consultations_today: 0,
    average_rating: 0,
    revenue_this_month: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      await loadStats(user.id);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("doctor_stats_cache")
      .select("*")
      .eq("doctor_id", doctorId)
      .single();

    if (!error && data) {
      setStats(data);
    }
  };

  const statsCards = [
    {
      title: "Pacientes Totales",
      value: stats.total_patients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Consultas Este Mes",
      value: stats.consultations_this_month,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Consultas Hoy",
      value: stats.consultations_today,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Calificación Promedio",
      value: stats.average_rating?.toFixed(1) || "0.0",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Ingresos Este Mes",
      value: `$${stats.revenue_this_month?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Consultas",
      value: stats.total_consultations,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Consultas Completadas</span>
              <span className="font-semibold">{stats.completed_appointments || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Consultas Pendientes</span>
              <span className="font-semibold">{stats.pending_appointments || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Consultas Canceladas</span>
              <span className="font-semibold">{stats.cancelled_appointments || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </VerificationGuard>
  );
}
