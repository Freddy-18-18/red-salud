import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  medicalReferralService,
  type MedicalReferral,
  type MedicalReferralDetail,
  type ReferralStatus,
} from "@/lib/services/medical-referral-service";

const REFERRALS_KEY = "medical-referrals";
const REFERRAL_DETAIL_KEY = "medical-referral-detail";

export function useMedicalReferrals(status?: ReferralStatus) {
  return useQuery<MedicalReferral[]>({
    queryKey: [REFERRALS_KEY, status ?? "all"],
    queryFn: () => medicalReferralService.getReferrals(status),
  });
}

export function useMedicalReferralDetail(id: string | null) {
  return useQuery<MedicalReferralDetail>({
    queryKey: [REFERRAL_DETAIL_KEY, id],
    queryFn: () => medicalReferralService.getReferralDetail(id!),
    enabled: !!id,
  });
}

/**
 * Patient consents a pending referral. Optionally chooses to share the
 * referring doctor's identity with the next specialist.
 */
export function useConsentReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      shareReferrerIdentity,
    }: {
      id: string;
      shareReferrerIdentity: boolean;
    }) => medicalReferralService.consent(id, shareReferrerIdentity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFERRALS_KEY] });
      queryClient.invalidateQueries({ queryKey: [REFERRAL_DETAIL_KEY] });
    },
  });
}

export function useDeclineReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicalReferralService.decline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFERRALS_KEY] });
    },
  });
}

/**
 * Sidebar/header badge — number of referrals pending the patient's review.
 */
export function useReferralCount() {
  const { data: referrals } = useMedicalReferrals();
  const pending =
    referrals?.filter((r) => r.status === "pending_consent").length ?? 0;
  const total = referrals?.length ?? 0;
  return { pending, total };
}
