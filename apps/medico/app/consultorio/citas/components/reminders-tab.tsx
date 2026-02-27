"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Bell, BellOff, Plus, Trash2, Pencil,
  Send, CheckCircle2, XCircle, TrendingUp,
  Clock, Loader2, Settings,
  MessageSquare, Mail, Phone, Smartphone,
  Calendar, User, RefreshCw,
  AlertCircle, Zap, Power, LayoutTemplate,
} from "lucide-react";
import {
  Button,
  Badge, ScrollArea, Switch,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@red-salud/design-system";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@red-salud/design-system";
import { useReminders } from "@/hooks/use-reminders";
import { createClient } from "@/lib/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type {
  ReminderRule,
  AppointmentReminder,
  CreateReminderRuleInput,
} from "@/lib/supabase/services/reminder-service";
import { ReminderEditorSheet } from "./reminder-editor-sheet";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RemindersTabProps {
  selectedOfficeId: string | null;
}

// ─── Preset templates for the picker ─────────────────────────────────────────

interface PresetTemplate {
  name: string;
  description: string;
  trigger_type: string;
  trigger_hours_offset: number;
  channel: string;
  template_body: string;
  allows_confirm: boolean;
  allows_reschedule: boolean;
  allows_cancel: boolean;
  emoji: string;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    emoji: "⏰",
    name: "Recordatorio 24h antes",
    description: "Se envía un día antes de la cita",
    trigger_type: "before_appointment",
    trigger_hours_offset: -24,
    channel: "whatsapp",
    template_body: "Hola {patient_name} 👋 Le recordamos su cita con {doctor_name} mañana {date} a las {time}. Confirme con *1*, reagende con *2* o cancele con *3*.",
    allows_confirm: true, allows_reschedule: true, allows_cancel: true,
  },
  {
    emoji: "🔔",
    name: "Recordatorio 2h antes",
    description: "Aviso de último momento 2 horas antes",
    trigger_type: "before_appointment",
    trigger_hours_offset: -2,
    channel: "whatsapp",
    template_body: "Hola {patient_name}! Su cita con {doctor_name} es HOY a las {time} en {office_name}. ¡Le esperamos! 🏥",
    allows_confirm: false, allows_reschedule: false, allows_cancel: false,
  },
  {
    emoji: "📧",
    name: "Confirmación por correo",
    description: "Email con detalles completos de la cita",
    trigger_type: "before_appointment",
    trigger_hours_offset: -48,
    channel: "email",
    template_body: "Estimado/a {patient_name},\n\nLe recordamos su cita médica:\n\n📅 Fecha: {date}\n🕐 Hora: {time}\n👨‍⚕️ Médico: {doctor_name}\n📋 Motivo: {motivo}\n📍 Consultorio: {office_name}\n\nPara confirmar o cancelar responda este correo.",
    allows_confirm: true, allows_reschedule: true, allows_cancel: true,
  },
  {
    emoji: "📱",
    name: "Push 1h antes",
    description: "Notificación push en la app del paciente",
    trigger_type: "before_appointment",
    trigger_hours_offset: -1,
    channel: "push",
    template_body: "⏰ Su cita con {doctor_name} comienza en 1 hora ({time}). Recuerde llegar a tiempo. ¡Hasta pronto!",
    allows_confirm: false, allows_reschedule: false, allows_cancel: false,
  },
  {
    emoji: "😔",
    name: "Seguimiento no asistió",
    description: "Mensaje cuando el paciente no se presentó",
    trigger_type: "on_no_show",
    trigger_hours_offset: 2,
    channel: "whatsapp",
    template_body: "Hola {patient_name}, notamos que no pudo asistir a su cita del {date}. ¿Desea reagendar? Responda *2* para solicitar un nuevo horario.",
    allows_confirm: false, allows_reschedule: true, allows_cancel: false,
  },
  {
    emoji: "✅",
    name: "Confirmación automática",
    description: "Avisa cuando la cita queda confirmada",
    trigger_type: "on_confirm",
    trigger_hours_offset: 0,
    channel: "whatsapp",
    template_body: "¡Perfecto, {patient_name}! ✅ Su cita con {doctor_name} el {date} a las {time} ha sido confirmada. Le esperamos en {office_name}.",
    allows_confirm: false, allows_reschedule: false, allows_cancel: false,
  },
  {
    emoji: "💖",
    name: "Seguimiento post-consulta",
    description: "Encuesta de satisfacción 24h después",
    trigger_type: "after_appointment",
    trigger_hours_offset: 24,
    channel: "whatsapp",
    template_body: "Hola {patient_name}, ¿qué tal te sentiste en tu consulta con {doctor_name}? Ayúdanos a mejorar comentando tu experiencia en este link: https://red-salud.com/feedback",
    allows_confirm: false, allows_reschedule: false, allows_cancel: false,
  },
  {
    emoji: "🔄",
    name: "Resurgimiento (Win-back)",
    description: "Se envía horas después de una cancelación",
    trigger_type: "on_cancel",
    trigger_hours_offset: 2,
    channel: "whatsapp",
    template_body: "Lamentamos que cancelaras tu cita de hoy {patient_name}. Si tus planes cambiaron y deseas reagendar con {doctor_name}, puedes hacerlo aquí: {reschedule_link}",
    allows_confirm: false, allows_reschedule: true, allows_cancel: false,
  },
  {
    emoji: "⚡",
    name: "Hueco en Lista de Espera",
    description: "Aviso cuando se libera un espacio",
    trigger_type: "waitlist_slot_open",
    trigger_hours_offset: 0,
    channel: "whatsapp",
    template_body: "¡Hola {patient_name}! Se ha liberado un turno para el {date} a las {time} con {doctor_name}. Si aún deseas asistir, responde *1* para tomarlo.",
    allows_confirm: true, allows_reschedule: false, allows_cancel: false,
  },
];

// ─── Channel & Status constants ───────────────────────────────────────────────

const CHANNEL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  push: Smartphone,
  whatsapp: MessageSquare,
  sms: Phone,
  email: Mail,
  in_app: Bell,
  multi: Zap,
};

const CHANNEL_LABELS: Record<string, string> = {
  push: "Push",
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  in_app: "In-App",
  multi: "Multi",
};

const CHANNEL_COLORS: Record<string, string> = {
  push: "text-violet-500",
  whatsapp: "text-green-600",
  sms: "text-blue-500",
  email: "text-amber-500",
  in_app: "text-sky-500",
  multi: "text-pink-500",
};

const TRIGGER_LABELS: Record<string, string> = {
  before_appointment: "Antes de cita",
  after_appointment: "Después de cita",
  on_cancel: "Al cancelar",
  on_no_show: "No asistió",
  on_confirm: "Al confirmar",
  waitlist_slot_open: "Lista espera",
  treatment_plan_due: "Plan vence",
  recall_due: "Recall",
  custom_interval: "Personalizado",
};

interface StatusConfig {
  label: string;
  className: string;
  icon: ComponentType<{ className?: string }>;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800", icon: Clock },
  scheduled: { label: "Programado", className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800", icon: Clock },
  sent: { label: "Enviado", className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800", icon: Send },
  failed: { label: "Fallido", className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800", icon: XCircle },
  skipped: { label: "Omitido", className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700", icon: BellOff },
  confirmed: { label: "Confirmado", className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800", icon: CheckCircle2 },
  confirmed_by_patient: { label: "Confirmado", className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", className: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800", icon: XCircle },
  cancelled_by_patient: { label: "Cancelado", className: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800", icon: XCircle },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function RemindersTab({ selectedOfficeId }: RemindersTabProps) {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"rules" | "log">("rules");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Editor sheet state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);

  // Template picker state
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => { if (user) setDoctorId(user.id); });
  }, []);

  const { rules, reminders, stats, loading, error, addRule, editRule, removeRule, toggleRule, refresh } =
    useReminders({ doctorId: doctorId ?? "" });

  const handleToggle = useCallback(
    async (id: string, enabled: boolean) => {
      setTogglingId(id);
      await toggleRule(id, enabled);
      setTogglingId(null);
    },
    [toggleRule]
  );

  const handleOpenNew = () => {
    setEditingRule(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (rule: ReminderRule) => {
    setEditingRule(rule);
    setEditorOpen(true);
  };

  const handleSave = async (data: Partial<CreateReminderRuleInput>, id?: string) => {
    if (id) {
      await editRule(id, data);
    } else {
      await addRule(data as CreateReminderRuleInput);
    }
  };

  const handleAddPreset = async (preset: PresetTemplate) => {
    await addRule({
      name: preset.name,
      description: preset.description,
      trigger_type: preset.trigger_type as ReminderRule["trigger_type"],
      trigger_hours_offset: preset.trigger_hours_offset,
      channel: preset.channel as ReminderRule["channel"],
      template_body: preset.template_body,
      allows_confirm: preset.allows_confirm,
      allows_reschedule: preset.allows_reschedule,
      allows_cancel: preset.allows_cancel,
      is_active: true,
      office_id: null,
      applies_to_tipos: [],
      specialty_context: null,
      trigger_time_of_day: null,
      channel_priority: [preset.channel],
      template_subject: null,
      confirm_keyword: "1",
      reschedule_keyword: "2",
      cancel_keyword: "3",
      auto_confirm_on_reply: false,
      auto_cancel_on_no_reply: false,
      no_reply_hours: 24,
      escalate_after_hours: null,
      escalation_template: null,
      priority: 10,
    });
    setPickerOpen(false);
  };

  const filteredReminders =
    statusFilter === "all"
      ? reminders
      : reminders.filter((r) => r.overall_status === statusFilter);

  if (!doctorId || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary/50" />
        <p className="text-sm">Cargando recordatorios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive/60" />
        <p className="text-sm text-center max-w-xs">Error al cargar: {error}</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="size-3 mr-1.5" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">

        {/* Left: rules + log */}
        <div className={cn(
          "flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out",
          editorOpen ? "w-full lg:w-[360px] flex-none lg:border-r bg-muted/10 shrink-0" : "flex-1 min-w-0"
        )}>

          {/* ── KPI Strip ──────────────────────────────────────────────── */}
          {stats && (
            <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-b">
              <KpiCard icon={<Send className="size-4 text-blue-500" />} label="Enviados (30d)" value={stats.sent} />
              <KpiCard icon={<CheckCircle2 className="size-4 text-emerald-500" />} label="Confirmados" value={stats.confirmed_by_patient} valueClass="text-emerald-600 dark:text-emerald-400" />
              <KpiCard icon={<XCircle className="size-4 text-rose-500" />} label="Cancelados" value={stats.cancelled_by_patient} valueClass="text-rose-600 dark:text-rose-400" />
              <KpiCard icon={<TrendingUp className="size-4 text-violet-500" />} label="Tasa confirmacion" value={`${stats.confirmation_rate_pct}%`} valueClass="text-violet-600 dark:text-violet-400" />
            </div>
          )}

          {/* ── Section Navigation ─────────────────────────────────────── */}
          <div className="flex-none flex items-center justify-between px-4 py-2 border-b bg-muted/20">
            <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
              {(["rules", "log"] as const).map((section) => {
                const count = section === "rules" ? rules.length : reminders.length;
                return (
                  <button
                    key={section}
                    onClick={() => {
                      setActiveSection(section);
                      if (section !== "rules") setEditorOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                      activeSection === section
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {section === "rules" ? <Settings className="size-3.5" /> : <Bell className="size-3.5" />}
                    {section === "rules" ? "Reglas" : "Historial"}
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] font-bold tabular-nums rounded-full px-1.5 min-w-[18px] text-center leading-none py-0.5",
                        activeSection === section ? "bg-primary/10 text-primary" : "bg-muted-foreground/20 text-muted-foreground"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={refresh}>
                    <RefreshCw className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">Actualizar</TooltipContent>
              </Tooltip>

              {activeSection === "rules" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setPickerOpen(true)}>
                        <LayoutTemplate className="size-3" />
                        Plantillas
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">Agregar desde plantillas predefinidas</TooltipContent>
                  </Tooltip>

                  <Button size="sm" className="h-7 text-xs gap-1" onClick={handleOpenNew}>
                    <Plus className="size-3" />
                    Nueva regla
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ── Rules Section ────────────────────────────────────────────── */}
          {activeSection === "rules" && (
            <ScrollArea className="flex-1">
              <div className={cn(
                "p-4 space-y-2.5",
                editorOpen ? "max-w-none" : "max-w-3xl mx-auto"
              )}>
                {rules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="rounded-full bg-muted p-5">
                      <Bell className="size-8 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-foreground">Sin reglas configuradas</h3>
                      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                        Configura reglas para enviar recordatorios automáticos a tus pacientes antes o después de cada cita.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)} className="gap-1.5">
                        <LayoutTemplate className="size-3.5" />
                        Elegir plantilla
                      </Button>
                      <Button size="sm" onClick={handleOpenNew} className="gap-1.5">
                        <Plus className="size-3.5" />
                        Crear personalizada
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {rules.filter((r) => r.is_active).length} de {rules.length} reglas activas
                    </p>
                    {rules.map((rule) => (
                      <RuleCard
                        key={rule.id}
                        rule={rule}
                        isCompact={editorOpen}
                        isToggling={togglingId === rule.id}
                        onToggle={(enabled) => handleToggle(rule.id, enabled)}
                        onEdit={() => handleOpenEdit(rule)}
                        onDelete={() => removeRule(rule.id)}
                      />
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          {/* ── Log Section ──────────────────────────────────────────────── */}
          {activeSection === "log" && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-none flex items-center gap-1.5 px-4 py-2 border-b overflow-x-auto">
                {(["all", "sent", "confirmed_by_patient", "cancelled_by_patient", "failed", "pending"] as const).map((status) => {
                  const cfg = STATUS_CONFIG[status];
                  const count = status === "all" ? reminders.length : reminders.filter((r) => r.overall_status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all whitespace-nowrap",
                        statusFilter === status
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                      )}
                    >
                      {status === "all" ? "Todos" : (cfg?.label ?? status)}
                      {count > 0 && <span className="tabular-nums">({count})</span>}
                    </button>
                  );
                })}
              </div>
              <ScrollArea className="flex-1">
                <div className={cn(
                  "p-4 space-y-2",
                  editorOpen ? "max-w-none" : "max-w-3xl mx-auto"
                )}>
                  {filteredReminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                      <div className="rounded-full bg-muted p-5">
                        <Bell className="size-7 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {statusFilter === "all" ? "Sin recordatorios enviados aún." : `Sin recordatorios con estado "${STATUS_CONFIG[statusFilter]?.label ?? statusFilter}".`}
                      </p>
                    </div>
                  ) : (
                    filteredReminders.map((reminder) => (
                      <ReminderLogCard key={reminder.id} reminder={reminder} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Right: inline editor panel (same page, no dialog) */}
        {editorOpen && (
          <div className="flex-1 min-w-0 h-full min-h-0 border-t lg:border-t-0 bg-background animate-in slide-in-from-right-8 duration-300">
            <ReminderEditorSheet
              open={editorOpen}
              rule={editingRule}
              onClose={() => setEditorOpen(false)}
              onSave={handleSave}
            />
          </div>
        )}

      </div>

      {/* ── Template Picker Dialog ───────────────────────────────────── */}
      <TemplatePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddPreset}
        existingNames={rules.map((r) => r.name)}
      />
    </TooltipProvider>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, valueClass = "text-foreground" }: {
  icon: React.ReactNode; label: string; value: string | number; valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-background">
      <div className="flex-none p-2 rounded-lg bg-muted/60">{icon}</div>
      <div className="min-w-0">
        <div className={cn("text-xl font-bold tabular-nums leading-tight", valueClass)}>{value}</div>
        <div className="text-[11px] text-muted-foreground leading-tight truncate">{label}</div>
      </div>
    </div>
  );
}

// ─── Rule Card ────────────────────────────────────────────────────────────────

function RuleCard({
  rule, isCompact, isToggling, onToggle, onEdit, onDelete,
}: {
  rule: ReminderRule;
  isCompact?: boolean;
  isToggling: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = CHANNEL_ICONS[rule.channel] ?? Bell;
  const colorClass = CHANNEL_COLORS[rule.channel] ?? "text-muted-foreground";

  const hoursLabel =
    rule.trigger_hours_offset === 0 ? "Al instante"
      : rule.trigger_hours_offset > 0 ? `${rule.trigger_hours_offset}h después`
        : `${Math.abs(rule.trigger_hours_offset)}h antes`;

  return (
    <div className={cn(
      "group relative flex rounded-lg border bg-card transition-all duration-200 overflow-hidden",
      rule.is_active ? "border-border/60 shadow-sm hover:shadow-md" : "border-border/30 bg-muted/20",
      isCompact ? "flex-col items-stretch p-0" : "flex-row items-center gap-3 px-4 py-3"
    )}>
      {/* Active accent bar */}
      <div className={cn(
        "absolute transition-colors duration-200",
        isCompact ? "top-0 left-0 right-0 h-0.5" : "left-0 top-3 bottom-3 w-0.5 rounded-r-full",
        rule.is_active ? "bg-emerald-500" : "bg-muted-foreground/20"
      )} />

      {!isCompact && (
        <div className={cn("flex-none p-2 rounded-lg bg-muted/60", colorClass)}>
          <Icon className="size-4" />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isCompact ? "p-3 space-y-2" : "space-y-1"
      )}>
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {isCompact && <Icon className={cn("size-3.5 flex-none", colorClass)} />}
            <span className={cn("text-sm font-semibold truncate", rule.is_active ? "text-foreground" : "text-muted-foreground")}>
              {rule.name}
            </span>
          </div>
          {/* Quick toggle for compact mode */}
          {isCompact && (
            <Switch
              checked={rule.is_active}
              onCheckedChange={onToggle}
              disabled={isToggling}
              className="scale-75 origin-right flex-none"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 opacity-90">
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-muted/80 uppercase tracking-wide">
            {TRIGGER_LABELS[rule.trigger_type] ?? rule.trigger_type}
          </Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary gap-0.5 uppercase tracking-wide">
            <Clock className="size-2.5" />
            {hoursLabel}
          </Badge>
        </div>

        {!isCompact && rule.template_body && (
          <p className={cn(
            "text-xs bg-muted/40 rounded px-2.5 py-1.5 italic line-clamp-1 border border-transparent group-hover:border-border/50 transition-colors",
            rule.is_active ? "text-muted-foreground" : "text-muted-foreground/50"
          )}>
            &ldquo;{rule.template_body}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {!isCompact && (
            <span className={cn("flex items-center gap-1 text-[10px] font-medium mr-1", rule.is_active ? colorClass : "text-muted-foreground/50")}>
              {CHANNEL_LABELS[rule.channel] ?? rule.channel}
            </span>
          )}
          {rule.allows_confirm && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20">
              Confirmar
            </Badge>
          )}
          {rule.allows_reschedule && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20">
              Reagendar
            </Badge>
          )}
          {rule.allows_cancel && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-rose-500 border-rose-300 dark:text-rose-400 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20">
              Cancelar
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-1 flex-none",
        isCompact ? "bg-muted/30 px-3 py-2 border-t justify-end" : "self-center"
      )}>
        {!isCompact && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToggle(!rule.is_active)}
                disabled={isToggling}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-md border transition-all mr-1",
                  rule.is_active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {isToggling
                  ? <Loader2 className="size-3 animate-spin" />
                  : <Power className="size-3" />}
                {rule.is_active ? "Activa" : "Pausada"}
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              {rule.is_active ? "Click para pausar esta regla" : "Click para activar esta regla"}
            </TooltipContent>
          </Tooltip>
        )}

        <Button
          variant={isCompact ? "secondary" : "ghost"}
          size={isCompact ? "sm" : "icon"}
          className={cn("text-muted-foreground hover:text-foreground", isCompact ? "h-6 text-[10px] px-2" : "size-8 hover:bg-muted")}
          onClick={onEdit}
        >
          <Pencil className="size-3" />
          {isCompact && <span className="ml-1">Editar</span>}
          {!isCompact && <span className="sr-only">Editar regla</span>}
        </Button>

        <Button
          variant="ghost"
          size={isCompact ? "sm" : "icon"}
          className={cn("text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all", isCompact ? "h-6 px-2" : "size-8")}
          onClick={onDelete}
        >
          <Trash2 className="size-3" />
          <span className="sr-only">Eliminar regla</span>
        </Button>
      </div>
    </div>
  );
}

// ─── Reminder Log Card ────────────────────────────────────────────────────────

type ReminderWithAppointment = AppointmentReminder & {
  appointment?: {
    id: string; fecha_hora: string; motivo: string; tipo_cita: string;
    paciente?: { nombre_completo: string; telefono: string; email: string };
  };
};

function ReminderLogCard({ reminder }: { reminder: AppointmentReminder }) {
  const r = reminder as ReminderWithAppointment;
  const cfg = STATUS_CONFIG[r.overall_status] ?? STATUS_CONFIG.skipped;
  const StatusIcon = cfg.icon;
  const patientName = r.appointment?.paciente?.nombre_completo;
  const appointmentDate = r.appointment?.fecha_hora;

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border/50 bg-card px-3.5 py-3 hover:border-border transition-colors">
      <div className={cn("flex-none mt-0.5 rounded-full p-1.5 border", cfg.className)}>
        <StatusIcon className="size-3" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", cfg.className)}>
            {cfg.label}
          </span>
          {(r.channels ?? []).map((ch: string) => {
            const Icon = CHANNEL_ICONS[ch] ?? Bell;
            return (
              <Tooltip key={ch}>
                <TooltipTrigger asChild>
                  <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-medium", CHANNEL_COLORS[ch] ?? "text-muted-foreground")}>
                    <Icon className="size-3" />
                    {CHANNEL_LABELS[ch] ?? ch}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Canal: {CHANNEL_LABELS[ch] ?? ch}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        {patientName && (
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5 truncate">
            <User className="size-3 text-muted-foreground flex-none" />
            {patientName}
          </p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
          {appointmentDate && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              Cita: {format(new Date(appointmentDate), "dd MMM yyyy, HH:mm", { locale: es })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatDistanceToNow(new Date(r.scheduled_for), { addSuffix: true, locale: es })}
          </span>
          {r.trigger_type && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-3.5 border-muted-foreground/20">
              {TRIGGER_LABELS[r.trigger_type] ?? r.trigger_type}
            </Badge>
          )}
        </div>
        {r.patient_response && (
          <div className="text-[11px] bg-muted/50 rounded px-2 py-1 text-muted-foreground">
            <span className="font-medium text-foreground">Respuesta: </span>
            &ldquo;{r.patient_response}&rdquo;
          </div>
        )}
        {r.error_message && (
          <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-1">
            <AlertCircle className="size-3 flex-none mt-0.5" />
            {r.error_message}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template Picker Dialog ───────────────────────────────────────────────────

function TemplatePicker({
  open, onClose, onAdd, existingNames,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (t: PresetTemplate) => Promise<void>;
  existingNames: string[];
}) {
  const [adding, setAdding] = useState<string | null>(null);

  async function handleAdd(t: PresetTemplate) {
    setAdding(t.name);
    await onAdd(t);
    setAdding(null);
  }

  const channelColorMap: Record<string, string> = {
    whatsapp: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400",
    email: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
    push: "text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400",
    sms: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Plantillas de recordatorio</DialogTitle>
          <DialogDescription className="text-xs">
            Elige una plantilla predefinida. Puedes editarla después con el botón de lápiz en la regla.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {PRESET_TEMPLATES.map((t) => {
            const alreadyAdded = existingNames.includes(t.name);
            const isAdding = adding === t.name;
            const chColor = channelColorMap[t.channel] ?? "text-gray-600 bg-gray-50";
            return (
              <div
                key={t.name}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  alreadyAdded ? "opacity-50 bg-muted/30" : "bg-card hover:bg-muted/20"
                )}
              >
                <span className="text-xl flex-none mt-0.5">{t.emoji}</span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", chColor)}>
                      {CHANNEL_LABELS[t.channel] ?? t.channel}
                    </span>
                    {alreadyAdded && (
                      <span className="text-[10px] text-muted-foreground">(ya existe)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 italic line-clamp-1">
                    &ldquo;{t.template_body.replace(/\n/g, " ")}&rdquo;
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={alreadyAdded ? "outline" : "default"}
                  className="flex-none h-7 text-xs gap-1"
                  disabled={alreadyAdded || isAdding !== null}
                  onClick={() => handleAdd(t)}
                >
                  {isAdding ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                  {alreadyAdded ? "Agregada" : "Agregar"}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Después de agregar puedes personalizar el mensaje completo.
          </p>
          <Button size="sm" variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
