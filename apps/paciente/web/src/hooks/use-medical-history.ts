import { useQuery, keepPreviousData } from "@tanstack/react-query";

import {
  medicalHistoryService,
  type TimelineEvent,
  type TimelineFilters,
  type TimelineStats,
} from "@/lib/services/medical-history-service";

/**
 * Hook for paginated medical timeline events.
 */
export function useMedicalTimeline(
  patientId: string | undefined,
  filters: TimelineFilters = {},
  page: number = 0,
  pageSize: number = 20,
) {
  const query = useQuery({
    queryKey: ["medical-timeline", patientId, filters, page, pageSize],
    queryFn: async () => {
      if (!patientId) return { events: [], hasMore: false };
      return medicalHistoryService.getMedicalTimeline(patientId, filters, page, pageSize);
    },
    enabled: !!patientId,
    placeholderData: keepPreviousData,
  });

  return {
    events: (query.data?.events ?? []) as TimelineEvent[],
    hasMore: query.data?.hasMore ?? false,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
    refresh: () => query.refetch(),
  };
}

/**
 * Hook for timeline statistics (event counts by type).
 */
export function useTimelineStats(patientId: string | undefined) {
  const query = useQuery({
    queryKey: ["medical-timeline-stats", patientId],
    queryFn: async () => {
      if (!patientId) return null;
      return medicalHistoryService.getTimelineStats(patientId);
    },
    enabled: !!patientId,
  });

  return {
    stats: (query.data ?? null) as TimelineStats | null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
