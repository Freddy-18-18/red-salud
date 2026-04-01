import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

import {
  getRewards,
  getTransactions,
  getBadges,
  getStreak,
  awardPoints,
  redeemPoints,
  checkAndAwardBadges,
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

const DEFAULT_REWARDS: PatientRewards = {
  patient_id: "",
  total_points: 0,
  level: 1,
  streak_days: 0,
  longest_streak: 0,
  last_activity_at: null,
};

const DEFAULT_STREAK: StreakInfo = {
  current: 0,
  longest: 0,
  lastActivity: null,
  activityDays: [],
};

export function useRewards(patientId: string | undefined) {
  const queryClient = useQueryClient();

  const [pointsNotifications, setPointsNotifications] = useState<
    PointsNotification[]
  >([]);
  const [badgeNotifications, setBadgeNotifications] = useState<
    BadgeNotification[]
  >([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["rewards", patientId],
    queryFn: async () => {
      const [rewardsResult, transactionsResult, badgesResult, streakResult] =
        await Promise.all([
          getRewards(patientId!),
          getTransactions(patientId!),
          getBadges(patientId!),
          getStreak(patientId!),
        ]);

      return {
        rewards: rewardsResult.data,
        transactions: transactionsResult.data,
        earned: badgesResult.data.earned,
        available: badgesResult.data.available,
        allBadges: badgesResult.data.all,
        earnedMap: badgesResult.data.earnedMap,
        streak: streakResult.data,
      };
    },
    enabled: !!patientId,
  });

  const state: RewardsState = {
    rewards: data?.rewards ?? DEFAULT_REWARDS,
    transactions: data?.transactions ?? [],
    earned: data?.earned ?? [],
    available: data?.available ?? [],
    allBadges: data?.allBadges ?? [],
    earnedMap: data?.earnedMap ?? [],
    streak: data?.streak ?? DEFAULT_STREAK,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Error cargando recompensas"
      : null,
  };

  const addPointsMutation = useMutation({
    mutationFn: async ({
      action,
      description,
      points,
      referenceId,
    }: {
      action: ActionType;
      description: string;
      points: number;
      referenceId?: string;
    }) => {
      const result = await awardPoints(
        patientId!,
        action,
        description,
        points,
        referenceId
      );

      if (result.success && result.data) {
        const badgeResult: { success: boolean; data: Badge[] } =
          await checkAndAwardBadges(patientId!);
        return { result, badgeResult };
      }

      return { result, badgeResult: null as { success: boolean; data: Badge[] } | null };
    },
    onSuccess: ({ result, badgeResult }, { description }) => {
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

        setTimeout(() => {
          setPointsNotifications((prev) => prev.filter((n) => n.id !== notifId));
        }, 3000);

        if (badgeResult?.success && badgeResult.data.length > 0) {
          const newBadgeNotifs = badgeResult.data.map((badge: Badge) => ({
            id: crypto.randomUUID(),
            badge,
          }));
          setBadgeNotifications((prev) => [...prev, ...newBadgeNotifs]);

          setTimeout(() => {
            setBadgeNotifications((prev) =>
              prev.filter((n) => !newBadgeNotifs.find((nb: BadgeNotification) => nb.id === n.id))
            );
          }, 5000);
        }

        queryClient.invalidateQueries({ queryKey: ["rewards", patientId] });
      }
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async ({
      rewardId,
      pointCost,
      rewardName,
    }: {
      rewardId: string;
      pointCost: number;
      rewardName: string;
    }) => {
      return redeemPoints(patientId!, rewardId, pointCost, rewardName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", patientId] });
    },
  });

  const addPoints = useCallback(
    async (
      action: ActionType,
      description: string,
      points: number,
      referenceId?: string
    ) => {
      if (!patientId) return;
      return addPointsMutation.mutateAsync({
        action,
        description,
        points,
        referenceId,
      });
    },
    [patientId, addPointsMutation]
  );

  const redeem = useCallback(
    async (rewardId: string, pointCost: number, rewardName: string) => {
      if (!patientId) return;
      return redeemMutation.mutateAsync({ rewardId, pointCost, rewardName });
    },
    [patientId, redeemMutation]
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
    refresh: refetch,
  };
}
