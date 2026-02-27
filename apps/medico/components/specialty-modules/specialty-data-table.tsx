"use client";

import { useCallback, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Inbox,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import type { ModuleSchema, ColumnDef } from "@/lib/specialties/modules/module-schema";

// ============================================================================
// TYPES
// ============================================================================

interface SpecialtyDataTableProps {
  schema: ModuleSchema;
  data: Record<string, unknown>[];
  isLoading: boolean;
  totalCount: number;
  onRowClick?: (record: Record<string, unknown>) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  pageSize?: number;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  searchQuery?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Resolve a cell value for display */
function renderCellValue(
  col: ColumnDef,
  row: Record<string, unknown>,
): React.ReactNode {
  const raw = row[col.key];

  // Badge columns
  if (col.type === "badge" && col.badgeVariant) {
    const label = col.format ? col.format(raw, row) : String(raw ?? "—");
    const variant = col.badgeVariant(raw);
    return <Badge variant={variant}>{label}</Badge>;
  }

  // Formatted value
  if (col.format) {
    return col.format(raw, row);
  }

  // Boolean display
  if (col.type === "boolean") {
    return raw ? "Sí" : "No";
  }

  // Fallback
  return raw != null ? String(raw) : "—";
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Column header with optional sort indicator */
function SortableHeader({
  col,
  sortKey,
  sortDirection,
  onSort,
}: {
  col: ColumnDef;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string, direction: "asc" | "desc") => void;
}) {
  const isActive = sortKey === col.key;

  const handleClick = useCallback(() => {
    if (!col.sortable || !onSort) return;
    const nextDir: "asc" | "desc" =
      isActive && sortDirection === "asc" ? "desc" : "asc";
    onSort(col.key, nextDir);
  }, [col.key, col.sortable, isActive, onSort, sortDirection]);

  if (!col.sortable) {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        {col.label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium transition-colors",
        "hover:text-foreground",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {col.label}
      {isActive ? (
        sortDirection === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

/** Skeleton loading rows */
function LoadingRows({ columns, rows = 5 }: { columns: ColumnDef[]; rows?: number }) {
  const visibleCols = columns.filter((c) => !c.hidden);
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-border">
          {visibleCols.map((col, colIdx) => (
            <td
              key={col.key}
              className={cn(
                "px-4 py-3",
                colIdx > 1 && "hidden md:table-cell",
              )}
            >
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Empty state placeholder */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SpecialtyDataTable({
  schema,
  data,
  isLoading,
  totalCount,
  onRowClick,
  onCreateNew,
  onRefresh,
  onSort,
  onSearch,
  onPageChange,
  currentPage = 1,
  pageSize = 20,
  sortKey,
  sortDirection,
  searchQuery = "",
}: SpecialtyDataTableProps) {
  // Derived values
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );

  const visibleColumns = useMemo(
    () => schema.columns.filter((c) => !c.hidden),
    [schema.columns],
  );

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Handlers
  const handlePrev = useCallback(() => {
    if (canGoPrev) onPageChange?.(currentPage - 1);
  }, [canGoPrev, currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (canGoNext) onPageChange?.(currentPage + 1);
  }, [canGoNext, currentPage, onPageChange]);

  return (
    <Card>
      {/* ── Header ──────────────────────────────────────────────── */}
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          {schema.labels.plural}
          {!isLoading && (
            <Badge variant="secondary" className="ml-1 text-xs font-normal">
              {totalCount}
            </Badge>
          )}
        </CardTitle>

        <div className="flex items-center gap-2">
          {/* Search */}
          {onSearch && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Buscar ${schema.labels.plural.toLowerCase()}…`}
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="h-9 w-[180px] pl-8 sm:w-[220px]"
              />
            </div>
          )}

          {/* Refresh */}
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Actualizar"
            >
              <RefreshCcw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
          )}

          {/* Create */}
          {onCreateNew && (
            <Button size="sm" className="h-9" onClick={onCreateNew}>
              <Plus className="mr-1.5 h-4 w-4" />
              {schema.labels.create}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* ── Content ─────────────────────────────────────────────── */}
      <CardContent className="p-0">
        {/* Empty state (non-loading) */}
        {!isLoading && data.length === 0 ? (
          <EmptyState message={schema.labels.empty} />
        ) : (
          <>
            {/* Responsive table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {visibleColumns.map((col, idx) => (
                      <th
                        key={col.key}
                        className={cn(
                          "whitespace-nowrap px-4 py-3 text-left font-medium",
                          col.width && `w-[${col.width}]`,
                          // Hide non-essential columns on mobile (keep first 2)
                          idx > 1 && "hidden md:table-cell",
                        )}
                      >
                        <SortableHeader
                          col={col}
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                          onSort={onSort}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <LoadingRows columns={schema.columns} />
                  ) : (
                    data.map((row, rowIdx) => (
                      <tr
                        key={(row.id as string) ?? rowIdx}
                        onClick={() => onRowClick?.(row)}
                        className={cn(
                          "border-b border-border transition-colors",
                          onRowClick &&
                            "cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50",
                        )}
                        tabIndex={onRowClick ? 0 : undefined}
                        role={onRowClick ? "button" : undefined}
                        onKeyDown={(e) => {
                          if (
                            onRowClick &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }}
                      >
                        {visibleColumns.map((col, colIdx) => (
                          <td
                            key={col.key}
                            className={cn(
                              "px-4 py-3",
                              colIdx > 1 && "hidden md:table-cell",
                            )}
                          >
                            {renderCellValue(col, row)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ─────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Página {currentPage} de {totalPages}
                  <span className="ml-2 hidden sm:inline">
                    ({totalCount} {totalCount === 1 ? "registro" : "registros"})
                  </span>
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!canGoPrev || isLoading}
                    onClick={handlePrev}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!canGoNext || isLoading}
                    onClick={handleNext}
                    aria-label="Página siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
