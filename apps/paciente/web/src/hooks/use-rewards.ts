import { useState, useEffect, useCallback } from "react";
import {
  getRewards,
  getTransactions,
  getBadges,
  getStreak,
  awardPoints,
  redeemPoints,
  checkAndAwardBadges,
  calculateLevel,
  pointsForNextLevel,
  type PatientRewards,
  type RewardTransaction,
  type Badge,
  type PatientBadge,
  type StreakInfo,
  type ActionType,
} from "@/lib/services/rewards-service";

interface RewardsState {
  rewards: PatientRewards;
  transactions: RewardTransaction[];
  earned: Badge[];
  available: Badge[];
  allBadges: Badge[];
  earnedMap: PatientBadge[];
  streak: StreakInfo;
  loading: boolean;
  error: string | null;
}

interface PointsNotification {
  id: string;
  points: number;
  description: string;
  leveledUp: boolean;
  newLevel?: number;
}

interface BadgeNotification {
  id: string;
  badge: Badge;
}

export function useRewards(patientId: string | undefined) {
  const [state, setState] = useState<RewardsState>({
    rewards: {
      patient_id: "",
      total_points: 0,
      level: 1,
      streak_days: 0,
      longest_streak: 0,
      last_activity_at: null,
    },
    transactions: [],
    earned: [],
    available: [],
    allBadges: [],
    earnedMap: [],
    streak: {
      current: 0,
      longest: 0,
      lastActivity: null,
      activityDays: [],
    },
    loading: true,
    error: null,
  });

  const [pointsNotifications, setPointsNotifications] = useState<
    PointsNotification[]
  >([]);
  const [badgeNotifications, setBadgeNotifications] = useState<
    BadgeNotification[]
  >([]);

  const loadAll = useCallback(async () => {
    if (!patientId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [rewardsResult, transactionsResult, badgesResult, streakResult] =
        await Promise.all([
          getRewards(patientId),
          getTransactions(patientId),
          getBadges(patientId),
          getStreak(patientId),
        ]);

      setState({
        rewards: rewardsResult.data,
        transactions: transactionsResult.data,
        earned: badgesResult.data.earned,
        available: badgesResult.data.available,
        allBadges: badgesResult.data.all,
        earnedMap: badgesResult.data.earnedMap,
        streak: streakResult.data,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Error cargando recompensas",
      }));
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      loadAll();
    }
  }, [patientId, loadAll]);

  const addPoints = useCallback(
    async (
      action: ActionType,
      description: string,
      points: number,
      referenceId?: string
    ) => {
      if (!patientId) return;

      const result = await awardPoints(
        patientId,
        action,
        description,
        points,
        referenceId
      );

      if (result.success && result.data) {
        const notifId = crypto.randomUUID();
        setPointsNotifications((prev) => [
          ...prev,
          {
            id: notifId,
            points: result.data.points,
            description,
            leveledUp: result.data.leveledUp,
            newLevel: result.data.leveledUp
              ? result.data.newLevel
              : undefined,
          },
        ]);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setPointsNotifications((prev) =>
            prev.filter((n) => n.id !== notifId)
          );
        }, 3000);

        // Check for new badges
        const badgeResult = await checkAndAwardBadges(patientId);
        if (badgeResult.success && badgeResult.data.length > 0) {
          const newBadgeNotifs = badgeResult.data.map((badge) => ({
            id: crypto.randomUUID(),
            badge,
          }));
          setBadgeNotifications((prev) => [...prev, ...newBadgeNotifs]);

          // Auto-dismiss badge notifications after 5 seconds
          setTimeout(() => {
            setBadgeNotifications((prev) =>
              prev.filter(
                (n) => !newBadgeNotifs.find((nb) => nb.id === n.id)
              )
            );
          }, 5000);
        }

        // Reload all data
        await loadAll();
      }

      return result;
    },
    [patientId, loadAll]
  );

  const redeem = useCallback(
    async (rewardId: string, pointCost: number, rewardName: string) => {
      if (!patientId) return;

      const result = await redeemPoints(
        patientId,
        rewardId,
        pointCost,
        rewardName
      );

      if (result.success) {
        await loadAll();
      }

      return result;
    },
    [patientId, loadAll]
  );

  const dismissPointsNotification = useCallback((id: string) => {
    setPointsNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissBadgeNotification = useCallback((id: string) => {
    setBadgeNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Computed values
  const currentLevel = state.rewards.level;
  const currentLevelPoints = (currentLevel - 1) * (currentLevel - 1) * 50;
  const nextLevelPoints = pointsForNextLevel(currentLevel);
  const progressPoints = state.rewards.total_points - currentLevelPoints;
  const progressNeeded = nextLevelPoints - currentLevelPoints;
  const progressPercent =
    progressNeeded > 0
      ? Math.min(Math.round((progressPoints / progressNeeded) * 100), 100)
      : 100;

  return {
    ...state,
    // Computed
    currentLevel,
    nextLevelPoints,
    progressPercent,
    progressPoints,
    progressNeeded,
    pointsToNextLevel: nextLevelPoints - state.rewards.total_points,
    // Notifications
    pointsNotifications,
    badgeNotifications,
    dismissPointsNotification,
    dismissBadgeNotification,
    // Actions
    addPoints,
    redeem,
    refresh: loadAll,
  };
}
