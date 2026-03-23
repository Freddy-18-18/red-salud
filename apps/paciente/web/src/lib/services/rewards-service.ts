import { supabase } from "@/lib/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────

export type ActionType =
  | "appointment_completed"
  | "profile_completed"
  | "family_added"
  | "health_metric_logged"
  | "message_sent"
  | "referral_completed"
  | "streak_bonus"
  | "prescription_filled"
  | "telemedicine_session"
  | "preventive_checkup";

export interface PatientRewards {
  patient_id: string;
  total_points: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  last_activity_at: string | null;
}

export interface RewardTransaction {
  id: string;
  patient_id: string;
  points: number;
  action_type: string;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  category: "health" | "engagement" | "community" | "milestone";
}

export interface PatientBadge {
  id: string;
  patient_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastActivity: string | null;
  activityDays: string[]; // ISO date strings for the last 30 days with activity
}

export interface RedeemableReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  point_cost: number;
  category: string;
  available: boolean;
}

// ─── Level Calculation ──────────────────────────────────────────────

export function calculateLevel(totalPoints: number): number {
  return Math.floor(Math.sqrt(totalPoints / 50)) + 1;
}

export function pointsForLevel(level: number): number {
  return (level - 1) * (level - 1) * 50;
}

export function pointsForNextLevel(level: number): number {
  return level * level * 50;
}

// ─── Service ────────────────────────────────────────────────────────

export async function getRewards(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("patient_rewards")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (error) throw error;

    // If no rewards record yet, return defaults
    const rewards: PatientRewards = data || {
      patient_id: patientId,
      total_points: 0,
      level: 1,
      streak_days: 0,
      longest_streak: 0,
      last_activity_at: null,
    };

    // Recalculate level from points (source of truth)
    rewards.level = calculateLevel(rewards.total_points);

    return { success: true, data: rewards };
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return {
      success: false,
      error,
      data: {
        patient_id: patientId,
        total_points: 0,
        level: 1,
        streak_days: 0,
        longest_streak: 0,
        last_activity_at: null,
      } as PatientRewards,
    };
  }
}

export async function getTransactions(patientId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from("reward_transactions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: (data || []) as RewardTransaction[] };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error, data: [] as RewardTransaction[] };
  }
}

export async function getBadges(patientId: string) {
  try {
    // Get all badges
    const { data: allBadges, error: badgesError } = await supabase
      .from("reward_badges")
      .select("*")
      .order("points_required", { ascending: true });

    if (badgesError) throw badgesError;

    // Get earned badges
    const { data: earnedData, error: earnedError } = await supabase
      .from("patient_badges")
      .select(`
        *,
        badge:reward_badges(*)
      `)
      .eq("patient_id", patientId);

    if (earnedError) throw earnedError;

    const earnedBadgeIds = new Set(
      (earnedData || []).map((pb: { badge_id: string }) => pb.badge_id)
    );
    const earnedBadges = (earnedData || []).map(
      (pb: PatientBadge) => pb.badge
    );
    const availableBadges = (allBadges || []).filter(
      (b: Badge) => !earnedBadgeIds.has(b.id)
    );

    return {
      success: true,
      data: {
        earned: earnedBadges as Badge[],
        available: availableBadges as Badge[],
        all: (allBadges || []) as Badge[],
        earnedMap: earnedData as PatientBadge[],
      },
    };
  } catch (error) {
    console.error("Error fetching badges:", error);
    return {
      success: false,
      error,
      data: {
        earned: [] as Badge[],
        available: [] as Badge[],
        all: [] as Badge[],
        earnedMap: [] as PatientBadge[],
      },
    };
  }
}

export async function awardPoints(
  patientId: string,
  action: ActionType,
  description: string,
  points: number,
  referenceId?: string
) {
  try {
    // Insert transaction
    const { error: txError } = await supabase
      .from("reward_transactions")
      .insert({
        patient_id: patientId,
        points,
        action_type: action,
        description,
        reference_id: referenceId || null,
      });

    if (txError) throw txError;

    // Upsert patient rewards (update total, streak, etc.)
    const { data: current } = await supabase
      .from("patient_rewards")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle();

    const now = new Date();
    const lastActivity = current?.last_activity_at
      ? new Date(current.last_activity_at)
      : null;

    // Calculate streak
    let streakDays = current?.streak_days || 0;
    let longestStreak = current?.longest_streak || 0;

    if (lastActivity) {
      const daysSinceLast = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLast === 1) {
        streakDays += 1;
      } else if (daysSinceLast > 1) {
        streakDays = 1;
      }
      // Same day: no streak change
    } else {
      streakDays = 1;
    }

    if (streakDays > longestStreak) {
      longestStreak = streakDays;
    }

    const newTotal = (current?.total_points || 0) + points;
    const newLevel = calculateLevel(newTotal);

    if (current) {
      const { error: updateError } = await supabase
        .from("patient_rewards")
        .update({
          total_points: newTotal,
          level: newLevel,
          streak_days: streakDays,
          longest_streak: longestStreak,
          last_activity_at: now.toISOString(),
        })
        .eq("patient_id", patientId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("patient_rewards")
        .insert({
          patient_id: patientId,
          total_points: newTotal,
          level: newLevel,
          streak_days: streakDays,
          longest_streak: longestStreak,
          last_activity_at: now.toISOString(),
        });

      if (insertError) throw insertError;
    }

    return {
      success: true,
      data: {
        points,
        newTotal,
        newLevel,
        previousLevel: current ? calculateLevel(current.total_points) : 1,
        leveledUp: current
          ? newLevel > calculateLevel(current.total_points)
          : newLevel > 1,
      },
    };
  } catch (error) {
    console.error("Error awarding points:", error);
    return { success: false, error, data: null };
  }
}

export async function redeemPoints(
  patientId: string,
  rewardId: string,
  pointCost: number,
  rewardName: string
) {
  try {
    // Check patient has enough points
    const { data: rewards } = await supabase
      .from("patient_rewards")
      .select("total_points")
      .eq("patient_id", patientId)
      .single();

    if (!rewards || rewards.total_points < pointCost) {
      return {
        success: false,
        error: new Error("Puntos insuficientes"),
        data: null,
      };
    }

    // Record the redemption as a negative transaction
    const { error: txError } = await supabase
      .from("reward_transactions")
      .insert({
        patient_id: patientId,
        points: -pointCost,
        action_type: "redemption",
        description: `Canjeaste: ${rewardName}`,
        reference_id: rewardId,
      });

    if (txError) throw txError;

    // Update total points
    const newTotal = rewards.total_points - pointCost;
    const { error: updateError } = await supabase
      .from("patient_rewards")
      .update({
        total_points: newTotal,
        level: calculateLevel(newTotal),
      })
      .eq("patient_id", patientId);

    if (updateError) throw updateError;

    return { success: true, data: { newTotal } };
  } catch (error) {
    console.error("Error redeeming points:", error);
    return { success: false, error, data: null };
  }
}

export async function getStreak(patientId: string): Promise<{
  success: boolean;
  data: StreakInfo;
}> {
  try {
    // Get patient rewards for streak info
    const { data: rewards } = await supabase
      .from("patient_rewards")
      .select("streak_days, longest_streak, last_activity_at")
      .eq("patient_id", patientId)
      .maybeSingle();

    // Get activity days for the last 30 days (for heat map)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions } = await supabase
      .from("reward_transactions")
      .select("created_at")
      .eq("patient_id", patientId)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    // Extract unique days
    const activityDays = [
      ...new Set(
        (transactions || []).map((t: { created_at: string }) =>
          t.created_at.split("T")[0]
        )
      ),
    ];

    return {
      success: true,
      data: {
        current: rewards?.streak_days || 0,
        longest: rewards?.longest_streak || 0,
        lastActivity: rewards?.last_activity_at || null,
        activityDays,
      },
    };
  } catch (error) {
    console.error("Error fetching streak:", error);
    return {
      success: true,
      data: {
        current: 0,
        longest: 0,
        lastActivity: null,
        activityDays: [],
      },
    };
  }
}

export async function checkAndAwardBadges(patientId: string) {
  try {
    // Get current rewards
    const rewardsResult = await getRewards(patientId);
    const rewards = rewardsResult.data;

    // Get all badges and earned badges
    const badgesResult = await getBadges(patientId);
    const { available, earnedMap } = badgesResult.data;

    const earnedBadgeIds = new Set(
      (earnedMap || []).map((pb: PatientBadge) => pb.badge_id)
    );

    // Get transaction counts by action type
    const { data: transactions } = await supabase
      .from("reward_transactions")
      .select("action_type")
      .eq("patient_id", patientId);

    const actionCounts: Record<string, number> = {};
    (transactions || []).forEach(
      (t: { action_type: string }) => {
        actionCounts[t.action_type] = (actionCounts[t.action_type] || 0) + 1;
      }
    );

    const newBadges: Badge[] = [];

    for (const badge of available) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      // Check by badge name (seeded badge names)
      switch (badge.name) {
        case "Primera Cita":
          shouldAward = (actionCounts["appointment_completed"] || 0) >= 1;
          break;
        case "Perfil Completo":
          shouldAward = (actionCounts["profile_completed"] || 0) >= 1;
          break;
        case "Familia Unida":
          shouldAward = (actionCounts["family_added"] || 0) >= 1;
          break;
        case "Constante":
          shouldAward = rewards.streak_days >= 7;
          break;
        case "Saludable":
          shouldAward = rewards.streak_days >= 30;
          break;
        case "Preventivo":
          shouldAward = (actionCounts["preventive_checkup"] || 0) >= 1;
          break;
        case "Comunicador":
          shouldAward = (actionCounts["message_sent"] || 0) >= 5;
          break;
        case "Embajador":
          shouldAward = (actionCounts["referral_completed"] || 0) >= 3;
          break;
        case "Nivel 5":
          shouldAward = rewards.level >= 5;
          break;
        case "Nivel 10":
          shouldAward = rewards.level >= 10;
          break;
        default:
          // For unknown badges, check by points_required
          shouldAward = rewards.total_points >= badge.points_required;
          break;
      }

      if (shouldAward) {
        const { error } = await supabase.from("patient_badges").insert({
          patient_id: patientId,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
        });

        if (!error) {
          newBadges.push(badge);
        }
      }
    }

    return { success: true, data: newBadges };
  } catch (error) {
    console.error("Error checking badges:", error);
    return { success: false, error, data: [] as Badge[] };
  }
}
