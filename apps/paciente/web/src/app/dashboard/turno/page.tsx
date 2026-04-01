"use client";

import { useState, useEffect } from "react";
import {
  Ticket,
  UserPlus,
  XCircle,
  Loader2,
  RefreshCw,
  Calendar,
} from "lucide-react";

import { QueueTicket } from "@/components/queue/queue-ticket";
import { QueueProgress } from "@/components/queue/queue-progress";
import { QueueHistory } from "@/components/queue/queue-history";
import { JoinQueueDialog } from "@/components/queue/join-queue-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";

import {
  useActiveQueue,
  useQueueHistory,
  useJoinQueue,
  useCancelQueue,
} from "@/hooks/use-queue";

import { supabase } from "@/lib/supabase/client";

interface TodayAppointment {
  id: string;
  doctor_name?: string;
  doctor_id?: string;
  specialty?: string;
  scheduled_at: string;
}

export default function TurnoPage() {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const {
    activeEntry,
    loading: activeLoading,
    refresh: refreshActive,
  } = useActiveQueue();

  const {
    history,
    loading: historyLoading,
  } = useQueueHistory();

  const { join, loading: joining } = useJoinQueue();
  const { cancel, loading: cancelling } = useCancelQueue();

  // Load today's appointments for the join dialog
  useEffect(() => {
    const loadTodayAppointments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingAppointments(false);
        return;
      }

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const { data } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_at,
          specialty,
          doctor_id,
          doctor:profiles!appointments_doctor_id_fkey(full_name)
        `)
        .eq("patient_id", user.id)
        .eq("status", "confirmed")
        .gte("scheduled_at", startOfDay)
        .lt("scheduled_at", endOfDay)
        .order("scheduled_at", { ascending: true });

      if (data) {
        setTodayAppointments(
          data.map((apt: Record<string, unknown>) => ({
            id: apt.id as string,
            doctor_id: (apt.doctor_id as string) ?? undefined,
            doctor_name: ((apt.doctor as Record<string, unknown> | null)?.full_name as string) ?? undefined,
            specialty: (apt.specialty as string) ?? undefined,
            scheduled_at: apt.scheduled_at as string,
          }))
        );
      }

      setLoadingAppointments(false);
    };

    loadTodayAppointments();
  }, []);

  const handleJoin = async (data: { appointment_id: string; doctor_id?: string; notes?: string }) => {
    const result = await join(data);
    if (result.success) {
      setShowJoinDialog(false);
      refreshActive();
    }
    return result;
  };

  const handleCancel = async () => {
    if (!activeEntry) return;
    const result = await cancel(activeEntry.id);
    if (result.success) {
      refreshActive();
    }
  };

  const isLoading = activeLoading || loadingAppointments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mi Turno
          </h1>
          <p className="text-gray-500 mt-1">
            Cola virtual y seguimiento de tu turno
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshActive()}
            disabled={activeLoading}
            className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-500 ${activeLoading ? "animate-spin" : ""}`}
            />
          </button>
          {!activeEntry && (
            <button
              onClick={() => setShowJoinDialog(true)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Unirse a la cola</span>
            </button>
          )}
        </div>
      </div>

      {/* Join dialog */}
      {showJoinDialog && (
        <JoinQueueDialog
          appointments={todayAppointments}
          onJoin={handleJoin}
          onClose={() => setShowJoinDialog(false)}
          loading={joining}
        />
      )}

      {/* Active queue */}
      {isLoading ? (
        <SkeletonList count={2} />
      ) : activeEntry ? (
        <div className="space-y-4">
          {/* Ticket */}
          <QueueTicket entry={activeEntry} />

          {/* Progress */}
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <QueueProgress status={activeEntry.status} />
          </div>

          {/* Auto-refresh indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Actualizando automaticamente cada 10 segundos</span>
          </div>

          {/* Cancel button */}
          {(activeEntry.status === "waiting") && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Cancelar mi turno
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title="No estas en ninguna cola"
          description="Unite a la cola virtual cuando llegues a tu cita para recibir tu turno"
        />
      )}

      {/* Today's appointments shortcut */}
      {!activeEntry && todayAppointments.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800">
              Citas de hoy
            </span>
          </div>
          <p className="text-xs text-emerald-600 mb-3">
            Tienes {todayAppointments.length} cita
            {todayAppointments.length !== 1 ? "s" : ""} confirmada
            {todayAppointments.length !== 1 ? "s" : ""} para hoy.
            Unite a la cola cuando llegues.
          </p>
          <button
            onClick={() => setShowJoinDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Unirme a la cola
          </button>
        </div>
      )}

      {/* History */}
      <div className="pt-4 border-t border-gray-100">
        <QueueHistory entries={history} loading={historyLoading} />
      </div>
    </div>
  );
}
