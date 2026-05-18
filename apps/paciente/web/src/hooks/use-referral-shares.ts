import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  medicalReferralService,
  type ReferralShare,
} from "@/lib/services/medical-referral-service";

const SHARES_KEY = "referral-shares";

export function useReferralShares(referralId: string | null) {
  return useQuery<ReferralShare[]>({
    queryKey: [SHARES_KEY, referralId],
    queryFn: () => medicalReferralService.listShares(referralId!),
    enabled: !!referralId,
  });
}

export function useCreateReferralShare(referralId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: {
      shareReferrerIdentity: boolean;
      recipientLabel?: string;
      expiresInHours: number;
    }) => medicalReferralService.createShare(referralId, opts),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SHARES_KEY, referralId] });
    },
  });
}

export function useRevokeReferralShare(referralId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shareId: string) =>
      medicalReferralService.revokeShare(referralId, shareId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SHARES_KEY, referralId] });
    },
  });
}
