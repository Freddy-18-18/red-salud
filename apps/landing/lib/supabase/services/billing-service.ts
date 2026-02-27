import { supabase } from "../client";

export async function getPaymentMethods(userId: string) {
  try {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return { success: false, error };
  }
}

export async function getTransactions(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error };
  }
}

export interface PaymentReportData {
  amount: number;
  currency: "VES" | "USD";
  reference_number: string;
  bank_origin: string;
  payment_date: Date;
  method: "mobile_payment" | "bank_transfer";
  proof_url?: string;
}

export async function reportPayment(userId: string, data: PaymentReportData) {
  try {
    const { error } = await supabase.from("payments").insert({
      user_id: userId,
      amount: data.amount,
      currency: data.currency,
      reference_number: data.reference_number,
      bank_origin: data.bank_origin,
      payment_date: data.payment_date.toISOString(),
      status: "pending",
      // Map other fields if necessary or available in the schema
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error reporting payment:", error);
    return { success: false, error };
  }
}
export async function getUserPayments(userId: string) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching user payments:", error);
    return { success: false, error };
  }
}
