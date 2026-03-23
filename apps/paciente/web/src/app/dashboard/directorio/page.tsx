"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDirectorySearch, useDirectorySpecialties } from "@/hooks/use-directory";
import { SearchBar } from "@/components/directory/search-bar";
import { ProviderTypeTabs } from "@/components/directory/provider-type-tabs";
import { ProviderCard } from "@/components/directory/provider-card";
import { FilterPanel } from "@/components/directory/filter-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { Search, Loader2 } from "lucide-react";
import type { ProviderResult, ProviderType } from "@/lib/services/directory-service";

export default function DirectorioPage() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const { specialties } = useDirectorySpecialties();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    query,
    providerType,
    filters,
    results,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    setQuery,
    setProviderType,
    updateFilter,
    resetFilters,
    loadMore,
  } = useDirectorySearch({ debounceMs: 300, pageSize: 20 });

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const navigateToProfile = useCallback(
    (provider: ProviderResult) => {
      const typeMap: Record<ProviderType, string> = {
        doctor: "doctor",
        pharmacy: "farmacia",
        clinic: "clinica",
        laboratory: "laboratorio",
      };
      router.push(
        `/dashboard/directorio/${typeMap[provider.type]}/${provider.id}`
      );
    },
    [router]
  );

  const handlePrimaryAction = useCallback(
    (provider: ProviderResult) => {
      switch (provider.type) {
        case "doctor":
          router.push(`/dashboard/agendar?doctor=${provider.id}`);
          break;
        case "pharmacy":
          if (provider.phone) {
            window.location.href = `tel:${provider.phone}`;
          }
          break;
        case "clinic":
          navigateToProfile(provider);
          break;
        case "laboratory":
          navigateToProfile(provider);
          break;
      }
    },
    [router, navigateToProfile]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Directorio
        </h1>
        <p className="text-gray-500 mt-1">
          Busca doctores, farmacias, clinicas y laboratorios en Red Salud
        </p>
      </div>

      {/* Search bar + mobile filter button */}
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        {/* Mobile-only filter trigger (hidden on lg+) */}
        <FilterPanel
          filters={filters}
          providerType={providerType}
          specialties={specialties}
          onUpdate={updateFilter}
          onReset={resetFilters}
          open={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
          mode="mobile-only"
        />
      </div>

      {/* Provider type tabs */}
      <ProviderTypeTabs
        value={providerType}
        onChange={setProviderType}
      />

      {/* Active filters summary */}
      <ActiveFiltersSummary
        filters={filters}
        specialties={specialties}
        onRemove={updateFilter}
      />

      {/* Content area with desktop filter sidebar */}
      <div className="flex gap-6">
        {/* Desktop-only sidebar (hidden below lg) */}
        <FilterPanel
          filters={filters}
          providerType={providerType}
          specialties={specialties}
          onUpdate={updateFilter}
          onReset={resetFilters}
          open={false}
          onToggle={() => {}}
          mode="desktop-only"
        />

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Result count */}
          {!loading && results.length > 0 && (
            <p className="text-sm text-gray-500 mb-3">
              {total} resultado{total !== 1 ? "s" : ""}
              {query && (
                <> para &quot;{query}&quot;</>
              )}
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && <SkeletonList count={4} />}

          {/* Results list */}
          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((provider) => (
                <ProviderCard
                  key={`${provider.type}-${provider.id}`}
                  provider={provider}
                  onViewProfile={() => navigateToProfile(provider)}
                  onPrimaryAction={() => handlePrimaryAction(provider)}
                />
              ))}
            </div>
          )}

          {/* Load more sentinel */}
          <div ref={loadMoreRef} className="h-1" />

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
              <span className="text-sm text-gray-500 ml-2">
                Cargando mas resultados...
              </span>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && results.length === 0 && (
            <EmptyState
              icon={Search}
              title="No se encontraron resultados"
              description={
                query
                  ? `No hay proveedores que coincidan con "${query}". Intenta con otra busqueda.`
                  : "No se encontraron proveedores con los filtros seleccionados."
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Active filters badges ---

function ActiveFiltersSummary({
  filters,
  specialties,
  onRemove,
}: {
  filters: Record<string, unknown>;
  specialties: { id: string; name: string }[];
  onRemove: (key: string, value: unknown) => void;
}) {
  const badges: { key: string; label: string }[] = [];

  if (filters.city) {
    badges.push({ key: "city", label: `Ciudad: ${filters.city}` });
  }
  if (filters.state) {
    badges.push({ key: "state", label: `Estado: ${filters.state}` });
  }
  if (filters.specialtyId) {
    const spec = specialties.find((s) => s.id === filters.specialtyId);
    badges.push({
      key: "specialtyId",
      label: spec?.name || "Especialidad",
    });
  }
  if (filters.minRating) {
    badges.push({
      key: "minRating",
      label: `${filters.minRating}+ estrellas`,
    });
  }
  if (filters.acceptsInsurance) {
    badges.push({ key: "acceptsInsurance", label: "Acepta seguro" });
  }
  if (filters.openNow) {
    badges.push({ key: "openNow", label: "Abierto ahora" });
  }
  if (filters.hasDelivery) {
    badges.push({ key: "hasDelivery", label: "Delivery" });
  }
  if (
    filters.maxPrice != null &&
    (filters.maxPrice as number) < 500
  ) {
    badges.push({
      key: "maxPrice",
      label: `Max $${filters.maxPrice}`,
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500">Filtrando por:</span>
      {badges.map((badge) => (
        <button
          key={badge.key}
          onClick={() => onRemove(badge.key, undefined)}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full hover:bg-emerald-100 transition"
        >
          {badge.label}
          <span className="text-emerald-500">&times;</span>
        </button>
      ))}
    </div>
  );
}
