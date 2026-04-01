'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    router.push(`/buscar?${params.toString()}`)
  }

  // Compute visible page numbers (show up to 5 around current)
  const pages: number[] = []
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, currentPage + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Paginacion"
    >
      {/* Previous */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] disabled:pointer-events-none disabled:opacity-40"
        aria-label="Pagina anterior"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* First page + ellipsis */}
      {start > 1 && (
        <>
          <PageButton page={1} current={currentPage} onClick={goToPage} />
          {start > 2 && (
            <span className="px-2 text-sm text-[hsl(var(--muted-foreground))]">
              ...
            </span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <PageButton key={page} page={page} current={currentPage} onClick={goToPage} />
      ))}

      {/* Last page + ellipsis */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-2 text-sm text-[hsl(var(--muted-foreground))]">
              ...
            </span>
          )}
          <PageButton page={totalPages} current={currentPage} onClick={goToPage} />
        </>
      )}

      {/* Next */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] disabled:pointer-events-none disabled:opacity-40"
        aria-label="Pagina siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Page info */}
      <span className="ml-4 text-xs text-[hsl(var(--muted-foreground))]">
        Pagina {currentPage} de {totalPages}
      </span>
    </nav>
  )
}

function PageButton({
  page,
  current,
  onClick,
}: {
  page: number
  current: number
  onClick: (page: number) => void
}) {
  const isActive = page === current
  return (
    <button
      onClick={() => onClick(page)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-emerald-600 text-white dark:bg-emerald-500'
          : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
      }`}
      aria-label={`Pagina ${page}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {page}
    </button>
  )
}
