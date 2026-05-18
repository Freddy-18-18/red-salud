"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Shield,
  Lock,
  Plus,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Settings as SettingsIcon,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Truck,
  ClipboardList,
  Bell,
  CalendarClock,
  Star,
  BarChart3,
  Receipt,
  DollarSign,
  Heart,
  Activity,
  Building2,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@red-salud/design-system";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@red-salud/core/utils";

// ============================================================================
// Types
// ============================================================================

type Scope = "none" | "own" | "team" | "all" | "own_today";

interface RoleRow {
  id: string;
  pharmacy_id: string | null;
  key: string;
  label_es: string;
  description: string | null;
  is_system: boolean;
  is_default: boolean;
  permissions: Record<string, unknown>;
  updated_at: string;
}

interface ResourceConfig {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  actions: ActionConfig[];
}

interface ActionConfig {
  key: string;
  label: string;
  type: "boolean" | "scope" | "scope_with_today" | "number" | "fields_hidden";
  description?: string;
  scopeOptions?: Scope[];
}

// ============================================================================
// Resource × Action configuration (drives the UI)
// ============================================================================

const SCOPE_LABELS: Record<Scope, string> = {
  none: "Sin acceso",
  own: "Solo propio",
  team: "Mi equipo",
  all: "Todo",
  own_today: "Solo del día",
};

const RESOURCES: ResourceConfig[] = [
  {
    key: "products", label: "Productos", icon: Package, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "create", label: "Crear", type: "boolean" },
      { key: "update", label: "Editar", type: "scope" },
      { key: "delete", label: "Eliminar", type: "boolean" },
      { key: "fields_hidden", label: "Campos ocultos", type: "fields_hidden" },
    ],
  },
  {
    key: "batches", label: "Lotes", icon: CalendarClock, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "create", label: "Crear", type: "boolean" },
      { key: "update", label: "Editar", type: "scope" },
      { key: "delete", label: "Eliminar", type: "boolean" },
      { key: "adjust_quantity", label: "Ajustar cantidad manual", type: "boolean", description: "Permite cambiar cantidad sin venta — alto riesgo de fraude" },
    ],
  },
  {
    key: "invoices", label: "Facturas / Caja", icon: ShoppingCart, actions: [
      { key: "view", label: "Ver", type: "scope", scopeOptions: ["none", "own", "all"] },
      { key: "create", label: "Crear (facturar)", type: "boolean" },
      { key: "update", label: "Editar", type: "boolean" },
      { key: "void", label: "Anular", type: "scope_with_today", scopeOptions: ["none", "own_today", "own", "all"] },
      { key: "fields_hidden", label: "Campos ocultos", type: "fields_hidden" },
    ],
  },
  {
    key: "prescriptions", label: "Recetas", icon: FileText, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "create", label: "Recibir/Crear", type: "boolean" },
      { key: "update", label: "Editar", type: "boolean" },
      { key: "dispense", label: "Dispensar", type: "boolean", description: "Solo farmacéuticos licenciados pueden dispensar controlados" },
      { key: "edit_content", label: "Modificar contenido de la receta", type: "boolean", description: "Casi nunca habilitar — viola la integridad de la receta del médico" },
    ],
  },
  {
    key: "suppliers", label: "Proveedores", icon: Truck, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "create", label: "Crear", type: "boolean" },
      { key: "update", label: "Editar", type: "boolean" },
      { key: "delete", label: "Eliminar", type: "boolean" },
    ],
  },
  {
    key: "purchase_orders", label: "Pedidos de compra", icon: ClipboardList, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "create", label: "Crear", type: "boolean" },
      { key: "update", label: "Editar", type: "boolean" },
      { key: "approve", label: "Aprobar", type: "boolean" },
      { key: "amount_limit_usd", label: "Límite de aprobación (USD)", type: "number", description: "0 = no puede aprobar; null = sin límite" },
    ],
  },
  {
    key: "loyalty_members", label: "Fidelización", icon: Star, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "create", label: "Inscribir", type: "boolean" },
      { key: "update", label: "Editar", type: "scope" },
      { key: "redeem_points", label: "Canjear puntos", type: "boolean" },
      { key: "edit_points_balance", label: "Editar balance manual", type: "boolean", description: "Anti-fraude: típicamente solo manager+" },
    ],
  },
  {
    key: "deliveries", label: "Entregas", icon: Activity, actions: [
      { key: "view", label: "Ver", type: "scope", scopeOptions: ["none", "own", "team", "all"] },
      { key: "create", label: "Crear", type: "boolean" },
      { key: "update_status", label: "Actualizar estado", type: "scope", scopeOptions: ["none", "own", "team", "all"] },
      { key: "reassign", label: "Reasignar repartidor", type: "boolean" },
    ],
  },
  {
    key: "staff", label: "Personal", icon: Users, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "create", label: "Contratar", type: "boolean" },
      { key: "update", label: "Editar", type: "boolean" },
      { key: "delete", label: "Despedir", type: "boolean" },
      { key: "view_salaries", label: "Ver salarios", type: "boolean" },
    ],
  },
  {
    key: "reports", label: "Reportes", icon: BarChart3, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "export", label: "Exportar (CSV/PDF)", type: "boolean" },
      { key: "view_financial", label: "Ver financieros (margen, costos)", type: "boolean" },
    ],
  },
  {
    key: "settings", label: "Configuración SaaS", icon: SettingsIcon, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "update", label: "Modificar", type: "boolean", description: "Cambiar RIF, dirección, plan, integraciones — owner only" },
    ],
  },
  {
    key: "alerts", label: "Alertas", icon: Bell, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "resolve", label: "Resolver/Marcar leída", type: "boolean" },
    ],
  },
  {
    key: "cash_session", label: "Sesión de caja", icon: Receipt, actions: [
      { key: "view", label: "Ver", type: "scope", scopeOptions: ["none", "own", "all"] },
      { key: "open", label: "Abrir caja", type: "boolean" },
      { key: "close", label: "Cerrar caja", type: "boolean" },
    ],
  },
  {
    key: "exchange_rate", label: "Tasa BCV", icon: DollarSign, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "update", label: "Modificar manual", type: "boolean" },
    ],
  },
  {
    key: "insurance", label: "Seguros / HCM", icon: Heart, actions: [
      { key: "view", label: "Ver", type: "scope" },
      { key: "create", label: "Crear contrato", type: "boolean" },
      { key: "update", label: "Editar", type: "boolean" },
      { key: "delete", label: "Eliminar", type: "boolean" },
    ],
  },
  {
    key: "audit_logs", label: "Logs de auditoría", icon: Lock, actions: [
      { key: "view", label: "Ver", type: "scope", scopeOptions: ["none", "all"] },
    ],
  },
];

const COMMON_HIDDEN_FIELDS = ["cost_usd", "cost_bs", "profit_margin"];

const DEFAULT_SCOPES: Scope[] = ["none", "own", "all"];

// ============================================================================
// Component
// ============================================================================

interface RoleManagerProps {
  pharmacyId: string;
  pharmacyName: string;
  initialRoles: RoleRow[];
}

export function RoleManager({ pharmacyId, pharmacyName, initialRoles }: RoleManagerProps) {
  const [roles, setRoles] = useState<RoleRow[]>(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialRoles[0]?.id ?? "",
  );
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    label_es: "",
    description: "",
    cloneFromKey: "cashier",
  });

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId),
    [roles, selectedRoleId],
  );

  // Initialize draft from selected role
  const ensureDraft = useCallback(() => {
    if (!selectedRole) return null;
    if (draft) return draft;
    const cloned = JSON.parse(JSON.stringify(selectedRole.permissions));
    setDraft(cloned);
    return cloned;
  }, [draft, selectedRole]);

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setDraft(null);
    setFeedback(null);
  };

  const updateDraft = (resource: string, action: string, value: unknown) => {
    const current = ensureDraft();
    if (!current) return;
    const next = JSON.parse(JSON.stringify(current));
    if (!next.resources) next.resources = {};
    if (!next.resources[resource]) next.resources[resource] = {};
    next.resources[resource][action] = value;
    setDraft(next);
  };

  const isDirty = draft !== null;

  const handleSave = async () => {
    if (!selectedRole || !draft) return;
    if (selectedRole.is_system) {
      setFeedback({ kind: "err", msg: "El rol del sistema no puede modificarse." });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("pharmacy_role_definitions")
        .update({ permissions: draft })
        .eq("id", selectedRole.id);

      if (error) throw error;

      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id ? { ...r, permissions: draft } : r,
        ),
      );
      setDraft(null);
      setFeedback({ kind: "ok", msg: "Permisos guardados." });
    } catch (e) {
      setFeedback({
        kind: "err",
        msg: e instanceof Error ? e.message : "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setDraft(null);
    setFeedback(null);
  };

  const handleCreateRole = async () => {
    if (!createForm.label_es.trim()) {
      setFeedback({ kind: "err", msg: "El nombre del rol es obligatorio." });
      return;
    }

    const cloneFrom = roles.find((r) => r.key === createForm.cloneFromKey);
    if (!cloneFrom) {
      setFeedback({ kind: "err", msg: "El rol base seleccionado no existe." });
      return;
    }

    const slug =
      "custom_" +
      createForm.label_es
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 40);

    setSaving(true);
    setFeedback(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pharmacy_role_definitions")
        .insert({
          pharmacy_id: pharmacyId,
          key: slug,
          label_es: createForm.label_es.trim(),
          description: createForm.description.trim() || null,
          is_system: false,
          is_default: false,
          permissions: cloneFrom.permissions,
        })
        .select()
        .single();

      if (error) throw error;

      setRoles((prev) => [...prev, data as RoleRow]);
      setSelectedRoleId((data as RoleRow).id);
      setDraft(null);
      setCreateOpen(false);
      setCreateForm({ label_es: "", description: "", cloneFromKey: "cashier" });
      setFeedback({ kind: "ok", msg: `Rol "${createForm.label_es}" creado.` });
    } catch (e) {
      setFeedback({
        kind: "err",
        msg: e instanceof Error ? e.message : "Error al crear el rol",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: RoleRow) => {
    if (role.is_system || role.is_default) {
      setFeedback({
        kind: "err",
        msg: "Los roles del sistema y por defecto no pueden eliminarse.",
      });
      return;
    }
    if (!confirm(`¿Eliminar el rol "${role.label_es}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("pharmacy_role_definitions")
        .delete()
        .eq("id", role.id);
      if (error) throw error;

      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      if (selectedRoleId === role.id) {
        setSelectedRoleId(roles[0]?.id ?? "");
      }
      setFeedback({ kind: "ok", msg: "Rol eliminado." });
    } catch (e) {
      setFeedback({
        kind: "err",
        msg: e instanceof Error ? e.message : "Error al eliminar",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const activePerms =
    (draft as { resources?: Record<string, Record<string, unknown>> } | null)
      ?.resources ??
    (selectedRole?.permissions as { resources?: Record<string, Record<string, unknown>> } | undefined)
      ?.resources ??
    {};

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Roles y Permisos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            <Building2 className="h-3.5 w-3.5 inline mr-1" />
            {pharmacyName} — {roles.length} roles configurados
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Crear rol custom
        </Button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
            feedback.kind === "ok"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200",
          )}
        >
          {feedback.kind === "ok" ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Layout: roles list (left) + matrix (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Roles list */}
        <Card className="h-fit">
          <CardContent className="p-2">
            <div className="space-y-1">
              {roles.map((role) => {
                const selected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleSelectRole(role.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-2",
                      selected
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-slate-50 text-slate-700",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium truncate">{role.label_es}</span>
                        {role.is_system && (
                          <Lock className="h-3 w-3 shrink-0 text-slate-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {role.is_system && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 border-slate-300">
                            Sistema
                          </Badge>
                        )}
                        {role.is_default && !role.is_system && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 border-slate-300">
                            Default
                          </Badge>
                        )}
                        {!role.is_default && !role.is_system && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 bg-purple-50 text-purple-700 border-purple-200">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Matrix */}
        <div className="space-y-4">
          {selectedRole && (
            <>
              {/* Selected role header */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedRole.label_es}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        {selectedRole.description ?? "Sin descripción."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!selectedRole.is_default && !selectedRole.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(selectedRole)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {isDirty && (
                        <>
                          <Button variant="outline" size="sm" onClick={handleDiscard}>
                            Descartar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || selectedRole.is_system}
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Save className="h-4 w-4" />
                            Guardar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {selectedRole.is_system && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      <Lock className="h-3.5 w-3.5" />
                      Este rol es del sistema. Sus permisos no se pueden modificar.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resource cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {RESOURCES.map((resource) => (
                  <ResourcePermissionCard
                    key={resource.key}
                    resource={resource}
                    perms={activePerms[resource.key] ?? {}}
                    disabled={selectedRole.is_system}
                    onChange={(action, value) =>
                      updateDraft(resource.key, action, value)
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create custom role dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear rol custom</DialogTitle>
            <DialogDescription>
              Empezá clonando los permisos de un rol existente. Después podés ajustar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre del rol</Label>
              <Input
                value={createForm.label_es}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, label_es: e.target.value }))
                }
                placeholder="Ej: Cajero Senior, Practicante UCV"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Input
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Para qué usás este rol"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Clonar permisos de</Label>
              <Select
                value={createForm.cloneFromKey}
                onValueChange={(v) =>
                  setCreateForm((f) => ({ ...f, cloneFromKey: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    .filter((r) => !r.is_system || r.key === "owner")
                    .map((r) => (
                      <SelectItem key={r.id} value={r.key}>
                        {r.label_es}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole} disabled={saving}>
              <Plus className="h-4 w-4 mr-1" /> Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Resource card — a single resource with all its actions
// ============================================================================

function ResourcePermissionCard({
  resource,
  perms,
  disabled,
  onChange,
}: {
  resource: ResourceConfig;
  perms: Record<string, unknown>;
  disabled: boolean;
  onChange: (action: string, value: unknown) => void;
}) {
  const Icon = resource.icon;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b">
          <Icon className="h-4 w-4 text-blue-600" />
          <h3 className="font-medium text-slate-900">{resource.label}</h3>
        </div>
        <div className="space-y-2.5">
          {resource.actions.map((action) => (
            <ActionControl
              key={action.key}
              action={action}
              value={perms[action.key]}
              disabled={disabled}
              onChange={(v) => onChange(action.key, v)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionControl({
  action,
  value,
  disabled,
  onChange,
}: {
  action: ActionConfig;
  value: unknown;
  disabled: boolean;
  onChange: (v: unknown) => void;
}) {
  const scopes = action.scopeOptions ?? DEFAULT_SCOPES;

  if (action.type === "boolean") {
    return (
      <div className="flex items-start justify-between gap-2 text-sm">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-700">{action.label}</p>
          {action.description && (
            <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
          )}
        </div>
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v)}
          disabled={disabled}
        />
      </div>
    );
  }

  if (action.type === "scope" || action.type === "scope_with_today") {
    const current = (typeof value === "string" ? value : "none") as Scope;
    return (
      <div className="flex items-start justify-between gap-2 text-sm">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-700">{action.label}</p>
          {action.description && (
            <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
          )}
        </div>
        <Select
          value={current}
          onValueChange={(v) => onChange(v)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scopes.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {SCOPE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (action.type === "number") {
    const num = typeof value === "number" ? value : value === null ? null : 0;
    return (
      <div className="flex items-start justify-between gap-2 text-sm">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-700">{action.label}</p>
          {action.description && (
            <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
          )}
        </div>
        <Input
          type="number"
          value={num ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? null : Number(v));
          }}
          disabled={disabled}
          className="h-8 w-24 text-xs"
          placeholder="∞"
        />
      </div>
    );
  }

  if (action.type === "fields_hidden") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-slate-700">{action.label}</p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_HIDDEN_FIELDS.map((field) => {
            const checked = arr.includes(field);
            return (
              <button
                key={field}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const next = checked
                    ? arr.filter((f) => f !== field)
                    : [...arr, field];
                  onChange(next);
                }}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded border transition-colors",
                  checked
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {checked ? "🚫 " : ""}
                {field}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
