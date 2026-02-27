"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Button, Badge, Input, Label, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Switch,
} from "@red-salud/design-system";
import {
  Separator,
} from "@red-salud/design-system";
import {
  Bell, MessageSquare, Mail, Smartphone, Zap, Phone,
  Clock, Check, X, Eye, Loader2, ChevronRight,
  Hash, User, Calendar, Timer, Building2, Info,
} from "lucide-react";
import type { ReminderRule, CreateReminderRuleInput } from "@/lib/supabase/services/reminder-service";

// ── Preview sample values ─────────────────────────────────────────────────────
const SAMPLE: Record<string, string> = {
  patient_name: "Carlos Rodríguez",
  doctor_name: "Dr. Martínez",
  date: "lunes 23 feb",
  time: "10:00 AM",
  duration: "30 min",
  motivo: "Consulta general",
  office_name: "Consultorio Centro",
  phone: "+58 412-555-0011",
  reschedule_link: "https://red-salud.com/r/x7k2",
};

function resolvePreview(template: string): string {
  return template
    .replace(/\{(\w+)\}/g, (_, key) => SAMPLE[key] ?? `{${key}}`);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-green-600" },
  { value: "email", label: "Email", icon: Mail, color: "text-amber-500" },
  { value: "push", label: "Push App", icon: Smartphone, color: "text-violet-500" },
  { value: "sms", label: "SMS", icon: Phone, color: "text-blue-500" },
  { value: "multi", label: "Multi-canal", icon: Zap, color: "text-pink-500" },
];

const TRIGGERS = [
  { value: "before_appointment", label: "Antes de la cita" },
  { value: "after_appointment", label: "Después de la cita" },
  { value: "on_cancel", label: "Al cancelar" },
  { value: "on_no_show", label: "Cuando no asiste" },
  { value: "on_confirm", label: "Al confirmar" },
  { value: "recall_due", label: "Recall de seguimiento" },
  { value: "custom_interval", label: "Intervalo personalizado" },
];

const VARIABLES = [
  { key: "patient_name", label: "Nombre paciente", icon: User },
  { key: "doctor_name", label: "Nombre médico", icon: User },
  { key: "date", label: "Fecha cita", icon: Calendar },
  { key: "time", label: "Hora cita", icon: Timer },
  { key: "duration", label: "Duración", icon: Clock },
  { key: "motivo", label: "Motivo", icon: Hash },
  { key: "office_name", label: "Consultorio", icon: Building2 },
  { key: "reschedule_link", label: "Link reagendar", icon: ChevronRight },
];

type FormState = {
  name: string;
  trigger_type: string;
  trigger_hours_offset: number;
  channel: string;
  template_body: string;
  allows_confirm: boolean;
  allows_reschedule: boolean;
  allows_cancel: boolean;
  is_active: boolean;
  description: string;
};

const BLANK_FORM: FormState = {
  name: "",
  trigger_type: "before_appointment",
  trigger_hours_offset: -24,
  channel: "whatsapp",
  template_body: "Hola {patient_name} 👋 Le recordamos su cita con {doctor_name} el {date} a las {time}. Confirme con *1*, reagende con *2* o cancele con *3*.",
  allows_confirm: true,
  allows_reschedule: true,
  allows_cancel: true,
  is_active: true,
  description: "",
};

function ruleToForm(rule: ReminderRule): FormState {
  return {
    name: rule.name,
    trigger_type: rule.trigger_type,
    trigger_hours_offset: rule.trigger_hours_offset,
    channel: rule.channel,
    template_body: rule.template_body,
    allows_confirm: rule.allows_confirm,
    allows_reschedule: rule.allows_reschedule,
    allows_cancel: rule.allows_cancel,
    is_active: rule.is_active,
    description: rule.description ?? "",
  };
}

// ── Exported component ────────────────────────────────────────────────────────

interface ReminderEditorSheetProps {
  open: boolean;
  rule?: ReminderRule | null;   // null = create new
  onClose: () => void;
  onSave: (data: Partial<CreateReminderRuleInput>, id?: string) => Promise<void>;
}

export function ReminderEditorSheet({ open, rule, onClose, onSave }: ReminderEditorSheetProps) {
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [previewChannel, setPreviewChannel] = useState<string>("whatsapp");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when rule changes
  useEffect(() => {
    setForm(rule ? ruleToForm(rule) : BLANK_FORM);
    setPreviewChannel(rule?.channel ?? "whatsapp");
  }, [rule, open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function insertVariable(key: string) {
    const el = textareaRef.current;
    if (!el) {
      set("template_body", form.template_body + `{${key}}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = form.template_body;
    const newText = text.substring(0, start) + `{${key}}` + text.substring(end);
    set("template_body", newText);
    // restore cursor after variable
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + key.length + 2;
      el.setSelectionRange(pos, pos);
    });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.template_body.trim()) return;
    setSaving(true);
    const payload: Partial<CreateReminderRuleInput> = {
      name: form.name.trim(),
      description: form.description || null,
      trigger_type: form.trigger_type as ReminderRule["trigger_type"],
      trigger_hours_offset: form.trigger_hours_offset,
      channel: form.channel as ReminderRule["channel"],
      template_body: form.template_body,
      allows_confirm: form.allows_confirm,
      allows_reschedule: form.allows_reschedule,
      allows_cancel: form.allows_cancel,
      is_active: form.is_active,
      // required fields with sensible defaults
      office_id: null,
      applies_to_tipos: [],
      specialty_context: null,
      trigger_time_of_day: null,
      channel_priority: [form.channel],
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
    };
    await onSave(payload, rule?.id);
    setSaving(false);
    onClose();
  }

  const preview = resolvePreview(form.template_body);
  const isEditing = !!rule;

  if (!open) return null;

  return (
    <div
      className="h-full min-h-0 flex flex-col"
      role="region"
      aria-label={isEditing ? "Editar recordatorio" : "Nueva regla de recordatorio"}
    >
      {/* Header */}
      <div className="flex-none px-5 pt-5 pb-4 border-b relative">
        <div className="pr-10">
          <h2 className="text-base font-semibold leading-tight">
            {isEditing ? "Editar recordatorio" : "Nueva regla de recordatorio"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isEditing
              ? "Modifica el mensaje, canal y condiciones de esta regla."
              : "Configura cuándo y cómo se enviará el recordatorio automático."}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-3 top-3 size-8 text-muted-foreground hover:text-foreground"
          aria-label="Cerrar editor"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Body — two-column layout */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Left: form */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8 space-y-6 min-w-0">

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-name" className="text-xs font-medium">Nombre de la regla *</Label>
            <Input
              id="rule-name"
              placeholder="Ej: Recordatorio 24h antes"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Trigger + Offset row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Cuándo enviar</Label>
              <Select value={form.trigger_type} onValueChange={(v) => set("trigger_type", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-sm">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(form.trigger_type === "before_appointment" || form.trigger_type === "after_appointment") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Horas {form.trigger_type === "before_appointment" ? "antes" : "después"}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={Math.abs(form.trigger_hours_offset)}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 1;
                      set("trigger_hours_offset", form.trigger_type === "before_appointment" ? -v : v);
                    }}
                    className="h-8 text-sm pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    horas
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Channel */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Canal de envío</Label>
            <div className="flex gap-2 flex-wrap">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const active = form.channel === ch.value;
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => { set("channel", ch.value); setPreviewChannel(ch.value); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-3.5", active ? "" : ch.color)} />
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Template body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Mensaje</Label>
              <span className="text-[10px] text-muted-foreground">{form.template_body.length} chars</span>
            </div>
            <Textarea
              ref={textareaRef}
              value={form.template_body}
              onChange={(e) => set("template_body", e.target.value)}
              placeholder="Escribe el mensaje aquí..."
              className="text-sm min-h-[80px] resize-none font-mono leading-relaxed"
              rows={4}
            />

            {/* Variable chips */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="size-3" />
                Haz click en una variable para insertarla en el cursor
              </p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => insertVariable(key)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono bg-muted hover:bg-primary/10 hover:text-primary border border-border/50 hover:border-primary/30 rounded px-1.5 py-0.5 transition-colors"
                  >
                    <Icon className="size-2.5" />
                    {`{${key}}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions allowed */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">El paciente puede responder con</Label>
            <div className="space-y-2">
              {[
                { key: "allows_confirm", label: "Confirmar cita", desc: "Responde con la keyword de confirmación" },
                { key: "allows_reschedule", label: "Reagendar cita", desc: "Responde para solicitar nuevo horario" },
                { key: "allows_cancel", label: "Cancelar cita", desc: "Responde para cancelar la cita" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={form[key as keyof FormState] as boolean}
                    onCheckedChange={(v) => set(key as keyof FormState, v as never)}
                    className="scale-90 flex-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Active state */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40 border border-border/40">
            <div>
              <p className="text-xs font-medium">Regla activa</p>
              <p className="text-[10px] text-muted-foreground">Los recordatorios se enviarán automáticamente</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => set("is_active", v)}
              className="scale-90 flex-none"
            />
          </div>
        </div>

        {/* Right: preview panel */}
        <div className="w-[280px] lg:w-[340px] flex-none border-l bg-muted/20 overflow-y-auto">
          <PreviewPanel
            message={preview}
            channel={previewChannel}
            onChannelChange={setPreviewChannel}
            allows_confirm={form.allows_confirm}
            allows_reschedule={form.allows_reschedule}
            allows_cancel={form.allows_cancel}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none flex items-center justify-between gap-3 pl-5 pr-24 py-4 border-t bg-muted/10">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !form.name.trim() || !form.template_body.trim()}
          className="gap-1.5 min-w-[100px]"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          {isEditing ? "Guardar cambios" : "Crear regla"}
        </Button>
      </div>
    </div>
  );
}

// ── Preview Panel ─────────────────────────────────────────────────────────────

function PreviewPanel({
  message,
  channel,
  onChannelChange,
  allows_confirm,
  allows_reschedule,
  allows_cancel,
}: {
  message: string;
  channel: string;
  onChannelChange: (c: string) => void;
  allows_confirm: boolean;
  allows_reschedule: boolean;
  allows_cancel: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
          <Eye className="size-3" />
          Vista previa
        </p>
      </div>

      {/* Channel tabs */}
      <div className="flex border-b">
        {["whatsapp", "email", "push"].map((ch) => (
          <button
            key={ch}
            onClick={() => onChannelChange(ch)}
            className={cn(
              "flex-1 py-1.5 text-[10px] font-medium transition-colors",
              channel === ch
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {ch === "whatsapp" ? "WA" : ch === "email" ? "Email" : "Push"}
          </button>
        ))}
      </div>

      <div className="flex-1 p-3">
        {channel === "whatsapp" && (
          <WhatsAppPreview
            message={message}
            allows_confirm={allows_confirm}
            allows_reschedule={allows_reschedule}
            allows_cancel={allows_cancel}
          />
        )}
        {channel === "email" && (
          <EmailPreview message={message} />
        )}
        {channel === "push" && (
          <PushPreview message={message} />
        )}
      </div>
    </div>
  );
}

function WhatsAppPreview({
  message, allows_confirm, allows_reschedule, allows_cancel,
}: {
  message: string; allows_confirm: boolean; allows_reschedule: boolean; allows_cancel: boolean;
}) {
  // Parse *bold* markdown
  const formatted = message.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*")
      ? <strong key={i} className="font-semibold">{part.slice(1, -1)}</strong>
      : <span key={i}>{part}</span>
  );

  return (
    <div className="space-y-2">
      {/* Phone frame */}
      <div className="rounded-2xl overflow-hidden border border-border/60 bg-background shadow-sm">
        <div className="bg-[#e5ddd5] p-2 shadow-inner">
          {/* WA header */}
          <div className="flex items-center gap-2 mb-2 bg-[#075e54] rounded-xl px-2 py-1.5">
            <div className="size-6 rounded-full bg-white/20 flex-none" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-white truncate">Red Salud</p>
              <p className="text-[8px] text-white/70">en línea</p>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Phone className="size-3" />
              <Mail className="size-3" />
            </div>
          </div>

          {/* Message bubble */}
          <div className="bg-white rounded-2xl rounded-tr-md px-2.5 py-2 shadow-sm max-w-[92%]">
            <p className="text-[10px] leading-relaxed text-gray-800 whitespace-pre-wrap">{formatted}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <p className="text-[8px] text-gray-400">10:05</p>
              <p className="text-[8px] text-gray-400">✓✓</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick-reply buttons */}
      {(allows_confirm || allows_reschedule || allows_cancel) && (
        <div className="space-y-1">
          <p className="text-[9px] text-muted-foreground">Respuestas rápidas:</p>
          {allows_confirm && <div className="text-[10px] text-center py-1 rounded border border-[#075e54] text-[#075e54] font-medium">1 · Confirmar ✅</div>}
          {allows_reschedule && <div className="text-[10px] text-center py-1 rounded border border-[#075e54] text-[#075e54] font-medium">2 · Reagendar 📅</div>}
          {allows_cancel && <div className="text-[10px] text-center py-1 rounded border border-rose-400 text-rose-500 font-medium">3 · Cancelar ❌</div>}
        </div>
      )}
    </div>
  );
}

function EmailPreview({ message }: { message: string }) {
  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden text-[10px]">
      <div className="bg-primary px-3 py-2">
        <p className="text-primary-foreground font-semibold text-[10px]">Red Salud</p>
        <p className="text-primary-foreground/70 text-[9px]">recordatorio@red-salud.com</p>
      </div>
      <div className="px-3 py-2 space-y-2">
        <div className="space-y-0.5 text-[9px] text-gray-600">
          <p><span className="font-semibold text-gray-800">Para:</span> {SAMPLE.patient_name}</p>
          <p><span className="font-semibold text-gray-800">Asunto:</span> Recordatorio de cita médica</p>
        </div>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{message}</p>
        <div className="flex gap-1 flex-wrap pt-1">
          <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[9px] font-medium">Confirmar</span>
          <span className="bg-muted rounded px-1.5 py-0.5 text-[9px]">Reagendar</span>
          <span className="bg-rose-50 text-rose-500 rounded px-1.5 py-0.5 text-[9px]">Cancelar</span>
        </div>
        <p className="text-gray-400 text-[8px] border-t pt-1">Red Salud · Tu plataforma de salud</p>
      </div>
    </div>
  );
}

function PushPreview({ message }: { message: string }) {
  return (
    <div className="space-y-2">
      {/* iOS-style notification */}
      <div className="rounded-xl bg-white/90 backdrop-blur shadow-lg border border-white/50 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="size-5 rounded bg-primary flex items-center justify-center flex-none">
            <Bell className="size-3 text-primary-foreground" />
          </div>
          <p className="text-[9px] font-semibold text-gray-800">Red Salud · Ahora</p>
        </div>
        <p className="text-[10px] font-medium text-gray-900 leading-tight">Recordatorio de cita</p>
        <p className="text-[9px] text-gray-600 line-clamp-3 leading-relaxed">{message}</p>
      </div>
      <p className="text-[9px] text-muted-foreground text-center">
        Notificación push en la app del paciente
      </p>
    </div>
  );
}
