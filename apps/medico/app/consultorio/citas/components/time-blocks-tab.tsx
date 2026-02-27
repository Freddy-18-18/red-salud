/**
 * @file time-blocks-tab.tsx
 * @description Enterprise schedule management tab.
 *   - View/create/delete time blocks (vacations, lunch, meetings, prep)
 *   - Weekly availability template
 *   - Visual monthly calendar of blocked periods
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, isToday, parseISO, getDay, addMonths, subMonths,
  startOfWeek, endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Button, Card, CardContent,
  Badge,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Input, Label, Textarea,
} from "@red-salud/design-system";
import {
  Calendar, Plus, Trash2, Edit2, Clock, Coffee, Users,
  Umbrella, AlertCircle, FileText, ChevronLeft, ChevronRight,
  Loader2, RefreshCw, Shield, Info,
} from "lucide-react";
import {
  useTimeBlocks, TIME_BLOCK_CONFIG,
  type TimeBlock, type TimeBlockType, type CreateTimeBlockInput,
} from "@/hooks/use-time-blocks";
import { supabase } from "@/lib/supabase/client";

interface TimeBlocksTabProps {
  selectedOfficeId: string | null;
  specialtyName?: string;
}

const BLOCK_TYPE_ICONS: Record<TimeBlockType, React.ElementType> = {
  vacaciones: Umbrella,
  almuerzo: Coffee,
  reunion: Users,
  preparacion: Clock,
  administrativa: FileText,
  emergencia: AlertCircle,
  bloqueo: Shield,
};

// ─── Time Blocks Tab ──────────────────────────────────────────────────────────
export function TimeBlocksTab({ selectedOfficeId, specialtyName }: TimeBlocksTabProps) {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setDoctorId(user.id);
    });
  }, []);

  const { blocks, loading, error, load, create, remove } = useTimeBlocks(doctorId, viewMonth);

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const getBlocksForDay = (day: Date) =>
    blocks.filter((b) => {
      const bStart = parseISO(b.fecha_inicio);
      const bEnd = parseISO(b.fecha_fin);
      return day >= new Date(bStart.toDateString()) && day <= new Date(bEnd.toDateString());
    });

  const selectedDayBlocks = selectedDay ? getBlocksForDay(selectedDay) : [];

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const monthBlocks = blocks.filter((b) => {
      const start = parseISO(b.fecha_inicio);
      return isSameMonth(start, viewMonth) || parseISO(b.fecha_fin) >= startOfMonth(viewMonth);
    });
    return {
      total: monthBlocks.length,
      byType: Object.entries(TIME_BLOCK_CONFIG).map(([type, cfg]) => ({
        type: type as TimeBlockType,
        ...cfg,
        count: monthBlocks.filter((b) => b.tipo === type).length,
      })).filter((s) => s.count > 0),
    };
  }, [blocks, viewMonth]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 pt-4 pb-3 border-b bg-background">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Gestión de Disponibilidad</h2>
            <p className="text-xs text-muted-foreground">
              Bloquea horarios para vacaciones, almuerzo, reuniones y preparación entre citas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button size="sm" onClick={() => { setSelectedDay(null); setShowCreateDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              Nuevo Bloqueo
            </Button>
          </div>
        </div>
        {/* Month stats strip – moved here from inside the calendar scroll area */}
        {stats.byType.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {stats.byType.map((s) => (
              <div
                key={s.type}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{ borderColor: s.color + "60", backgroundColor: s.color + "15", color: s.color }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">{s.count}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Calendar */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-6 space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-2">{error}</div>
              )}



              {/* Calendar navigation */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setViewMonth((m) => subMonths(m, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-sm font-semibold capitalize">
                  {format(viewMonth, "MMMM yyyy", { locale: es })}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setViewMonth((m) => addMonths(m, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar grid */}
              <div className="rounded-xl border overflow-hidden bg-card">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                    <div key={d} className="text-[10px] font-semibold text-muted-foreground text-center py-2 uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 divide-x divide-y">
                  {calendarDays.map((day) => {
                    const dayBlocks = getBlocksForDay(day);
                    const isCurrentMonth = isSameMonth(day, viewMonth);
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    const isCurrentDay = isToday(day);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                        className={cn(
                          "min-h-16 p-1.5 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                          !isCurrentMonth && "opacity-40 bg-muted/10",
                          isSelected && "bg-primary/10 ring-2 ring-inset ring-primary/20",
                          isCurrentDay && !isSelected && "bg-blue-50/50 dark:bg-blue-950/20",
                        )}
                      >
                        <span className={cn(
                          "text-xs font-medium flex items-center justify-center w-6 h-6 rounded-full",
                          isCurrentDay && "bg-primary text-primary-foreground",
                        )}>
                          {format(day, "d")}
                        </span>

                        {/* Block indicators */}
                        <div className="mt-1 space-y-0.5">
                          {dayBlocks.slice(0, 2).map((block) => (
                            <div
                              key={block.id}
                              className="rounded text-[9px] font-medium px-1 py-0.5 truncate"
                              style={{ backgroundColor: block.color + "25", color: block.color }}
                            >
                              {TIME_BLOCK_CONFIG[block.tipo]?.icon} {block.titulo}
                            </div>
                          ))}
                          {dayBlocks.length > 2 && (
                            <div className="text-[9px] text-muted-foreground px-1">
                              +{dayBlocks.length - 2} más
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Los bloqueos impiden que se agendan citas en ese horario. Los pacientes y la secretaria verán
                    esos momentos como <strong>no disponible</strong>. Para bloqueos diarios (almuerzo), activa la opción Recurrente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: selected day blocks OR block list */}
        <div className="w-80 border-l flex flex-col min-h-0 bg-muted/10">
          <div className="flex-none px-4 py-3 border-b bg-background">
            <h3 className="text-sm font-semibold">
              {selectedDay
                ? format(selectedDay, "EEEE d 'de' MMMM", { locale: es })
                : "Todos los bloqueos activos"}
            </h3>
            {selectedDay && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs mt-1 -ml-1"
                onClick={() => { setSelectedDay(selectedDay); setShowCreateDialog(true); }}
              >
                <Plus className="w-3 h-3 mr-1" /> Agregar en este día
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-4 space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (selectedDay ? selectedDayBlocks : blocks).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">
                    {selectedDay ? "Sin bloqueos este día" : "No hay bloqueos activos"}
                  </p>
                </div>
              ) : (
                (selectedDay ? selectedDayBlocks : blocks).map((block) => (
                  <TimeBlockCard
                    key={block.id}
                    block={block}
                    onDelete={() => void remove(block.id)}
                    onEdit={() => setEditingBlock(block)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <CreateTimeBlockDialog
        open={showCreateDialog || !!editingBlock}
        defaultDate={selectedDay ?? undefined}
        existingBlock={editingBlock}
        officeId={selectedOfficeId}
        onSave={async (input) => {
          const { error: err } = await create(input);
          if (!err) {
            setShowCreateDialog(false);
            setEditingBlock(null);
          }
          return err;
        }}
        onClose={() => { setShowCreateDialog(false); setEditingBlock(null); }}
      />
    </div>
  );
}

// ─── Time Block Card ──────────────────────────────────────────────────────────
function TimeBlockCard({
  block, onDelete, onEdit,
}: {
  block: TimeBlock;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const cfg = TIME_BLOCK_CONFIG[block.tipo];
  const Icon = BLOCK_TYPE_ICONS[block.tipo];

  const startDate = parseISO(block.fecha_inicio);
  const endDate = parseISO(block.fecha_fin);
  const isMultiDay = !isSameDay(startDate, endDate);

  return (
    <Card className="group hover:shadow-sm transition-shadow border-l-4" style={{ borderLeftColor: block.color }}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
              style={{ backgroundColor: block.color + "20" }}
            >
              {cfg?.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{block.titulo}</p>
              <p className="text-[10px] text-muted-foreground">
                {isMultiDay
                  ? `${format(startDate, "d MMM", { locale: es })} → ${format(endDate, "d MMM", { locale: es })}`
                  : format(startDate, "d MMM", { locale: es })
                }
                {!block.todo_el_dia && (
                  <> · {format(startDate, "HH:mm")} – {format(endDate, "HH:mm")}</>
                )}
              </p>
              {block.descripcion && (
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate italic">{block.descripcion}</p>
              )}
              <div className="flex gap-1 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[9px] h-4 px-1">{cfg?.label}</Badge>
                {block.es_recurrente && (
                  <Badge variant="outline" className="text-[9px] h-4 px-1 border-purple-200 text-purple-600">🔁 Recurrente</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Create Time Block Dialog ─────────────────────────────────────────────────
interface CreateTimeBlockDialogProps {
  open: boolean;
  defaultDate?: Date;
  existingBlock?: TimeBlock | null;
  officeId?: string | null;
  onSave: (input: CreateTimeBlockInput) => Promise<string | null>;
  onClose: () => void;
}

function CreateTimeBlockDialog({
  open, defaultDate, existingBlock, officeId, onSave, onClose
}: CreateTimeBlockDialogProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [tipo, setTipo] = useState<TimeBlockType>("bloqueo");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDesc] = useState("");
  const [fechaInicio, setFechaIn] = useState(
    defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [horaInicio, setHoraIn] = useState("08:00");
  const [fechaFin, setFechaEnd] = useState(
    defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [horaFin, setHoraEnd] = useState("09:00");
  const [todoElDia, setTodoElDia] = useState(false);
  const [esRecurrente, setEsRec] = useState(false);
  const [recurrenceDays, setRecDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon–Fri default

  // Minimum selectable time: if the selected date is today, don't allow past hours
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const nowRounded = (() => {
    const n = new Date();
    n.setSeconds(0, 0);
    n.setMinutes(n.getMinutes() + 1); // at least 1 minute ahead
    return format(n, "HH:mm");
  })();
  const minTimeInicio = fechaInicio === todayStr ? nowRounded : undefined;
  const minTimeFin = fechaFin === todayStr ? nowRounded : undefined;

  useEffect(() => {
    if (existingBlock) {
      const start = parseISO(existingBlock.fecha_inicio);
      const end = parseISO(existingBlock.fecha_fin);
      setTipo(existingBlock.tipo);
      setTitulo(existingBlock.titulo);
      setDesc(existingBlock.descripcion ?? "");
      setFechaIn(format(start, "yyyy-MM-dd"));
      setHoraIn(format(start, "HH:mm"));
      setFechaEnd(format(end, "yyyy-MM-dd"));
      setHoraEnd(format(end, "HH:mm"));
      setTodoElDia(existingBlock.todo_el_dia);
      setEsRec(existingBlock.es_recurrente);
    } else {
      // Defaults based on type
      const cfg = TIME_BLOCK_CONFIG["bloqueo"];
      setTipo("bloqueo");
      setTitulo("");
      setDesc("");
    }
  }, [existingBlock, open]);

  // Auto-fill title when type changes
  useEffect(() => {
    if (!titulo || titulo === TIME_BLOCK_CONFIG[tipo === "bloqueo" ? "vacaciones" : "bloqueo"]?.label) {
      setTitulo(TIME_BLOCK_CONFIG[tipo]?.label ?? "");
    }
  }, [tipo]);

  const WEEKDAYS = [
    { value: 1, label: "L" }, { value: 2, label: "M" }, { value: 3, label: "X" },
    { value: 4, label: "J" }, { value: 5, label: "V" }, { value: 6, label: "S" },
    { value: 0, label: "D" },
  ];

  const toggleDay = (d: number) =>
    setRecDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    const input: CreateTimeBlockInput = {
      tipo,
      titulo: titulo || TIME_BLOCK_CONFIG[tipo]?.label,
      descripcion: descripcion || undefined,
      color: TIME_BLOCK_CONFIG[tipo]?.color,
      fecha_inicio: todoElDia
        ? `${fechaInicio}T00:00:00`
        : `${fechaInicio}T${horaInicio}:00`,
      fecha_fin: todoElDia
        ? `${fechaFin}T23:59:59`
        : `${fechaFin}T${horaFin}:00`,
      todo_el_dia: todoElDia,
      es_recurrente: esRecurrente,
      recurrence_rule: esRecurrente
        ? { type: "weekly", days: recurrenceDays, until: "2027-12-31" }
        : undefined,
      office_id: officeId ?? null,
    };

    const err = await onSave(input);
    setSaving(false);

    if (err) {
      setSaveError(err);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-none">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {existingBlock ? "Editar Bloqueo" : "Nuevo Bloqueo de Horario"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-4 py-2">
            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TIME_BLOCK_CONFIG).map(([key, cfg]) => {
                const Icon = BLOCK_TYPE_ICONS[key as TimeBlockType];
                return (
                  <button
                    key={key}
                    onClick={() => setTipo(key as TimeBlockType)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all hover:shadow-sm",
                      tipo === key
                        ? "border-2 shadow-sm font-semibold"
                        : "border-muted bg-muted/20 text-muted-foreground"
                    )}
                    style={tipo === key ? { borderColor: cfg.color, color: cfg.color, backgroundColor: cfg.color + "12" } : {}}
                  >
                    <span className="text-lg">{cfg.icon}</span>
                    <span className="text-[10px] leading-tight text-center">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs">Título</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder={TIME_BLOCK_CONFIG[tipo]?.label}
                className="h-8 text-sm"
              />
            </div>

            {/* All day toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="todo-el-dia"
                checked={todoElDia}
                onChange={(e) => setTodoElDia(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="todo-el-dia" className="text-sm cursor-pointer">Todo el día</Label>
            </div>

            {/* Date/time range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Desde</Label>
                <Input type="date" value={fechaInicio} onChange={(e) => setFechaIn(e.target.value)} className="h-8 text-sm" />
                {!todoElDia && (
                  <Input
                    type="time"
                    value={horaInicio}
                    min={minTimeInicio}
                    onChange={(e) => setHoraIn(e.target.value)}
                    className="h-7 text-xs"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hasta</Label>
                <Input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaEnd(e.target.value)} className="h-8 text-sm" />
                {!todoElDia && (
                  <Input
                    type="time"
                    value={horaFin}
                    min={minTimeFin}
                    onChange={(e) => setHoraEnd(e.target.value)}
                    className="h-7 text-xs"
                  />
                )}
              </div>
            </div>

            {/* Recurrence */}
            <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="es-recurrente"
                  checked={esRecurrente}
                  onChange={(e) => setEsRec(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="es-recurrente" className="text-sm cursor-pointer font-medium">Repetir semanalmente</Label>
              </div>

              {esRecurrente && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Días de la semana:</p>
                  <div className="flex gap-1.5">
                    {WEEKDAYS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => toggleDay(d.value)}
                        className={cn(
                          "w-8 h-8 rounded-full text-xs font-bold transition-colors",
                          recurrenceDays.includes(d.value)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs">Nota interna (opcional)</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Motivo del bloqueo..."
                className="text-sm resize-none"
                rows={2}
              />
            </div>

            {saveError && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded px-3 py-2">
                {saveError}
              </div>
            )}
          </div>
        </div>{/* end overflow-y-auto scroll wrapper */}

        <DialogFooter className="flex-none border-t pt-4 mt-0">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {existingBlock ? "Guardar cambios" : "Crear bloqueo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
