// ============================================================================
// RBAC v2 — TypeScript types matching the JSONB shape stored in
// pharmacy_role_definitions.permissions.
// Source of truth: migration `pharmacy_role_definitions_v2_resource_action_scope`.
// ============================================================================

export type Scope = "none" | "own" | "team" | "all" | "own_today";

export interface ProductsPerm {
  view: Scope;
  create: boolean;
  update: Scope;
  delete: boolean;
  fields_hidden: string[];
}

export interface BatchesPerm {
  view: Scope;
  create: boolean;
  update: Scope;
  delete: boolean;
  adjust_quantity: boolean;
}

export interface InvoicesPerm {
  view: Scope;
  create: boolean;
  update: boolean;
  void: Scope;
  fields_hidden: string[];
}

export interface PrescriptionsPerm {
  view: Scope;
  create: boolean;
  update: boolean;
  dispense: boolean;
  edit_content: boolean;
}

export interface SuppliersPerm {
  view: Scope;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface PurchaseOrdersPerm {
  view: Scope;
  create: boolean;
  update: boolean;
  approve: boolean;
  amount_limit_usd: number | null;
}

export interface LoyaltyPerm {
  view: Scope;
  create: boolean;
  update: Scope;
  redeem_points: boolean;
  edit_points_balance: boolean;
}

export interface DeliveriesPerm {
  view: Scope;
  create: boolean;
  update_status: Scope;
  reassign: boolean;
}

export interface StaffPerm {
  view: Scope;
  create: boolean;
  update: boolean;
  delete: boolean;
  view_salaries: boolean;
}

export interface ReportsPerm {
  view: Scope;
  export: boolean;
  view_financial: boolean;
}

export interface SettingsPerm {
  view: Scope;
  update: boolean;
}

export interface AlertsPerm {
  view: Scope;
  resolve: boolean;
}

export interface CashSessionPerm {
  view: Scope;
  open: boolean;
  close: boolean;
}

export interface ExchangeRatePerm {
  view: Scope;
  update: boolean;
}

export interface InsurancePerm {
  view: Scope;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface AuditLogsPerm {
  view: Scope;
}

export interface PharmacyPermissions {
  version: 2;
  resources: {
    products: ProductsPerm;
    batches: BatchesPerm;
    invoices: InvoicesPerm;
    prescriptions: PrescriptionsPerm;
    suppliers: SuppliersPerm;
    purchase_orders: PurchaseOrdersPerm;
    loyalty_members: LoyaltyPerm;
    deliveries: DeliveriesPerm;
    staff: StaffPerm;
    reports: ReportsPerm;
    settings: SettingsPerm;
    alerts: AlertsPerm;
    cash_session: CashSessionPerm;
    exchange_rate: ExchangeRatePerm;
    insurance: InsurancePerm;
    audit_logs: AuditLogsPerm;
  };
}

export type Resource = keyof PharmacyPermissions["resources"];

// Empty permissions returned when user has no role / no pharmacy.
export const EMPTY_PERMISSIONS: PharmacyPermissions = {
  version: 2,
  resources: {
    products: { view: "none", create: false, update: "none", delete: false, fields_hidden: [] },
    batches: { view: "none", create: false, update: "none", delete: false, adjust_quantity: false },
    invoices: { view: "none", create: false, update: false, void: "none", fields_hidden: [] },
    prescriptions: { view: "none", create: false, update: false, dispense: false, edit_content: false },
    suppliers: { view: "none", create: false, update: false, delete: false },
    purchase_orders: { view: "none", create: false, update: false, approve: false, amount_limit_usd: 0 },
    loyalty_members: { view: "none", create: false, update: "none", redeem_points: false, edit_points_balance: false },
    deliveries: { view: "none", create: false, update_status: "none", reassign: false },
    staff: { view: "none", create: false, update: false, delete: false, view_salaries: false },
    reports: { view: "none", export: false, view_financial: false },
    settings: { view: "none", update: false },
    alerts: { view: "none", resolve: false },
    cash_session: { view: "none", open: false, close: false },
    exchange_rate: { view: "none", update: false },
    insurance: { view: "none", create: false, update: false, delete: false },
    audit_logs: { view: "none" },
  },
};

// ----- Helpers ------------------------------------------------------------

const TRUTHY_SCOPES = new Set<Scope>(["own", "team", "all", "own_today"]);

export function isAllowed(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return TRUTHY_SCOPES.has(value as Scope);
  if (typeof value === "number") return value > 0;
  return false;
}

export function getScope(value: unknown): Scope {
  if (typeof value === "string" && TRUTHY_SCOPES.has(value as Scope)) return value as Scope;
  if (value === "none") return "none";
  if (typeof value === "boolean") return value ? "all" : "none";
  return "none";
}
