"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { subscribeToCancellationEvents } from "@/lib/supabase/services/reminder-service";
import { cn } from "@red-salud/core/utils";
import {
  Clock, Phone, CalendarPlus, Bell, CheckCircle2, XCircle, AlertTriangle,
  ArrowUpDown, Filter, Plus, Send, UserPlus, Loader2, Trash2, RefreshCw,
  Search, X, User,
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Badge, Input, ScrollArea,
} from "@red-salud/design-system";
import type { WaitlistEntry } from "@/types/dental";
import { useWaitlist, type WaitlistPatientOption } from "@/hooks/use-waitlist";
import { createClient } from "@/lib/supabase/client";
import type { CreateWaitlistInput } from "@/lib/supabase/services/waitlist-service";
import { validateCedulaWithCNE } from "@/lib/services/cedula-validation";

const supabase = createClient();

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", icon: AlertTriangle },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", icon: ArrowUpDown },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300", icon: Clock },
  low: { label: "Baja", color: "bg-gray-100 text-gray-800 dark:bg-black/80 dark:text-gray-300", icon: Clock },
};

const STATUS_CONFIG = {
  waiting: { label: "En espera", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  notified: { label: "Notificado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  confirmed: { label: "Confirmado", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  expired: { label: "Expirado", color: "bg-gray-100 text-gray-500 dark:bg-black/80 dark:text-gray-400" },
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

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

// ─── Waitlist Tab ─────────────────────────────────────────────────────────────
export function WaitlistTab({ selectedOfficeId, specialtyName }: WaitlistTabProps) {
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setDoctorId(user.id);
    });
  }, []);

  const {
    entries, loading, error, stats,
    patients, loadingPatients,
    load, loadPatients,
    addEntry, notify, confirm, cancel, remove,
  } = useWaitlist(doctorId, selectedOfficeId);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [cancelledSlot, setCancelledSlot] = useState<{ date: string; time: string; duration: number } | null>(null);
  const cancellationChannelRef = useRef<ReturnType<typeof subscribeToCancellationEvents> | null>(null);

  // ── Auto-promote waitlist on cancellation ─────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;
    cancellationChannelRef.current = subscribeToCancellationEvents(doctorId, (event) => {
      setCancelledSlot({
        date:     event.slot_date as string,
        time:     event.slot_time as string,
        duration: event.duration_minutes as number,
      });
    });
    return () => { cancellationChannelRef.current?.unsubscribe(); };
  }, [doctorId]);

  useEffect(() => {
    if (showAddForm) void loadPatients();
  }, [showAddForm, loadPatients]);

  const filteredEntries = useMemo(() =>
    entries
      .filter((e) => filterStatus === "all" || e.status === filterStatus)
      .filter((e) => filterPriority === "all" || e.priority === filterPriority)
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)),
    [entries, filterStatus, filterPriority]
  );

  const matchPatients = (duration: number, dayOfWeek: string, time: string) =>
    entries.filter((e) => {
      if (e.status !== "waiting") return false;
      if (e.estimatedDuration > duration) return false;
      if (e.preferredDays.length > 0 && !e.preferredDays.includes(dayOfWeek)) return false;
      if (e.preferredTimeStart && time < e.preferredTimeStart) return false;
      if (e.preferredTimeEnd && time > e.preferredTimeEnd) return false;
      return true;
    });

  const handleAddEntry = async (input: Omit<CreateWaitlistInput, "doctorId">) => {
    const { error: err } = await addEntry(input);
    if (!err) setShowAddForm(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Lista de Espera Inteligente</h2>
            <p className="text-xs text-muted-foreground">Llena automáticamente los espacios por cancelaciones</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} title="Actualizar">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => setCancelledSlot({ date: new Date().toISOString().slice(0, 10), time: "10:00", duration: 60 })}
            >
              <CalendarPlus className="w-4 h-4 mr-1" /> Espacio liberado
            </Button>
            <Button size="sm" onClick={() => setShowAddForm((v) => !v)}>
              <UserPlus className="w-4 h-4 mr-1" /> Agregar Paciente
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4 pb-6">

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-2">{error}</div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="En Espera"  value={stats.waiting}   color="text-yellow-600" />
            <StatCard label="Notificados" value={stats.notified}  color="text-blue-600"   />
            <StatCard label="Confirmados" value={stats.confirmed} color="text-green-600"  />
            <StatCard label="Total"       value={stats.total}     color="text-foreground" />
          </div>

          {/* Freed slot match panel */}
          {cancelledSlot && (
            <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Bell className="w-4 h-4" />
                  Espacio disponible — {cancelledSlot.date} a las {cancelledSlot.time} ({cancelledSlot.duration} min)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dayIndex = new Date(cancelledSlot.date.replace(/-/g, "/")).getDay();
                  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                  const matches = matchPatients(cancelledSlot.duration, days[dayIndex] ?? "monday", cancelledSlot.time);
                  if (matches.length === 0) return <p className="text-sm text-muted-foreground">No hay pacientes compatibles en lista de espera.</p>;
                  return (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{matches.length} paciente(s) compatible(s):</p>
                      {matches.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-background border">
                          <div>
                            <span className="font-semibold text-sm">{m.patientName}</span>
                            <span className="text-xs text-muted-foreground ml-2">{m.procedureType} ({m.estimatedDuration} min)</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => void notify(m.id)}>
                            <Send className="w-3 h-3 mr-1" /> Notificar
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCancelledSlot(null)}>Cerrar</Button>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-2 py-1 text-sm bg-background">
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="border rounded px-2 py-1 text-sm bg-background">
              <option value="all">Todas las prioridades</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
          </div>

          {/* Add form */}
          {showAddForm && (
            <AddToWaitlistForm
              patients={patients}
              loadingPatients={loadingPatients}
              specialtyName={specialtyName}
              officeId={selectedOfficeId}
              onAdd={handleAddEntry}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No hay pacientes en lista de espera</p>
              <p className="text-xs mt-1">Agrega pacientes usando el botón de arriba</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map((entry) => (
                <WaitlistCard
                  key={entry.id}
                  entry={entry}
                  onNotify={() => void notify(entry.id)}
                  onConfirm={() => void confirm(entry.id)}
                  onCancel={() => void cancel(entry.id)}
                  onDelete={() => void remove(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Waitlist Card ────────────────────────────────────────────────────────────
function WaitlistCard({
  entry,
  onNotify,
  onConfirm,
  onCancel,
  onDelete,
}: {
  entry: WaitlistEntry;
  onNotify: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const priorityCfg = PRIORITY_CONFIG[entry.priority];
  const statusCfg = STATUS_CONFIG[entry.status];
  const PriorityIcon = priorityCfg.icon;
  const isActive = entry.status === "waiting" || entry.status === "notified";

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
              {entry.patientPhone && (
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{entry.patientPhone}</span>
              )}
            </div>
            {entry.preferredDays.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {entry.preferredDays.map((d) => (
                  <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium">
                    {DAY_LABELS[d] || d}
                  </span>
                ))}
                {entry.preferredTimeStart && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium">
                    {entry.preferredTimeStart}–{entry.preferredTimeEnd}
                  </span>
                )}
              </div>
            )}
            {(entry.toothNumbers?.length || entry.procedureCode) && (
              <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                {entry.procedureCode && <span>Cód: {entry.procedureCode}</span>}
                {(entry.toothNumbers?.length ?? 0) > 0 && <span>Dientes: {entry.toothNumbers!.join(", ")}</span>}
                {entry.requiresAnesthesia && <span className="text-amber-600">• Requiere anestesia</span>}
              </div>
            )}
            {entry.notes && <p className="text-xs text-muted-foreground italic mt-1">{entry.notes}</p>}
            {entry.notifiedAt && (
              <p className="text-[10px] text-muted-foreground">
                Notificado: {new Date(entry.notifiedAt).toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" })}
              </p>
            )}
            {entry.confirmedAt && (
              <p className="text-[10px] text-muted-foreground">
                Confirmado: {new Date(entry.confirmedAt).toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" })}
              </p>
            )}
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
            {isActive ? (
              <Button size="sm" variant="ghost" onClick={onCancel} title="Cancelar">
                <XCircle className="w-3 h-3" />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={onDelete} title="Eliminar">
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Add Form ─────────────────────────────────────────────────────────────────
function AddToWaitlistForm({
  patients,
  loadingPatients,
  specialtyName,
  officeId,
  onAdd,
  onCancel,
}: {
  patients: WaitlistPatientOption[];
  loadingPatients: boolean;
  specialtyName?: string;
  officeId?: string | null;
  onAdd: (input: Omit<CreateWaitlistInput, "doctorId">) => Promise<void>;
  onCancel: () => void;
}) {
  const isOdontology = Boolean(
    specialtyName?.toLowerCase().includes("odonto") ||
    specialtyName?.toLowerCase().includes("dental")
  );

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [cedulaInput, setCedulaInput] = useState("");
  const [foundName, setFoundName] = useState<string | null>(null);
  const [searchingCedula, setSearchingCedula] = useState(false);
  const [cedulaNotFound, setCedulaNotFound] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const cedulaTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [procedure, setProcedure] = useState("");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<WaitlistEntry["priority"]>("normal");
  const [notes, setNotes] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [procedureCode, setProcedureCode] = useState("");
  const [toothNumbers, setToothNumbers] = useState<number[]>([]);
  const [requiresAnesthesia, setRequiresAnesthesia] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const resolvedName = selectedPatient?.name || foundName || "";
  const resolvedPhone = selectedPatient?.phone || manualPhone;
  const canSubmit = resolvedName.trim() && procedure.trim();

  const clearCedula = useCallback(() => {
    setCedulaInput("");
    setFoundName(null);
    setSelectedPatientId("");
    setCedulaNotFound(false);
    setSearchingCedula(false);
    if (cedulaTimerRef.current) clearTimeout(cedulaTimerRef.current);
  }, []);

  const searchByCedula = useCallback(async (cedula: string) => {
    if (cedula.length < 5) return;
    setSearchingCedula(true);
    setCedulaNotFound(false);
    try {
      // 1. Buscar localmente por cédula
      const local = patients.find((p) => {
        if (!p.cedula) return false;
        return p.cedula.toString().replace(/\D/g, "") === cedula;
      });
      if (local) {
        setSelectedPatientId(local.id);
        setFoundName(local.name);
        return;
      }
      // 2. Buscar en CNE
      const result = await validateCedulaWithCNE(cedula);
      if (result.found && result.nombre_completo) {
        setFoundName(result.nombre_completo);
      } else {
        setCedulaNotFound(true);
      }
    } catch {
      setCedulaNotFound(true);
    } finally {
      setSearchingCedula(false);
    }
  }, [patients]);

  useEffect(() => {
    const isFound = foundName !== null || selectedPatientId !== "";
    if (isFound || cedulaInput.length < 6) return;
    if (cedulaTimerRef.current) clearTimeout(cedulaTimerRef.current);
    cedulaTimerRef.current = setTimeout(() => void searchByCedula(cedulaInput), 800);
    return () => { if (cedulaTimerRef.current) clearTimeout(cedulaTimerRef.current); };
  }, [cedulaInput, foundName, selectedPatientId, searchByCedula]);

  const toggleDay = (day: string) =>
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    await onAdd({
      patientId: selectedPatient?.type === "registered" ? selectedPatient.id : undefined,
      offlinePatientId: selectedPatient?.type === "offline" ? selectedPatient.id : undefined,
      officeId: officeId ?? undefined,
      patientName: resolvedName,
      patientPhone: resolvedPhone,
      procedureType: procedure,
      estimatedDuration: duration,
      priority,
      preferredDays,
      preferredTimeStart: timeStart || undefined,
      preferredTimeEnd: timeEnd || undefined,
      notes,
      procedureCode: isOdontology ? procedureCode : undefined,
      toothNumbers: isOdontology && toothNumbers.length > 0 ? toothNumbers : undefined,
      requiresAnesthesia: isOdontology ? requiresAnesthesia : undefined,
    });
    setSaving(false);
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Agregar a Lista de Espera</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Patient selector — solo cédula */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Cédula del paciente</p>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {resolvedName
                ? <User className="w-4 h-4 text-green-600" />
                : <Search className="w-4 h-4 text-muted-foreground" />}
            </div>
            <Input
              placeholder="Ingrese cédula..."
              value={resolvedName || cedulaInput}
              readOnly={!!resolvedName}
              onChange={(e) => {
                if (resolvedName) return;
                const val = e.target.value.replace(/\D/g, "");
                setCedulaInput(val);
                setCedulaNotFound(false);
              }}
              maxLength={resolvedName ? undefined : 9}
              className={cn(
                "pl-9 pr-9",
                resolvedName && "border-green-400 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100 cursor-default"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchingCedula && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              {resolvedName && !searchingCedula && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              {(cedulaInput.length > 0 || resolvedName) && !searchingCedula && (
                <button type="button" onClick={clearCedula} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {resolvedName && (
            <p className="text-[11px] text-green-700 dark:text-green-400 pl-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> V-{cedulaInput} · Verificado
            </p>
          )}
          {cedulaNotFound && !searchingCedula && (
            <p className="text-[11px] text-red-500 pl-1">No se encontró V-{cedulaInput} en el sistema ni en CNE</p>
          )}
          <Input placeholder="Teléfono (opcional)" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} />
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input placeholder="Procedimiento" value={procedure} onChange={(e) => setProcedure(e.target.value)} />
          <Input type="number" placeholder="Duración (min)" value={duration} min={5} onChange={(e) => setDuration(parseInt(e.target.value) || 30)} />
          <select value={priority} onChange={(e) => setPriority(e.target.value as WaitlistEntry["priority"])} className="border rounded px-2 py-1 text-sm bg-background">
            <option value="low">Baja</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        {/* Preferred days */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Días preferidos</p>
          <div className="flex gap-1 flex-wrap">
            {Object.entries(DAY_LABELS).map(([key, label]) => (
              <button key={key} type="button" onClick={() => toggleDay(key)}
                className={cn("text-xs px-2 py-1 rounded border font-medium transition-colors",
                  preferredDays.includes(key) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                )}>{label}</button>
            ))}
          </div>
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-2">
          <div><p className="text-xs text-muted-foreground mb-1">Hora desde</p><Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} /></div>
          <div><p className="text-xs text-muted-foreground mb-1">Hora hasta</p><Input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} /></div>
        </div>

        <Input placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        {/* Dental fields */}
        {isOdontology && (
          <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground">Campos odontológicos</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Código procedimiento" value={procedureCode} onChange={(e) => setProcedureCode(e.target.value)} />
              <Input placeholder="Dientes (11,12,21...)" value={toothNumbers.join(",")}
                onChange={(e) => { const nums = e.target.value.split(",").map((n) => parseInt(n.trim())).filter((n) => !isNaN(n)); setToothNumbers(nums); }} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={requiresAnesthesia} onChange={(e) => setRequiresAnesthesia(e.target.checked)} className="rounded" />
              Requiere anestesia
            </label>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" onClick={() => void handleSubmit()} disabled={!canSubmit || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            Agregar a lista
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Button>
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
