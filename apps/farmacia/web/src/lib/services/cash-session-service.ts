import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

export type CashSessionStatus = "open" | "closed" | "reconciled";

export interface CashSession {
  id: string;
  pharmacy_id: string;
  cashier_id: string;
  opened_at: string;
  closed_at: string | null;
  opening_balance_bs: number;
  opening_balance_usd: number;
  closing_balance_bs: number | null;
  closing_balance_usd: number | null;
  expected_bs: number | null;
  expected_usd: number | null;
  difference_bs: number | null;
  difference_usd: number | null;
  total_sales_count: number | null;
  total_sales_bs: number | null;
  total_sales_usd: number | null;
  status: CashSessionStatus;
  notes: string | null;
}

export interface OpenSessionPayload {
  pharmacy_id: string;
  cashier_id: string;
  opening_balance_bs: number;
  opening_balance_usd: number;
}

export interface CloseSessionPayload {
  session_id: string;
  closing_balance_bs: number;
  closing_balance_usd: number;
  notes?: string;
}

// ─── Get Current Open Session ────────────────────────────────────────

export async function getCurrentSession(
  pharmacyId: string,
  cashierId: string
): Promise<CashSession | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_cash_sessions")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .eq("cashier_id", cashierId)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching current session:", error);
    return null;
  }

  return data as CashSession | null;
}

/**
 * Get any open session for the pharmacy (any cashier)
 */
export async function getAnyOpenSession(
  pharmacyId: string
): Promise<CashSession | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_cash_sessions")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching open session:", error);
    return null;
  }

  return data as CashSession | null;
}

// ─── Open Session ────────────────────────────────────────────────────

export async function openSession(
  payload: OpenSessionPayload
): Promise<CashSession> {
  const supabase = createClient();

  // Check for existing open session
  const existing = await getCurrentSession(
    payload.pharmacy_id,
    payload.cashier_id
  );
  if (existing) {
    throw new Error(
      "Ya existe una sesión de caja abierta. Cierre la sesión actual antes de abrir una nueva."
    );
  }

  const { data, error } = await supabase
    .from("pharmacy_cash_sessions")
    .insert({
      pharmacy_id: payload.pharmacy_id,
      cashier_id: payload.cashier_id,
      opening_balance_bs: payload.opening_balance_bs,
      opening_balance_usd: payload.opening_balance_usd,
      status: "open" as CashSessionStatus,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Error al abrir sesión de caja: ${error?.message || "Error desconocido"}`
    );
  }

  return data as CashSession;
}

// ─── Close Session ───────────────────────────────────────────────────

export async function closeSession(
  payload: CloseSessionPayload
): Promise<CashSession> {
  const supabase = createClient();

  // Fetch session to compute expected values
  const { data: session, error: fetchError } = await supabase
    .from("pharmacy_cash_sessions")
    .select("*")
    .eq("id", payload.session_id)
    .eq("status", "open")
    .single();

  if (fetchError || !session) {
    throw new Error("Sesión de caja no encontrada o ya cerrada.");
  }

  // Fetch total sales during this session
  const { data: salesAgg } = await supabase
    .from("pharmacy_invoices")
    .select("total_usd, total_bs, id")
    .eq("pharmacy_id", session.pharmacy_id)
    .eq("status", "completed")
    .gte("created_at", session.opened_at);

  const totalSalesCount = salesAgg?.length || 0;
  const totalSalesUsd =
    salesAgg?.reduce((sum, s) => sum + Number(s.total_usd), 0) || 0;
  const totalSalesBs =
    salesAgg?.reduce((sum, s) => sum + Number(s.total_bs), 0) || 0;

  const expectedUsd = session.opening_balance_usd + totalSalesUsd;
  const expectedBs = session.opening_balance_bs + totalSalesBs;

  const differenceUsd = payload.closing_balance_usd - expectedUsd;
  const differenceBs = payload.closing_balance_bs - expectedBs;

  const { data, error } = await supabase
    .from("pharmacy_cash_sessions")
    .update({
      closed_at: new Date().toISOString(),
      closing_balance_bs: payload.closing_balance_bs,
      closing_balance_usd: payload.closing_balance_usd,
      expected_bs: expectedBs,
      expected_usd: expectedUsd,
      difference_bs: differenceBs,
      difference_usd: differenceUsd,
      total_sales_count: totalSalesCount,
      total_sales_bs: totalSalesBs,
      total_sales_usd: totalSalesUsd,
      status: "closed" as CashSessionStatus,
      notes: payload.notes || null,
    })
    .eq("id", payload.session_id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Error al cerrar sesión de caja: ${error?.message || "Error desconocido"}`
    );
  }

  return data as CashSession;
}

// ─── Get Session History ─────────────────────────────────────────────

export async function getSessionHistory(
  pharmacyId: string,
  limit = 30
): Promise<CashSession[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_cash_sessions")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .order("opened_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching session history:", error);
    return [];
  }

  return (data || []) as CashSession[];
}
