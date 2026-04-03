import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  calculateHealthScore,
  getImprovementTips,
  getScoreHistory,
  type HealthScoreBreakdown,
  type ScoreHistoryEntry,
} from "@/lib/services/health-score-service";
import { supabase } from "@/lib/supabase/client";

const DEFAULT_BREAKDOWN: HealthScoreBreakdown = {
  appointments: 0,
  medications: 0,
  vitals: 0,
  activity: 0,
  profile: 0,
  total: 0,
  level: "necesita-atencion",
};

export function useHealthScore() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, []);

  const {
    data: scoreData,
    isLoading: scoreLoading,
    error: scoreError,
  } = useQuery({
    queryKey: ["health-score", userId],
    queryFn: () => calculateHealthScore(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["health-score-history", userId],
    queryFn: () => getScoreHistory(userId!, 30),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const breakdown = scoreData ?? DEFAULT_BREAKDOWN;
  const tips = scoreData ? getImprovementTips(scoreData) : [];
  const history: ScoreHistoryEntry[] = historyData ?? [];
  const loading = !userId || scoreLoading || historyLoading;

  return {
    score: breakdown.total,
    breakdown,
    history,
    tips,
    loading,
    error: scoreError
      ? scoreError instanceof Error
        ? scoreError.message
        : "Error calculando health score"
      : null,
  };
}
