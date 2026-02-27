"use client";

import { useState, useEffect } from "react";
import { cn } from "@red-salud/core/utils";
import {
  ClipboardList, Plus, ChevronRight, CheckCircle2, Clock,
  Circle, Pause, XCircle, Loader2, User, CalendarDays, DollarSign,
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Badge, ScrollArea, Progress,
} from "@red-salud/design-system";
import { useTreatmentPlans } from "@/hooks/use-treatment-plans";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { TreatmentPlan } from "@/lib/supabase/services/treatment-plan-service";

interface TreatmentPlansTabProps {
  selectedOfficeId: string | null;
}

const PLAN_STATUS_CONFIG = {
  active:    { label: "Activo",     color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",   icon: Circle },
  paused:    { label: "En pausa",   color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300", icon: Pause },
  completed: { label: "Completado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",       icon: CheckCircle2 },
  cancelled: { label: "Cancelado",  color: "bg-gray-100 text-gray-500 dark:bg-black/60 dark:text-gray-400",          icon: XCircle },
};

export function TreatmentPlansTab({ selectedOfficeId }: TreatmentPlansTabProps) {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [filter, setFilter]     = useState<string>("active");
  const [selected, setSelected] = useState<TreatmentPlan | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setDoctorId(user.id);
    });
  }, []);

  const { plans, loading, error, selectPlan, getPlanProgress, edit, refresh } = useTreatmentPlans({
    doctorId: doctorId ?? "",
    status: filter === "all" ? undefined : filter,
  });

  if (!doctorId || loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span>Cargando planes de tratamiento…</span>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── List ──────────────────────────────────────────────────────── */}
      <div className="w-80 flex-none flex flex-col border-r">
        {/* Filter bar */}
        <div className="flex-none flex gap-1 p-3 border-b overflow-x-auto">
          {(["active", "paused", "completed", "all"] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "ghost"}
              size="sm"
              className="h-6 text-xs px-2 flex-none"
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "Todos" : PLAN_STATUS_CONFIG[s as keyof typeof PLAN_STATUS_CONFIG].label}
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {plans.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <ClipboardList className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin planes de tratamiento</p>
              </div>
            ) : null}
            {plans.map((plan) => {
              const progress = getPlanProgress(plan);
              const statusConf = PLAN_STATUS_CONFIG[plan.tps_status] ?? PLAN_STATUS_CONFIG.active;
              const StatusIcon = statusConf.icon;
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/30",
                    selected?.id === plan.id && "ring-1 ring-primary bg-muted/20"
                  )}
                  onClick={async () => {
                    await selectPlan(plan.id);
                    setSelected(plan);
                  }}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{plan.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {plan.patient
                            ? Array.isArray(plan.patient) ? plan.patient[0]?.nombre_completo : (plan.patient as { nombre_completo: string }).nombre_completo
                            : "Paciente"}
                        </p>
                      </div>
                      <Badge className={cn("text-[10px] flex-none", statusConf.color)}>
                        <StatusIcon className="size-2.5 mr-1" />
                        {statusConf.label}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{plan.completed_sessions} / {plan.total_sessions} sesiones</span>
                        <span>{progress.pct}%</span>
                      </div>
                      <Progress value={progress.pct} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* ── Detail ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <ClipboardList className="size-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Selecciona un plan para ver sus detalles</p>
            </div>
          </div>
        ) : (
          <PlanDetail plan={selected} />
        )}
      </div>
    </div>
  );
}

// ── Plan Detail ───────────────────────────────────────────────────────────────

function PlanDetail({ plan }: { plan: TreatmentPlan }) {
  const appointments = plan.appointments ?? [];
  const progress = plan.total_sessions > 0
    ? Math.round((plan.completed_sessions / plan.total_sessions) * 100)
    : 0;
  const statusConf = PLAN_STATUS_CONFIG[plan.tps_status] ?? PLAN_STATUS_CONFIG.active;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{plan.name}</h2>
            {plan.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
            )}
          </div>
          <Badge className={cn("text-[10px] flex-none", statusConf.color)}>
            {statusConf.label}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{plan.completed_sessions} de {plan.total_sessions} sesiones completadas</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="size-3.5" />
            <span>{plan.patient
              ? Array.isArray(plan.patient) ? plan.patient[0]?.nombre_completo : (plan.patient as { nombre_completo: string }).nombre_completo
              : "—"}</span>
          </div>
          {plan.total_estimated_cost != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="size-3.5" />
              <span>{plan.total_estimated_cost.toLocaleString()} estimado</span>
            </div>
          )}
          {plan.started_at && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" />
              <span>Inicio: {format(new Date(plan.started_at), "d MMM yyyy", { locale: es })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Session list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Sesiones del plan
          </h3>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin citas vinculadas al plan.</p>
          ) : null}
          {appointments
            .slice()
            .sort((a, b) => (a.treatment_plan_session ?? 0) - (b.treatment_plan_session ?? 0))
            .map((apt) => {
              const isDone   = apt.status === "completada";
              const isMissed = apt.status === "no_asistio" || apt.status === "cancelada";
              return (
                <div key={apt.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className={cn(
                    "size-6 rounded-full flex items-center justify-center flex-none text-[10px] font-bold border",
                    isDone   ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                    : isMissed ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                    : "bg-muted text-muted-foreground border-muted-foreground/20"
                  )}>
                    {apt.treatment_plan_session ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{apt.motivo ?? "Consulta"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(apt.fecha_hora), "EEEE d MMM · HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px]", isDone && "border-green-300 text-green-700")}>
                    {apt.status}
                  </Badge>
                </div>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
}
