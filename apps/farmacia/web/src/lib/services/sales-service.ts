import { createClient } from "@/lib/supabase/client";
import type {
  Invoice,
  InvoiceWithItems,
  InvoiceStatus,
  PaymentMethod,
} from "./pos-service";

// ─── Types ───────────────────────────────────────────────────────────

export interface SalesFilters {
  pharmacy_id: string;
  date_from?: string;
  date_to?: string;
  payment_method?: PaymentMethod;
  status?: InvoiceStatus;
  cashier_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface SalesSummary {
  total_sales_today_usd: number;
  total_sales_today_bs: number;
  total_sales_today_count: number;
  total_sales_week_usd: number;
  total_sales_week_bs: number;
  total_sales_month_usd: number;
  total_sales_month_bs: number;
  total_sales_month_count: number;
  avg_sale_usd: number;
}

export interface PaginatedSales {
  invoices: Invoice[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Sales History ───────────────────────────────────────────────────

export async function getSalesHistory(
  filters: SalesFilters
): Promise<PaginatedSales> {
  const supabase = createClient();
  const page = filters.page || 1;
  const perPage = filters.per_page || 25;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("pharmacy_invoices")
    .select("*", { count: "exact" })
    .eq("pharmacy_id", filters.pharmacy_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.date_from) {
    query = query.gte("created_at", `${filters.date_from}T00:00:00`);
  }
  if (filters.date_to) {
    query = query.lte("created_at", `${filters.date_to}T23:59:59`);
  }
  if (filters.payment_method) {
    query = query.eq("payment_method", filters.payment_method);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.cashier_id) {
    query = query.eq("cashier_id", filters.cashier_id);
  }
  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      `invoice_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_ci.ilike.%${term}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching sales history:", error);
    return { invoices: [], total: 0, page, per_page: perPage, total_pages: 0 };
  }

  const total = count || 0;
  return {
    invoices: (data || []) as Invoice[],
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
  };
}

// ─── Sales Summary / KPIs ────────────────────────────────────────────

export async function getSalesSummary(
  pharmacyId: string
): Promise<SalesSummary> {
  const supabase = createClient();
  const now = new Date();

  // Today start/end
  const todayStr = now.toISOString().split("T")[0];
  const todayStart = `${todayStr}T00:00:00`;
  const todayEnd = `${todayStr}T23:59:59`;

  // This week (Monday start)
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - mondayOffset);
  const weekStartStr = `${weekStart.toISOString().split("T")[0]}T00:00:00`;

  // This month
  const monthStartStr = `${todayStr.slice(0, 7)}-01T00:00:00`;

  // Fetch all three in parallel
  const [todayResult, weekResult, monthResult] = await Promise.all([
    supabase
      .from("pharmacy_invoices")
      .select("total_usd, total_bs")
      .eq("pharmacy_id", pharmacyId)
      .eq("status", "completed")
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd),
    supabase
      .from("pharmacy_invoices")
      .select("total_usd, total_bs")
      .eq("pharmacy_id", pharmacyId)
      .eq("status", "completed")
      .gte("created_at", weekStartStr)
      .lte("created_at", todayEnd),
    supabase
      .from("pharmacy_invoices")
      .select("total_usd, total_bs")
      .eq("pharmacy_id", pharmacyId)
      .eq("status", "completed")
      .gte("created_at", monthStartStr)
      .lte("created_at", todayEnd),
  ]);

  const todaySales = todayResult.data || [];
  const weekSales = weekResult.data || [];
  const monthSales = monthResult.data || [];

  const sumUsd = (rows: { total_usd: number }[]) =>
    rows.reduce((s, r) => s + Number(r.total_usd), 0);
  const sumBs = (rows: { total_bs: number }[]) =>
    rows.reduce((s, r) => s + Number(r.total_bs), 0);

  const monthTotalUsd = sumUsd(monthSales);
  const monthCount = monthSales.length;

  return {
    total_sales_today_usd: sumUsd(todaySales),
    total_sales_today_bs: sumBs(todaySales),
    total_sales_today_count: todaySales.length,
    total_sales_week_usd: sumUsd(weekSales),
    total_sales_week_bs: sumBs(weekSales),
    total_sales_month_usd: monthTotalUsd,
    total_sales_month_bs: sumBs(monthSales),
    total_sales_month_count: monthCount,
    avg_sale_usd: monthCount > 0 ? monthTotalUsd / monthCount : 0,
  };
}

// ─── Invoice Detail ──────────────────────────────────────────────────

export async function getInvoiceDetail(
  invoiceId: string
): Promise<InvoiceWithItems | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_invoices")
    .select(
      `
      *,
      pharmacy_invoice_items (
        *,
        pharmacy_products:pharmacy_products!product_id (name, generic_name, presentation)
      )
    `
    )
    .eq("id", invoiceId)
    .single();

  if (error || !data) return null;

  return data as unknown as InvoiceWithItems;
}
