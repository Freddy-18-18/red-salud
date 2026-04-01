import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  familyService,
  type FamilyMember,
  type CreateFamilyMember,
} from "@/lib/services/family-service";
import { supabase } from "@/lib/supabase/client";

export function useFamily() {
  const [userId, setUserId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // Load family members → useQuery
  const membersQuery = useQuery({
    queryKey: ["family", "members", userId],
    queryFn: async () => {
      if (!userId) return [];
      return familyService.getMembers(userId);
    },
    enabled: !!userId,
  });

  const members = membersQuery.data ?? [];

  // Add member → useMutation
  const addMutation = useMutation({
    mutationFn: async (data: CreateFamilyMember) => {
      if (!userId) throw new Error("No user");
      return familyService.addMember(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members", userId] });
    },
  });

  const addMember = useCallback(
    async (data: CreateFamilyMember): Promise<{ success: boolean; member?: FamilyMember }> => {
      if (!userId) return { success: false };
      try {
        const member = await addMutation.mutateAsync(data);
        return { success: true, member };
      } catch {
        return { success: false };
      }
    },
    [userId, addMutation]
  );

  // Update member → useMutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateFamilyMember> }) => {
      return familyService.updateMember(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members", userId] });
    },
  });

  const updateMember = useCallback(
    async (
      id: string,
      data: Partial<CreateFamilyMember>
    ): Promise<{ success: boolean }> => {
      try {
        await updateMutation.mutateAsync({ id, data });
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [updateMutation]
  );

  // Remove member → useMutation
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await familyService.removeMember(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members", userId] });
    },
  });

  const removeMember = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      try {
        await removeMutation.mutateAsync(id);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [removeMutation]
  );

  const getMemberDetail = useCallback(
    async (id: string): Promise<FamilyMember | null> => {
      try {
        return await familyService.getMemberDetail(id);
      } catch {
        return null;
      }
    },
    []
  );

  const saving = addMutation.isPending || updateMutation.isPending || removeMutation.isPending;
  const error =
    membersQuery.error?.message ??
    addMutation.error?.message ??
    updateMutation.error?.message ??
    removeMutation.error?.message ??
    null;

  return {
    userId,
    members,
    loading: membersQuery.isLoading,
    saving,
    error,
    addMember,
    updateMember,
    removeMember,
    getMemberDetail,
  };
}
