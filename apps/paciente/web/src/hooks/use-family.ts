import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  familyService,
  type FamilyMember,
  type CreateFamilyMember,
} from "@/lib/services/family-service";

export function useFamily() {
  const [userId, setUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  // Load family members when userId is available
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await familyService.getMembers(userId);
        setMembers(data);
      } catch {
        setError("No se pudieron cargar los familiares");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const addMember = useCallback(
    async (data: CreateFamilyMember): Promise<{ success: boolean; member?: FamilyMember }> => {
      if (!userId) return { success: false };

      setSaving(true);
      setError(null);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimistic: FamilyMember = {
        id: tempId,
        owner_id: userId,
        profile_id: null,
        full_name: data.full_name,
        relationship: data.relationship,
        date_of_birth: data.date_of_birth ?? null,
        gender: data.gender ?? null,
        blood_type: data.blood_type ?? null,
        allergies: data.allergies ?? [],
        chronic_conditions: data.chronic_conditions ?? [],
        current_medications: data.current_medications ?? [],
        emergency_contact: data.emergency_contact ?? null,
        national_id: data.national_id ?? null,
        avatar_url: data.avatar_url ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMembers((prev) => [...prev, optimistic]);

      try {
        const member = await familyService.addMember(userId, data);
        // Replace optimistic entry with real one
        setMembers((prev) =>
          prev.map((m) => (m.id === tempId ? member : m))
        );
        return { success: true, member };
      } catch {
        // Revert optimistic update
        setMembers((prev) => prev.filter((m) => m.id !== tempId));
        setError("No se pudo agregar el familiar");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const updateMember = useCallback(
    async (
      id: string,
      data: Partial<CreateFamilyMember>
    ): Promise<{ success: boolean }> => {
      setSaving(true);
      setError(null);

      // Snapshot for rollback
      const snapshot = members.find((m) => m.id === id);

      // Optimistic update
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...data } : m))
      );

      try {
        const updated = await familyService.updateMember(id, data);
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? updated : m))
        );
        return { success: true };
      } catch {
        // Revert
        if (snapshot) {
          setMembers((prev) =>
            prev.map((m) => (m.id === id ? snapshot : m))
          );
        }
        setError("No se pudo actualizar el familiar");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [members]
  );

  const removeMember = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      setSaving(true);
      setError(null);

      // Snapshot for rollback
      const snapshot = [...members];

      // Optimistic remove
      setMembers((prev) => prev.filter((m) => m.id !== id));

      try {
        await familyService.removeMember(id);
        return { success: true };
      } catch {
        // Revert
        setMembers(snapshot);
        setError("No se pudo eliminar el familiar");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [members]
  );

  const getMemberDetail = useCallback(
    async (id: string): Promise<FamilyMember | null> => {
      try {
        return await familyService.getMemberDetail(id);
      } catch {
        setError("No se pudo cargar el detalle del familiar");
        return null;
      }
    },
    []
  );

  return {
    userId,
    members,
    loading,
    saving,
    error,
    addMember,
    updateMember,
    removeMember,
    getMemberDetail,
  };
}
