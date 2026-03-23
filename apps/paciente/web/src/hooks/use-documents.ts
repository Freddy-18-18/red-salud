import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  documentsService,
  type PatientDocument,
  type DocumentCategory,
  type DocumentMetadata,
  type VaccinationRecord,
  type CreateVaccinationData,
  type CategoryCount,
} from "@/lib/services/documents-service";

export function useDocuments(filterCategory?: DocumentCategory) {
  const [userId, setUserId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Load documents
  const loadDocuments = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const [docs, counts, recent] = await Promise.all([
        searchQuery
          ? documentsService.searchDocuments(userId, searchQuery)
          : documentsService.getDocuments(userId, filterCategory),
        documentsService.getDocumentsByCategory(userId),
        documentsService.getRecentDocuments(userId, 5),
      ]);
      setDocuments(docs);
      setCategoryCounts(counts);
      setRecentDocuments(recent);
    } catch {
      setError("No se pudieron cargar los documentos");
    } finally {
      setLoading(false);
    }
  }, [userId, filterCategory, searchQuery]);

  useEffect(() => {
    if (userId) loadDocuments();
  }, [userId, loadDocuments]);

  // Upload document
  const uploadDocument = useCallback(
    async (
      file: File,
      metadata: DocumentMetadata
    ): Promise<{ success: boolean; document?: PatientDocument }> => {
      if (!userId) return { success: false };

      setUploading(true);
      setError(null);
      try {
        const doc = await documentsService.uploadDocument(
          userId,
          file,
          metadata
        );
        setDocuments((prev) => [doc, ...prev]);
        setRecentDocuments((prev) => [doc, ...prev.slice(0, 4)]);
        // Update category counts
        setCategoryCounts((prev) =>
          prev.map((c) =>
            c.category === metadata.category
              ? { ...c, count: c.count + 1 }
              : c
          )
        );
        return { success: true, document: doc };
      } catch {
        setError("No se pudo subir el documento");
        return { success: false };
      } finally {
        setUploading(false);
      }
    },
    [userId]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (id: string, fileUrl: string): Promise<{ success: boolean }> => {
      const snapshot = [...documents];
      const doc = documents.find((d) => d.id === id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));

      try {
        await documentsService.deleteDocument(id, fileUrl);
        if (doc) {
          setCategoryCounts((prev) =>
            prev.map((c) =>
              c.category === doc.category
                ? { ...c, count: Math.max(0, c.count - 1) }
                : c
            )
          );
        }
        setRecentDocuments((prev) => prev.filter((d) => d.id !== id));
        return { success: true };
      } catch {
        setDocuments(snapshot);
        setError("No se pudo eliminar el documento");
        return { success: false };
      }
    },
    [documents]
  );

  // Share with doctor
  const shareWithDoctor = useCallback(
    async (
      documentId: string,
      doctorId: string
    ): Promise<{ success: boolean }> => {
      if (!userId) return { success: false };

      try {
        await documentsService.shareWithDoctor(documentId, doctorId, userId);
        return { success: true };
      } catch {
        setError("No se pudo compartir el documento");
        return { success: false };
      }
    },
    [userId]
  );

  // Search
  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Derived
  const totalDocuments = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  return {
    userId,
    documents,
    categoryCounts,
    recentDocuments,
    totalDocuments,
    loading,
    uploading,
    error,
    searchQuery,
    search,
    uploadDocument,
    deleteDocument,
    shareWithDoctor,
    refresh: loadDocuments,
  };
}

export function useDocument(documentId: string | null) {
  const [document, setDocument] = useState<PatientDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const doc = await documentsService.getDocument(documentId);
        setDocument(doc);
      } catch {
        setError("No se pudo cargar el documento");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [documentId]);

  return { document, loading, error };
}

export function useVaccinations() {
  const [userId, setUserId] = useState<string | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  const loadVaccinations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await documentsService.getVaccinations(userId);
      setVaccinations(data);
    } catch {
      setError("No se pudieron cargar las vacunas");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadVaccinations();
  }, [userId, loadVaccinations]);

  const addVaccination = useCallback(
    async (
      data: CreateVaccinationData
    ): Promise<{ success: boolean; vaccination?: VaccinationRecord }> => {
      if (!userId) return { success: false };

      setSaving(true);
      setError(null);
      try {
        const vaccination = await documentsService.addVaccination(userId, data);
        setVaccinations((prev) => [vaccination, ...prev]);
        return { success: true, vaccination };
      } catch {
        setError("No se pudo agregar la vacuna");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const deleteVaccination = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      const snapshot = [...vaccinations];
      setVaccinations((prev) => prev.filter((v) => v.id !== id));

      try {
        await documentsService.deleteVaccination(id);
        return { success: true };
      } catch {
        setVaccinations(snapshot);
        setError("No se pudo eliminar la vacuna");
        return { success: false };
      }
    },
    [vaccinations]
  );

  // Upcoming vaccines (those with next_dose_date in the future)
  const upcomingVaccines = vaccinations.filter(
    (v) => v.next_dose_date && new Date(v.next_dose_date) > new Date()
  );

  return {
    userId,
    vaccinations,
    upcomingVaccines,
    loading,
    saving,
    error,
    addVaccination,
    deleteVaccination,
    refresh: loadVaccinations,
  };
}
