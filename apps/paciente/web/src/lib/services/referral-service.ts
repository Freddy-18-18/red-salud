import { supabase } from "@/lib/supabase/client";

// ---------- Types ----------

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id?: string;
  referred_name?: string;
  referred_email?: string;
  status: "pending" | "registered" | "expired";
  points_earned: number;
  created_at: string;
  registered_at?: string;
  referred_profile?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ReferralStats {
  total: number;
  pending: number;
  registered: number;
  points: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  referral_count: number;
  is_current_user?: boolean;
}

// ---------- Service ----------

export const referralService = {
  /**
   * Get or generate the referral code for a patient.
   * Format: FIRSTNAME-XXXX (uppercase)
   */
  async getReferralCode(patientId: string): Promise<string> {
    // Check if user already has a referral code in profiles
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("referral_code, full_name")
      .eq("id", patientId)
      .single();

    if (error) throw error;

    if (profile?.referral_code) {
      return profile.referral_code as string;
    }

    // Generate a new code: first name + random 4 chars
    const firstName = ((profile?.full_name as string) || "USER")
      .split(" ")[0]
      .toUpperCase()
      .replace(/[^A-Z]/g, "");

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 4; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }

    const code = `${firstName}-${suffix}`;

    // Save the generated code
    await supabase
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", patientId);

    return code;
  },

  /**
   * Get all referrals made by a patient.
   */
  async getReferrals(patientId: string): Promise<Referral[]> {
    const { data, error } = await supabase
      .from("referrals")
      .select(`
        *,
        referred_profile:profiles!referrals_referred_id_fkey(full_name, avatar_url)
      `)
      .eq("referrer_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Referral[];
  },

  /**
   * Get referral statistics for a patient.
   */
  async getReferralStats(patientId: string): Promise<ReferralStats> {
    const { data, error } = await supabase
      .from("referrals")
      .select("status, points_earned")
      .eq("referrer_id", patientId);

    if (error) throw error;

    const referrals = data || [];
    return {
      total: referrals.length,
      pending: referrals.filter((r) => r.status === "pending").length,
      registered: referrals.filter((r) => r.status === "registered").length,
      points: referrals.reduce((sum, r) => sum + (r.points_earned || 0), 0),
    };
  },

  /**
   * Get the monthly referral leaderboard.
   */
  async getLeaderboard(
    limit: number = 10,
    currentUserId?: string,
  ): Promise<LeaderboardEntry[]> {
    // Get referrals from this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("referrals")
      .select(`
        referrer_id,
        referrer:profiles!referrals_referrer_id_fkey(full_name, avatar_url)
      `)
      .eq("status", "registered")
      .gte("registered_at", startOfMonth.toISOString());

    if (error) throw error;

    // Aggregate counts by referrer
    const counts = new Map<
      string,
      { count: number; full_name: string; avatar_url?: string }
    >();

    for (const row of data || []) {
      const id = row.referrer_id as string;
      const referrer = row.referrer as unknown as Record<string, unknown>;
      const existing = counts.get(id);
      if (existing) {
        existing.count++;
      } else {
        counts.set(id, {
          count: 1,
          full_name: (referrer?.full_name as string) || "Usuario",
          avatar_url: referrer?.avatar_url as string | undefined,
        });
      }
    }

    // Sort by count descending, take top N
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit);

    return sorted.map(([userId, info], index) => ({
      rank: index + 1,
      user_id: userId,
      full_name: info.full_name,
      avatar_url: info.avatar_url,
      referral_count: info.count,
      is_current_user: userId === currentUserId,
    }));
  },

  /**
   * Generate a share link with the referral code.
   */
  generateShareLink(code: string): string {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://paciente.redsalud.com";
    return `${baseUrl}/auth/register?ref=${encodeURIComponent(code)}`;
  },

  /**
   * Generate a WhatsApp share link.
   */
  generateWhatsAppLink(code: string): string {
    const shareLink = referralService.generateShareLink(code);
    const message = `Te invito a Red-Salud, la mejor plataforma para cuidar tu salud. Registrate con mi codigo ${code} y gana 100 puntos de bienvenida: ${shareLink}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  },
};
