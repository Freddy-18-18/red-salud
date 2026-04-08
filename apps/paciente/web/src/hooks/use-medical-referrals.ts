import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  medicalReferralService,
  type MedicalReferral,
  type MedicalReferralDetail,
  type ReferralStatus,
} from "@/lib/services/medical-referral-service";

const REFERRALS_KEY = "medical-referrals";
const REFERRAL_DETAIL_KEY = "medical-referral-detail";

/**
 * List all medical referrals with optional status filter.
 */
export function useMedicalReferrals(status?: ReferralStatus) {
  return useQuery<MedicalReferral[]>({
    queryKey: [REFERRALS_KEY, status ?? "all"],
    queryFn: () => medicalReferralService.getReferrals(status),
  });
}

/**
 * Get full detail for a single medical referral.
 */
export function useMedicalReferralDetail(id: string | null) {
  return useQuery<MedicalReferralDetail>({
    queryKey: [REFERRAL_DETAIL_KEY, id],
    queryFn: () => medicalReferralService.getReferralDetail(id!),
    enabled: !!id,
  });
}

/**
 * Mutation to update referral status (scheduled / completed).
 * Invalidates the list and detail caches on success.
 */
export function useUpdateReferralStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      scheduledAppointmentId,
    }: {
      id: string;
      status: "scheduled" | "completed";
      scheduledAppointmentId?: string;
    }) =>
      medicalReferralService.updateReferralStatus(
        id,
        status,
        scheduledAppointmentId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFERRALS_KEY] });
      queryClient.invalidateQueries({ queryKey: [REFERRAL_DETAIL_KEY] });
    },
  });
}

/**
 * Returns the count of pending referrals (for sidebar badge).
 */
export function useReferralCount() {
  const { data: referrals } = useMedicalReferrals();

  const pending =
    referrals?.filter((r) => r.status === "pending").length ?? 0;
  const total = referrals?.length ?? 0;

  return { pending, total };
}
