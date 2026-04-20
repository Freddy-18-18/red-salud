export default function MensajesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-6 w-28 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="h-10 w-full rounded-xl bg-gray-200 animate-pulse" />
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
            <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-48 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
