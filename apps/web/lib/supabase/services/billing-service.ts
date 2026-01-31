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
