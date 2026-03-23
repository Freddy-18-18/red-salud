import { useState, useEffect, useCallback, useRef } from "react";
import {
  directoryService,
  type DirectoryFilters,
  type ProviderResult,
  type ProviderType,
  type ProviderReview,
  type RatingBreakdown,
  type DoctorDetail,
  type PharmacyDetail,
  type ClinicDetail,
  type LabDetail,
  type CreateReview,
} from "@/lib/services/directory-service";

// --- Directory Search Hook ---

interface UseDirectorySearchOptions {
  initialQuery?: string;
  initialType?: ProviderType | "all";
  debounceMs?: number;
  pageSize?: number;
}

export function useDirectorySearch(options: UseDirectorySearchOptions = {}) {
  const {
    initialQuery = "",
    initialType = "all",
    debounceMs = 300,
    pageSize = 20,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [providerType, setProviderType] = useState<ProviderType | "all">(
    initialType
  );
  const [filters, setFilters] = useState<DirectoryFilters>({});
  const [results, setResults] = useState<ProviderResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef(0); // simple counter to discard stale requests

  // Main search function
  const search = useCallback(
    async (
      searchQuery: string,
      searchFilters: DirectoryFilters,
      searchPage: number,
      append: boolean = false
    ) => {
      const requestId = ++abortRef.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const { results: newResults, total: newTotal, hasMore: more } =
          await directoryService.searchAll({
            ...searchFilters,
            query: searchQuery,
            providerType: searchFilters.providerType || providerType,
            page: searchPage,
            limit: pageSize,
          });

        // Discard stale response
        if (requestId !== abortRef.current) return;

        if (append) {
          setResults((prev) => [...prev, ...newResults]);
        } else {
          setResults(newResults);
        }
        setTotal(newTotal);
        setHasMore(more);
        setPage(searchPage);
      } catch (err) {
        if (requestId !== abortRef.current) return;
        setError(
          err instanceof Error ? err.message : "Error al buscar proveedores"
        );
      } finally {
        if (requestId === abortRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [providerType, pageSize]
  );

  // Debounced search on query/filters/type change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      search(query, { ...filters, providerType }, 0);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, filters, providerType, debounceMs, search]);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    search(query, { ...filters, providerType }, page + 1, true);
  }, [query, filters, providerType, page, loadingMore, hasMore, search]);

  // Update a single filter
  const updateFilter = useCallback(
    (key: keyof DirectoryFilters, value: unknown) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setQuery("");
    setProviderType("all");
  }, []);

  return {
    // State
    query,
    providerType,
    filters,
    results,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    // Actions
    setQuery,
    setProviderType,
    setFilters,
    updateFilter,
    resetFilters,
    loadMore,
  };
}

// --- Provider Detail Hook ---

export function useProviderDetail(
  providerId: string | undefined,
  providerType: ProviderType | undefined
) {
  const [detail, setDetail] = useState<
    DoctorDetail | PharmacyDetail | ClinicDetail | LabDetail | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId || !providerType) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await directoryService.getProviderDetail(
          providerId,
          providerType
        );
        if (!cancelled) setDetail(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar detalle"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [providerId, providerType]);

  return { detail, loading, error };
}

// --- Provider Reviews Hook ---

export function useProviderReviews(
  providerId: string | undefined,
  providerType: ProviderType | undefined
) {
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [breakdown, setBreakdown] = useState<RatingBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (!providerId || !providerType) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await directoryService.getProviderReviews(
          providerId,
          providerType,
          pageNum
        );

        if (append) {
          setReviews((prev) => [...prev, ...result.reviews]);
        } else {
          setReviews(result.reviews);
        }
        setBreakdown(result.breakdown);
        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar resenas"
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [providerId, providerType]
  );

  useEffect(() => {
    if (providerId && providerType) {
      loadReviews(0);
    }
  }, [providerId, providerType, loadReviews]);

  const loadMoreReviews = useCallback(() => {
    if (loadingMore || !hasMore) return;
    loadReviews(page + 1, true);
  }, [page, loadingMore, hasMore, loadReviews]);

  const refresh = useCallback(() => {
    loadReviews(0);
  }, [loadReviews]);

  return {
    reviews,
    breakdown,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMoreReviews,
    refresh,
  };
}

// --- Submit Review Hook ---

export function useSubmitReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (userId: string, data: CreateReview) => {
      setLoading(true);
      setError(null);
      try {
        const result = await directoryService.submitReview(userId, data);
        if (!result.success) {
          setError(result.error || "Error al enviar resena");
          return false;
        }
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al enviar resena"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submit, loading, error };
}

// --- Specialties Hook (for filter) ---

export function useDirectorySpecialties() {
  const [specialties, setSpecialties] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    directoryService
      .getSpecialties()
      .then(setSpecialties)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { specialties, loading };
}
