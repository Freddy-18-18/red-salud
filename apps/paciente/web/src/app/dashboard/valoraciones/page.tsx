"use client";

import {
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RatingForm } from "@/components/ratings/rating-form";
import { RatingDisplay } from "@/components/ratings/rating-display";
import { FollowUpChecklist } from "@/components/ratings/follow-up-checklist";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import {
  usePendingFollowUps,
  useAllFollowUps,
  useCompleteFollowUp,
} from "@/hooks/use-ratings";
import type { Rating } from "@/lib/services/rating-service";
import { supabase } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────────────

interface CompletedAppointment {
  id: string;
  doctor_id: string;
  start_time: string;
  end_time: string;
  status: string;
  type: string;
  motivo: string | null;
  doctor: {
    id: string;
    consultation_fee: number | null;
    city: string | null;
    profile: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
    specialty: {
      id: string;
      name: string;
      icon: string | null;
    };
  };
}

interface RatedAppointment extends CompletedAppointment {
  rating: Rating;
}

type TabValue = "pendientes" | "historial";

// ── Sub-components ───────────────────────────────────────────────────

function AppointmentRatingCard({
  appointment,
  onRated,
}: {
  appointment: CompletedAppointment;
  onRated: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const doctorName = `${appointment.doctor.profile.first_name} ${appointment.doctor.profile.last_name}`;
  const initials = `${appointment.doctor.profile.first_name[0]}${appointment.doctor.profile.last_name[0]}`.toUpperCase();

  const formattedDate = (() => {
    try {
      return new Date(appointment.start_time).toLocaleDateString("es-VE", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  })();

  const formattedTime = (() => {
    try {
      return new Date(appointment.start_time).toLocaleTimeString("es-VE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  })();

  if (showForm) {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            {appointment.doctor.profile.avatar_url ? (
              <img
                src={appointment.doctor.profile.avatar_url}
                alt={doctorName}
                className="h-full w-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-sm font-semibold text-emerald-600">
                {initials}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Dr. {doctorName}
            </p>
            <p className="text-xs text-gray-500">
              {appointment.doctor.specialty.name}
            </p>
          </div>
        </div>

        <RatingForm
          appointmentId={appointment.id}
          doctorId={appointment.doctor_id}
          doctorName={doctorName}
          onSuccess={() => {
            setShowForm(false);
            onRated();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          {appointment.doctor.profile.avatar_url ? (
            <img
              src={appointment.doctor.profile.avatar_url}
              alt={doctorName}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-sm font-semibold text-emerald-600">
              {initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Dr. {doctorName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {appointment.doctor.specialty.name}
              </p>
            </div>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 whitespace-nowrap">
              Sin valorar
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
          >
            <Star className="h-3.5 w-3.5" />
            Valorar consulta
          </button>
        </div>
      </div>
    </div>
  );
}

function RatedAppointmentCard({ item }: { item: RatedAppointment }) {
  const doctorName = `${item.doctor.profile.first_name} ${item.doctor.profile.last_name}`;
  const initials = `${item.doctor.profile.first_name[0]}${item.doctor.profile.last_name[0]}`.toUpperCase();

  const formattedDate = (() => {
    try {
      return new Date(item.start_time).toLocaleDateString("es-VE", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  })();

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          {item.doctor.profile.avatar_url ? (
            <img
              src={item.doctor.profile.avatar_url}
              alt={doctorName}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-sm font-semibold text-emerald-600">
              {initials}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            Dr. {doctorName}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span>{item.doctor.specialty.name}</span>
            <span className="text-gray-300">|</span>
            <span className="capitalize">{formattedDate}</span>
          </div>
        </div>
      </div>

      <RatingDisplay rating={item.rating} />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function ValoracionesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("pendientes");

  // Data: unrated appointments
  const [unratedAppointments, setUnratedAppointments] = useState<
    CompletedAppointment[]
  >([]);
  const [ratedAppointments, setRatedAppointments] = useState<
    RatedAppointment[]
  >([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Follow-ups
  const {
    followUps: pendingFollowUps,
    loading: loadingFollowUps,
    refetch: refetchFollowUps,
  } = usePendingFollowUps();

  const {
    followUps: allFollowUps,
    loading: loadingAllFollowUps,
  } = useAllFollowUps();

  const { complete } = useCompleteFollowUp();

  // Load completed appointments and their ratings
  const loadAppointmentsData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch completed appointments
      const res = await fetch("/api/appointments?status=completed&page_size=50");
      if (!res.ok) return;
      const json = await res.json();
      const appointments = (json.data ?? []) as CompletedAppointment[];

      // Also try with "completada" status
      const res2 = await fetch("/api/appointments?status=completada&page_size=50");
      if (res2.ok) {
        const json2 = await res2.json();
        const more = (json2.data ?? []) as CompletedAppointment[];
        // Merge without duplicates
        const ids = new Set(appointments.map((a) => a.id));
        for (const a of more) {
          if (!ids.has(a.id)) {
            appointments.push(a);
            ids.add(a.id);
          }
        }
      }

      // Fetch ratings for each appointment
      const unrated: CompletedAppointment[] = [];
      const rated: RatedAppointment[] = [];

      await Promise.all(
        appointments.map(async (apt) => {
          try {
            const ratingRes = await fetch(`/api/ratings/${apt.id}`);
            if (!ratingRes.ok) {
              unrated.push(apt);
              return;
            }
            const ratingJson = await ratingRes.json();
            if (ratingJson.data) {
              rated.push({ ...apt, rating: ratingJson.data });
            } else {
              unrated.push(apt);
            }
          } catch {
            unrated.push(apt);
          }
        }),
      );

      // Sort: newest first
      unrated.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
      );
      rated.sort(
        (a, b) =>
          new Date(b.rating.created_at).getTime() -
          new Date(a.rating.created_at).getTime(),
      );

      setUnratedAppointments(unrated);
      setRatedAppointments(rated);
    } catch (err) {
      console.error("Error loading appointments data:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadAppointmentsData();
  }, []);

  const handleCompleteFollowUp = async (id: string, notes?: string) => {
    const result = await complete(id, notes);
    if (result.success) {
      refetchFollowUps();
    }
    return result;
  };

  const handleScheduleNext = (doctorId: string) => {
    router.push(`/dashboard/agendar?doctor_id=${doctorId}`);
  };

  const handleRated = () => {
    loadAppointmentsData();
  };

  // Tab counts
  const pendingCount = unratedAppointments.length + pendingFollowUps.length;

  const tabs: { label: string; value: TabValue; count: number }[] = [
    {
      label: "Pendientes",
      value: "pendientes",
      count: pendingCount,
    },
    {
      label: "Historial",
      value: "historial",
      count: ratedAppointments.length,
    },
  ];

  const isLoading = loadingAppointments || loadingFollowUps;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Valoraciones
        </h1>
        <p className="text-gray-500 mt-1">
          Valora tus consultas y revisa tus seguimientos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <SkeletonList count={3} />
      ) : activeTab === "pendientes" ? (
        <PendientesTab
          unratedAppointments={unratedAppointments}
          pendingFollowUps={pendingFollowUps}
          onRated={handleRated}
          onCompleteFollowUp={handleCompleteFollowUp}
          onScheduleNext={handleScheduleNext}
        />
      ) : (
        <HistorialTab
          ratedAppointments={ratedAppointments}
          allFollowUps={allFollowUps}
          loadingAllFollowUps={loadingAllFollowUps}
        />
      )}
    </div>
  );
}

// ── Tab: Pendientes ──────────────────────────────────────────────────

function PendientesTab({
  unratedAppointments,
  pendingFollowUps,
  onRated,
  onCompleteFollowUp,
  onScheduleNext,
}: {
  unratedAppointments: CompletedAppointment[];
  pendingFollowUps: import("@/lib/services/rating-service").FollowUpItem[];
  onRated: () => void;
  onCompleteFollowUp: (
    id: string,
    notes?: string,
  ) => Promise<{ success: boolean }>;
  onScheduleNext: (doctorId: string) => void;
}) {
  const hasPending =
    unratedAppointments.length > 0 || pendingFollowUps.length > 0;

  if (!hasPending) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No tienes pendientes"
        description="Todas tus consultas estan valoradas y tus seguimientos al dia"
        action={{ label: "Agendar Cita", href: "/dashboard/agendar" }}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Unrated appointments */}
      {unratedAppointments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">
              Consultas por valorar
            </h2>
            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium">
              {unratedAppointments.length}
            </span>
          </div>

          <div className="space-y-3">
            {unratedAppointments.map((appointment) => (
              <AppointmentRatingCard
                key={appointment.id}
                appointment={appointment}
                onRated={onRated}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pending follow-ups */}
      {pendingFollowUps.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Seguimientos pendientes
            </h2>
            <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">
              {pendingFollowUps.length}
            </span>
          </div>

          <FollowUpChecklist
            items={pendingFollowUps}
            onComplete={onCompleteFollowUp}
            onScheduleNext={onScheduleNext}
          />
        </section>
      )}
    </div>
  );
}

// ── Tab: Historial ───────────────────────────────────────────────────

function HistorialTab({
  ratedAppointments,
  allFollowUps,
  loadingAllFollowUps,
}: {
  ratedAppointments: RatedAppointment[];
  allFollowUps: import("@/lib/services/rating-service").FollowUpItem[];
  loadingAllFollowUps: boolean;
}) {
  const completedFollowUps = allFollowUps.filter((f) => f.completed);

  if (ratedAppointments.length === 0 && completedFollowUps.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Sin historial de valoraciones"
        description="Cuando valores tus consultas, aparecerán aqui"
      />
    );
  }

  // Summary stats
  const avgRating =
    ratedAppointments.length > 0
      ? ratedAppointments.reduce((sum, r) => sum + r.rating.rating, 0) /
        ratedAppointments.length
      : 0;

  const recommendCount = ratedAppointments.filter(
    (r) => r.rating.would_recommend,
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {ratedAppointments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-white border border-gray-100 rounded-xl text-center">
            <p className="text-2xl font-bold text-gray-900">
              {ratedAppointments.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Valoraciones</p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-600">
              {avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Promedio</p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {ratedAppointments.length > 0
                ? Math.round(
                    (recommendCount / ratedAppointments.length) * 100,
                  )
                : 0}
              %
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Recomienda</p>
          </div>
        </div>
      )}

      {/* Rated appointments */}
      {ratedAppointments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Valoraciones pasadas
          </h2>
          {ratedAppointments.map((item) => (
            <RatedAppointmentCard key={item.id} item={item} />
          ))}
        </section>
      )}

      {/* Completed follow-ups */}
      {completedFollowUps.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Seguimientos completados ({completedFollowUps.length})
          </h2>
          <div className="space-y-2">
            {completedFollowUps.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl opacity-75"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 line-through truncate">
                    {item.description}
                  </p>
                  {item.completed_at && (
                    <p className="text-xs text-gray-400">
                      Completado{" "}
                      {new Date(item.completed_at).toLocaleDateString("es-VE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
