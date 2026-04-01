"use client";

import { Clock, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import type { TimelineEvent } from "@/lib/services/medical-history-service";

import { TimelineEventCard } from "./timeline-event-card";

interface TimelineViewProps {
  events: TimelineEvent[];
  loading: boolean;
  isFetching: boolean;
  hasMore: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

/**
 * Group events by month+year for date markers.
 */
function groupByMonth(events: TimelineEvent[]): Array<{ label: string; events: TimelineEvent[] }> {
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    try {
      const d = new Date(event.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const label = d.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(event);
      // Store label on first occurrence
      if (!groups.get(key)!.length) {
        // never happens, but keeps key + label together
      }
    } catch {
      // Fallback — ungrouped
      if (!groups.has("unknown")) groups.set("unknown", []);
      groups.get("unknown")!.push(event);
    }
  }

  return Array.from(groups.entries()).map(([key, evts]) => {
    let label: string;
    if (key === "unknown") {
      label = "Fecha desconocida";
    } else {
      const [year, month] = key.split("-");
      const d = new Date(Number(year), Number(month), 1);
      label = d.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
    }
    return { label, events: evts };
  });
}

export function TimelineView({
  events,
  loading,
  isFetching,
  hasMore,
  page,
  onPageChange,
}: TimelineViewProps) {
  const groups = useMemo(() => groupByMonth(events), [events]);

  if (loading) {
    return <SkeletonList count={5} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No hay eventos en tu historial"
        description="Tu historial medico aparecera aqui conforme recibas consultas, estudios y tratamientos."
        action={{ label: "Buscar Medico", href: "/dashboard/buscar-medico" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {groups.map((group) => (
          <div key={group.label}>
            {/* Month marker */}
            <div className="flex items-center gap-2 mb-3 mt-2">
              <div className="w-3 flex justify-center">
                <Clock className="h-3 w-3 text-gray-300" />
              </div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide capitalize">
                {group.label}
              </h3>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Events in group — vertical line connecting them */}
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-100" />

              {group.events.map((event) => (
                <TimelineEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
            page === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <span className="text-xs text-gray-400">
          {isFetching ? "Cargando..." : `Pagina ${page + 1}`}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
            !hasMore
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
