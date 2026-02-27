"use client";

import { type ComponentType } from "react";
import { cn } from "@red-salud/core/utils";
import {
  CalendarDays, TrendingDown, Clock, DollarSign, Users,
  BarChart3, Target, Loader2,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@red-salud/design-system";
import { useAgendaStats } from "@/hooks/use-agenda-stats";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AgendaCitasTabProps {
  doctorId: string;
  dateRange?: { start: Date; end: Date };
}

export function AgendaCitasTab({ doctorId }: AgendaCitasTabProps) {
  const {
    kpis, noShowTrend, heatmap, typeMetrics,
    revenue, waitlist, duration, loading, error, refresh,
  } = useAgendaStats({ doctorId, monthlyRevenueGoal: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span>Calculando estadísticas de agenda…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-4">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Row ───────────────────────────────────────────────────── */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard
            label="No-shows (30d)"
            value={`${kpis.no_show_rate_pct}%`}
            sub={`${kpis.total_appointments_30d} citas total`}
            icon={TrendingDown}
            danger={kpis.no_show_rate_pct > 15}
          />
          <KpiCard
            label="Ocupación"
            value={`${kpis.occupancy_rate_pct}%`}
            sub="vs capacidad estimada"
            icon={CalendarDays}
          />
          <KpiCard
            label="Duración real prom."
            value={kpis.avg_actual_duration_mins != null ? `${kpis.avg_actual_duration_mins} min` : "—"}
            sub="tiempo en consulta"
            icon={Clock}
          />
          <KpiCard
            label="A tiempo"
            value={`${kpis.on_time_rate_pct}%`}
            sub="±15 min del horario"
            icon={Target}
          />
          <KpiCard
            label="Conversión lista espera"
            value={`${kpis.waitlist_conversion_pct}%`}
            sub="pacientes confirmados"
            icon={Users}
          />
        </div>
      )}

      {/* ── No-show trend ─────────────────────────────────────────────── */}
      {noShowTrend.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de no-shows — últimos 12 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <NoShowChart data={noShowTrend} />
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* ── Appointment type metrics ──────────────────────────────────── */}
        {typeMetrics.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Métricas por tipo de cita</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-1.5">Tipo</th>
                    <th className="text-right py-1.5">Total</th>
                    <th className="text-right py-1.5">No-show</th>
                    <th className="text-right py-1.5">Pred. (min)</th>
                    <th className="text-right py-1.5">Real (min)</th>
                    <th className="text-right py-1.5">Desvío</th>
                  </tr>
                </thead>
                <tbody>
                  {typeMetrics.map((m) => (
                    <tr key={m.tipo_cita} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="py-1.5 font-medium capitalize">{m.tipo_cita}</td>
                      <td className="py-1.5 text-right tabular-nums">{m.total}</td>
                      <td className={cn("py-1.5 text-right tabular-nums", m.no_show > 0 && "text-red-600 dark:text-red-400")}>
                        {m.no_show}
                      </td>
                      <td className="py-1.5 text-right tabular-nums">{m.avg_scheduled_mins}</td>
                      <td className="py-1.5 text-right tabular-nums">{m.avg_actual_mins ?? "—"}</td>
                      <td className={cn("py-1.5 text-right tabular-nums",
                        m.avg_overrun_mins != null && m.avg_overrun_mins > 5 ? "text-orange-600 dark:text-orange-400" : ""
                      )}>
                        {m.avg_overrun_mins != null ? (m.avg_overrun_mins > 0 ? `+${m.avg_overrun_mins}` : `${m.avg_overrun_mins}`) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* ── Duration drill-down ───────────────────────────────────────── */}
        {duration.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Duración real vs. programada (3 meses)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {duration.slice(0, 6).map((d) => (
                <div key={d.tipo_cita} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">{d.tipo_cita}</span>
                    <span className="text-muted-foreground">
                      {d.avg_actual ?? "—"} / {d.avg_scheduled} min
                      {d.overrun_pct !== 0 && (
                        <span className={cn("ml-1.5", d.overrun_pct > 10 ? "text-orange-600" : "text-muted-foreground")}>
                          ({d.overrun_pct > 0 ? "+" : ""}{d.overrun_pct}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        d.overrun_pct > 15 ? "bg-orange-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, d.avg_actual ? (d.avg_actual / Math.max(d.avg_scheduled, d.avg_actual ?? 0)) * 100 : 50)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Hourly heatmap ────────────────────────────────────────────── */}
      {heatmap.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mapa de calor — horas pico</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapGrid data={heatmap} />
          </CardContent>
        </Card>
      )}

      {/* ── Waitlist conversion ───────────────────────────────────────── */}
      {waitlist.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversión de lista de espera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {waitlist.map((w) => (
                <div key={w.month} className="flex-none text-center min-w-[72px]">
                  <div className="relative h-24 w-10 mx-auto bg-muted rounded-md overflow-hidden">
                    <div
                      className="absolute bottom-0 inset-x-0 bg-primary/70 rounded-md transition-all"
                      style={{ height: `${w.conversion_rate_pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{w.month.slice(5)}</p>
                  <p className="text-xs font-semibold">{w.conversion_rate_pct}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, danger = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className={cn("size-4", danger ? "text-red-500" : "text-muted-foreground/60")} />
        </div>
        <p className={cn("text-2xl font-bold tabular-nums", danger && "text-red-600 dark:text-red-400")}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function NoShowChart({ data }: { data: Array<{ month: string; rate_pct: number; total: number; no_shows: number }> }) {
  const max = Math.max(...data.map((d) => d.rate_pct), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 overflow-x-auto pb-4">
      {data.map((d) => (
        <div key={d.month} className="flex-none flex flex-col items-center gap-1 min-w-[36px]">
          <div
            className={cn(
              "w-7 rounded-t transition-all",
              d.rate_pct > 20 ? "bg-red-500" :
              d.rate_pct > 10 ? "bg-orange-400" : "bg-primary/60"
            )}
            style={{ height: `${Math.round((d.rate_pct / max) * 80)}px` }}
            title={`${d.no_shows} no-shows / ${d.total} citas`}
          />
          <span className="text-[9px] text-muted-foreground">{d.month.slice(5)}</span>
          <span className="text-[10px] font-semibold">{d.rate_pct}%</span>
        </div>
      ))}
    </div>
  );
}

const HOUR_LABELS = ["6h","7h","8h","9h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h","20h"];
const DAY_SHORT  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function HeatmapGrid({ data }: { data: Array<{ day_of_week: number; hour_of_day: number; appointment_count: number }> }) {
  const maxCount = Math.max(...data.map((d) => d.appointment_count), 1);
  const getCount = (day: number, hour: number) =>
    data.find((d) => d.day_of_week === day && d.hour_of_day === hour)?.appointment_count ?? 0;

  const hours = Array.from({ length: 15 }, (_, i) => i + 6);

  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: `40px repeat(${hours.length}, 1fr)` }}>
        <div /> {/* empty corner */}
        {hours.map((h) => (
          <div key={h} className="text-[9px] text-muted-foreground text-center">{h}h</div>
        ))}
        {[1, 2, 3, 4, 5, 6, 0].map((day) => (
          <>
            <div key={`label-${day}`} className="text-[9px] text-muted-foreground flex items-center">{DAY_SHORT[day]}</div>
            {hours.map((hour) => {
              const count = getCount(day, hour);
              const intensity = count / maxCount;
              return (
                <div
                  key={`${day}-${hour}`}
                  className="aspect-square rounded-sm transition-colors"
                  style={{
                    backgroundColor: count === 0
                      ? "hsl(var(--muted))"
                      : `hsl(var(--primary) / ${0.15 + intensity * 0.85})`,
                  }}
                  title={`${DAY_SHORT[day]} ${hour}h: ${count} citas`}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
