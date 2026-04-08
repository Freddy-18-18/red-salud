import { Skeleton } from "@/components/ui/skeleton";

export default function AgendarLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            {i < 5 && <Skeleton className="h-0.5 flex-1" />}
          </div>
        ))}
      </div>

      {/* Specialty grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white border border-gray-100 rounded-xl flex flex-col items-center gap-3"
          >
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
