"use client";

import {
  Stethoscope,
  TestTube,
  Pill,
  Syringe,
  Ambulance,
  Activity,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { TimelineFilters } from "@/components/medical-history/timeline-filters";
import { TimelineView } from "@/components/medical-history/timeline-view";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useMedicalTimeline, useTimelineStats } from "@/hooks/use-medical-history";
import type { TimelineFilters as TFilters } from "@/lib/services/medical-history-service";
import { supabase } from "@/lib/supabase/client";

export default function HistorialTimelinePage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [filters, setFilters] = useState<TFilters>({});
  const [page, setPage] = useState(0);
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  // Fetch unique doctors from patient's appointments for filter dropdown
  useEffect(() => {
    if (!userId) return;
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from("appointments")
          .select("medico_id, doctor:profiles!appointments_medico_id_fkey(id, full_name)")
          .eq("paciente_id", userId);

        if (!error && data) {
          const seen = new Set<string>();
          const unique: Array<{ id: string; name: string }> = [];
          for (const row of data) {
            const doctor = row.doctor as unknown as Record<string, unknown> | null;
            const id = doctor?.id as string;
            const name = doctor?.full_name as string;
            if (id && name && !seen.has(id)) {
              seen.add(id);
              unique.push({ id, name });
            }
          }
          unique.sort((a, b) => a.name.localeCompare(b.name));
          setDoctors(unique);
        }
      } catch {
        // Non-critical — filter will just not show doctors
      }
    };
    fetchDoctors();
  }, [userId]);

  // Reset page when filters change
  const handleFiltersChange = useCallback((newFilters: TFilters) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const { events, hasMore, loading, isFetching } = useMedicalTimeline(userId, filters, page);
  const { stats, loading: statsLoading } = useTimelineStats(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Linea de Tiempo
        </h1>
        <p className="text-gray-500 mt-1">
          Visualiza todos tus eventos medicos en orden cronologico
        </p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <StatCard
            icon={Activity}
            label="Total"
            value={stats.total}
            color="bg-gray-100 text-gray-600"
          />
          <StatCard
            icon={Stethoscope}
            label="Consultas"
            value={stats.appointments}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={TestTube}
            label="Laboratorio"
            value={stats.lab_results}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Pill}
            label="Recetas"
            value={stats.prescriptions}
            color="bg-purple-50 text-purple-600"
          />
          <div className="col-span-3 sm:col-span-1 grid grid-cols-2 sm:grid-cols-1 gap-3">
            <StatCard
              icon={Syringe}
              label="Vacunas"
              value={stats.vaccinations}
              color="bg-orange-50 text-orange-600"
            />
            <StatCard
              icon={Ambulance}
              label="Emergencias"
              value={stats.emergencies}
              color="bg-red-50 text-red-600"
            />
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <TimelineFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        doctors={doctors}
      />

      {/* Timeline */}
      <TimelineView
        events={events}
        loading={loading}
        isFetching={isFetching}
        hasMore={hasMore}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
