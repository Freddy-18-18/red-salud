"use client";

import { Loader2, Video } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchJson } from "@/lib/utils/fetch";

const JOIN_WINDOW_MIN = 15;

interface VideoJoinButtonProps {
  appointmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  onError?: (message: string) => void;
}

type Phase =
  | { kind: "early"; minutesUntilOpen: number }
  | { kind: "open" }
  | { kind: "ended" };

function computePhase(scheduledAtIso: string, durationMinutes: number): Phase {
  const now = Date.now();
  const start = new Date(scheduledAtIso).getTime();
  const windowOpens = start - JOIN_WINDOW_MIN * 60_000;
  const windowCloses = start + (durationMinutes + 30) * 60_000;

  if (now < windowOpens) {
    return {
      kind: "early",
      minutesUntilOpen: Math.ceil((windowOpens - now) / 60_000),
    };
  }
  if (now > windowCloses) {
    return { kind: "ended" };
  }
  return { kind: "open" };
}

function formatCountdown(minutes: number): string {
  if (minutes <= 1) return "1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return remH > 0 ? `${days}d ${remH}h` : `${days}d`;
}

export function VideoJoinButton({
  appointmentId,
  scheduledAt,
  durationMinutes,
  status,
  onError,
}: VideoJoinButtonProps) {
  const [phase, setPhase] = useState<Phase>(() =>
    computePhase(scheduledAt, durationMinutes),
  );
  const [loading, setLoading] = useState(false);

  // Re-compute phase every 30s. We don't need second-level precision and
  // 30s keeps the visible countdown reasonably current without burning CPU.
  useEffect(() => {
    setPhase(computePhase(scheduledAt, durationMinutes));
    const t = setInterval(
      () => setPhase(computePhase(scheduledAt, durationMinutes)),
      30_000,
    );
    return () => clearInterval(t);
  }, [scheduledAt, durationMinutes]);

  if (status === "cancelled" || phase.kind === "ended") {
    return null;
  }

  const handleJoin = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<{
        meeting_url: string;
        session_id: string;
      }>(`/api/appointments/${appointmentId}/video-link`);
      window.open(data.meeting_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos abrir la videollamada. Intenta de nuevo.";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  if (phase.kind === "early") {
    return (
      <button
        type="button"
        disabled
        title={`La videollamada se habilita ${JOIN_WINDOW_MIN} minutos antes de la cita`}
        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-xl cursor-not-allowed"
      >
        <Video className="h-4 w-4" />
        Disponible en {formatCountdown(phase.minutesUntilOpen)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleJoin}
      disabled={loading}
      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 text-white text-sm font-medium rounded-xl hover:bg-cyan-600 transition disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <Video className="h-4 w-4" />
          Unirse a videollamada
        </>
      )}
    </button>
  );
}
