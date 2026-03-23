"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRewards } from "@/hooks/use-rewards";
import { LevelProgress } from "@/components/rewards/level-progress";
import { StreakCounter } from "@/components/rewards/streak-counter";
import { BadgeGrid } from "@/components/rewards/badge-grid";
import { PointsHistory } from "@/components/rewards/points-history";
import { RedeemStore } from "@/components/rewards/redeem-store";
import { PointsEarnedToast } from "@/components/rewards/points-earned-toast";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { Trophy, Award, ArrowLeft } from "lucide-react";

export default function RecompensasPage() {
  const [userId, setUserId] = useState<string>();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setAuthLoading(false);
    };
    loadUser();
  }, []);

  const {
    rewards,
    transactions,
    allBadges,
    earned,
    earnedMap,
    streak,
    loading,
    // Computed
    currentLevel,
    nextLevelPoints,
    progressPercent,
    progressPoints,
    progressNeeded,
    pointsToNextLevel,
    // Notifications
    pointsNotifications,
    badgeNotifications,
    dismissPointsNotification,
    dismissBadgeNotification,
    // Actions
    redeem,
  } = useRewards(userId);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Recent earned badges (last 5)
  const recentBadges = [...(earnedMap || [])]
    .sort(
      (a, b) =>
        new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <PointsEarnedToast
        pointsNotifications={pointsNotifications}
        badgeNotifications={badgeNotifications}
        onDismissPoints={dismissPointsNotification}
        onDismissBadge={dismissBadgeNotification}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <a
          href="/dashboard"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            Mis Recompensas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gana puntos cuidando tu salud y canjealos por beneficios
          </p>
        </div>
      </div>

      {/* Level Progress */}
      <LevelProgress
        level={currentLevel}
        totalPoints={rewards.total_points}
        progressPercent={progressPercent}
        progressPoints={progressPoints}
        progressNeeded={progressNeeded}
        pointsToNextLevel={pointsToNextLevel}
      />

      {/* Streak + Recent Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakCounter streak={streak} />

        {/* Recent Achievements */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            Logros Recientes
          </h3>

          {recentBadges.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Award className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">
                Completa actividades para ganar insignias
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentBadges.map((pb) => (
                <div
                  key={pb.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">
                      {pb.badge?.icon || "🏅"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {pb.badge?.name || "Insignia"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(pb.earned_at).toLocaleDateString("es-VE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Badge Grid */}
      <BadgeGrid allBadges={allBadges} earnedMap={earnedMap} />

      {/* Points History */}
      <PointsHistory transactions={transactions} />

      {/* Redeem Store */}
      <RedeemStore
        totalPoints={rewards.total_points}
        onRedeem={redeem}
      />
    </div>
  );
}
