import { useQuery } from "@tanstack/react-query";

import {
  medicalReferralService,
  type ReferralAuditEntry,
} from "@/lib/services/medical-referral-service";

const AUDIT_KEY = "referral-audit";

export function useReferralAudit(referralId: string | null) {
  return useQuery<ReferralAuditEntry[]>({
    queryKey: [AUDIT_KEY, referralId],
    queryFn: () => medicalReferralService.listAudit(referralId!),
    enabled: !!referralId,
  });
}
