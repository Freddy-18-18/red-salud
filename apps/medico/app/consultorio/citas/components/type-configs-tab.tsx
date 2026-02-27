"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, X, Settings2, AlertCircle, Check, Globe, Lock } from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Badge, ScrollArea, Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, Input, Label, Switch,
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import { useTypeConfigs } from "@/hooks/use-type-configs";
import { createClient } from "@/lib/supabase/client";
import { TIPO_LABELS, type AppointmentTypeConfig, type CreateTypeConfigInput } from "@/lib/supabase/services/type-configs-service";

interface TypeConfigsTabProps {
  selectedOfficeId: string | null;
}

const PRESET_COLORS = [
  "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#10b981",
  "#84cc16", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
  "#64748b", "#1e293b",
];

// ── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM: Omit<CreateTypeConfigInput, "specialty_slug"> = {
  tipo_cita:                  "",
  procedure_code:             null,
  duracion_default:           30,
  duracion_min:               15,
  duracion_max:               60,
  buffer_before_min:          0,
  buffer_after_min:           5,
  color:                      "#3b82f6",
  reminder_templates:         { "24h": true, "2h": true, "30min": false },
  reminder_message_override:  null,
  preparation_instructions:   null,
  requires_consent_form:      false,
  consent_form_url:           null,
  is_high_privacy:            false,
  shows_tooth_selector:       false,
  shows_session_counter:      false,
  allow_online_booking:       true,
};

function InlineNumber({
  value, min = 0, max = 240, step = 5, onChange, disabled,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => { setLocal(String(value)); }, [value]);

  const commit = () => {
    const n = parseInt(local, 10);
    if (!Number.isNaN(n) && n >= min && n <= max) onChange(n);
    else setLocal(String(value));
  };

  return (
    <Input
      type="number"
      className="h-7 w-16 text-center text-sm px-1"
      value={local}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
    />
  );
}

export function TypeConfigsTab({ selectedOfficeId: _ }: TypeConfigsTabProps) {
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setDoctorId(user.id);
    });
  }, []);

  const { configs, loading, saving, error, editConfig, addConfig, removeConfig } =
    useTypeConfigs({ doctorId: doctorId ?? "" });

  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [form, setForm]                 = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [formErrors, setFormErrors]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess]   = useState<string | null>(null);
  const successTimeout                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openCreateDialog() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors(null);
    setDialogOpen(true);
  }

  function openEditDialog(cfg: AppointmentTypeConfig) {
    setEditingId(cfg.id);
    setForm({
      tipo_cita:                  cfg.tipo_cita,
      procedure_code:             cfg.procedure_code,
      duracion_default:           cfg.duracion_default,
      duracion_min:               cfg.duracion_min,
      duracion_max:               cfg.duracion_max,
      buffer_before_min:          cfg.buffer_before_min,
      buffer_after_min:           cfg.buffer_after_min,
      color:                      cfg.color,
      reminder_templates:         cfg.reminder_templates,
      reminder_message_override:  cfg.reminder_message_override,
      preparation_instructions:   cfg.preparation_instructions,
      requires_consent_form:      cfg.requires_consent_form,
      consent_form_url:           cfg.consent_form_url,
      is_high_privacy:            cfg.is_high_privacy,
      shows_tooth_selector:       cfg.shows_tooth_selector,
      shows_session_counter:      cfg.shows_session_counter,
      allow_online_booking:       cfg.allow_online_booking,
    });
    setFormErrors(null);
    setDialogOpen(true);
  }

  async function submitForm() {
    if (!form.tipo_cita.trim()) {
      setFormErrors("El nombre del tipo es obligatorio.");
      return;
    }
    if (form.duracion_default < 5) {
      setFormErrors("La duración mínima es 5 minutos.");
      return;
    }

    setFormErrors(null);
    let result: { error: string | null };

    if (editingId) {
      result = await editConfig(editingId, { ...form, specialty_slug: null });
    } else {
      result = await addConfig({ ...form, specialty_slug: null });
    }

    if (result.error) {
      setFormErrors(result.error);
      return;
    }

    setDialogOpen(false);
    flashSuccess(editingId ?? "new");
  }

  async function confirmDelete(id: string) {
    const result = await removeConfig(id);
    if (result.error) console.error(result.error);
    setDeleteTarget(null);
  }

  function flashSuccess(id: string) {
    if (successTimeout.current) clearTimeout(successTimeout.current);
    setSaveSuccess(id);
    successTimeout.current = setTimeout(() => setSaveSuccess(null), 2000);
  }

  // ── Inline save helpers ────────────────────────────────────────────────────
  async function inlineSave(id: string, updates: Partial<AppointmentTypeConfig>) {
    const result = await editConfig(id, updates);
    if (!result.error) flashSuccess(id);
  }

  if (!doctorId || loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Cargando configuraciones…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-destructive">
        <AlertCircle className="size-4" />
        <span>{error}</span>
      </div>
    );
  }

  const configToDelete = configs.find((c) => c.id === deleteTarget);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b bg-muted/20">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              Tipos de cita
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configura duración, buffers y comportamiento por tipo de consulta
            </p>
          </div>
          <Button size="sm" onClick={openCreateDialog} className="gap-1.5">
            <Plus className="size-3.5" />
            Nuevo tipo
          </Button>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            {configs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <Settings2 className="size-8 opacity-40" />
                  <p className="text-sm">No hay tipos configurados</p>
                  <Button variant="outline" size="sm" onClick={openCreateDialog} className="gap-1.5">
                    <Plus className="size-3.5" />
                    Crear el primero
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[180px_1fr_80px_80px_80px_80px_80px_80px_56px] gap-0 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
                  {["Tipo de cita","Instrucciones previas","Duración","Mín","Máx","Buffer pre","Buffer post","Reserva online",""].map((h, i) => (
                    <div key={i} className={cn("px-3 py-2 truncate", i === 0 && "flex items-center gap-2")}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {configs.map((cfg) => {
                  const isSaving  = saving === cfg.id;
                  const isSuccess = saveSuccess === cfg.id;

                  return (
                    <div
                      key={cfg.id}
                      className={cn(
                        "grid grid-cols-[180px_1fr_80px_80px_80px_80px_80px_80px_56px] gap-0",
                        "border-b last:border-b-0 hover:bg-muted/20 transition-colors",
                        isSaving && "opacity-60",
                        isSuccess && "bg-emerald-50/40 dark:bg-emerald-900/10"
                      )}
                    >
                      {/* Tipo */}
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <span
                          className="size-3 rounded-full flex-none ring-1 ring-border"
                          style={{ background: cfg.color }}
                        />
                        <span className="text-sm font-medium truncate">
                          {TIPO_LABELS[cfg.tipo_cita] ?? cfg.tipo_cita}
                        </span>
                        {isSuccess && <Check className="size-3 text-emerald-600 flex-none" />}
                      </div>

                      {/* Instrucciones */}
                      <div className="flex items-center px-3 py-2.5">
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {cfg.preparation_instructions ?? (
                            <span className="italic opacity-50">Sin instrucciones</span>
                          )}
                        </p>
                      </div>

                      {/* Duración default */}
                      <div className="flex items-center px-2 py-2.5">
                        <InlineNumber
                          value={cfg.duracion_default}
                          min={5} max={240} step={5}
                          disabled={isSaving}
                          onChange={(v) => inlineSave(cfg.id, { duracion_default: v })}
                        />
                      </div>

                      {/* Mín */}
                      <div className="flex items-center px-2 py-2.5">
                        <InlineNumber
                          value={cfg.duracion_min}
                          min={5} max={cfg.duracion_max} step={5}
                          disabled={isSaving}
                          onChange={(v) => inlineSave(cfg.id, { duracion_min: v })}
                        />
                      </div>

                      {/* Máx */}
                      <div className="flex items-center px-2 py-2.5">
                        <InlineNumber
                          value={cfg.duracion_max}
                          min={cfg.duracion_min} max={480} step={5}
                          disabled={isSaving}
                          onChange={(v) => inlineSave(cfg.id, { duracion_max: v })}
                        />
                      </div>

                      {/* Buffer antes */}
                      <div className="flex items-center px-2 py-2.5">
                        <InlineNumber
                          value={cfg.buffer_before_min}
                          min={0} max={60} step={5}
                          disabled={isSaving}
                          onChange={(v) => inlineSave(cfg.id, { buffer_before_min: v })}
                        />
                      </div>

                      {/* Buffer después */}
                      <div className="flex items-center px-2 py-2.5">
                        <InlineNumber
                          value={cfg.buffer_after_min}
                          min={0} max={60} step={5}
                          disabled={isSaving}
                          onChange={(v) => inlineSave(cfg.id, { buffer_after_min: v })}
                        />
                      </div>

                      {/* Reserva online */}
                      <div className="flex items-center justify-center px-2 py-2.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() =>
                                inlineSave(cfg.id, { allow_online_booking: !cfg.allow_online_booking })
                              }
                              disabled={isSaving}
                              className="rounded p-1 hover:bg-muted/40 transition-colors"
                            >
                              {cfg.allow_online_booking
                                ? <Globe className="size-4 text-emerald-600" />
                                : <Lock  className="size-4 text-muted-foreground" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {cfg.allow_online_booking ? "Reserva online activa" : "Solo reserva presencial"}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-0.5 px-1 py-2.5">
                        {isSaving ? (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => openEditDialog(cfg)}
                                  className="rounded p-1 hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Editar completo</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setDeleteTarget(cfg.id)}
                                  className="rounded p-1 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <p className="mt-3 text-xs text-muted-foreground">
              Todos los valores de duración están en <strong>minutos</strong>. Los buffers se aplican antes
              y después de cada cita para preparación y documentación.
            </p>
          </div>
        </ScrollArea>

        {/* ── Edit/Create Dialog ─────────────────────────────────────────── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar tipo de cita" : "Nuevo tipo de cita"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {formErrors && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  <AlertCircle className="size-4 flex-none" />
                  {formErrors}
                </div>
              )}

              {/* Nombre */}
              <div className="space-y-1.5">
                <Label>Nombre del tipo *</Label>
                <Input
                  placeholder="Ej: primera_vez, urgencia, limpieza…"
                  value={form.tipo_cita}
                  onChange={(e) => setForm((f) => ({ ...f, tipo_cita: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  disabled={saving === "new" || (editingId !== null && saving === editingId)}
                />
                <p className="text-xs text-muted-foreground">Sin espacios, en minúsculas, con guiones bajos.</p>
              </div>

              {/* Color */}
              <div className="space-y-1.5">
                <Label>Color en calendario</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className={cn(
                        "size-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                        form.color === c ? "ring-foreground scale-110" : "ring-transparent hover:scale-105"
                      )}
                      style={{ background: c }}
                    />
                  ))}
                  <Input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="w-9 h-7 p-0.5 rounded-full cursor-pointer"
                  />
                </div>
              </div>

              {/* Duración */}
              <div className="grid grid-cols-3 gap-3">
                {([ ["Duración por defecto (min)", "duracion_default", 5, 240], ["Duración mínima (min)", "duracion_min", 5, 240], ["Duración máxima (min)", "duracion_max", 5, 480] ] as [string, keyof typeof form, number, number][]).map(([label, key, min, max]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      type="number" min={min} max={max} step={5}
                      value={form[key] as number}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: parseInt(e.target.value, 10) || 0 }))}
                    />
                  </div>
                ))}
              </div>

              {/* Buffers */}
              <div className="grid grid-cols-2 gap-3">
                {([ ["Buffer antes (min)", "buffer_before_min"], ["Buffer después (min)", "buffer_after_min"] ] as [string, keyof typeof form][]).map(([label, key]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      type="number" min={0} max={60} step={5}
                      value={form[key] as number}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: parseInt(e.target.value, 10) || 0 }))}
                    />
                  </div>
                ))}
              </div>

              {/* Instrucciones previas */}
              <div className="space-y-1.5">
                <Label className="text-xs">Instrucciones al confirmar</Label>
                <textarea
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Ej: Asistir en ayunas. Traer estudios previos."
                  value={form.preparation_instructions ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, preparation_instructions: e.target.value || null }))}
                />
              </div>

              {/* Switches */}
              <Card className="border-dashed">
                <CardContent className="py-3 space-y-3">
                  {([ ["Permite reserva en línea",     "allow_online_booking"   ],
                      ["Requiere formulario de consentimiento", "requires_consent_form"],
                      ["Alta privacidad (psicología)",  "is_high_privacy"        ],
                      ["Mostrar selector de piezas",    "shows_tooth_selector"   ],
                      ["Mostrar contador de sesiones",  "shows_session_counter"  ],
                  ] as [string, keyof typeof form][]).map(([label, key]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm cursor-pointer">{label}</Label>
                      <Switch
                        checked={form[key] as boolean}
                        onCheckedChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Reminder overrides */}
              <Card className="border-dashed">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recordatorios automáticos
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3 space-y-2">
                  {([ ["24 horas antes", "24h"], ["2 horas antes", "2h"], ["30 minutos antes", "30min"] ] as [string, "24h" | "2h" | "30min"][]).map(([label, key]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm cursor-pointer">{label}</Label>
                      <Switch
                        checked={form.reminder_templates[key]}
                        onCheckedChange={(v) =>
                          setForm((f) => ({
                            ...f,
                            reminder_templates: { ...f.reminder_templates, [key]: v },
                          }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="gap-1.5">
                <X className="size-3.5" />
                Cancelar
              </Button>
              <Button
                onClick={submitForm}
                disabled={saving === "new" || (editingId !== null && saving === editingId)}
                className="gap-1.5"
              >
                {(saving === "new" || saving === editingId) ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {editingId ? "Guardar cambios" : "Crear tipo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete confirmation ────────────────────────────────────────── */}
        <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-2">
              ¿Eliminar el tipo <strong>{TIPO_LABELS[configToDelete?.tipo_cita ?? ""] ?? configToDelete?.tipo_cita}</strong>?
              Las citas existentes no se verán afectadas.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button
                variant="destructive"
                onClick={() => deleteTarget && confirmDelete(deleteTarget)}
                disabled={saving === deleteTarget}
                className="gap-1.5"
              >
                {saving === deleteTarget && <Loader2 className="size-3.5 animate-spin" />}
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
