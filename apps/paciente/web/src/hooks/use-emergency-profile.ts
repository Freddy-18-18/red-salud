import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getEmergencyProfile,
  updateEmergencyProfile,
  getPublicProfile,
  type EmergencyProfileResponse,
  type UpdateEmergencyProfileSettings,
  type PublicEmergencyProfile,
} from "@/lib/services/emergency-profile-service";

// --- Keys ---

const KEYS = {
  profile: ["emergency-profile"] as const,
  public: (token: string) => ["emergency-profile", "public", token] as const,
};

// --- Authenticated hooks ---

/**
 * Fetch the patient's emergency profile configuration and medical data.
 */
export function useEmergencyProfile() {
  return useQuery<EmergencyProfileResponse>({
    queryKey: KEYS.profile,
    queryFn: getEmergencyProfile,
    staleTime: 30_000,
  });
}

/**
 * Mutation to update emergency profile settings.
 * Optimistically updates the cache for instant UI feedback.
 */
export function useUpdateEmergencyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpdateEmergencyProfileSettings) =>
      updateEmergencyProfile(settings),

    onMutate: async (settings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: KEYS.profile });

      // Snapshot previous value
      const previous = queryClient.getQueryData<EmergencyProfileResponse>(
        KEYS.profile,
      );

      // Optimistic update
      if (previous?.config) {
        queryClient.setQueryData<EmergencyProfileResponse>(KEYS.profile, {
          ...previous,
          config: {
            ...previous.config,
            ...settings,
            updated_at: new Date().toISOString(),
          },
        });
      }

      return { previous };
    },

    onError: (_err, _settings, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(KEYS.profile, context.previous);
      }
    },

    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: KEYS.profile });
    },
  });
}

// --- Public hook (no auth) ---

/**
 * Fetch a public emergency profile by token.
 * Used on the public-facing page that anyone can access.
 */
export function usePublicEmergencyProfile(token: string | null) {
  return useQuery<PublicEmergencyProfile>({
    queryKey: KEYS.public(token ?? ""),
    queryFn: () => getPublicProfile(token!),
    enabled: !!token,
    staleTime: 60_000,
    retry: 1,
  });
}
