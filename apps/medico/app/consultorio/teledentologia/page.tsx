"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  ArrowLeft, Camera, AlertTriangle, CheckCircle, Clock, Eye,
  Image, Activity, TrendingUp, TrendingDown, Bell, Calendar,
  User, MessageSquare, Star, Pause, Play, Flag, Shield
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge, Input
} from "@red-salud/design-system";
import Link from "next/link";
import type { RemoteMonitoringCase, MonitoringSubmission, MonitoringAlert } from "@/types/dental";

// ─── Demo Data ───────────────────────────────────────────────────────────────
const DEMO_CASES: RemoteMonitoringCase[] = [
  {
    id: "rm-1",
    patientId: "p1",
    patientName: "María García",
    doctorId: "d1",
    type: "orthodontic_tracking",
    status: "active",
    schedule: { frequency: "weekly", nextDueDate: "2026-02-16", totalSessions: 24, completedSessions: 8 },
    submissions: [
      {
        id: "s1-3", photos: ["/photos/maria-week8.jpg"], painLevel: 1, notes: "Todo bien, los brackets no molestan",
        selfAssessment: { brushing: "3x/day", flossing: true, elastics_worn: true },
        aiAnalysis: { progressScore: 92, deviationDetected: false, recommendation: "Progreso excelente, continuar con arco actual" },
        submittedAt: "2026-02-09T10:00:00", reviewedAt: "2026-02-09T14:00:00", doctorNotes: "Buen progreso, citar en 3 semanas"
      },
      {
        id: "s1-2", photos: ["/photos/maria-week7.jpg"], painLevel: 2, notes: "Ligera molestia al cambiar elásticos",
        selfAssessment: { brushing: "2x/day", flossing: true, elastics_worn: true },
        aiAnalysis: { progressScore: 88, deviationDetected: false, recommendation: "Progreso normal, recordar técnica de cepillado" },
        submittedAt: "2026-02-02T09:30:00", reviewedAt: "2026-02-02T15:00:00"
      },
      {
        id: "s1-1", photos: ["/photos/maria-week6.jpg"], painLevel: 0, notes: "Sin molestias",
        selfAssessment: { brushing: "3x/day", flossing: false, elastics_worn: true },
        aiAnalysis: { progressScore: 85, deviationDetected: false, recommendation: "Reforzar uso de hilo dental" },
        submittedAt: "2026-01-26T11:00:00", reviewedAt: "2026-01-27T09:00:00"
      },
    ],
    alerts: [
      { id: "a1-1", type: "photo_quality", severity: "info", message: "Foto semana 6 con poca iluminación — solicitar retomar", resolved: true, createdAt: "2026-01-26T11:05:00" },
    ],
    createdAt: "2025-12-15T08:00:00",
    updatedAt: "2026-02-09T14:00:00",
  },
  {
    id: "rm-2",
    patientId: "p2",
    patientName: "Carlos Fernández",
    doctorId: "d1",
    type: "post_operative",
    status: "flagged",
    schedule: { frequency: "daily", nextDueDate: "2026-02-14", totalSessions: 14, completedSessions: 6 },
    submissions: [
      {
        id: "s2-3", photos: ["/photos/carlos-day6.jpg"], painLevel: 7, notes: "Dolor aumentó, zona inflamada y enrojecida",
        selfAssessment: { medication_taken: true, ice_applied: true, soft_diet: true },
        aiAnalysis: { progressScore: 45, deviationDetected: true, deviationDescription: "Inflamación excesiva detectada en zona quirúrgica, posible infección", recommendation: "URGENTE: Agendar revisión presencial inmediata" },
        submittedAt: "2026-02-13T08:00:00"
      },
      {
        id: "s2-2", photos: ["/photos/carlos-day5.jpg"], painLevel: 5, notes: "Sigue doliendo pero menos que ayer",
        selfAssessment: { medication_taken: true, ice_applied: false, soft_diet: true },
        aiAnalysis: { progressScore: 62, deviationDetected: false, recommendation: "Progreso aceptable, continuar con medicación" },
        submittedAt: "2026-02-12T07:45:00", reviewedAt: "2026-02-12T10:00:00"
      },
      {
        id: "s2-1", photos: ["/photos/carlos-day4.jpg"], painLevel: 4, notes: "Mejorando gradualmente",
        selfAssessment: { medication_taken: true, ice_applied: true, soft_diet: true },
        aiAnalysis: { progressScore: 70, deviationDetected: false, recommendation: "Evolución normal post-quirúrgica" },
        submittedAt: "2026-02-11T08:30:00", reviewedAt: "2026-02-11T12:00:00"
      },
    ],
    alerts: [
      { id: "a2-1", type: "pain_increase", severity: "critical", message: "Dolor aumentó de 5 a 7 — posible complicación post-operatoria", resolved: false, createdAt: "2026-02-13T08:05:00" },
      { id: "a2-2", type: "deviation", severity: "critical", message: "IA detectó inflamación anormal en fotos del día 6", resolved: false, createdAt: "2026-02-13T08:10:00" },
    ],
    createdAt: "2026-02-08T10:00:00",
    updatedAt: "2026-02-13T08:10:00",
  },
  {
    id: "rm-3",
    patientId: "p3",
    patientName: "Ana Rodríguez",
    doctorId: "d1",
    type: "periodontal",
    status: "active",
    schedule: { frequency: "biweekly", nextDueDate: "2026-02-20", totalSessions: 12, completedSessions: 4 },
    submissions: [
      {
        id: "s3-1", photos: ["/photos/ana-check4.jpg"], painLevel: 2, notes: "Sangrado leve al cepillar",
        selfAssessment: { brushing: "2x/day", flossing: true, mouthwash: true },
        aiAnalysis: { progressScore: 75, deviationDetected: false, recommendation: "Sangrado en reducción, continuar protocolo actual" },
        submittedAt: "2026-02-06T16:00:00", reviewedAt: "2026-02-07T09:00:00", doctorNotes: "Mejoría notable vs. línea base"
      },
    ],
    alerts: [],
    createdAt: "2025-11-01T08:00:00",
    updatedAt: "2026-02-07T09:00:00",
  },
  {
    id: "rm-4",
    patientId: "p4",
    patientName: "Luis Mendoza",
    doctorId: "d1",
    type: "general_checkup",
    status: "paused",
    schedule: { frequency: "monthly", nextDueDate: "2026-03-01", totalSessions: 6, completedSessions: 2 },
    submissions: [
      {
        id: "s4-1", photos: ["/photos/luis-check2.jpg"], painLevel: 0, notes: "Todo normal",
        selfAssessment: { brushing: "2x/day", flossing: false },
        aiAnalysis: { progressScore: 80, deviationDetected: false, recommendation: "Incorporar hilo dental" },
        submittedAt: "2026-01-15T10:00:00", reviewedAt: "2026-01-16T11:00:00"
      },
    ],
    alerts: [
      { id: "a4-1", type: "missed_submission", severity: "warning", message: "Paciente no envió reporte de febrero", resolved: false, createdAt: "2026-02-03T00:00:00" },
    ],
    createdAt: "2025-10-01T08:00:00",
    updatedAt: "2026-01-16T11:00:00",
  },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  orthodontic_tracking: { label: "Ortodoncia", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: <Activity className="w-4 h-4" /> },
  post_operative: { label: "Post-Operatorio", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", icon: <Shield className="w-4 h-4" /> },
  periodontal: { label: "Periodontal", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: <Activity className="w-4 h-4" /> },
  general_checkup: { label: "Control General", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: <CheckCircle className="w-4 h-4" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Activo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: <Play className="w-3 h-3" /> },
  flagged: { label: "Alerta", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: <Flag className="w-3 h-3" /> },
  paused: { label: "Pausado", color: "bg-gray-100 text-gray-800 dark:bg-black/80 dark:text-gray-200", icon: <Pause className="w-3 h-3" /> },
  completed: { label: "Completado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: <CheckCircle className="w-3 h-3" /> },
};

const ALERT_SEVERITY: Record<string, { label: string; color: string }> = {
  info: { label: "Info", color: "bg-blue-50 text-blue-700 border-blue-200" },
  warning: { label: "Advertencia", color: "bg-amber-50 text-amber-700 border-amber-200" },
  critical: { label: "Crítico", color: "bg-red-50 text-red-700 border-red-200" },
};

const PAIN_COLOR = (level: number) =>
  level <= 2 ? "text-green-600" : level <= 5 ? "text-amber-500" : "text-red-600";

export default function TeledentistryPage() {
  const [cases] = useState(DEMO_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [tab, setTab] = useState<"timeline" | "alerts">("timeline");

  const selectedCase = selectedCaseId ? cases.find((c) => c.id === selectedCaseId) : null;

  const stats = useMemo(() => {
    const active = cases.filter((c) => c.status === "active").length;
    const flagged = cases.filter((c) => c.status === "flagged").length;
    const pendingReview = cases.flatMap((c) => c.submissions).filter((s) => !s.reviewedAt).length;
    const unresolvedAlerts = cases.flatMap((c) => c.alerts).filter((a) => !a.resolved).length;
    const avgProgress = Math.round(
      cases.flatMap((c) => c.submissions).filter((s) => s.aiAnalysis)
        .reduce((sum, s) => sum + (s.aiAnalysis?.progressScore || 0), 0) /
      Math.max(1, cases.flatMap((c) => c.submissions).filter((s) => s.aiAnalysis).length)
    );
    return { active, flagged, pendingReview, unresolvedAlerts, avgProgress };
  }, [cases]);

  const latestSubmission = (c: RemoteMonitoringCase) => c.submissions[0];
  const progressTrend = (c: RemoteMonitoringCase) => {
    if (c.submissions.length < 2) return null;
    const curr = c.submissions[0]?.aiAnalysis?.progressScore;
    const prev = c.submissions[1]?.aiAnalysis?.progressScore;
    if (curr == null || prev == null) return null;
    return curr - prev;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/consultorio">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            Teledentología — Monitoreo Remoto
          </h1>
          <p className="text-sm text-muted-foreground">Seguimiento de pacientes con fotos, IA y alertas automáticas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3">
          <Play className="w-5 h-5 text-green-500" />
          <div><p className="text-xl font-bold">{stats.active}</p><p className="text-xs text-muted-foreground">Activos</p></div>
        </CardContent></Card>
        <Card className={cn(stats.flagged > 0 && "border-red-300")}><CardContent className="pt-3 pb-3 flex items-center gap-3">
          <Flag className="w-5 h-5 text-red-500" />
          <div><p className={cn("text-xl font-bold", stats.flagged > 0 && "text-red-600")}>{stats.flagged}</p><p className="text-xs text-muted-foreground">Con alerta</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3">
          <Eye className="w-5 h-5 text-amber-500" />
          <div><p className="text-xl font-bold">{stats.pendingReview}</p><p className="text-xs text-muted-foreground">Por revisar</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3">
          <Bell className="w-5 h-5 text-red-500" />
          <div><p className="text-xl font-bold">{stats.unresolvedAlerts}</p><p className="text-xs text-muted-foreground">Alertas activas</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div><p className="text-xl font-bold">{stats.avgProgress}%</p><p className="text-xs text-muted-foreground">Progreso prom.</p></div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Case List */}
        <div className="lg:col-span-2 space-y-2">
          {cases.map((c) => {
            const latest = latestSubmission(c);
            const trend = progressTrend(c);
            const st = STATUS_CONFIG[c.status];
            const tp = TYPE_CONFIG[c.type];
            const urgentAlerts = c.alerts.filter((a) => !a.resolved && a.severity === "critical").length;

            return (
              <Card
                key={c.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  selectedCaseId === c.id && "ring-2 ring-primary",
                  c.status === "flagged" && "border-red-300"
                )}
                onClick={() => setSelectedCaseId(c.id === selectedCaseId ? null : c.id)}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{c.patientName}</span>
                        {urgentAlerts > 0 && (
                          <span className="flex items-center gap-0.5 text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{urgentAlerts}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge className={cn("text-[10px] h-4", tp?.color)}>{tp?.label}</Badge>
                        <Badge className={cn("text-[10px] h-4", st?.color)}>
                          <span className="mr-0.5">{st?.icon}</span>{st?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{c.schedule.completedSessions}/{c.schedule.totalSessions} sesiones</span>
                        {latest?.aiAnalysis && (
                          <span className="flex items-center gap-0.5">
                            <span className="font-medium">{latest.aiAnalysis.progressScore}%</span>
                            {trend !== null && (
                              trend >= 0 ?
                                <TrendingUp className="w-3 h-3 text-green-500" /> :
                                <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress ring */}
                    <div className="shrink-0 relative w-10 h-10">
                      <svg viewBox="0 0 36 36" className="w-10 h-10">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/20" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke="currentColor" strokeWidth="2.5"
                          strokeDasharray={`${(c.schedule.completedSessions / c.schedule.totalSessions) * 100}, 100`}
                          className={cn(c.status === "flagged" ? "text-red-500" : "text-primary")}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                        {Math.round((c.schedule.completedSessions / c.schedule.totalSessions) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {selectedCase ? (
            <div className="space-y-4">
              {/* Case Header */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />{selectedCase.patientName}
                    </span>
                    <Badge className={cn("text-xs", STATUS_CONFIG[selectedCase.status]?.color)}>
                      {STATUS_CONFIG[selectedCase.status]?.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <Badge className={cn("text-[10px]", TYPE_CONFIG[selectedCase.type]?.color)}>{TYPE_CONFIG[selectedCase.type]?.label}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frecuencia</p>
                      <p className="font-medium capitalize">{selectedCase.schedule.frequency === "biweekly" ? "Quincenal" : selectedCase.schedule.frequency === "daily" ? "Diario" : selectedCase.schedule.frequency === "weekly" ? "Semanal" : "Mensual"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Próximo envío</p>
                      <p className="font-medium">{new Date(selectedCase.schedule.nextDueDate).toLocaleDateString("es-VE")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progreso</p>
                      <p className="font-medium">{selectedCase.schedule.completedSessions}/{selectedCase.schedule.totalSessions} ({Math.round((selectedCase.schedule.completedSessions / selectedCase.schedule.totalSessions) * 100)}%)</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={cn("h-full rounded-full transition-all", selectedCase.status === "flagged" ? "bg-red-500" : "bg-primary")}
                      style={{ width: `${(selectedCase.schedule.completedSessions / selectedCase.schedule.totalSessions) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="flex gap-1">
                <Button size="sm" variant={tab === "timeline" ? "default" : "ghost"} onClick={() => setTab("timeline")} className="h-7 text-xs">
                  <Clock className="w-3 h-3 mr-1" />Timeline ({selectedCase.submissions.length})
                </Button>
                <Button size="sm" variant={tab === "alerts" ? "default" : "ghost"} onClick={() => setTab("alerts")} className="h-7 text-xs">
                  <Bell className="w-3 h-3 mr-1" />Alertas ({selectedCase.alerts.filter((a) => !a.resolved).length})
                </Button>
              </div>

              {tab === "timeline" && (
                <div className="space-y-3">
                  {selectedCase.submissions.map((sub, idx) => {
                    const isLatest = idx === 0;
                    const needsReview = !sub.reviewedAt;
                    return (
                      <Card key={sub.id} className={cn(needsReview && "border-amber-300", isLatest && "ring-1 ring-primary/30")}>
                        <CardContent className="pt-3 pb-3 space-y-2">
                          {/* Submission header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium">
                                {new Date(sub.submittedAt).toLocaleDateString("es-VE", { weekday: "short", day: "numeric", month: "short" })}
                              </span>
                              {isLatest && <Badge variant="outline" className="text-[9px] h-4">Último</Badge>}
                              {needsReview && <Badge className="text-[9px] h-4 bg-amber-100 text-amber-800">Sin revisar</Badge>}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Dolor:</span>
                              <span className={cn("text-sm font-bold", PAIN_COLOR(sub.painLevel))}>{sub.painLevel}/10</span>
                            </div>
                          </div>

                          {/* Photo placeholder */}
                          <div className="flex gap-2">
                            {sub.photos.map((_, pi) => (
                              <div key={pi} className="w-16 h-16 rounded bg-muted flex items-center justify-center border">
                                <Image className="w-5 h-5 text-muted-foreground" />
                              </div>
                            ))}
                          </div>

                          {/* Patient notes */}
                          {sub.notes && (
                            <div className="bg-muted/50 rounded p-2 text-xs">
                              <p className="text-muted-foreground mb-0.5 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Paciente:</p>
                              <p>{sub.notes}</p>
                            </div>
                          )}

                          {/* AI Analysis */}
                          {sub.aiAnalysis && (
                            <div className={cn("rounded p-2 text-xs border", sub.aiAnalysis.deviationDetected ? "border-red-300 bg-red-50 dark:bg-red-950" : "border-primary/20 bg-primary/5")}>
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-3 h-3" />
                                <span className="font-semibold">Análisis IA</span>
                                <span className={cn("font-bold ml-auto",
                                  sub.aiAnalysis.progressScore >= 80 ? "text-green-600" :
                                    sub.aiAnalysis.progressScore >= 60 ? "text-amber-500" :
                                      "text-red-600"
                                )}>
                                  {sub.aiAnalysis.progressScore}% progreso
                                </span>
                              </div>
                              {sub.aiAnalysis.deviationDetected && (
                                <div className="flex items-start gap-1 text-red-700 mb-1">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                  <span className="font-medium">{sub.aiAnalysis.deviationDescription}</span>
                                </div>
                              )}
                              <p className="text-muted-foreground">{sub.aiAnalysis.recommendation}</p>
                            </div>
                          )}

                          {/* Doctor review */}
                          {sub.reviewedAt && (
                            <div className="flex items-start gap-2 text-xs pt-1 border-t">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                              <div>
                                <span className="text-muted-foreground">Revisado {new Date(sub.reviewedAt).toLocaleDateString("es-VE")}</span>
                                {sub.doctorNotes && <p className="font-medium mt-0.5">{sub.doctorNotes}</p>}
                              </div>
                            </div>
                          )}

                          {needsReview && (
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" className="h-6 text-[10px] flex-1">
                                <CheckCircle className="w-3 h-3 mr-1" />Revisar y aprobar
                              </Button>
                              <Button size="sm" variant="outline" className="h-6 text-[10px]">
                                <Calendar className="w-3 h-3 mr-1" />Citar
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {tab === "alerts" && (
                <div className="space-y-2">
                  {selectedCase.alerts.length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />Sin alertas
                    </CardContent></Card>
                  ) : (
                    selectedCase.alerts.map((alert) => (
                      <Card key={alert.id} className={cn("border", ALERT_SEVERITY[alert.severity]?.color, alert.resolved && "opacity-50")}>
                        <CardContent className="pt-3 pb-3 flex items-start gap-3">
                          <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0",
                            alert.severity === "critical" ? "text-red-600" :
                              alert.severity === "warning" ? "text-amber-600" : "text-blue-500"
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] h-4">{ALERT_SEVERITY[alert.severity]?.label}</Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(alert.createdAt).toLocaleDateString("es-VE")}
                              </span>
                              {alert.resolved && <Badge variant="outline" className="text-[10px] h-4 text-green-600">Resuelta</Badge>}
                            </div>
                            <p className="text-xs mt-1">{alert.message}</p>
                          </div>
                          {!alert.resolved && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] shrink-0">Resolver</Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Seleccione un caso para ver timeline y alertas</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
