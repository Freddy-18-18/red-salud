"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock,
  ArrowLeft, Search, Brain, Users, Calendar, TrendingUp,
  MessageSquare, Star, Play, FileText, BarChart3
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge, Input
} from "@red-salud/ui";
import Link from "next/link";
import type { CallRecord } from "@/types/dental";

// ─── Demo Call Records ───────────────────────────────────────────────────────
const DEMO_CALLS: CallRecord[] = [
  {
    id: "call-1",
    patientId: "p1", patientName: "María García",
    direction: "inbound",
    callerNumber: "+58 414-1234567",
    phoneNumber: "+58 414-1234567",
    startTime: "2026-02-13T09:15:00",
    endTime: "2026-02-13T09:22:00",
    duration: 420,
    status: "completed",
    recordingUrl: "/recordings/call-1.mp3",
    transcription: "Paciente llama para reprogramar cita del viernes. Menciona dolor leve en zona del molar inferior izquierdo. Se reprograma para el lunes a las 10am. Paciente pregunta si debe tomar algún analgésico.",
    aiSummary: "Reprogramación de cita + dolor molar inferior izquierdo",
    aiSentiment: "neutral",
    aiFollowUp: ["Verificar cita lunes 10am", "Preparar evaluación molar inferior izquierdo", "Considerar radiografía periapical"],
    aiKeywords: ["reprogramar", "dolor molar", "analgésico"],
    assignedTo: "Secretaria Ana",
    notes: "",
    createdAt: "2026-02-13T09:15:00",
  },
  {
    id: "call-2",
    patientId: "p2", patientName: "Carlos Fernández",
    direction: "outbound",
    callerNumber: "+58 424-9876543",
    phoneNumber: "+58 424-9876543",
    startTime: "2026-02-13T10:30:00",
    endTime: "2026-02-13T10:35:00",
    duration: 300,
    status: "completed",
    recordingUrl: "/recordings/call-2.mp3",
    transcription: "Llamada de seguimiento post-operatorio. Paciente reporta inflamación moderada pero sin dolor intenso. Se confirma que está tomando antibióticos según indicación. Próximo control en 5 días.",
    aiSummary: "Seguimiento post-op: inflamación moderada, sin dolor, antibióticos OK",
    aiSentiment: "positive",
    aiFollowUp: ["Agendar control en 5 días", "Verificar adherencia antibióticos"],
    aiKeywords: ["seguimiento", "post-operatorio", "inflamación", "antibióticos"],
    assignedTo: "Dr. López",
    notes: "Paciente cooperativo",
    createdAt: "2026-02-13T10:30:00",
  },
  {
    id: "call-3",
    patientId: "p3", patientName: "Ana Rodríguez",
    direction: "inbound",
    callerNumber: "+58 412-5551234",
    phoneNumber: "+58 412-5551234",
    startTime: "2026-02-13T11:00:00",
    duration: 0,
    status: "missed",
    assignedTo: "Secretaria Ana",
    createdAt: "2026-02-13T11:00:00",
  },
  {
    id: "call-4",
    patientId: "p4", patientName: "Luis Mendoza",
    direction: "inbound",
    callerNumber: "+58 416-7778899",
    phoneNumber: "+58 416-7778899",
    startTime: "2026-02-13T13:45:00",
    endTime: "2026-02-13T13:58:00",
    duration: 780,
    status: "completed",
    recordingUrl: "/recordings/call-4.mp3",
    transcription: "Paciente muy molesto por tiempo de espera para su prótesis. Expresa frustración con el laboratorio. Se explica que hubo un retraso en el material. Se ofrece descuento del 10% y se confirma fecha de entrega para el viernes.",
    aiSummary: "Queja por retraso en prótesis — ofrecido 10% descuento — entrega viernes",
    aiSentiment: "negative",
    aiFollowUp: ["Confirmar con laboratorio entrega viernes", "Aplicar descuento 10%", "Llamar al paciente el jueves para confirmar"],
    aiKeywords: ["queja", "retraso", "prótesis", "descuento", "laboratorio"],
    assignedTo: "Secretaria Ana",
    notes: "Paciente insatisfecho, manejar con cuidado",
    createdAt: "2026-02-13T13:45:00",
  },
  {
    id: "call-5",
    patientId: undefined, patientName: "Desconocido",
    direction: "inbound",
    callerNumber: "+58 414-0001111",
    phoneNumber: "+58 414-0001111",
    startTime: "2026-02-13T15:00:00",
    endTime: "2026-02-13T15:08:00",
    duration: 480,
    status: "completed",
    transcription: "Nuevo paciente interesado en blanqueamiento dental y precios. Se explican opciones: blanqueamiento en consultorio ($200) y blanqueamiento con férulas ($150). Solicita cita para evaluación.",
    aiSummary: "Nuevo paciente — interés en blanqueamiento — agendar evaluación",
    aiSentiment: "positive",
    aiFollowUp: ["Agendar evaluación nuevo paciente", "Enviar información de precios por WhatsApp"],
    aiKeywords: ["nuevo paciente", "blanqueamiento", "precios", "evaluación"],
    assignedTo: "Secretaria Ana",
    createdAt: "2026-02-13T15:00:00",
  },
];

const DIRECTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  inbound: { label: "Entrante", icon: <PhoneIncoming className="w-4 h-4" />, color: "text-blue-500" },
  outbound: { label: "Saliente", icon: <PhoneOutgoing className="w-4 h-4" />, color: "text-green-500" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  completed: { label: "Completada", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  missed: { label: "Perdida", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  voicemail: { label: "Buzón", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  in_progress: { label: "En curso", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
};

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  positive: { label: "Positivo", color: "text-green-600", icon: "😊" },
  neutral: { label: "Neutral", color: "text-gray-500", icon: "😐" },
  negative: { label: "Negativo", color: "text-red-600", icon: "😟" },
};

export default function VoIPDashboardPage() {
  const [calls] = useState(DEMO_CALLS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDirection, setFilterDirection] = useState("all");

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      const matchSearch = !searchTerm ||
        c.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phoneNumber ?? c.callerNumber).includes(searchTerm);
      const matchDir = filterDirection === "all" || c.direction === filterDirection;
      return matchSearch && matchDir;
    });
  }, [calls, searchTerm, filterDirection]);

  const selected = selectedId ? calls.find((c) => c.id === selectedId) : null;

  const stats = useMemo(() => ({
    total: calls.length,
    completed: calls.filter((c) => c.status === "completed").length,
    missed: calls.filter((c) => c.status === "missed").length,
    avgDuration: Math.round(calls.filter((c) => c.duration > 0).reduce((s, c) => s + c.duration, 0) / Math.max(1, calls.filter((c) => c.duration > 0).length)),
    positive: calls.filter((c) => c.aiSentiment === "positive").length,
    negative: calls.filter((c) => c.aiSentiment === "negative").length,
    pendingFollowups: calls.flatMap((c) => c.aiFollowUp || []).length,
  }), [calls]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/medico">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Phone className="w-6 h-6 text-primary" />
            VoIP &amp; Call Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">Inteligencia de llamadas con transcripción y análisis de IA</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3"><Phone className="w-5 h-5 text-blue-500" /><div><p className="text-xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total hoy</p></div></CardContent></Card>
        <Card className={cn(stats.missed > 0 && "border-red-300")}><CardContent className="pt-3 pb-3 flex items-center gap-3"><PhoneMissed className="w-5 h-5 text-red-500" /><div><p className={cn("text-xl font-bold", stats.missed > 0 && "text-red-600")}>{stats.missed}</p><p className="text-xs text-muted-foreground">Perdidas</p></div></CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3"><Clock className="w-5 h-5 text-amber-500" /><div><p className="text-xl font-bold">{formatDuration(stats.avgDuration)}</p><p className="text-xs text-muted-foreground">Duración prom.</p></div></CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3"><Brain className="w-5 h-5 text-purple-500" /><div><p className="text-xl font-bold">{stats.pendingFollowups}</p><p className="text-xs text-muted-foreground">Seguimientos</p></div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o número..." />
        </div>
        <select value={filterDirection} onChange={(e) => setFilterDirection(e.target.value)} className="border rounded px-3 py-2 text-sm bg-background">
          <option value="all">Todas</option>
          <option value="inbound">Entrantes</option>
          <option value="outbound">Salientes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Call List */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.map((call) => {
            const dir = DIRECTION_CONFIG[call.direction];
            const st = STATUS_CONFIG[call.status];
            const sentiment = call.aiSentiment ? SENTIMENT_CONFIG[call.aiSentiment] : null;
            return (
              <Card
                key={call.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  selectedId === call.id && "ring-2 ring-primary",
                  call.status === "missed" && "border-red-200"
                )}
                onClick={() => setSelectedId(call.id === selectedId ? null : call.id)}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("shrink-0", dir?.color)}>{dir?.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{call.patientName}</span>
                        {sentiment && <span className="text-xs">{sentiment.icon}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{call.phoneNumber ?? call.callerNumber}</p>
                      {call.aiSummary && <p className="text-xs text-primary mt-0.5 truncate">{call.aiSummary}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={cn("text-[10px]", st?.color)}>{st?.label}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(call.startTime ?? call.createdAt ?? "").toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                        {call.duration > 0 && ` • ${formatDuration(call.duration)}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="space-y-4">
              {/* Call Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={DIRECTION_CONFIG[selected.direction]?.color}>
                        {DIRECTION_CONFIG[selected.direction]?.icon}
                      </span>
                      {selected.patientName}
                    </span>
                    <Badge className={cn("text-[10px]", STATUS_CONFIG[selected.status]?.color)}>
                      {STATUS_CONFIG[selected.status]?.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div><p className="text-muted-foreground">Teléfono</p><p className="font-medium">{selected.phoneNumber ?? selected.callerNumber}</p></div>
                    <div><p className="text-muted-foreground">Inicio</p><p className="font-medium">{new Date(selected.startTime ?? selected.createdAt ?? "").toLocaleTimeString("es-VE")}</p></div>
                    <div><p className="text-muted-foreground">Duración</p><p className="font-medium">{selected.duration > 0 ? formatDuration(selected.duration) : "N/A"}</p></div>
                    <div><p className="text-muted-foreground">Asignado</p><p className="font-medium">{selected.assignedTo || "N/A"}</p></div>
                  </div>

                  {selected.recordingUrl && (
                    <div className="bg-muted/50 p-2 rounded flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-7"><Play className="w-4 h-4" /></Button>
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-full rounded-full w-0" />
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDuration(selected.duration)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Analysis */}
              {selected.transcription && (
                <>
                  {/* Transcription */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />Transcripción
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{selected.transcription}</p>
                    </CardContent>
                  </Card>

                  {/* AI Summary */}
                  <Card className="border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-1">
                        <Brain className="w-4 h-4 text-primary" />Análisis IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Resumen: </span>
                          <span className="font-medium">{selected.aiSummary}</span>
                        </div>
                      </div>

                      {selected.aiSentiment && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Sentimiento:</span>
                          <span className={cn("font-medium", SENTIMENT_CONFIG[selected.aiSentiment]?.color)}>
                            {SENTIMENT_CONFIG[selected.aiSentiment]?.icon} {SENTIMENT_CONFIG[selected.aiSentiment]?.label}
                          </span>
                        </div>
                      )}

                      {selected.aiKeywords && selected.aiKeywords.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-xs text-muted-foreground mr-1">Palabras clave:</span>
                          {selected.aiKeywords.map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{kw}</Badge>
                          ))}
                        </div>
                      )}

                      {selected.aiFollowUp && selected.aiFollowUp.length > 0 && (
                        <div className="border-t pt-2">
                          <p className="text-xs font-semibold mb-1">Seguimientos sugeridos por IA:</p>
                          <ul className="space-y-1">
                            {selected.aiFollowUp.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs">
                                <input type="checkbox" className="mt-0.5 w-3 h-3" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {selected.status === "missed" && (
                <Card className="border-red-300">
                  <CardContent className="pt-4 text-center">
                    <PhoneMissed className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Llamada perdida</p>
                    <p className="text-xs text-muted-foreground mb-3">Devolver la llamada lo antes posible</p>
                    <Button size="sm"><PhoneOutgoing className="w-4 h-4 mr-1" />Devolver Llamada</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Seleccione una llamada para ver detalles y análisis IA</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
