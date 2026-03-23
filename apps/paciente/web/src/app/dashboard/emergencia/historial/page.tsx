"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock, AlertCircle, MapPin, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  getEmergencyHistory,
  type EmergencyRequest,
  type EmergencyPriority,
  type EmergencyStatus,
} from "@/lib/services/emergency-service";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getResponseTime(request: EmergencyRequest): string | null {
  if (!request.dispatched_at) return null;
  const created = new Date(request.created_at).getTime();
  const dispatched = new Date(request.dispatched_at).getTime();
  const diffMinutes = Math.round((dispatched - created) / 60000);
  if (diffMinutes < 1) return "< 1 min";
  return `${diffMinutes} min`;
}

const PRIORITY_CONFIG: Record<EmergencyPriority, { label: string; color: string }> = {
  red: { label: "Peligro de vida", color: "bg-red-100 text-red-700" },
  yellow: { label: "Urgente", color: "bg-amber-100 text-amber-700" },
  green: { label: "No urgente", color: "bg-green-100 text-green-700" },
};

const STATUS_CONFIG: Record<
  EmergencyStatus,
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  requesting: { label: "Solicitando", icon: Clock, color: "text-amber-500" },
  dispatched: { label: "Despachada", icon: AlertCircle, color: "text-blue-500" },
  en_route: { label: "En camino", icon: AlertCircle, color: "text-blue-600" },
  on_scene: { label: "En sitio", icon: MapPin, color: "text-emerald-500" },
  transporting: { label: "Trasladando", icon: AlertCircle, color: "text-purple-500" },
  completed: { label: "Completada", icon: CheckCircle2, color: "text-emerald-600" },
  cancelled: { label: "Cancelada", icon: X, color: "text-gray-400" },
};

export default function EmergenciaHistorialPage() {
  const [history, setHistory] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await getEmergencyHistory(user.id);
      if (result.success) setHistory(result.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <a
          href="/dashboard/emergencia"
          className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </a>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Historial de emergencias</h1>
          <p className="text-xs text-gray-500">Tus solicitudes anteriores</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Sin emergencias previas</p>
          <p className="text-sm text-gray-400 mt-1">
            Tu historial aparecerá aquí cuando solicites una emergencia
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((req) => {
            const pConfig = PRIORITY_CONFIG[req.priority];
            const sConfig = STATUS_CONFIG[req.status];
            const responseTime = getResponseTime(req);

            return (
              <div
                key={req.id}
                className="bg-white border border-gray-100 rounded-xl p-4 space-y-3"
              >
                {/* Top row: priority + status */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${pConfig.color}`}>
                    {pConfig.label}
                  </span>
                  <div className={`flex items-center gap-1 text-xs font-medium ${sConfig.color}`}>
                    <sConfig.icon className="h-3.5 w-3.5" />
                    {sConfig.label}
                  </div>
                </div>

                {/* Date + location */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDate(req.created_at)}
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{req.location_address}</span>
                  </div>
                </div>

                {/* Symptoms */}
                {req.symptoms && (
                  <p className="text-xs text-gray-600 line-clamp-2">{req.symptoms}</p>
                )}

                {/* Response time */}
                {responseTime && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium pt-1 border-t border-gray-50">
                    <Clock className="h-3 w-3" />
                    Tiempo de respuesta: {responseTime}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
