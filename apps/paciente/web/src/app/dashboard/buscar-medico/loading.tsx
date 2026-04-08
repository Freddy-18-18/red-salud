import { Skeleton } from "@/components/ui/skeleton";

export default function BuscarMedicoLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Doctor cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white border border-gray-100 rounded-xl"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-32" />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Skeleton key={s} className="w-3.5 h-3.5 rounded" />
                  ))}
                  <Skeleton className="h-3 w-8 ml-1" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
