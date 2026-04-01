import { createClient } from "@/lib/supabase/server";

// ---------- Types ----------

export interface DashboardStats {
  salesTodayUsd: number;
  salesTodayBs: number;
  salesTodayCount: number;
  salesMonthUsd: number;
  salesMonthBs: number;
  salesMonthCount: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalBatches: number;
  expiringSoonBatches: number;
  expiredBatches: number;
  unreadAlerts: number;
  criticalAlerts: number;
  pendingDeliveries: number;
  inTransitDeliveries: number;
  activeStaffCount: number;
  activeLoyaltyMembers: number;
}

export interface RecentSale {
  id: string;
  invoiceNumber: string;
  totalUsd: number;
  totalBs: number;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
}

export interface RecentAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  isRead: boolean;
  createdAt: string;
}

export interface DailySales {
  date: string;
  totalUsd: number;
  totalBs: number;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  genericName: string | null;
  totalQuantity: number;
  totalUsd: number;
}

export interface PharmacyProfile {
  id: string;
  pharmacyName: string;
  rif: string | null;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

// ---------- Pharmacy resolution ----------

export async function getPharmacyForUser(): Promise<PharmacyProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // First: check if user owns a pharmacy
  const { data: owned } = await supabase
    .from("pharmacy_details")
    .select("id, business_name, pharmacy_license, pharmacy_type, latitud, longitud")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (owned) {
    return {
      id: owned.id,
      pharmacyName: owned.business_name,
      rif: owned.pharmacy_license,
      logoUrl: null,
      address: null,
      phone: null,
    };
  }

  // Second: check if user is staff at a pharmacy
  const { data: staffRecord } = await supabase
    .from("pharmacy_staff")
    .select("pharmacy_id, pharmacy_details(id, business_name, pharmacy_license)")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (staffRecord?.pharmacy_details) {
    const pd = staffRecord.pharmacy_details as unknown as {
      id: string;
      business_name: string;
      pharmacy_license: string | null;
    };
    return {
      id: pd.id,
      pharmacyName: pd.business_name,
      rif: pd.pharmacy_license,
      logoUrl: null,
      address: null,
      phone: null,
    };
  }

  return null;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.full_name || user.email?.split("@")[0] || "Usuario",
    email: profile.email || user.email || "",
    avatarUrl: profile.avatar_url,
    role: profile.role || "farmacia",
  };
}

// ---------- Dashboard stats ----------

export async function getDashboardStats(
  pharmacyId: string,
): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pharmacy_dashboard_stats")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .maybeSingle();

  if (error || !data) {
    return {
      salesTodayUsd: 0,
      salesTodayBs: 0,
      salesTodayCount: 0,
      salesMonthUsd: 0,
      salesMonthBs: 0,
      salesMonthCount: 0,
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalBatches: 0,
      expiringSoonBatches: 0,
      expiredBatches: 0,
      unreadAlerts: 0,
      criticalAlerts: 0,
      pendingDeliveries: 0,
      inTransitDeliveries: 0,
      activeStaffCount: 0,
      activeLoyaltyMembers: 0,
    };
  }

  return {
    salesTodayUsd: data.sales_today_usd ?? 0,
    salesTodayBs: data.sales_today_bs ?? 0,
    salesTodayCount: data.sales_today_count ?? 0,
    salesMonthUsd: data.sales_month_usd ?? 0,
    salesMonthBs: data.sales_month_bs ?? 0,
    salesMonthCount: data.sales_month_count ?? 0,
    totalProducts: data.total_products ?? 0,
    activeProducts: data.active_products ?? 0,
    lowStockProducts: data.low_stock_products ?? 0,
    outOfStockProducts: data.out_of_stock_products ?? 0,
    totalBatches: data.total_batches ?? 0,
    expiringSoonBatches: data.expiring_soon_batches ?? 0,
    expiredBatches: data.expired_batches ?? 0,
    unreadAlerts: data.unread_alerts ?? 0,
    criticalAlerts: data.critical_alerts ?? 0,
    pendingDeliveries: data.pending_deliveries ?? 0,
    inTransitDeliveries: data.in_transit_deliveries ?? 0,
    activeStaffCount: data.active_staff_count ?? 0,
    activeLoyaltyMembers: data.active_loyalty_members ?? 0,
  };
}

// ---------- Recent sales ----------

export async function getRecentSales(
  pharmacyId: string,
  limit = 5,
): Promise<RecentSale[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pharmacy_invoices")
    .select("id, invoice_number, total_usd, total_bs, payment_method, created_at")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  // Fetch item counts for these invoices
  const invoiceIds = data.map((inv) => inv.id);
  const { data: itemCounts } = await supabase
    .from("pharmacy_invoice_items")
    .select("invoice_id")
    .in("invoice_id", invoiceIds);

  const countMap = new Map<string, number>();
  for (const item of itemCounts || []) {
    countMap.set(item.invoice_id, (countMap.get(item.invoice_id) || 0) + 1);
  }

  return data.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoice_number || `#${inv.id.slice(0, 8)}`,
    totalUsd: inv.total_usd ?? 0,
    totalBs: inv.total_bs ?? 0,
    paymentMethod: inv.payment_method || "efectivo",
    createdAt: inv.created_at,
    itemCount: countMap.get(inv.id) ?? 0,
  }));
}

// ---------- Recent alerts ----------

export async function getRecentAlerts(
  pharmacyId: string,
  limit = 5,
): Promise<RecentAlert[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pharmacy_alerts")
    .select("id, alert_type, title, message, severity, is_read, created_at")
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((alert) => ({
    id: alert.id,
    type: alert.alert_type || "info",
    title: alert.title || "Alerta",
    message: alert.message || "",
    severity: (alert.severity as RecentAlert["severity"]) || "low",
    isRead: alert.is_read ?? false,
    createdAt: alert.created_at,
  }));
}

// ---------- Sales by day (last 7 days) ----------

export async function getSalesLast7Days(
  pharmacyId: string,
): Promise<DailySales[]> {
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("pharmacy_invoices")
    .select("created_at, total_usd, total_bs")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "completed")
    .gte("created_at", `${fromDate}T00:00:00`)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Group by date
  const grouped = new Map<string, DailySales>();

  // Initialize all 7 days
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const dateKey = d.toISOString().split("T")[0];
    grouped.set(dateKey, { date: dateKey, totalUsd: 0, totalBs: 0, count: 0 });
  }

  for (const row of data) {
    const dateKey = row.created_at.split("T")[0];
    const existing = grouped.get(dateKey);
    if (existing) {
      existing.totalUsd += row.total_usd ?? 0;
      existing.totalBs += row.total_bs ?? 0;
      existing.count += 1;
    }
  }

  return Array.from(grouped.values());
}

// ---------- Top products ----------

export async function getTopProducts(
  pharmacyId: string,
  limit = 5,
): Promise<TopProduct[]> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().split("T")[0];

  // First get invoices in the date range
  const { data: invoices, error: invError } = await supabase
    .from("pharmacy_invoices")
    .select("id")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "completed")
    .gte("created_at", `${fromDate}T00:00:00`);

  if (invError || !invoices?.length) return [];

  const invoiceIds = invoices.map((inv) => inv.id);

  const { data, error } = await supabase
    .from("pharmacy_invoice_items")
    .select(`
      product_id,
      quantity,
      subtotal_usd,
      pharmacy_products:pharmacy_products!product_id(name, generic_name)
    `)
    .in("invoice_id", invoiceIds);

  if (error || !data) return [];

  // Aggregate by product_id
  const aggregated = new Map<
    string,
    { productName: string; genericName: string | null; totalQty: number; totalUsd: number }
  >();

  for (const item of data) {
    const pid = item.product_id;
    const existing = aggregated.get(pid);
    const product = item.pharmacy_products as unknown as {
      name: string;
      generic_name: string | null;
    } | null;

    if (existing) {
      existing.totalQty += item.quantity ?? 0;
      existing.totalUsd += item.subtotal_usd ?? 0;
    } else {
      aggregated.set(pid, {
        productName: product?.name || "Producto",
        genericName: product?.generic_name || null,
        totalQty: item.quantity ?? 0,
        totalUsd: item.subtotal_usd ?? 0,
      });
    }
  }

  return Array.from(aggregated.entries())
    .sort((a, b) => b[1].totalUsd - a[1].totalUsd)
    .slice(0, limit)
    .map(([pid, agg]) => ({
      productId: pid,
      productName: agg.productName,
      genericName: agg.genericName,
      totalQuantity: agg.totalQty,
      totalUsd: agg.totalUsd,
    }));
}

// ---------- Unread alert count (for navbar bell) ----------

export async function getUnreadAlertCount(
  pharmacyId: string,
): Promise<{ total: number; critical: number }> {
  const supabase = await createClient();

  const { count: total } = await supabase
    .from("pharmacy_alerts")
    .select("id", { count: "exact", head: true })
    .eq("pharmacy_id", pharmacyId)
    .eq("is_read", false);

  const { count: critical } = await supabase
    .from("pharmacy_alerts")
    .select("id", { count: "exact", head: true })
    .eq("pharmacy_id", pharmacyId)
    .eq("is_read", false)
    .eq("severity", "critical");

  return { total: total ?? 0, critical: critical ?? 0 };
}
