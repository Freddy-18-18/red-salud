"use client";

import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import { useState } from "react";

import { fetchJson, postJson } from "@/lib/utils/fetch";
import type { AppointmentDetail } from "@/lib/services/appointments/appointments.types";

interface WaitlistToggleProps {
  appointment: AppointmentDetail;
}

type WaitlistRow = NonNullable<AppointmentDetail["waitlist"]>;

export function WaitlistToggle({ appointment }: WaitlistToggleProps) {
  const router = useRouter();
  const initial =
    appointment.waitlist && appointment.waitlist.status === "active"
      ? appointment.waitlist
      : null;

  const [optimistic, setOptimistic] = useState<WaitlistRow | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optedIn = optimistic !== null;

  const handleToggle = async () => {
    setError(null);
    setLoading(true);
    try {
      if (optedIn) {
        await fetchJson<null>(
          `/api/appointments/${appointment.id}/waitlist`,
          { method: "DELETE" },
        );
        setOptimistic(null);
      } else {
        const data = await postJson<WaitlistRow>(
          `/api/appointments/${appointment.id}/waitlist`,
          {},
        );
        setOptimistic(data);
      }
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos actualizar la lista de espera.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
          <Bell className="h-4 w-4 text-cyan-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-cyan-900">
            {optedIn
              ? "Anotado en lista de espera"
              : "¿Querés moverla antes si se libera un cupo?"}
          </p>
          <p className="text-xs text-cyan-800 mt-0.5">
            {optedIn
              ? "Te avisaremos si otro paciente cancela y queda un slot antes de tu cita actual."
              : "Si otro paciente cancela y queda un slot antes de tu cita, te avisamos primero."}
          </p>

          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`flex-shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition disabled:opacity-50 ${
            optedIn
              ? "bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
              : "bg-cyan-500 text-white hover:bg-cyan-600"
          }`}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : optedIn ? (
            "Quitar"
          ) : (
            "Anotarme"
          )}
        </button>
      </div>
    </section>
  );
}
