"use client";

import { ClipboardCheck, Bell, ArrowRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { ActionsList } from "@/components/post-consultation/actions-list";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList, Skeleton } from "@/components/ui/skeleton";
import {
  getPostConsultationSummaries,
  markActionViewed,
  markActionCompleted,
  type PostConsultationSummary,
} from "@/lib/services/post-consultation-service";
import { supabase } from "@/lib/supabase/client";

export default function PostConsultaPage() {
  const [userId, setUserId] = useState<string>();
  const [summaries, setSummaries] = useState<PostConsultationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (uid: string) => {
    const result = await getPostConsultationSummaries(uid);
    if (result.success) {
      setSummaries(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await loadData(user.id);
    };

    init();
  }, [loadData]);

  // Subscribe to new post-consultation actions in realtime
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`post-consultation:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_consultation_actions",
          filter: `patient_id=eq.${userId}`,
        },
        () => {
          // Reload all summaries when a new action arrives
          loadData(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadData]);

  const handleMarkViewed = async (actionId: string) => {
    await markActionViewed(actionId);
    // Optimistically update local state
    setSummaries((prev) =>
      prev.map((s) => ({
        ...s,
        actions: s.actions.map((a) =>
          a.id === actionId && a.status === "pending"
            ? { ...a, status: "viewed" as const }
            : a
        ),
      }))
    );
  };

  const handleMarkCompleted = async (actionId: string) => {
    await markActionCompleted(actionId);
    // Optimistically update local state
    setSummaries((prev) =>
      prev.map((s) => ({
        ...s,
        actions: s.actions.map((a) =>
          a.id === actionId ? { ...a, status: "completed" as const } : a
        ),
      }))
    );
  };

  // Count pending actions
  const pendingCount = summaries.reduce(
    (total, s) =>
      total + s.actions.filter((a) => a.status !== "completed").length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Post-Consulta
        </h1>
        <p className="text-gray-500 mt-1">
          Acciones pendientes despues de tus consultas medicas
        </p>
      </div>

      {/* Pending actions banner */}
      {!loading && pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">
              {pendingCount} accion{pendingCount !== 1 ? "es" : ""} pendiente
              {pendingCount !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Completa las indicaciones de tu medico para continuar tu
              tratamiento
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <SkeletonList count={3} />
        </div>
      ) : summaries.length > 0 ? (
        <ActionsList
          summaries={summaries}
          onMarkViewed={handleMarkViewed}
          onMarkCompleted={handleMarkCompleted}
        />
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="No tienes acciones pendientes"
          description="Despues de tus consultas medicas, aqui veras las recetas, ordenes de laboratorio y proximas citas sugeridas"
          action={{ label: "Buscar Medico", href: "/dashboard/buscar-medico" }}
        />
      )}

      {/* Link to orders */}
      {!loading && (
        <div className="pt-4 border-t border-gray-100">
          <a
            href="/dashboard/pedidos"
            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Mis Pedidos
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Revisa el estado de tus pedidos de farmacia
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
          </a>
        </div>
      )}
    </div>
  );
}
