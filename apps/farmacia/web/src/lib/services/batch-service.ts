import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

export type BatchStatus = "active" | "expired" | "recalled" | "depleted";

export interface BatchWithProduct {
  id: string;
  product_id: string;
  pharmacy_id: string;
  batch_number: string;
  expiry_date: string;
  manufacture_date: string | null;
  quantity_received: number;
  quantity_available: number;
  quantity_sold: number;
  quantity_damaged: number;
  quantity_returned: number;
  supplier_id: string | null;
  purchase_price_usd: number | null;
  purchase_price_bs: number | null;
  received_at: string | null;
  status: BatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_presentation: string | null;
  product_concentration: string | null;
  product_manufacturer: string | null;
  days_until_expiry: number;
  expiry_status: "expired" | "critical" | "warning" | "healthy";
  is_fefo_priority: boolean;
}

export interface ExpirySummary {
  expired: number;
  next30Days: number;
  next90Days: number;
  healthy: number;
}

export type ExpiryTab = "expired" | "next30" | "next90" | "all";

export type BatchAction = "mark_damaged" | "return_supplier" | "withdraw";

// ── Helpers ────────────────────────────────────────────────────────────────

function computeExpiryStatus(expiryDate: string): {
  daysUntilExpiry: number;
  expiryStatus: "expired" | "critical" | "warning" | "healthy";
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let expiryStatus: "expired" | "critical" | "warning" | "healthy";
  if (daysUntilExpiry < 0) expiryStatus = "expired";
  else if (daysUntilExpiry <= 30) expiryStatus = "critical";
  else if (daysUntilExpiry <= 90) expiryStatus = "warning";
  else expiryStatus = "healthy";

  return { daysUntilExpiry, expiryStatus };
}

// ── Service ────────────────────────────────────────────────────────────────

export async function fetchBatchesWithExpiry(
  pharmacyId: string,
  tab: ExpiryTab = "all"
): Promise<BatchWithProduct[]> {
  const supabase = createClient();

  let query = supabase
    .from("pharmacy_batches")
    .select(
      `
      *,
      pharmacy_products!product_id!inner (
        name,
        presentation,
        concentration,
        manufacturer
      )
    `
    )
    .eq("pharmacy_id", pharmacyId)
    .gt("quantity_available", 0)
    .order("expiry_date", { ascending: true });

  // Filter by tab at query level where possible
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  if (tab === "expired") {
    query = query.lt("expiry_date", todayStr);
  } else if (tab === "next30") {
    const in30 = new Date(today);
    in30.setDate(in30.getDate() + 30);
    query = query.gte("expiry_date", todayStr).lte("expiry_date", in30.toISOString().split("T")[0]);
  } else if (tab === "next90") {
    const in90 = new Date(today);
    in90.setDate(in90.getDate() + 90);
    query = query.gte("expiry_date", todayStr).lte("expiry_date", in90.toISOString().split("T")[0]);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  // Track first (FEFO) batch per product
  const fefoMap = new Map<string, string>();

  const enriched: BatchWithProduct[] = data.map((row) => {
    const product = row.pharmacy_products as unknown as {
      name: string;
      presentation: string | null;
      concentration: string | null;
      manufacturer: string | null;
    };

    const { daysUntilExpiry, expiryStatus } = computeExpiryStatus(
      row.expiry_date
    );

    // FEFO: first active batch per product (sorted by expiry_date asc)
    let isFefoPriority = false;
    if (row.status === "active" && !fefoMap.has(row.product_id)) {
      fefoMap.set(row.product_id, row.id);
      isFefoPriority = true;
    }

    return {
      id: row.id,
      product_id: row.product_id,
      pharmacy_id: row.pharmacy_id,
      batch_number: row.batch_number,
      expiry_date: row.expiry_date,
      manufacture_date: row.manufacture_date,
      quantity_received: row.quantity_received,
      quantity_available: row.quantity_available,
      quantity_sold: row.quantity_sold,
      quantity_damaged: row.quantity_damaged,
      quantity_returned: row.quantity_returned,
      supplier_id: row.supplier_id,
      purchase_price_usd: row.purchase_price_usd,
      purchase_price_bs: row.purchase_price_bs,
      received_at: row.received_at,
      status: row.status as BatchStatus,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      product_name: product.name,
      product_presentation: product.presentation,
      product_concentration: product.concentration,
      product_manufacturer: product.manufacturer,
      days_until_expiry: daysUntilExpiry,
      expiry_status: expiryStatus,
      is_fefo_priority: isFefoPriority,
    };
  });

  return enriched;
}

export async function fetchExpirySummary(
  pharmacyId: string
): Promise<ExpirySummary> {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const in30Str = in30.toISOString().split("T")[0];

  const in90 = new Date(today);
  in90.setDate(in90.getDate() + 90);
  const in90Str = in90.toISOString().split("T")[0];

  // Parallel queries for counts
  const [expiredRes, next30Res, next90Res, healthyRes] = await Promise.all([
    supabase
      .from("pharmacy_batches")
      .select("id", { count: "exact", head: true })
      .eq("pharmacy_id", pharmacyId)
      .gt("quantity_available", 0)
      .lt("expiry_date", todayStr),
    supabase
      .from("pharmacy_batches")
      .select("id", { count: "exact", head: true })
      .eq("pharmacy_id", pharmacyId)
      .gt("quantity_available", 0)
      .gte("expiry_date", todayStr)
      .lte("expiry_date", in30Str),
    supabase
      .from("pharmacy_batches")
      .select("id", { count: "exact", head: true })
      .eq("pharmacy_id", pharmacyId)
      .gt("quantity_available", 0)
      .gt("expiry_date", in30Str)
      .lte("expiry_date", in90Str),
    supabase
      .from("pharmacy_batches")
      .select("id", { count: "exact", head: true })
      .eq("pharmacy_id", pharmacyId)
      .gt("quantity_available", 0)
      .gt("expiry_date", in90Str),
  ]);

  return {
    expired: expiredRes.count ?? 0,
    next30Days: next30Res.count ?? 0,
    next90Days: next90Res.count ?? 0,
    healthy: healthyRes.count ?? 0,
  };
}

export async function executeBatchAction(
  batchId: string,
  action: BatchAction,
  quantity?: number
): Promise<void> {
  const supabase = createClient();

  const { data: batch, error: fetchError } = await supabase
    .from("pharmacy_batches")
    .select("quantity_available, quantity_damaged, quantity_returned")
    .eq("id", batchId)
    .single();

  if (fetchError || !batch) throw fetchError || new Error("Lote no encontrado");

  const qty = quantity ?? batch.quantity_available;

  switch (action) {
    case "mark_damaged": {
      const { error } = await supabase
        .from("pharmacy_batches")
        .update({
          quantity_available: batch.quantity_available - qty,
          quantity_damaged: (batch.quantity_damaged || 0) + qty,
          status:
            batch.quantity_available - qty <= 0 ? "depleted" : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);
      if (error) throw error;
      break;
    }
    case "return_supplier": {
      const { error } = await supabase
        .from("pharmacy_batches")
        .update({
          quantity_available: batch.quantity_available - qty,
          quantity_returned: (batch.quantity_returned || 0) + qty,
          status:
            batch.quantity_available - qty <= 0 ? "depleted" : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);
      if (error) throw error;
      break;
    }
    case "withdraw": {
      const { error } = await supabase
        .from("pharmacy_batches")
        .update({
          quantity_available: 0,
          status: "depleted",
          notes: "Retirado del inventario manualmente",
          updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);
      if (error) throw error;
      break;
    }
  }
}
