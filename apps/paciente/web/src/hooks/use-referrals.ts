import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  referralService,
  type Referral,
  type ReferralStats,
  type LeaderboardEntry,
} from "@/lib/services/referral-service";

/**
 * Hook for the referral system — code, referrals list, stats, leaderboard.
 */
export function useReferrals(patientId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["referrals", patientId],
    queryFn: async () => {
      const [codeResult, referralsResult, statsResult, leaderboardResult] =
        await Promise.all([
          referralService.getReferralCode(patientId!),
          referralService.getReferrals(patientId!),
          referralService.getReferralStats(patientId!),
          referralService.getLeaderboard(10, patientId!),
        ]);

      return {
        code: codeResult,
        referrals: referralsResult,
        stats: statsResult,
        leaderboard: leaderboardResult,
      };
    },
    enabled: !!patientId,
  });

  const code = data?.code ?? "";
  const referrals = data?.referrals ?? ([] as Referral[]);
  const stats = data?.stats ?? ({
    total: 0,
    pending: 0,
    registered: 0,
    points: 0,
  } as ReferralStats);
  const leaderboard = data?.leaderboard ?? ([] as LeaderboardEntry[]);

  const shareLink = code ? referralService.generateShareLink(code) : "";
  const whatsappLink = code ? referralService.generateWhatsAppLink(code) : "";

  const copyLink = useCallback(async () => {
    if (!shareLink) return false;
    try {
      await navigator.clipboard.writeText(shareLink);
      return true;
    } catch {
      return false;
    }
  }, [shareLink]);

  const nativeShare = useCallback(async () => {
    if (!shareLink || !navigator.share) return false;
    try {
      await navigator.share({
        title: "Red-Salud - Invitacion",
        text: `Registrate en Red-Salud con mi codigo ${code} y gana 100 puntos`,
        url: shareLink,
      });
      return true;
    } catch {
      return false;
    }
  }, [shareLink, code]);

  return {
    code,
    referrals,
    stats,
    leaderboard,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Error cargando referidos"
      : null,
    refresh: refetch,
    shareLink,
    whatsappLink,
    copyLink,
    nativeShare,
  };
}
