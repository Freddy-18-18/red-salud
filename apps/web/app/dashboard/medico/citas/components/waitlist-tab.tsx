"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Clock, Phone, CalendarPlus, Bell, CheckCircle2, XCircle, AlertTriangle,
  ArrowUpDown, Filter, Plus, Send, UserPlus
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Badge, Input, ScrollArea
} from "@red-salud/ui";
import type { WaitlistEntry } from "@/types/dental";

// ─── Demo Data ───────────────────────────────────────────────────────────────
const DEMO_WAITLIST: WaitlistEntry[] = [
  {
    id: "1", patientId: "p1", patientName: "María García", patientPhone: "+58 414-1234567",
    procedureType: "Corona dental", estimatedDuration: 60, priority: "high",
    preferredDays: ["monday", "wednesday", "friday"], preferredTimeStart: "08:00", preferredTimeEnd: "12:00",
    status: "waiting", notes: "Paciente con dolor moderado", createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "2", patientId: "p2", patientName: "Carlos Rodríguez", patientPhone: "+58 412-7654321",
    procedureType: "Limpieza profunda", estimatedDuration: 45, priority: "normal",
    preferredDays: ["tuesday", "thursday"], preferredTimeStart: "14:00", preferredTimeEnd: "17:00",
    status: "waiting", notes: "", createdAt: "2026-02-11T14:00:00Z",
  },
  {
    id: "3", patientId: "p3", patientName: "Ana Martínez", patientPhone: "+58 416-1112233",
    procedureType: "Extracción molar", estimatedDuration: 30, priority: "urgent",
    preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    status: "notified", notifiedAt: "2026-02-13T08:00:00Z",
    notes: "Dolor severo, necesita atención pronto", createdAt: "2026-02-12T09:00:00Z",
  },
  {
    id: "4", patientId: "p4", patientName: "Pedro López", patientPhone: "+58 424-4455667",
    procedureType: "Obturación compuesta", estimatedDuration: 30, priority: "low",
    preferredDays: ["friday"], preferredTimeStart: "10:00", preferredTimeEnd: "13:00",
    status: "confirmed", confirmedAt: "2026-02-13T09:30:00Z",
    notes: "", createdAt: "2026-02-08T11:00:00Z",
  },
];

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", icon: AlertTriangle },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", icon: ArrowUpDown },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300", icon: Clock },
  low: { label: "Baja", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300", icon: Clock },
};

const STATUS_CONFIG = {
  waiting: { label: "En espera", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  notified: { label: "Notificado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  confirmed: { label: "Confirmado", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  expired: { label: "Expirado", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" },
};

const DAY_LABELS: Record<string, string> = {
  monday: "Lun", tuesday: "Mar", wednesday: "Mié",
  thursday: "Jue", friday: "Vie", saturday: "Sáb",
};

interface WaitlistTabProps {
  selectedOfficeId: string | null;
  specialtyName?: string;
}

// ─── Waitlist Tab ────────────────────────────────────────────────────────────
export function WaitlistTab({ selectedOfficeId, specialtyName }: WaitlistTabProps) {
  const [entries, setEntries] = useState<WaitlistEntry[]>(DEMO_WAITLIST);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [cancelledSlot, setCancelledSlot] = useState<{ date: string; time: string; duration: number } | null>(null);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => filterStatus === "all" || e.status === filterStatus)
      .filter((e) => filterPriority === "all" || e.priority === filterPriority)
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [entries, filterStatus, filterPriority]);

  // Find matching patients for a cancelled slot
  const matchPatients = (duration: number, dayOfWeek: string, time: string) => {
    return entries.filter((e) => {
      if (e.status !== "waiting") return false;
      if (e.estimatedDuration > duration) return false;
      if (e.preferredDays.length > 0 && !e.preferredDays.includes(dayOfWeek)) return false;
      if (e.preferredTimeStart && time < e.preferredTimeStart) return false;
      if (e.preferredTimeEnd && time > e.preferredTimeEnd) return false;
      return true;
    });
  };

  const notifyPatient = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "notified" as const, notifiedAt: new Date().toISOString() } : e
      )
    );
  };

  const confirmPatient = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "confirmed" as const, confirmedAt: new Date().toISOString() } : e
      )
    );
  };

  const cancelEntry = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "cancelled" as const } : e))
    );
  };

  const stats = useMemo(() => ({
    waiting: entries.filter((e) => e.status === "waiting").length,
    notified: entries.filter((e) => e.status === "notified").length,
    confirmed: entries.filter((e) => e.status === "confirmed").length,
    total: entries.length,
  }), [entries]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Actions - Altura fija */}
      <div className="flex-none px-6 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Lista de Espera Inteligente</h2>
            <p className="text-xs text-muted-foreground">
              Llena automáticamente los espacios por cancelaciones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCancelledSlot({ date: "2026-02-14", time: "10:00", duration: 60 })}
            >
              <CalendarPlus className="w-4 h-4 mr-1" />
              Simular Cancelación
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <UserPlus className="w-4 h-4 mr-1" />
              Agregar Paciente
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4 pb-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="En Espera" value={stats.waiting} color="text-yellow-600" />
            <StatCard label="Notificados" value={stats.notified} color="text-blue-600" />
            <StatCard label="Confirmados" value={stats.confirmed} color="text-green-600" />
            <StatCard label="Total" value={stats.total} color="text-foreground" />
          </div>

          {/* Cancelled Slot Match Panel */}
          {cancelledSlot && (
            <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Bell className="w-4 h-4" />
                  Cancelación detectada — {cancelledSlot.date} a las {cancelledSlot.time} ({cancelledSlot.duration} min)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dayIndex = new Date(cancelledSlot.date).getDay();
                  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                  const matches = matchPatients(cancelledSlot.duration, days[dayIndex] ?? "monday", cancelledSlot.time);

                  if (matches.length === 0) {
                    return <p className="text-sm text-muted-foreground">No se encontraron pacientes compatibles en la lista de espera.</p>;
                  }

                  return (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{matches.length} pacientes compatibles:</p>
                      {matches.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-background border">
                          <div>
                            <span className="font-semibold text-sm">{m.patientName}</span>
                            <span className="text-xs text-muted-foreground ml-2">{m.procedureType} ({m.estimatedDuration} min)</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => notifyPatient(m.id)}>
                              <Send className="w-3 h-3 mr-1" /> Notificar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCancelledSlot(null)}>
                  Cerrar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="all">Todas las prioridades</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <AddToWaitlistForm
              onAdd={(entry) => {
                setEntries((prev) => [entry, ...prev]);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
              specialtyName={specialtyName}
            />
          )}

          {/* Waitlist Table */}
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <WaitlistCard
                key={entry.id}
                entry={entry}
                onNotify={() => notifyPatient(entry.id)}
                onConfirm={() => confirmPatient(entry.id)}
                onCancel={() => cancelEntry(entry.id)}
              />
            ))}
            {filteredEntries.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No hay pacientes en la lista de espera</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Waitlist Card ───────────────────────────────────────────────────────────
function WaitlistCard({
  entry,
  onNotify,
  onConfirm,
  onCancel,
}: {
  entry: WaitlistEntry;
  onNotify: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const priorityCfg = PRIORITY_CONFIG[entry.priority];
  const statusCfg = STATUS_CONFIG[entry.status];
  const PriorityIcon = priorityCfg.icon;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold">{entry.patientName}</span>
              <Badge className={cn("text-xs", priorityCfg.color)}>
                <PriorityIcon className="w-3 h-3 mr-1" />
                {priorityCfg.label}
              </Badge>
              <Badge className={cn("text-xs", statusCfg.color)}>{statusCfg.label}</Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{entry.procedureType}</span>
              <span>{entry.estimatedDuration} min</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{entry.patientPhone}</span>
            </div>
            {entry.preferredDays.length > 0 && (
              <div className="flex gap-1 mt-1">
                {entry.preferredDays.map((d) => (
                  <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium">
                    {DAY_LABELS[d] || d}
                  </span>
                ))}
                {entry.preferredTimeStart && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium">
                    {entry.preferredTimeStart}-{entry.preferredTimeEnd}
                  </span>
                )}
              </div>
            )}
            {entry.notes && <p className="text-xs text-muted-foreground italic mt-1">{entry.notes}</p>}
          </div>

          <div className="flex gap-1 shrink-0">
            {entry.status === "waiting" && (
              <Button size="sm" variant="outline" onClick={onNotify}>
                <Send className="w-3 h-3 mr-1" /> Notificar
              </Button>
            )}
            {entry.status === "notified" && (
              <Button size="sm" onClick={onConfirm}>
                <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmar
              </Button>
            )}
            {(entry.status === "waiting" || entry.status === "notified") && (
              <Button size="sm" variant="ghost" onClick={onCancel}>
                <XCircle className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Add Form ────────────────────────────────────────────────────────────────
function AddToWaitlistForm({
  onAdd,
  onCancel,
  specialtyName,
}: {
  onAdd: (entry: WaitlistEntry) => void;
  onCancel: () => void;
  specialtyName?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [procedure, setProcedure] = useState("");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<WaitlistEntry["priority"]>("normal");
  
  // Campos dentales
  const [procedureCode, setProcedureCode] = useState("");
  const [toothNumbers, setToothNumbers] = useState<number[]>([]);
  const [requiresAnesthesia, setRequiresAnesthesia] = useState(false);

  const isOdontology = specialtyName?.toLowerCase().includes("odonto") || 
                       specialtyName?.toLowerCase().includes("dental");

  const handleSubmit = () => {
    onAdd({
      id: crypto.randomUUID(),
      patientId: "",
      patientName: name,
      patientPhone: phone,
      procedureType: procedure,
      estimatedDuration: duration,
      priority,
      preferredDays: [],
      status: "waiting",
      notes: "",
      createdAt: new Date().toISOString(),
      // Campos dentales opcionales
      procedureCode: isOdontology ? procedureCode : undefined,
      toothNumbers: isOdontology && toothNumbers.length > 0 ? toothNumbers : undefined,
      requiresAnesthesia: isOdontology ? requiresAnesthesia : undefined,
    });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Agregar a Lista de Espera</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Nombre del paciente" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Procedimiento" value={procedure} onChange={(e) => setProcedure(e.target.value)} />
          <Input 
            type="number" 
            placeholder="Duración (min)" 
            value={duration} 
            onChange={(e) => setDuration(parseInt(e.target.value) || 30)} 
          />
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as WaitlistEntry["priority"])} 
            className="border rounded px-2 py-1 text-sm bg-background"
          >
            <option value="low">Baja</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
          
          {/* Campos Dentales */}
          {isOdontology && (
            <>
              <Input 
                placeholder="Código de procedimiento (ej: REST-001)" 
                value={procedureCode} 
                onChange={(e) => setProcedureCode(e.target.value)} 
              />
              <Input 
                placeholder="Dientes (11,12,13...)" 
                value={toothNumbers.join(",")} 
                onChange={(e) => {
                  const nums = e.target.value.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                  setToothNumbers(nums);
                }} 
              />
              <label className="flex items-center gap-2 px-2 py-1 text-sm">
                <input 
                  type="checkbox" 
                  checked={requiresAnesthesia} 
                  onChange={(e) => setRequiresAnesthesia(e.target.checked)}
                  className="rounded"
                />
                Requiere anestesia
              </label>
            </>
          )}
          
          <div className="flex gap-2 md:col-span-3">
            <Button size="sm" onClick={handleSubmit} disabled={!name || !procedure}>
              <Plus className="w-4 h-4 mr-1" /> Agregar
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border p-3 bg-card text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-bold mt-1", color)}>{value}</p>
    </div>
  );
}
