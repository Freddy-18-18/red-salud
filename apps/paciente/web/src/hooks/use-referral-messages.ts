import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import {
  medicalReferralService,
  type ReferralMessage,
} from "@/lib/services/medical-referral-service";

const MESSAGES_KEY = "referral-messages";

/**
 * Reads + Realtime subscribes to messages for a referral. Server applies
 * read receipts on GET (any unread doctor → patient messages get marked
 * read on first fetch).
 */
export function useReferralMessages(referralId: string | null) {
  const qc = useQueryClient();
  const query = useQuery<ReferralMessage[]>({
    queryKey: [MESSAGES_KEY, referralId],
    queryFn: () => medicalReferralService.listMessages(referralId!),
    enabled: !!referralId,
  });

  useEffect(() => {
    if (!referralId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`referral-msgs-${referralId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "referral_messages",
          filter: `referral_id=eq.${referralId}`,
        },
        (payload) => {
          const msg = payload.new as ReferralMessage;
          qc.setQueryData<ReferralMessage[]>(
            [MESSAGES_KEY, referralId],
            (prev) => {
              if (!prev) return [msg];
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            },
          );
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [referralId, qc]);

  return query;
}

export function useSendReferralMessage(referralId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      medicalReferralService.sendMessage(referralId, body),
    onSuccess: (msg) => {
      qc.setQueryData<ReferralMessage[]>(
        [MESSAGES_KEY, referralId],
        (prev) => {
          if (!prev) return [msg];
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        },
      );
    },
  });
}
