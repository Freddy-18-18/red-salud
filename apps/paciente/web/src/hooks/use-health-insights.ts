import { useQuery } from "@tanstack/react-query";

import {
  getHealthInsights,
  type HealthInsight,
} from "@/lib/services/health-insights-service";
import { supabase } from "@/lib/supabase/client";

export function useHealthInsights() {
  const { data: userId } = useQuery({
    queryKey: ["currentUserId"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data, isFetching } = useQuery<HealthInsight[]>({
    queryKey: ["healthInsights", userId],
    queryFn: () => getHealthInsights(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    insights: data ?? [],
    loading: isFetching,
  };
}
