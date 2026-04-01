import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createSymptomCheck,
  getSymptomHistory,
  type CreateSymptomCheckData,
} from "@/lib/services/symptom-checker-service";

// --- Query Keys ---

const SYMPTOM_KEYS = {
  all: ["symptom-checks"] as const,
  history: (patientId: string) => [...SYMPTOM_KEYS.all, "history", patientId] as const,
};

// --- Hooks ---

/**
 * Fetch symptom check history for a patient.
 */
export function useSymptomHistory(patientId: string | undefined) {
  return useQuery({
    queryKey: SYMPTOM_KEYS.history(patientId ?? ""),
    queryFn: async () => {
      const result = await getSymptomHistory(patientId!);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!patientId,
  });
}

/**
 * Mutation to create a new symptom check session.
 */
export function useCreateSymptomCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSymptomCheckData) => {
      const result = await createSymptomCheck(data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SYMPTOM_KEYS.history(variables.patientId),
      });
    },
  });
}
