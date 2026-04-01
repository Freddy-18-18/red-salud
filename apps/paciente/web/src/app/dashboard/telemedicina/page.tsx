"use client";

import {
  Video,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Monitor,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useTelemedicineSessions } from "@/hooks/use-telemedicine";
import { supabase } from "@/lib/supabase/client";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 0) return "Pasada";
  if (diffHours < 1) return `En ${Math.round(diffHours * 60)} minutos`;
  if (diffHours < 24) return `En ${Math.round(diffHours)} horas`;
  if (diffDays < 2) return "Manana";
  if (diffDays < 7) {
    return date.toLocaleDateString("es-VE", { weekday: "long" });
  }
  return date.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TelemedicinePage() {
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { upcoming, history, loading: sessionsLoading } =
    useTelemedicineSessions(userId);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setLoading(false);
    };
    loadUser();
  }, []);

  const nextSession = upcoming[0];
  const [isSessionSoon, setIsSessionSoon] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect -- sync with external clock via interval */
  useEffect(() => {
    if (!nextSession) {
      setIsSessionSoon(false);
      return;
    }
    const check = () =>
      new Date(nextSession.scheduled_at).getTime() - Date.now() < 30 * 60 * 1000;
    setIsSessionSoon(check());
    const interval = setInterval(() => setIsSessionSoon(check()), 60_000);
    return () => clearInterval(interval);
  }, [nextSession]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (loading || sessionsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Telemedicina
        </h1>
        <p className="text-gray-500 mt-1">
          Consultas virtuales con tus doctores
        </p>
      </div>

      {/* Next Virtual Consultation */}
      {nextSession ? (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5" />
              <span className="text-sm font-medium text-emerald-100">
                Proxima consulta virtual
              </span>
            </div>
            {isSessionSoon && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                Pronto
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold mb-1">
            Dr. {nextSession.doctor?.full_name || "Medico"}
          </h2>
          <p className="text-emerald-100 text-sm mb-4">
            {formatRelativeDate(nextSession.scheduled_at)} -{" "}
            {formatTime(nextSession.scheduled_at)}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`/dashboard/telemedicina/sala-espera?session=${nextSession.id}`}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                isSessionSoon
                  ? "bg-white text-emerald-700 hover:bg-emerald-50"
                  : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              }`}
            >
              <Video className="h-4 w-4" />
              {isSessionSoon
                ? "Unirme a la sala de espera"
                : "Preparar consulta"}
            </a>
            <a
              href={`/dashboard/telemedicina/sala-espera?session=${nextSession.id}&check=true`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-sm text-white transition backdrop-blur-sm"
            >
              <Settings className="h-4 w-4" />
              Probar camara y microfono
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Video className="h-7 w-7 text-emerald-500" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">
            No tienes consultas virtuales programadas
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Agenda una cita de telemedicina con tu doctor
          </p>
          <a
            href="/dashboard/buscar-medico"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
          >
            Buscar medico
          </a>
        </div>
      )}

      {/* Other Upcoming Sessions */}
      {upcoming.length > 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Otras consultas programadas
          </h2>
          <div className="space-y-3">
            {upcoming.slice(1).map((session) => (
              <a
                key={session.id}
                href={`/dashboard/telemedicina/sala-espera?session=${session.id}`}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-emerald-600">
                    {session.doctor?.full_name?.charAt(0) || "D"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    Dr. {session.doctor?.full_name || "Medico"}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(session.scheduled_at).toLocaleDateString(
                        "es-VE",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(session.scheduled_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <Video className="h-4 w-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Session History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Historial de consultas virtuales
          </h2>
        </div>

        {history.length > 0 ? (
          <div className="space-y-2">
            {history.slice(0, 5).map((session) => (
              <a
                key={session.id}
                href={`/dashboard/telemedicina/resumen/${session.id}`}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-500">
                    {session.doctor?.full_name?.charAt(0) || "D"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    Dr. {session.doctor?.full_name || "Medico"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <span>{formatDate(session.scheduled_at)}</span>
                    {session.duration_minutes && (
                      <>
                        <span>-</span>
                        <span>{session.duration_minutes} min</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {session.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : session.status === "cancelled" ? (
                    <XCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </a>
            ))}

            {history.length > 5 && (
              <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:text-emerald-700 mt-2 mx-auto">
                Ver todas
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <EmptyState
            icon={Monitor}
            title="Sin consultas anteriores"
            description="Tu historial de consultas virtuales aparecera aqui"
          />
        )}
      </div>
    </div>
  );
}
