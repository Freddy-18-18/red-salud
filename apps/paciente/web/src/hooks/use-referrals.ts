import { useState, useEffect, useCallback } from "react";
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
  const [code, setCode] = useState<string>("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    total: 0,
    pending: 0,
    registered: 0,
    points: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const [codeResult, referralsResult, statsResult, leaderboardResult] =
        await Promise.all([
          referralService.getReferralCode(patientId),
          referralService.getReferrals(patientId),
          referralService.getReferralStats(patientId),
          referralService.getLeaderboard(10, patientId),
        ]);

      setCode(codeResult);
      setReferrals(referralsResult);
      setStats(statsResult);
      setLeaderboard(leaderboardResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error cargando referidos",
      );
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) refresh();
  }, [patientId, refresh]);

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
        title: "Red Salud - Invitacion",
        text: `Registrate en Red Salud con mi codigo ${code} y gana 100 puntos`,
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
    loading,
    error,
    refresh,
    shareLink,
    whatsappLink,
    copyLink,
    nativeShare,
  };
}
