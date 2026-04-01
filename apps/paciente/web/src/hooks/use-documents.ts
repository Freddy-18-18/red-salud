import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  documentsService,
  type PatientDocument,
  type DocumentCategory,
  type DocumentMetadata,
  type VaccinationRecord,
  type CreateVaccinationData,
  type CategoryCount,
} from "@/lib/services/documents-service";
import { supabase } from "@/lib/supabase/client";

export function useDocuments(filterCategory?: DocumentCategory) {
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const documentsQuery = useQuery({
    queryKey: ["documents", userId, filterCategory, searchQuery],
    queryFn: async () => {
      if (!userId) return [];
      if (searchQuery) {
        return documentsService.searchDocuments(userId, searchQuery);
      }
      return documentsService.getDocuments(userId, filterCategory);
    },
    enabled: !!userId,
  });

  const categoryCountsQuery = useQuery({
    queryKey: ["documents", "category-counts", userId],
    queryFn: async () => {
      if (!userId) return [];
      return documentsService.getDocumentsByCategory(userId);
    },
    enabled: !!userId,
  });

  const recentDocumentsQuery = useQuery({
    queryKey: ["documents", "recent", userId],
    queryFn: async () => {
      if (!userId) return [];
      return documentsService.getRecentDocuments(userId, 5);
    },
    enabled: !!userId,
  });

  const isLoading = documentsQuery.isLoading || categoryCountsQuery.isLoading || recentDocumentsQuery.isLoading;
  const error =
    documentsQuery.error?.message ??
    categoryCountsQuery.error?.message ??
    recentDocumentsQuery.error?.message ??
    null;

  const documents = documentsQuery.data ?? [];
  const categoryCounts = categoryCountsQuery.data ?? [];
  const recentDocuments = recentDocumentsQuery.data ?? [];

  // Upload document
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      metadata,
    }: {
      file: File;
      metadata: DocumentMetadata;
    }) => {
      if (!userId) throw new Error("No user");
      return documentsService.uploadDocument(userId, file, metadata);
    },
    onSuccess: (_doc, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
      queryClient.invalidateQueries({ queryKey: ["documents", "category-counts", userId] });
      queryClient.invalidateQueries({ queryKey: ["documents", "recent", userId] });
    },
  });

  const uploadDocument = useCallback(
    async (
      file: File,
      metadata: DocumentMetadata
    ): Promise<{ success: boolean; document?: PatientDocument }> => {
      if (!userId) return { success: false };
      try {
        const doc = await uploadMutation.mutateAsync({ file, metadata });
        return { success: true, document: doc };
      } catch {
        return { success: false };
      }
    },
    [userId, uploadMutation]
  );

  // Delete document
  const deleteMutation = useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) => {
      await documentsService.deleteDocument(id, fileUrl);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
      queryClient.invalidateQueries({ queryKey: ["documents", "category-counts", userId] });
      queryClient.invalidateQueries({ queryKey: ["documents", "recent", userId] });
    },
  });

  const deleteDocument = useCallback(
    async (id: string, fileUrl: string): Promise<{ success: boolean }> => {
      try {
        await deleteMutation.mutateAsync({ id, fileUrl });
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [deleteMutation]
  );

  // Share with doctor
  const shareMutation = useMutation({
    mutationFn: async ({
      documentId,
      doctorId,
    }: {
      documentId: string;
      doctorId: string;
    }) => {
      if (!userId) throw new Error("No user");
      await documentsService.shareWithDoctor(documentId, doctorId, userId);
    },
  });

  const shareWithDoctor = useCallback(
    async (
      documentId: string,
      doctorId: string
    ): Promise<{ success: boolean }> => {
      if (!userId) return { success: false };
      try {
        await shareMutation.mutateAsync({ documentId, doctorId });
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [userId, shareMutation]
  );

  // Search
  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Derived
  const totalDocuments = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  const uploading = uploadMutation.isPending;

  return {
    userId,
    documents,
    categoryCounts,
    recentDocuments,
    totalDocuments,
    loading: isLoading,
    uploading,
    error,
    searchQuery,
    search,
    uploadDocument,
    deleteDocument,
    shareWithDoctor,
    refresh: () => {
      documentsQuery.refetch();
      categoryCountsQuery.refetch();
      recentDocumentsQuery.refetch();
    },
  };
}

export function useDocument(documentId: string | null) {
  const query = useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      if (!documentId) return null;
      return documentsService.getDocument(documentId);
    },
    enabled: !!documentId,
  });

  return {
    document: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

export function useVaccinations() {
  const [userId, setUserId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const vaccinationsQuery = useQuery({
    queryKey: ["vaccinations", userId],
    queryFn: async () => {
      if (!userId) return [];
      return documentsService.getVaccinations(userId);
    },
    enabled: !!userId,
  });

  const vaccinations = vaccinationsQuery.data ?? [];

  // Add vaccination
  const addMutation = useMutation({
    mutationFn: async (data: CreateVaccinationData) => {
      if (!userId) throw new Error("No user");
      return documentsService.addVaccination(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations", userId] });
    },
  });

  const addVaccination = useCallback(
    async (
      data: CreateVaccinationData
    ): Promise<{ success: boolean; vaccination?: VaccinationRecord }> => {
      if (!userId) return { success: false };
      try {
        const vaccination = await addMutation.mutateAsync(data);
        return { success: true, vaccination };
      } catch {
        return { success: false };
      }
    },
    [userId, addMutation]
  );

  // Delete vaccination
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await documentsService.deleteVaccination(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations", userId] });
    },
  });

  const deleteVaccination = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      try {
        await deleteMutation.mutateAsync(id);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [deleteMutation]
  );

  // Upcoming vaccines (those with next_dose_date in the future)
  const upcomingVaccines = vaccinations.filter(
    (v) => v.next_dose_date && new Date(v.next_dose_date) > new Date()
  );

  return {
    userId,
    vaccinations,
    upcomingVaccines,
    loading: vaccinationsQuery.isLoading,
    saving: addMutation.isPending || deleteMutation.isPending,
    error: vaccinationsQuery.error?.message ?? null,
    addVaccination,
    deleteVaccination,
    refresh: () => vaccinationsQuery.refetch(),
  };
}
