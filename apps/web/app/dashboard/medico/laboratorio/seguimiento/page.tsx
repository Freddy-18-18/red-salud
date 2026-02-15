"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  FlaskConical, Plus, Eye, Clock, CheckCircle2, ArrowLeft,
  ChevronRight, Package, Truck, AlertTriangle, Search
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge, Input
} from "@red-salud/ui";
import Link from "next/link";
import type { LabCase, LabCaseStatus, LabCaseEvent } from "@/types/dental";

// ─── Status Pipeline ─────────────────────────────────────────────────────────
const STATUS_PIPELINE: Array<{ key: LabCaseStatus; label: string; color: string }> = [
  { key: "impression_sent", label: "Impresión enviada", color: "bg-blue-500" },
  { key: "received_by_lab", label: "Recibido en lab", color: "bg-indigo-500" },
  { key: "in_fabrication", label: "En fabricación", color: "bg-yellow-500" },
  { key: "quality_check", label: "Control calidad", color: "bg-orange-500" },
  { key: "shipped", label: "Enviado", color: "bg-cyan-500" },
  { key: "received_by_clinic", label: "Recibido en clínica", color: "bg-teal-500" },
  { key: "try_in", label: "Prueba", color: "bg-purple-500" },
  { key: "adjustment", label: "Ajuste", color: "bg-pink-500" },
  { key: "seated", label: "Instalado", color: "bg-green-500" },
  { key: "rejected", label: "Rechazado", color: "bg-red-500" },
];

const STATUS_MAP = Object.fromEntries(STATUS_PIPELINE.map((s) => [s.key, s]));

// ─── Demo Data ───────────────────────────────────────────────────────────────
const DEMO_CASES: LabCase[] = [
  {
    id: "lc-1",
    patientId: "p1", patientName: "María García",
    doctorId: "d1",
    labId: "lab-1", labName: "Dental Lab Plus",
    type: "Corona porcelana",
    toothNumbers: [14],
    shade: "A2",
    material: "Zirconia",
    status: "in_fabrication",
    priority: "normal",
    sentDate: "2026-02-10",
    expectedDate: "2026-02-20",
    notes: "Verificar espacio oclusal",
    events: [
      { id: "e1", date: "2026-02-10T09:00:00", status: "impression_sent", note: "Impresión digital enviada", by: "Dr. López" },
      { id: "e2", date: "2026-02-11T14:30:00", status: "received_by_lab", note: "Recibido y procesado", by: "Lab Tech" },
      { id: "e3", date: "2026-02-12T08:00:00", status: "in_fabrication", note: "Inicio fabricación zirconia", by: "Lab Tech" },
    ],
    createdAt: "2026-02-10T09:00:00",
  },
  {
    id: "lc-2",
    patientId: "p2", patientName: "Carlos Fernández",
    doctorId: "d1",
    labId: "lab-2", labName: "ProDent Lab",
    type: "Puente 3 unidades",
    toothNumbers: [21, 22, 23],
    shade: "B1",
    material: "Porcelana sobre metal",
    status: "quality_check",
    priority: "high",
    sentDate: "2026-02-05",
    expectedDate: "2026-02-15",
    events: [
      { id: "e4", date: "2026-02-05T10:00:00", status: "impression_sent", note: "", by: "Dr. López" },
      { id: "e5", date: "2026-02-06T11:00:00", status: "received_by_lab", note: "", by: "Lab" },
      { id: "e6", date: "2026-02-08T09:00:00", status: "in_fabrication", note: "", by: "Lab" },
      { id: "e7", date: "2026-02-13T16:00:00", status: "quality_check", note: "Revisión final", by: "Lab QC" },
    ],
    createdAt: "2026-02-05T10:00:00",
  },
  {
    id: "lc-3",
    patientId: "p3", patientName: "Ana Rodríguez",
    doctorId: "d1",
    labId: "lab-1", labName: "Dental Lab Plus",
    type: "Carillas porcelana (x4)",
    toothNumbers: [11, 12, 21, 22],
    shade: "A1",
    material: "Disilicato de litio",
    status: "shipped",
    priority: "normal",
    sentDate: "2026-02-01",
    expectedDate: "2026-02-14",
    events: [
      { id: "e8", date: "2026-02-01T10:00:00", status: "impression_sent", note: "", by: "Dr. López" },
      { id: "e12", date: "2026-02-12T09:00:00", status: "shipped", note: "Tracking: VEN123456", by: "Lab" },
    ],
    createdAt: "2026-02-01T10:00:00",
  },
  {
    id: "lc-4",
    patientId: "p4", patientName: "Luis Mendoza",
    doctorId: "d1",
    labId: "lab-2", labName: "ProDent Lab",
    type: "PPR Cromo-cobalto",
    toothNumbers: [35, 36, 37],
    material: "Cromo-cobalto",
    status: "seated",
    priority: "low",
    sentDate: "2026-01-20",
    expectedDate: "2026-02-10",
    events: [
      { id: "e13", date: "2026-01-20T10:00:00", status: "impression_sent", note: "", by: "Dr. López" },
      { id: "e17", date: "2026-02-12T11:00:00", status: "seated", note: "Paciente satisfecho", by: "Dr. López" },
    ],
    createdAt: "2026-01-20T10:00:00",
  },
];

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  normal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export default function LabTrackingPage() {
  const [cases, setCases] = useState(DEMO_CASES);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      const matchSearch = !searchTerm || 
        c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.type ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.labName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [cases, filterStatus, searchTerm]);

  const activeCase = selectedCase ? cases.find((c) => c.id === selectedCase) : null;

  const stats = useMemo(() => ({
    active: cases.filter((c) => !["seated", "rejected"].includes(c.status)).length,
    overdue: cases.filter((c) => c.expectedDate && new Date(c.expectedDate) < new Date() && !["seated", "rejected"].includes(c.status)).length,
    completed: cases.filter((c) => c.status === "seated").length,
  }), [cases]);

  const updateCaseStatus = (caseId: string, newStatus: LabCaseStatus) => {
    setCases((prev) => prev.map((c) => {
      if (c.id !== caseId) return c;
      const event: LabCaseEvent = {
        id: `e-${Date.now()}`,
        date: new Date().toISOString(),
        status: newStatus,
        note: "",
        by: "Dr. López",
      };
      return { ...c, status: newStatus, events: [...(c.events ?? []), event] };
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/medico">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-primary" />
              Casos de Laboratorio
            </h1>
            <p className="text-sm text-muted-foreground">Seguimiento de trabajos del laboratorio dental</p>
          </div>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" />Nuevo Caso</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Activos" value={stats.active} icon={<Package className="w-4 h-4 text-blue-500" />} />
        <StatCard label="Atrasados" value={stats.overdue} icon={<AlertTriangle className="w-4 h-4 text-red-500" />} highlight={stats.overdue > 0} />
        <StatCard label="Completados" value={stats.completed} icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar paciente, tipo o laboratorio..." />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-3 py-2 text-sm bg-background">
          <option value="all">Todos los estados</option>
          {STATUS_PIPELINE.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-3 space-y-2">
          {filtered.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No se encontraron casos.</CardContent></Card>
          )}
          {filtered.map((c) => {
            const statusInfo = STATUS_MAP[c.status];
            const isOverdue = c.expectedDate && new Date(c.expectedDate) < new Date() && !["seated", "rejected"].includes(c.status);
            return (
              <Card
                key={c.id}
                className={cn("cursor-pointer transition-all hover:shadow-md", selectedCase === c.id && "ring-2 ring-primary", isOverdue && "border-red-300")}
                onClick={() => setSelectedCase(c.id === selectedCase ? null : c.id)}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{c.patientName}</span>
                        <Badge className={cn("text-[10px]", PRIORITY_STYLES[c.priority ?? "normal"])}>{c.priority ?? "normal"}</Badge>
                        {isOverdue && <Badge variant="destructive" className="text-[10px]">Atrasado</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{c.type ?? ""} — Dientes: {(c.toothNumbers ?? []).join(", ")} — {c.material || ""}</p>
                      <p className="text-xs text-muted-foreground">{c.labName} {c.shade ? `• Color: ${c.shade}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={cn("text-[10px] text-white", statusInfo?.color)}>{statusInfo?.label}</Badge>
                      {c.expectedDate && (
                        <p className={cn("text-[10px] mt-1", isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground")}>
                          {isOverdue ? "Vencido: " : "Entrega: "}{c.expectedDate}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Pipeline mini */}
                  <div className="flex gap-0.5 mt-2">
                    {STATUS_PIPELINE.filter((s) => s.key !== "rejected").map((s) => {
                      const idx = STATUS_PIPELINE.findIndex((sp) => sp.key === s.key);
                      const currentIdx = STATUS_PIPELINE.findIndex((sp) => sp.key === c.status);
                      return (<div key={s.key} className={cn("h-1.5 flex-1 rounded-full", idx <= currentIdx ? statusInfo?.color : "bg-muted")} title={s.label} />);
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {activeCase ? (
            <Card className="sticky top-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Detalle del Caso</span>
                  <Badge className={cn("text-[10px] text-white", STATUS_MAP[activeCase.status]?.color)}>{STATUS_MAP[activeCase.status]?.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-muted-foreground">Paciente</p><p className="font-medium">{activeCase.patientName}</p></div>
                  <div><p className="text-muted-foreground">Laboratorio</p><p className="font-medium">{activeCase.labName}</p></div>
                  <div><p className="text-muted-foreground">Tipo</p><p className="font-medium">{activeCase.type ?? "N/A"}</p></div>
                  <div><p className="text-muted-foreground">Material</p><p className="font-medium">{activeCase.material || "N/A"}</p></div>
                  <div><p className="text-muted-foreground">Dientes</p><p className="font-medium">{(activeCase.toothNumbers ?? []).join(", ")}</p></div>
                  <div><p className="text-muted-foreground">Color</p><p className="font-medium">{activeCase.shade || "N/A"}</p></div>
                  <div><p className="text-muted-foreground">Enviado</p><p className="font-medium">{activeCase.sentDate}</p></div>
                  <div><p className="text-muted-foreground">Entrega</p><p className="font-medium">{activeCase.expectedDate || "Sin fecha"}</p></div>
                </div>
                {activeCase.notes && (
                  <div className="text-xs bg-muted/50 p-2 rounded"><p className="text-muted-foreground mb-0.5">Notas:</p><p>{activeCase.notes}</p></div>
                )}
                {/* Timeline */}
                <div>
                  <p className="text-xs font-semibold mb-2">Historial</p>
                  <div className="space-y-2 border-l-2 border-muted pl-3">
                    {(activeCase.events ?? []).map((ev) => (
                      <div key={ev.id} className="relative">
                        <div className={cn("absolute -left-[17px] w-2.5 h-2.5 rounded-full border-2 border-background", STATUS_MAP[ev.status]?.color)} />
                        <p className="text-xs font-medium">{STATUS_MAP[ev.status]?.label}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(ev.date ?? ev.timestamp ?? "").toLocaleString("es-VE")} • {ev.by ?? ev.updatedBy ?? ""}</p>
                        {ev.note && <p className="text-[10px]">{ev.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                {!["seated", "rejected"].includes(activeCase.status) && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-semibold">Avanzar estado</p>
                    <div className="flex flex-wrap gap-1">
                      {STATUS_PIPELINE
                        .filter((s) => {
                          const curr = STATUS_PIPELINE.findIndex((sp) => sp.key === activeCase.status);
                          const target = STATUS_PIPELINE.findIndex((sp) => sp.key === s.key);
                          return target === curr + 1 || s.key === "rejected";
                        })
                        .map((s) => (
                          <Button key={s.key} size="sm" variant={s.key === "rejected" ? "destructive" : "outline"} className="text-xs" onClick={() => updateCaseStatus(activeCase.id, s.key)}>
                            {s.label}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Eye className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Seleccione un caso para ver detalles</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <Card className={cn(highlight && "border-red-300")}>
      <CardContent className="pt-3 pb-3 flex items-center gap-3">
        {icon}
        <div>
          <p className={cn("text-xl font-bold", highlight && "text-red-600")}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
