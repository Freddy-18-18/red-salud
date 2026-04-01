import { createClient } from "@/lib/supabase/client";

// ============================================================================
// Types
// ============================================================================

export type LoyaltyTier = "bronce" | "plata" | "oro" | "platino";

export const TIER_LABELS: Record<LoyaltyTier, string> = {
  bronce: "Bronce",
  plata: "Plata",
  oro: "Oro",
  platino: "Platino",
};

export const TIER_COLORS: Record<LoyaltyTier, string> = {
  bronce: "bg-amber-100 text-amber-800",
  plata: "bg-slate-100 text-slate-700",
  oro: "bg-yellow-100 text-yellow-800",
  platino: "bg-purple-100 text-purple-800",
};

export type TransactionType = "earn" | "redeem" | "adjust" | "expire";

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  earn: "Ganado",
  redeem: "Canjeado",
  adjust: "Ajuste",
  expire: "Expirado",
};

export interface LoyaltyProgram {
  id: string;
  pharmacy_id: string;
  program_name: string;
  points_per_usd: number;
  points_per_bs: number;
  min_redemption_points: number;
  redemption_value_usd: number;
  is_active: boolean;
}

export interface LoyaltyMember {
  id: string;
  pharmacy_id: string;
  customer_name: string;
  customer_ci: string;
  customer_phone: string | null;
  customer_email: string | null;
  points_balance: number;
  total_points_earned: number;
  total_points_redeemed: number;
  tier: LoyaltyTier;
  joined_at: string;
  last_purchase_at: string | null;
}

export interface LoyaltyTransaction {
  id: string;
  member_id: string;
  pharmacy_id: string;
  invoice_id: string | null;
  transaction_type: TransactionType;
  points: number;
  description: string | null;
  created_at: string;
}

export interface CreateMemberInput {
  pharmacy_id: string;
  customer_name: string;
  customer_ci: string;
  customer_phone?: string;
  customer_email?: string;
}

export interface UpdateMemberInput {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

export interface TierSummary {
  tier: LoyaltyTier;
  count: number;
}

// ============================================================================
// Program Queries
// ============================================================================

export async function getLoyaltyProgram(
  pharmacyId: string
): Promise<LoyaltyProgram | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_loyalty_programs")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching loyalty program:", error);
    return null;
  }

  return data;
}

export async function updateLoyaltyProgram(
  programId: string,
  updates: Partial<
    Pick<
      LoyaltyProgram,
      | "program_name"
      | "points_per_usd"
      | "points_per_bs"
      | "min_redemption_points"
      | "redemption_value_usd"
      | "is_active"
    >
  >
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("pharmacy_loyalty_programs")
    .update(updates)
    .eq("id", programId);

  if (error) {
    console.error("Error updating loyalty program:", error);
    return false;
  }

  return true;
}

export async function createLoyaltyProgram(
  pharmacyId: string,
  programName: string
): Promise<LoyaltyProgram | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_loyalty_programs")
    .insert({
      pharmacy_id: pharmacyId,
      program_name: programName,
      points_per_usd: 1,
      points_per_bs: 0.1,
      min_redemption_points: 100,
      redemption_value_usd: 1,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating loyalty program:", error);
    return null;
  }

  return data;
}

// ============================================================================
// Members Queries
// ============================================================================

export async function getLoyaltyMembers(
  pharmacyId: string,
  tierFilter?: LoyaltyTier
): Promise<LoyaltyMember[]> {
  const supabase = createClient();

  let query = supabase
    .from("pharmacy_loyalty_members")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .order("points_balance", { ascending: false });

  if (tierFilter) {
    query = query.eq("tier", tierFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching loyalty members:", error);
    return [];
  }

  return data || [];
}

export async function getTierSummary(
  pharmacyId: string
): Promise<TierSummary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_loyalty_members")
    .select("tier")
    .eq("pharmacy_id", pharmacyId);

  if (error) return [];

  const counts: Record<string, number> = {};
  for (const m of data || []) {
    counts[m.tier] = (counts[m.tier] || 0) + 1;
  }

  const tiers: LoyaltyTier[] = ["bronce", "plata", "oro", "platino"];
  return tiers.map((tier) => ({ tier, count: counts[tier] || 0 }));
}

// ============================================================================
// Members Mutations
// ============================================================================

export async function createLoyaltyMember(
  input: CreateMemberInput
): Promise<LoyaltyMember | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_loyalty_members")
    .insert({
      pharmacy_id: input.pharmacy_id,
      customer_name: input.customer_name,
      customer_ci: input.customer_ci,
      customer_phone: input.customer_phone || null,
      customer_email: input.customer_email || null,
      points_balance: 0,
      total_points_earned: 0,
      total_points_redeemed: 0,
      tier: "bronce" as LoyaltyTier,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating loyalty member:", error);
    return null;
  }

  return data;
}

export async function updateLoyaltyMember(
  memberId: string,
  updates: UpdateMemberInput
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("pharmacy_loyalty_members")
    .update(updates)
    .eq("id", memberId);

  if (error) {
    console.error("Error updating loyalty member:", error);
    return false;
  }

  return true;
}

// ============================================================================
// Transactions
// ============================================================================

export async function getMemberTransactions(
  memberId: string,
  limit = 20
): Promise<LoyaltyTransaction[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_loyalty_transactions")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

export async function addPointsTransaction(
  memberId: string,
  pharmacyId: string,
  type: TransactionType,
  points: number,
  description: string,
  invoiceId?: string
): Promise<boolean> {
  const supabase = createClient();

  const { error: txError } = await supabase
    .from("pharmacy_loyalty_transactions")
    .insert({
      member_id: memberId,
      pharmacy_id: pharmacyId,
      invoice_id: invoiceId || null,
      transaction_type: type,
      points,
      description,
    });

  if (txError) {
    console.error("Error creating transaction:", txError);
    return false;
  }

  // Update member balance
  const adjustment = type === "earn" || type === "adjust" ? points : -points;

  const { data: member } = await supabase
    .from("pharmacy_loyalty_members")
    .select("points_balance, total_points_earned, total_points_redeemed")
    .eq("id", memberId)
    .single();

  if (!member) return false;

  const updatePayload: Record<string, number | string> = {
    points_balance: member.points_balance + adjustment,
  };

  if (type === "earn") {
    updatePayload.total_points_earned =
      member.total_points_earned + points;
    updatePayload.last_purchase_at = new Date().toISOString();
  } else if (type === "redeem") {
    updatePayload.total_points_redeemed =
      member.total_points_redeemed + points;
  }

  const { error: updateError } = await supabase
    .from("pharmacy_loyalty_members")
    .update(updatePayload)
    .eq("id", memberId);

  if (updateError) {
    console.error("Error updating member balance:", updateError);
    return false;
  }

  return true;
}
