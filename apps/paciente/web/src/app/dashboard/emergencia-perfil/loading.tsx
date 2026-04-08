import { Skeleton } from "@/components/ui/skeleton";

export default function EmergenciaPerfilLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>

      {/* Main grid: config + QR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: config form */}
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>

        {/* Right: QR code */}
        <div className="flex justify-center">
          <Skeleton className="h-[300px] w-[260px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
