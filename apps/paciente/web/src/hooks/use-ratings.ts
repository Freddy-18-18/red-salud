import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ratingService,
  type Rating,
  type SubmitRatingData,
  type FollowUpItem,
} from "@/lib/services/rating-service";

// ── useAppointmentRating ─────────────────────────────────────────────

export function useAppointmentRating(appointmentId: string | undefined) {
  const query = useQuery({
    queryKey: ["rating", appointmentId],
    queryFn: () => ratingService.getRating(appointmentId!),
    enabled: !!appointmentId,
  });

  return {
    rating: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

// ── useSubmitRating ──────────────────────────────────────────────────

export function useSubmitRating() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: SubmitRatingData) => ratingService.submitRating(data),
    onSuccess: (_data: Rating, variables: SubmitRatingData) => {
      // Invalidate the specific rating query
      queryClient.invalidateQueries({
        queryKey: ["rating", variables.appointment_id],
      });
      // Invalidate appointments list (to update UI badges)
      queryClient.invalidateQueries({
        queryKey: ["appointments"],
      });
      // Invalidate pending ratings
      queryClient.invalidateQueries({
        queryKey: ["completed-appointments-without-rating"],
      });
    },
  });

  const submit = async (data: SubmitRatingData) => {
    try {
      const result = await mutation.mutateAsync(data);
      return { success: true as const, data: result };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  return {
    submit,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

// ── usePendingFollowUps ─────────────────────────────────────────────

export function usePendingFollowUps() {
  const query = useQuery({
    queryKey: ["follow-ups", "pending"],
    queryFn: () => ratingService.getPendingFollowUps(),
  });

  return {
    followUps: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// ── useAllFollowUps ─────────────────────────────────────────────────

export function useAllFollowUps() {
  const query = useQuery({
    queryKey: ["follow-ups", "all"],
    queryFn: () => ratingService.getAllFollowUps(),
  });

  return {
    followUps: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// ── useCompleteFollowUp ─────────────────────────────────────────────

export function useCompleteFollowUp() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      ratingService.completeFollowUp(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
  });

  const complete = async (id: string, notes?: string) => {
    try {
      const result = await mutation.mutateAsync({ id, notes });
      return { success: true as const, data: result };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  return {
    complete,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

// ── useFollowUpStats ────────────────────────────────────────────────

export function useFollowUpStats() {
  const query = useQuery({
    queryKey: ["follow-ups", "stats"],
    queryFn: () => ratingService.getFollowUpStats(),
    staleTime: 30_000, // 30 seconds
  });

  return {
    stats: query.data ?? { total: 0, pending: 0, completed: 0 },
    loading: query.isLoading,
  };
}
