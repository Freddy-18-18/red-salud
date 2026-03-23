"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useTelemedicineSession,
} from "@/hooks/use-telemedicine";
import { DeviceCheck } from "@/components/telemedicine/device-check";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Video,
  Clock,
  ArrowLeft,
  Lightbulb,
  UserCircle,
  Loader2,
} from "lucide-react";

const WAITING_TIPS = [
  "Asegurate de estar en un lugar tranquilo y bien iluminado",
  "Ten tus medicamentos a mano para mostrarlos al doctor si es necesario",
  "Prepara tus preguntas con anticipacion para aprovechar la consulta",
  "Verifica que tu conexion a internet sea estable",
  "Usa auriculares para mejor calidad de audio",
  "Ten a mano los resultados de examenes recientes",
];

function AnimatedDots() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-6 text-left">{dots}</span>;
}

export default function WaitingRoomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") ?? undefined;
  const showCheckOnly = searchParams.get("check") === "true";

  const { session, loading, error, join } =
    useTelemedicineSession(sessionId);
  const [joined, setJoined] = useState(false);
  const [deviceReady, setDeviceReady] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Rotate tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % WAITING_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-redirect when session starts (in_progress)
  useEffect(() => {
    if (session?.status === "in_progress" && sessionId) {
      router.push(`/dashboard/telemedicina/consulta/${sessionId}`);
    }
  }, [session?.status, sessionId, router]);

  // Join waiting room when device check is done
  const handleDeviceReady = async () => {
    setDeviceReady(true);
    if (!showCheckOnly && session && session.status === "scheduled") {
      await join();
      setJoined(true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-16">
        <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Sesion no encontrada
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          No se pudo cargar la informacion de esta consulta
        </p>
        <a
          href="/dashboard/telemedicina"
          className="inline-flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a telemedicina
        </a>
      </div>
    );
  }

  const doctorName = session.doctor?.nombre_completo || "tu doctor";
  const scheduledTime = new Date(session.scheduled_at).toLocaleTimeString(
    "es-VE",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
  const scheduledDate = new Date(session.scheduled_at).toLocaleDateString(
    "es-VE",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Link */}
      <a
        href="/dashboard/telemedicina"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </a>

      {/* Doctor Info Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
        {session.doctor?.avatar_url ? (
          <img
            src={session.doctor.avatar_url}
            alt={doctorName}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <UserCircle className="h-12 w-12 text-emerald-400" />
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-900">
          Dr. {doctorName}
        </h1>

        <div className="flex items-center justify-center gap-3 mt-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {scheduledTime}
          </div>
          <span>-</span>
          <span className="capitalize">{scheduledDate}</span>
        </div>

        {/* Waiting Status */}
        {joined && session.status !== "in_progress" && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
              <p className="font-medium text-emerald-800">
                Tu doctor se unira pronto
                <AnimatedDots />
              </p>
            </div>
            <p className="text-sm text-emerald-600">
              Estas en la sala de espera. La consulta comenzara cuando el doctor
              se conecte.
            </p>
          </div>
        )}
      </div>

      {/* Device Check */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {deviceReady
            ? "Dispositivos verificados"
            : "Verifica tus dispositivos"}
        </h2>
        <DeviceCheck
          onReady={handleDeviceReady}
          compact={deviceReady}
        />
      </div>

      {/* Tips While Waiting */}
      {joined && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">
                Consejo
              </p>
              <p className="text-sm text-amber-700 transition-all duration-300">
                {WAITING_TIPS[currentTip]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!joined && deviceReady && !showCheckOnly && (
        <button
          onClick={async () => {
            await join();
            setJoined(true);
          }}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600 transition flex items-center justify-center gap-2"
        >
          <Video className="h-5 w-5" />
          Unirme a la sala de espera
        </button>
      )}

      {showCheckOnly && deviceReady && (
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <Video className="h-5 w-5" />
            <p className="font-medium">
              Tus dispositivos estan listos para la consulta
            </p>
          </div>
          <a
            href="/dashboard/telemedicina"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a telemedicina
          </a>
        </div>
      )}
    </div>
  );
}
