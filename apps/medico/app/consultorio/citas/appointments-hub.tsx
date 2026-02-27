"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "@red-salud/design-system";
import {
  Calendar,
  Users,
  ClipboardList,
  Shield,
  Bell,
  UserCheck,
  Clipboard,
  Settings2,
} from "lucide-react";
import {
  AgendaTab, OperationsTab, WaitlistTab, TimeBlocksTab,
  CheckinTab, RemindersTab, TreatmentPlansTab, TypeConfigsTab,
} from "./components";
import { useCurrentOffice } from "@/hooks/use-current-office";
import { supabase } from "@/lib/supabase/client";
import { startOfDay, endOfDay } from "date-fns";

interface AppointmentsHubProps {
  specialtyName?: string;
  initialTab?: string;
}

interface DailyStats {
  total: number;
  confirmada: number;
  completada: number;
  pendiente: number;
  no_asistio: number;
  waitlistCount: number;
}

const EMPTY_STATS: DailyStats = {
  total: 0,
  confirmada: 0,
  completada: 0,
  pendiente: 0,
  no_asistio: 0,
  waitlistCount: 0,
};

/**
 * Hub central de Agenda
 * Layout sin scroll principal - solo scroll interno en tabs
 */
export function AppointmentsHub({
  specialtyName: propSpecialtyName,
  initialTab,
}: AppointmentsHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab");

  const [selectedTab, setSelectedTab] = useState(initialTab || tabFromUrl || "agenda");
  const [specialtyName, setSpecialtyName] = useState<string | undefined>(propSpecialtyName);
  const [dailyStats, setDailyStats] = useState<DailyStats>(EMPTY_STATS);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const doctorIdRef = useRef<string | null>(null);

  const { currentOffice } = useCurrentOffice();
  const selectedOfficeId = currentOffice?.id || null;

  // ── Fetch today's stats ──────────────────────────────────────────────────
  const loadDailyStats = useCallback(async (doctorId: string) => {
    const today = new Date();
    const start = startOfDay(today).toISOString();
    const end = endOfDay(today).toISOString();

    const [appointmentsResult, waitlistResult] = await Promise.all([
      supabase
        .from("appointments")
        .select("status")
        .eq("medico_id", doctorId)
        .gte("fecha_hora", start)
        .lte("fecha_hora", end),
      supabase
        .from("smart_waitlist")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", doctorId)
        .in("status", ["waiting", "notified"]),
    ]);

    if (appointmentsResult.error || !appointmentsResult.data) return;

    const stats: DailyStats = {
      ...EMPTY_STATS,
      total: appointmentsResult.data.length,
      waitlistCount: waitlistResult.count ?? 0,
    };
    for (const row of appointmentsResult.data) {
      const s = row.status as string;
      if (s === "confirmada") stats.confirmada++;
      else if (s === "completada") stats.completada++;
      else if (s === "pendiente" || s === "sin_confirmar") stats.pendiente++;
      else if (s === "no_asistio" || s === "no_show") stats.no_asistio++;
    }
    setDailyStats(stats);
  }, []);

  // ── Setup realtime KPI subscription ─────────────────────────────────────
  const setupRealtimeKpi = useCallback(
    (doctorId: string) => {
      if (realtimeChannelRef.current) realtimeChannelRef.current.unsubscribe();

      const channel = supabase
        .channel("hub-daily-stats")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "appointments",
            filter: `medico_id=eq.${doctorId}`,
          },
          () => loadDailyStats(doctorId)
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "smart_waitlist",
            filter: `doctor_id=eq.${doctorId}`,
          },
          () => loadDailyStats(doctorId)
        )
        .subscribe();

      realtimeChannelRef.current = channel;
    },
    [loadDailyStats]
  );

  // ── Load specialty & initial data ────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      doctorIdRef.current = user.id;

      await loadDailyStats(user.id);
      setupRealtimeKpi(user.id);

      if (propSpecialtyName) {
        setSpecialtyName(propSpecialtyName);
        return;
      }

      const { data: doctorDetails } = await supabase
        .from("doctor_details")
        .select("especialidad:specialties(name)")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (doctorDetails?.especialidad) {
        const specialty = doctorDetails.especialidad as { name?: string };
        setSpecialtyName(specialty.name || undefined);
      }
    }

    init();

    return () => {
      realtimeChannelRef.current?.unsubscribe();
    };
  }, [propSpecialtyName, loadDailyStats, setupRealtimeKpi]);

  // ── URL sync ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== selectedTab) {
      setSelectedTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const isOdontology = specialtyName?.toLowerCase().includes("odontolog");

  const tabTriggerClassName =
    "relative rounded-none gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-200 ease-out after:content-[''] after:absolute after:left-2 after:right-2 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-primary after:origin-center after:scale-x-0 after:transition-transform after:duration-200 after:ease-out data-[state=active]:after:scale-x-100";

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full">
      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <Tabs
        value={selectedTab}
        onValueChange={handleTabChange}
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        {/* Tab bar */}
        <div className="flex-none border-b bg-muted/30 px-6">
          <TabsList className="h-10 bg-transparent border-b-0 rounded-none p-0">
            <TabsTrigger
              value="agenda"
              className={tabTriggerClassName}
            >
              <Calendar className="size-4" aria-hidden="true" />
              Agenda
              {dailyStats.total > 0 && (
                <Badge
                  variant="secondary"
                  className="h-4 min-w-4 px-1 text-[10px] font-semibold tabular-nums"
                >
                  {dailyStats.total}
                </Badge>
              )}
            </TabsTrigger>

            {isOdontology && (
              <TabsTrigger
                value="operations"
                className={tabTriggerClassName}
              >
                <Users className="size-4" aria-hidden="true" />
                Operaciones
              </TabsTrigger>
            )}

            <TabsTrigger
              value="waitlist"
              className={tabTriggerClassName}
            >
              <ClipboardList className="size-4" aria-hidden="true" />
              Lista de Espera
              {dailyStats.waitlistCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-4 min-w-4 px-1 text-[10px] font-semibold tabular-nums"
                >
                  {dailyStats.waitlistCount}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="disponibilidad"
              className={tabTriggerClassName}
            >
              <Shield className="size-4" aria-hidden="true" />
              Disponibilidad
            </TabsTrigger>

            <TabsTrigger
              value="sala-espera"
              className={tabTriggerClassName}
            >
              <UserCheck className="size-4" aria-hidden="true" />
              Sala de espera
            </TabsTrigger>

            <TabsTrigger
              value="recordatorios"
              className={tabTriggerClassName}
            >
              <Bell className="size-4" aria-hidden="true" />
              Recordatorios
            </TabsTrigger>

            <TabsTrigger
              value="planes"
              className={tabTriggerClassName}
            >
              <Clipboard className="size-4" aria-hidden="true" />
              Planes
            </TabsTrigger>

            <TabsTrigger
              value="tipos"
              className={tabTriggerClassName}
            >
              <Settings2 className="size-4" aria-hidden="true" />
              Tipos
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <TabsContent
            value="agenda"
            className="flex-1 min-h-0 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
          >
            <AgendaTab selectedOfficeId={selectedOfficeId} specialtyName={specialtyName} />
          </TabsContent>

          {isOdontology && (
            <TabsContent
              value="operations"
              className="flex-1 min-h-0 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
            >
              <OperationsTab selectedOfficeId={selectedOfficeId} specialtyName={specialtyName} />
            </TabsContent>
          )}

          <TabsContent
            value="waitlist"
            className="flex-1 min-h-0 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
          >
            <WaitlistTab selectedOfficeId={selectedOfficeId} specialtyName={specialtyName} />
          </TabsContent>

          <TabsContent
            value="disponibilidad"
            className="flex-1 min-h-0 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
          >
            <TimeBlocksTab selectedOfficeId={selectedOfficeId} />
          </TabsContent>

          <TabsContent
            value="sala-espera"
            className="flex-1 min-h-0 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
          >
            <CheckinTab selectedOfficeId={selectedOfficeId} />
          </TabsContent>

          <TabsContent
            value="recordatorios"
            className="flex-1 min-h-0 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
          >
            <RemindersTab selectedOfficeId={selectedOfficeId} />
          </TabsContent>

          <TabsContent
            value="planes"
            className="flex-1 min-h-0 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
          >
            <TreatmentPlansTab selectedOfficeId={selectedOfficeId} />
          </TabsContent>

          <TabsContent
            value="tipos"
            className="flex-1 min-h-0 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
          >
            <TypeConfigsTab selectedOfficeId={selectedOfficeId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
