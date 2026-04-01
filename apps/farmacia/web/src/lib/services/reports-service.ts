import { createClient } from "@/lib/supabase/client";

// ============================================================================
// Types
// ============================================================================

export interface SalesMetrics {
  total_sales_usd: number;
  total_sales_bs: number;
  total_invoices: number;
  average_per_sale_usd: number;
  voided_count: number;
}

export interface SalesByPaymentMethod {
  method: string;
  count: number;
  total_usd: number;
  total_bs: number;
}

export interface SalesByDay {
  date: string;
  total_usd: number;
  count: number;
}

export interface TopProduct {
  product_id: string;
  name: string;
  quantity_sold: number;
  revenue_usd: number;
}

export interface InventoryMetrics {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  total_value_usd: number;
  total_value_bs: number;
}

export interface ExpiringProduct {
  id: string;
  product_name: string;
  batch_number: string;
  expiry_date: string;
  quantity_available: number;
  days_until_expiry: number;
}

export interface FinancialMetrics {
  total_revenue_usd: number;
  total_cost_usd: number;
  gross_margin_usd: number;
  gross_margin_percent: number;
  total_revenue_bs: number;
  total_cost_bs: number;
  gross_margin_bs: number;
}

export interface CategorySales {
  category: string;
  total_usd: number;
  count: number;
}

// ============================================================================
// Sales Report
// ============================================================================

export async function getSalesMetrics(
  pharmacyId: string,
  dateFrom: string,
  dateTo: string
): Promise<SalesMetrics> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_invoices")
    .select("total_usd, total_bs, status, payment_method")
    .eq("pharmacy_id", pharmacyId)
    .gte("created_at", `${dateFrom}T00:00:00`)
    .lte("created_at", `${dateTo}T23:59:59`);

  if (error) {
    console.error("Error fetching sales metrics:", error);
    return {
      total_sales_usd: 0,
      total_sales_bs: 0,
      total_invoices: 0,
      average_per_sale_usd: 0,
      voided_count: 0,
    };
  }

  const completed = (data || []).filter((i) => i.status === "completed");
  const voided = (data || []).filter((i) => i.status === "voided");
  const totalUsd = completed.reduce((s, i) => s + (i.total_usd || 0), 0);
  const totalBs = completed.reduce((s, i) => s + (i.total_bs || 0), 0);

  return {
    total_sales_usd: totalUsd,
    total_sales_bs: totalBs,
    total_invoices: completed.length,
    average_per_sale_usd:
      completed.length > 0 ? totalUsd / completed.length : 0,
    voided_count: voided.length,
  };
}

export async function getSalesByPaymentMethod(
  pharmacyId: string,
  dateFrom: string,
  dateTo: string
): Promise<SalesByPaymentMethod[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_invoices")
    .select("payment_method, total_usd, total_bs")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "completed")
    .gte("created_at", `${dateFrom}T00:00:00`)
    .lte("created_at", `${dateTo}T23:59:59`);

  if (error) {
    console.error("Error fetching sales by payment method:", error);
    return [];
  }

  const grouped = new Map<
    string,
    { count: number; total_usd: number; total_bs: number }
  >();
  for (const inv of data || []) {
    const method = inv.payment_method || "otro";
    const curr = grouped.get(method) || { count: 0, total_usd: 0, total_bs: 0 };
    grouped.set(method, {
      count: curr.count + 1,
      total_usd: curr.total_usd + (inv.total_usd || 0),
      total_bs: curr.total_bs + (inv.total_bs || 0),
    });
  }

  return Array.from(grouped.entries()).map(([method, vals]) => ({
    method,
    ...vals,
  }));
}

export async function getSalesByDay(
  pharmacyId: string,
  dateFrom: string,
  dateTo: string
): Promise<SalesByDay[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_invoices")
    .select("created_at, total_usd")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "completed")
    .gte("created_at", `${dateFrom}T00:00:00`)
    .lte("created_at", `${dateTo}T23:59:59`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching sales by day:", error);
    return [];
  }

  const grouped = new Map<string, { total_usd: number; count: number }>();
  for (const inv of data || []) {
    const day = inv.created_at.split("T")[0];
    const curr = grouped.get(day) || { total_usd: 0, count: 0 };
    grouped.set(day, {
      total_usd: curr.total_usd + (inv.total_usd || 0),
      count: curr.count + 1,
    });
  }

  return Array.from(grouped.entries()).map(([date, vals]) => ({
    date,
    ...vals,
  }));
}

export async function getTopProducts(
  pharmacyId: string,
  dateFrom: string,
  dateTo: string,
  limit = 10
): Promise<TopProduct[]> {
  const supabase = createClient();

  const { data: invoices, error: invError } = await supabase
    .from("pharmacy_invoices")
    .select("id")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "completed")
    .gte("created_at", `${dateFrom}T00:00:00`)
    .lte("created_at", `${dateTo}T23:59:59`);

  if (invError || !invoices?.length) return [];

  const invoiceIds = invoices.map((i) => i.id);

  const { data: items, error: itemsError } = await supabase
    .from("pharmacy_invoice_items")
    .select("product_id, quantity, subtotal_usd")
    .in("invoice_id", invoiceIds);

  if (itemsError) return [];

  const productMap = new Map<
    string,
    { quantity: number; revenue_usd: number }
  >();
  for (const item of items || []) {
    const curr = productMap.get(item.product_id) || {
      quantity: 0,
      revenue_usd: 0,
    };
    productMap.set(item.product_id, {
      quantity: curr.quantity + (item.quantity || 0),
      revenue_usd: curr.revenue_usd + (item.subtotal_usd || 0),
    });
  }

  const productIds = Array.from(productMap.keys());
  const { data: products } = await supabase
    .from("pharmacy_products")
    .select("id, name")
    .in("id", productIds);

  const nameMap = new Map<string, string>();
  for (const p of products || []) {
    nameMap.set(p.id, p.name);
  }

  return Array.from(productMap.entries())
    .map(([pid, vals]) => ({
      product_id: pid,
      name: nameMap.get(pid) || "Producto desconocido",
      quantity_sold: vals.quantity,
      revenue_usd: vals.revenue_usd,
    }))
    .sort((a, b) => b.quantity_sold - a.quantity_sold)
    .slice(0, limit);
}

// ============================================================================
// Inventory Report
// ============================================================================

export async function getInventoryMetrics(
  pharmacyId: string,
  exchangeRate: number
): Promise<InventoryMetrics> {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from("pharmacy_products")
    .select("id, price_usd, cost_usd")
    .eq("pharmacy_id", pharmacyId);

  if (error) {
    console.error("Error fetching inventory metrics:", error);
    return {
      total_products: 0,
      active_products: 0,
      out_of_stock: 0,
      low_stock: 0,
      total_value_usd: 0,
      total_value_bs: 0,
    };
  }

  const productIds = (products || []).map((p) => p.id);

  const { data: batches } = await supabase
    .from("pharmacy_batches")
    .select("product_id, quantity_available, status")
    .eq("pharmacy_id", pharmacyId)
    .in("product_id", productIds.length > 0 ? productIds : ["__none__"]);

  const stockByProduct = new Map<string, number>();
  for (const b of batches || []) {
    const curr = stockByProduct.get(b.product_id) || 0;
    stockByProduct.set(b.product_id, curr + (b.quantity_available || 0));
  }

  let outOfStock = 0;
  let lowStock = 0;
  let totalValueUsd = 0;

  for (const p of products || []) {
    const stock = stockByProduct.get(p.id) || 0;
    if (stock === 0) outOfStock++;
    else if (stock <= 10) lowStock++;
    totalValueUsd += stock * (p.cost_usd || 0);
  }

  return {
    total_products: products?.length || 0,
    active_products: (products?.length || 0) - outOfStock,
    out_of_stock: outOfStock,
    low_stock: lowStock,
    total_value_usd: totalValueUsd,
    total_value_bs: totalValueUsd * exchangeRate,
  };
}

export async function getExpiringProducts(
  pharmacyId: string,
  warningDays = 90
): Promise<ExpiringProduct[]> {
  const supabase = createClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + warningDays);

  const { data, error } = await supabase
    .from("pharmacy_batches")
    .select(
      "id, product_id, batch_number, expiry_date, quantity_available, pharmacy_products(name)"
    )
    .eq("pharmacy_id", pharmacyId)
    .gt("quantity_available", 0)
    .lte("expiry_date", cutoffDate.toISOString().split("T")[0])
    .order("expiry_date", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Error fetching expiring products:", error);
    return [];
  }

  return (data || []).map((b) => {
    const daysUntil = Math.ceil(
      (new Date(b.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const prodData = b.pharmacy_products as unknown as { name: string } | null;
    return {
      id: b.id,
      product_name: prodData?.name || "Desconocido",
      batch_number: b.batch_number,
      expiry_date: b.expiry_date,
      quantity_available: b.quantity_available,
      days_until_expiry: daysUntil,
    };
  });
}

// ============================================================================
// Financial Report
// ============================================================================

export async function getFinancialMetrics(
  pharmacyId: string,
  dateFrom: string,
  dateTo: string,
  exchangeRate: number
): Promise<FinancialMetrics> {
  const supabase = createClient();

  const { data: invoices, error: invError } = await supabase
    .from("pharmacy_invoices")
    .select("id, total_usd, total_bs")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "completed")
    .gte("created_at", `${dateFrom}T00:00:00`)
    .lte("created_at", `${dateTo}T23:59:59`);

  if (invError || !invoices?.length) {
    return {
      total_revenue_usd: 0,
      total_cost_usd: 0,
      gross_margin_usd: 0,
      gross_margin_percent: 0,
      total_revenue_bs: 0,
      total_cost_bs: 0,
      gross_margin_bs: 0,
    };
  }

  const revenueUsd = invoices.reduce((s, i) => s + (i.total_usd || 0), 0);
  const revenueBs = invoices.reduce((s, i) => s + (i.total_bs || 0), 0);

  const invoiceIds = invoices.map((i) => i.id);
  const { data: items } = await supabase
    .from("pharmacy_invoice_items")
    .select("product_id, quantity")
    .in("invoice_id", invoiceIds);

  let totalCostUsd = 0;
  const productIds = [
    ...new Set((items || []).map((i) => i.product_id)),
  ];

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("pharmacy_products")
      .select("id, cost_usd")
      .in("id", productIds);

    const costMap = new Map<string, number>();
    for (const p of products || []) {
      costMap.set(p.id, p.cost_usd || 0);
    }

    for (const item of items || []) {
      totalCostUsd += (costMap.get(item.product_id) || 0) * (item.quantity || 0);
    }
  }

  const totalCostBs = totalCostUsd * exchangeRate;
  const marginUsd = revenueUsd - totalCostUsd;
  const marginBs = revenueBs - totalCostBs;
  const marginPercent = revenueUsd > 0 ? (marginUsd / revenueUsd) * 100 : 0;

  return {
    total_revenue_usd: revenueUsd,
    total_cost_usd: totalCostUsd,
    gross_margin_usd: marginUsd,
    gross_margin_percent: marginPercent,
    total_revenue_bs: revenueBs,
    total_cost_bs: totalCostBs,
    gross_margin_bs: marginBs,
  };
}

export async function getSalesByCategory(
  pharmacyId: string,
  dateFrom: string,
  dateTo: string
): Promise<CategorySales[]> {
  const supabase = createClient();

  const { data: invoices } = await supabase
    .from("pharmacy_invoices")
    .select("id")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "completed")
    .gte("created_at", `${dateFrom}T00:00:00`)
    .lte("created_at", `${dateTo}T23:59:59`);

  if (!invoices?.length) return [];

  const invoiceIds = invoices.map((i) => i.id);

  const { data: items } = await supabase
    .from("pharmacy_invoice_items")
    .select("product_id, subtotal_usd")
    .in("invoice_id", invoiceIds);

  if (!items?.length) return [];

  const productIds = [...new Set(items.map((i) => i.product_id))];
  const { data: products } = await supabase
    .from("pharmacy_products")
    .select("id, category")
    .in("id", productIds);

  const catMap = new Map<string, string>();
  for (const p of products || []) {
    catMap.set(p.id, p.category || "Sin categoria");
  }

  const grouped = new Map<string, { total_usd: number; count: number }>();
  for (const item of items) {
    const cat = catMap.get(item.product_id) || "Sin categoria";
    const curr = grouped.get(cat) || { total_usd: 0, count: 0 };
    grouped.set(cat, {
      total_usd: curr.total_usd + (item.subtotal_usd || 0),
      count: curr.count + 1,
    });
  }

  return Array.from(grouped.entries())
    .map(([category, vals]) => ({ category, ...vals }))
    .sort((a, b) => b.total_usd - a.total_usd);
}

// ============================================================================
// CSV Export
// ============================================================================

export function exportToCsv(
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
