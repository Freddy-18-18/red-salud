"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  MessageSquare,
  FileText,
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  Stethoscope,
  ClipboardList,
} from "lucide-react";

import { ExchangeRateDashboardCard } from "@/components/currency/exchange-rate-dashboard-card";
import { InsightsCards } from "@/components/dashboard/insights-cards";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { usePatientAppointments } from "@/hooks/use-appointments";
import { getUnreadMessagesCount } from "@/lib/services/messaging-service";
import { supabase } from "@/lib/supabase/client";

// Lightweight local shape for the appointment cards on this dashboard.
// Full typing lives in the appointments service; we only touch a handful of
// fields here so we keep this permissive until the booking-flow follow-up.
type DashboardAppointment = {
  id: string;
  status: string;
  appointment_date: string;
  appointment_time: string;
  doctor?: {
    full_name?: string;
    specialty?: string;
    avatar_url?: string | null;
  } | null;
  [key: string]: unknown;
};

const HEALTH_TIPS = [
  "Recuerda beber al menos 8 vasos de agua al dia para mantenerte hidratado.",
  "Realizar 30 minutos de actividad fisica diaria puede mejorar tu salud cardiovascular.",
  "Dormir entre 7 y 9 horas cada noche es fundamental para tu bienestar.",
  "Incluye al menos 5 porciones de frutas y verduras en tu alimentacion diaria.",
  "Las consultas preventivas anuales pueden detectar problemas de salud a tiempo.",
  "Reducir el consumo de sal ayuda a mantener una presion arterial saludable.",
  "La meditacion y ejercicios de respiracion pueden reducir el estres diario.",
];

const QUICK_ACTIONS = [
  {
    label: "Buscar Medico",
    description: "Encuentra al especialista ideal",
    icon: Search,
    href: "/dashboard/buscar-medico",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Mis Citas",
    description: "Consulta tus proximas citas",
    icon: Calendar,
    href: "/dashboard/citas",
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Mensajes",
    description: "Escribe a tu doctor",
    icon: MessageSquare,
    href: "/dashboard/mensajes",
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Recetas",
    description: "Consulta tus recetas activas",
    icon: FileText,
    href: "/dashboard/recetas",
    color: "bg-amber-50 text-amber-600",
  },
];

export default function PatientDashboard() {
  const [userId, setUserId] = useState<string>();
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activePrescriptionsCount, setActivePrescriptionsCount] = useState<number | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number | null>(null);
  const { appointments, loading: appointmentsLoading } = usePatientAppointments(userId);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Load profile name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        setUserName(
          profile?.full_name ||
          user.user_metadata?.full_name ||
          ""
        );

        // Load active prescriptions count via BFF API
        fetch('/api/prescriptions?status=active')
          .then((res) => res.ok ? res.json() : null)
          .then((json) => {
            const list = json?.data as unknown[] | undefined;
            setActivePrescriptionsCount(list ? list.length : 0);
          })
          .catch(() => {
            setActivePrescriptionsCount(0);
          });

        // Load unread messages count
        getUnreadMessagesCount(user.id).then(({ data }) => {
          setUnreadMessagesCount(data);
        });
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const todayTip = HEALTH_TIPS[new Date().getDate() % HEALTH_TIPS.length];

  const now = new Date();
  const list = (appointments ?? []) as unknown as DashboardAppointment[];
  const upcomingAppointments = list
    .filter((a: DashboardAppointment) => a.status !== "cancelled" && new Date(`${a.appointment_date}T${a.appointment_time}`) >= now)
    .slice(0, 3);

  const completedCount = list.filter((a: DashboardAppointment) => a.status === "completed").length;
  const firstName = userName.split(" ")[0] || "Paciente";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Hola, {firstName}
        </h1>
        <p className="text-gray-500 mt-1">Bienvenido a tu portal de salud</p>
      </div>

      {/* Health tip */}
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
        <Sparkles className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-emerald-800">Consejo de salud del dia</p>
          <p className="text-sm text-emerald-700 mt-0.5">{todayTip}</p>
        </div>
      </div>

      {/* Exchange Rate Card */}
      <SectionErrorBoundary>
        <ExchangeRateDashboardCard />
      </SectionErrorBoundary>

      {/* Health Insights */}
      {userId && (
        <SectionErrorBoundary>
          <InsightsCards />
        </SectionErrorBoundary>
      )}

      {/* Stats */}
      <SectionErrorBoundary>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Calendar}
            label="Proximas citas"
            value={upcomingAppointments.length}
            color="bg-blue-50 text-blue-600"
            href="/dashboard/citas"
          />
          <StatCard
            icon={Stethoscope}
            label="Consultas realizadas"
            value={completedCount}
            color="bg-emerald-50 text-emerald-600"
            href="/dashboard/historial"
          />
          <StatCard
            icon={FileText}
            label="Recetas activas"
            value={activePrescriptionsCount ?? "-"}
            color="bg-amber-50 text-amber-600"
            href="/dashboard/recetas"
          />
          <StatCard
            icon={MessageSquare}
            label="Mensajes"
            value={unreadMessagesCount ?? "-"}
            color="bg-purple-50 text-purple-600"
            href="/dashboard/mensajes"
          />
        </div>
      </SectionErrorBoundary>

      {/* Quick Actions */}
      <SectionErrorBoundary>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Acciones rapidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{action.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
              </a>
            ))}
          </div>
        </div>
      </SectionErrorBoundary>

      {/* Upcoming Appointments */}
      <SectionErrorBoundary>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Proximas citas</h2>
            <a
              href="/dashboard/citas"
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {appointmentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((apt: DashboardAppointment) => (
                <a
                  key={apt.id}
                  href="/dashboard/citas"
                  className="block p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-emerald-600">
                        {apt.doctor?.full_name?.charAt(0) || "D"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        Dr. {apt.doctor?.full_name || "Medico"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(apt.appointment_date + "T00:00:00").toLocaleDateString("es-VE", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {apt.appointment_time?.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      apt.status === "confirmed" ? "bg-emerald-50 text-emerald-700" :
                      apt.status === "pending" ? "bg-amber-50 text-amber-700" :
                      "bg-gray-50 text-gray-700"
                    }`}>
                      {apt.status === "confirmed" ? "Confirmada" :
                       apt.status === "pending" ? "Pendiente" :
                       apt.status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No tienes citas proximas"
              description="Busca un medico y agenda tu primera cita"
              action={{ label: "Buscar Medico", href: "/dashboard/buscar-medico" }}
            />
          )}
        </div>
      </SectionErrorBoundary>
    </div>
  );
}
