"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  SpecialtyCrudService,
  FilterOptions,
} from "@/lib/supabase/services/specialty-crud-factory";
import type { ModuleSchema } from "@/lib/specialties/modules/module-schema";

// ============================================
// Types
// ============================================

type ViewState = "list" | "form" | "detail";

export interface UseSpecialtyModulePageOptions {
  service: SpecialtyCrudService<any>;
  schema: ModuleSchema;
  doctorId?: string;
}

export interface UseSpecialtyModulePageReturn {
  records: Record<string, unknown>[];
  selectedRecord: Record<string, unknown> | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortKey: string;
  sortDirection: "asc" | "desc";
  searchQuery: string;
  view: ViewState;
  setView: (view: ViewState) => void;
  handleCreate: (data: Record<string, unknown>) => Promise<void>;
  handleUpdate: (data: Record<string, unknown>) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleSort: (key: string) => void;
  handleSearch: (query: string) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (record: Record<string, unknown>) => void;
  handleRefresh: () => void;
}

// ============================================
// Hook
// ============================================

const DEFAULT_PAGE_SIZE = 10;

export function useSpecialtyModulePage({
  service,
  schema,
  doctorId,
}: UseSpecialtyModulePageOptions): UseSpecialtyModulePageReturn {
  // -- View state --
  const [view, setView] = useState<ViewState>("list");
  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(null);

  // -- Data --
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // -- Loading flags --
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // -- Pagination --
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  // -- Sort --
  const [sortKey, setSortKey] = useState(schema.defaultSort.key);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    schema.defaultSort.direction
  );

  // -- Search --
  const [searchQuery, setSearchQuery] = useState("");

  // Ref to prevent double-fetches in strict mode
  const fetchIdRef = useRef(0);

  // ============================================
  // Fetch records
  // ============================================

  const fetchRecords = useCallback(async () => {
    if (!doctorId) return;

    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);

    try {
      const filters: FilterOptions = {
        orderBy: sortKey,
        orderDirection: sortDirection,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      };

      const [listResult, countResult] = await Promise.all([
        service.list(doctorId, filters),
        service.count(doctorId, filters),
      ]);

      // Only apply results if this is still the latest fetch
      if (fetchId !== fetchIdRef.current) return;

      if (listResult.success && listResult.data) {
        setRecords(listResult.data);
      } else {
        setRecords([]);
      }

      if (countResult.success && countResult.data != null) {
        setTotalCount(countResult.data);
      }
    } catch {
      if (fetchId === fetchIdRef.current) {
        setRecords([]);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [doctorId, service, sortKey, sortDirection, pageSize, currentPage]);

  // Fetch on mount and whenever dependencies change
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ============================================
  // Handlers
  // ============================================

  const handleCreate = useCallback(
    async (data: Record<string, unknown>) => {
      if (!doctorId) return;
      setIsSubmitting(true);
      try {
        const result = await service.create(doctorId, data);
        if (result.success) {
          setSelectedRecord(null);
          setView("list");
          await fetchRecords();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [doctorId, service, fetchRecords]
  );

  const handleUpdate = useCallback(
    async (data: Record<string, unknown>) => {
      if (!doctorId || !selectedRecord) return;
      setIsSubmitting(true);
      try {
        const result = await service.update(String(selectedRecord.id), doctorId, data);
        if (result.success) {
          setSelectedRecord(null);
          setView("list");
          await fetchRecords();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [doctorId, service, selectedRecord, fetchRecords]
  );

  const handleDelete = useCallback(async () => {
    if (!doctorId || !selectedRecord) return;
    setIsDeleting(true);
    try {
      const result = await service.remove(String(selectedRecord.id), doctorId);
      if (result.success) {
        setSelectedRecord(null);
        setView("list");
        await fetchRecords();
      }
    } finally {
      setIsDeleting(false);
    }
  }, [doctorId, service, selectedRecord, fetchRecords]);

  const handleSort = useCallback(
    (key: string) => {
      if (key === sortKey) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("asc");
      }
      setCurrentPage(1);
    },
    [sortKey]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowClick = useCallback((record: Record<string, unknown>) => {
    setSelectedRecord(record);
    setView("detail");
  }, []);

  const handleRefresh = useCallback(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    selectedRecord,
    isLoading,
    isSubmitting,
    isDeleting,
    totalCount,
    currentPage,
    pageSize,
    sortKey,
    sortDirection,
    searchQuery,
    view,
    setView,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSort,
    handleSearch,
    handlePageChange,
    handleRowClick,
    handleRefresh,
  };
}
