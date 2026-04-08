import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";

import {
  directoryService,
  type DirectoryFilters,
  type ProviderResult,
  type ProviderType,
  type ProviderReview,
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

  // Local UI state
  const [query, setQuery] = useState(initialQuery);
  const [providerType, setProviderType] = useState<ProviderType | "all">(
    initialType
  );
  const [filters, setFilters] = useState<DirectoryFilters>({});
  const [page, setPage] = useState(0);

  // Debounced values for query key
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [debouncedProviderType, setDebouncedProviderType] =
    useState(providerType);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const accumulatedResultsRef = useRef<ProviderResult[]>([]);

  // Debounce query and providerType changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedProviderType(providerType);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, providerType, debounceMs]);

  // Main search query
  const queryResult = useInfiniteQuery({
    queryKey: [
      "directory-search",
      debouncedQuery,
      { ...filters, providerType: debouncedProviderType },
      page,
    ],
    queryFn: async ({ pageParam }) => {
      const { results, total, hasMore } = await directoryService.searchAll({
        ...filters,
        query: debouncedQuery,
        providerType: filters.providerType || debouncedProviderType,
        page: pageParam,
        limit: pageSize,
      });

      return { results, total, hasMore };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    select: (data) => {
      const allResults = data.pages.flatMap((p) => p.results);
      const lastPage = data.pages[data.pages.length - 1];
      return {
        results: allResults,
        hasMore: lastPage?.hasMore ?? false,
        total: lastPage?.total ?? 0,
      };
    },
  });

  // Reset accumulated results when search params change
  useEffect(() => {
    accumulatedResultsRef.current = [];
    setPage(0);
    queryResult.refetch();
  }, [debouncedQuery, filters, debouncedProviderType, queryResult.refetch]);

  // Sync accumulated results ref from query data
  useEffect(() => {
    if (queryResult.data) {
      accumulatedResultsRef.current = queryResult.data.results;
    }
  }, [queryResult.data]);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    if (queryResult.isFetchingNextPage || !queryResult.data?.hasMore) return;
    queryResult.fetchNextPage();
  }, [queryResult]);

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
    results: accumulatedResultsRef.current,
    total: queryResult.data?.total ?? 0,
    hasMore: queryResult.data?.hasMore ?? false,
    loading: queryResult.isLoading,
    loadingMore: queryResult.isFetchingNextPage,
    error: queryResult.error?.message ?? null,
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
  const query = useQuery({
    queryKey: ["provider-detail", providerId, providerType],
    queryFn: () =>
      directoryService.getProviderDetail(providerId!, providerType!),
    enabled: !!providerId && !!providerType,
  });

  return {
    detail: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

// --- Provider Reviews Hook ---

export function useProviderReviews(
  providerId: string | undefined,
  providerType: ProviderType | undefined
) {
  const [page, setPage] = useState(0);
  const [appendMode, setAppendMode] = useState(false);
  const accumulatedReviewsRef = useRef<ProviderReview[]>([]);
  const prevProviderRef = useRef<{ id?: string; type?: ProviderType }>({});

  const query = useQuery({
    queryKey: ["provider-reviews", providerId, providerType, page],
    queryFn: async () => {
      // Reset accumulated results when provider changes
      if (
        prevProviderRef.current.id !== providerId ||
        prevProviderRef.current.type !== providerType
      ) {
        accumulatedReviewsRef.current = [];
      }
      prevProviderRef.current = { id: providerId, type: providerType };

      const result = await directoryService.getProviderReviews(
        providerId!,
        providerType!,
        page
      );

      // Accumulate results for load-more behavior
      if (appendMode && accumulatedReviewsRef.current.length > 0) {
        const newResults = [
          ...accumulatedReviewsRef.current,
          ...result.reviews,
        ];
        accumulatedReviewsRef.current = newResults;
      } else {
        accumulatedReviewsRef.current = result.reviews;
      }

      return result;
    },
    enabled: !!providerId && !!providerType,
  });

  // Reset when provider changes
  useEffect(() => {
    accumulatedReviewsRef.current = [];
    prevProviderRef.current = { id: providerId, type: providerType };
    setPage(0);
    setAppendMode(false);
  }, [providerId, providerType]);

  const loadMoreReviews = useCallback(() => {
    if (query.isFetching || !query.data?.hasMore) return;
    setAppendMode(true);
    setPage((prev) => prev + 1);
  }, [query.isFetching, query.data?.hasMore]);

  const refresh = useCallback(() => {
    accumulatedReviewsRef.current = [];
    setAppendMode(false);
    setPage(0);
    query.refetch();
  }, [query]);

  return {
    reviews: accumulatedReviewsRef.current,
    breakdown: query.data?.breakdown ?? null,
    loading: query.isLoading,
    loadingMore: query.isFetching && page > 0,
    hasMore: query.data?.hasMore ?? false,
    error: query.error?.message ?? null,
    loadMoreReviews,
    refresh,
  };
}

// --- Submit Review Hook ---

export function useSubmitReview() {
  const mutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: CreateReview;
    }) => {
      return directoryService.submitReview(userId, data);
    },
  });

  const submit = useCallback(
    async (userId: string, data: CreateReview) => {
      try {
        const result = await mutation.mutateAsync({ userId, data });
        if (!result.success) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    [mutation]
  );

  return {
    submit,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

// --- Specialties Hook (for filter) ---

export function useDirectorySpecialties() {
  const query = useQuery({
    queryKey: ["directory-specialties"],
    queryFn: () => directoryService.getSpecialties(),
  });

  return {
    specialties: query.data ?? [],
    loading: query.isLoading,
  };
}
