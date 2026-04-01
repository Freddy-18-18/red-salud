import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

export type AlertType =
  | "low_stock"
  | "expiry_warning"
  | "expiry_critical"
  | "out_of_stock"
  | "order_received"
  | "price_change"
  | "controlled_med";

export type AlertSeverity = "info" | "warning" | "critical";

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  low_stock: "Stock Bajo",
  expiry_warning: "Vencimiento Proximo",
  expiry_critical: "Vencimiento Critico",
  out_of_stock: "Agotado",
  order_received: "Pedido Recibido",
  price_change: "Cambio de Precio",
  controlled_med: "Medicamento Controlado",
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: "Informativa",
  warning: "Advertencia",
  critical: "Critica",
};

export interface PharmacyAlert {
  id: string;
  pharmacy_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  related_product_id: string | null;
  related_batch_id: string | null;
  is_read: boolean;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  // Joined product data (optional)
  product_name?: string;
}

export interface AlertFilters {
  type?: AlertType | "";
  severity?: AlertSeverity | "";
  status?: "todas" | "sin_leer" | "resueltas";
}

export interface AlertCounts {
  total: number;
  unread: number;
  critical: number;
  warning: number;
  info: number;
}

// ── Service ────────────────────────────────────────────────────────────────

export async function fetchAlerts(
  pharmacyId: string,
  filters: AlertFilters = {}
): Promise<PharmacyAlert[]> {
  const supabase = createClient();

  let query = supabase
    .from("pharmacy_alerts")
    .select(
      `
      *,
      pharmacy_products:pharmacy_products!related_product_id (name)
    `
    )
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false });

  if (filters.type) {
    query = query.eq("alert_type", filters.type);
  }

  if (filters.severity) {
    query = query.eq("severity", filters.severity);
  }

  if (filters.status === "sin_leer") {
    query = query.eq("is_read", false);
  } else if (filters.status === "resueltas") {
    query = query.eq("is_resolved", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  return data.map((row) => {
    const product = row.pharmacy_products as unknown as { name: string } | null;
    return {
      id: row.id,
      pharmacy_id: row.pharmacy_id,
      alert_type: row.alert_type as AlertType,
      severity: row.severity as AlertSeverity,
      title: row.title,
      message: row.message,
      related_product_id: row.related_product_id,
      related_batch_id: row.related_batch_id,
      is_read: row.is_read,
      is_resolved: row.is_resolved,
      resolved_by: row.resolved_by,
      resolved_at: row.resolved_at,
      created_at: row.created_at,
      product_name: product?.name ?? undefined,
    };
  });
}

export async function fetchAlertCounts(
  pharmacyId: string
): Promise<AlertCounts> {
  const supabase = createClient();

  const [totalRes, unreadRes, criticalRes, warningRes, infoRes] =
    await Promise.all([
      supabase
        .from("pharmacy_alerts")
        .select("id", { count: "exact", head: true })
        .eq("pharmacy_id", pharmacyId)
        .eq("is_resolved", false),
      supabase
        .from("pharmacy_alerts")
        .select("id", { count: "exact", head: true })
        .eq("pharmacy_id", pharmacyId)
        .eq("is_read", false)
        .eq("is_resolved", false),
      supabase
        .from("pharmacy_alerts")
        .select("id", { count: "exact", head: true })
        .eq("pharmacy_id", pharmacyId)
        .eq("severity", "critical")
        .eq("is_resolved", false),
      supabase
        .from("pharmacy_alerts")
        .select("id", { count: "exact", head: true })
        .eq("pharmacy_id", pharmacyId)
        .eq("severity", "warning")
        .eq("is_resolved", false),
      supabase
        .from("pharmacy_alerts")
        .select("id", { count: "exact", head: true })
        .eq("pharmacy_id", pharmacyId)
        .eq("severity", "info")
        .eq("is_resolved", false),
    ]);

  return {
    total: totalRes.count ?? 0,
    unread: unreadRes.count ?? 0,
    critical: criticalRes.count ?? 0,
    warning: warningRes.count ?? 0,
    info: infoRes.count ?? 0,
  };
}

export async function markAlertRead(alertId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pharmacy_alerts")
    .update({ is_read: true })
    .eq("id", alertId);

  if (error) throw error;
}

export async function resolveAlert(alertId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("pharmacy_alerts")
    .update({
      is_resolved: true,
      is_read: true,
      resolved_by: user?.id ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", alertId);

  if (error) throw error;
}

export async function markAllRead(pharmacyId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pharmacy_alerts")
    .update({ is_read: true })
    .eq("pharmacy_id", pharmacyId)
    .eq("is_read", false);

  if (error) throw error;
}

export async function resolveAllByType(
  pharmacyId: string,
  alertType: AlertType
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("pharmacy_alerts")
    .update({
      is_resolved: true,
      is_read: true,
      resolved_by: user?.id ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq("pharmacy_id", pharmacyId)
    .eq("alert_type", alertType)
    .eq("is_resolved", false);

  if (error) throw error;
}
