import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "@/lib/services/dashboard-service";

export type { DashboardSummary };

export function useDashboardSummary() {
  const query = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // consider stale after 2 minutes
  });

  return {
    summary: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}
