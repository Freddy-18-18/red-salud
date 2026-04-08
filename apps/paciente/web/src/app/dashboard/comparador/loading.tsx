import { Skeleton } from "@/components/ui/skeleton";

export default function ComparadorLoading() {
  return (
    <div className="space-y-6">
      {/* Header + back button */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72 mt-1" />
        </div>
      </div>

      {/* BCV rate badge */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Prescription selector cards */}
      <div>
        <Skeleton className="h-5 w-40 mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white border border-gray-100 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="w-5 h-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison results placeholder */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <Skeleton className="h-5 w-44" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
