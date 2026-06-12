export default function AdminProductsLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden pb-10 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="bg-card border-b border-border/40 px-4 py-5 sm:px-6 md:px-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded bg-muted/60 animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-full bg-primary/20 animate-pulse" />
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Search/Filter bar skeleton */}
        <div className="h-12 w-full rounded-xl bg-card border border-border/50 animate-pulse" />

        {/* Table skeleton */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-border/10 last:border-0">
                <div className="w-12 h-12 rounded bg-muted animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                  <div className="h-3.5 w-1/4 rounded bg-muted/60 animate-pulse" />
                </div>
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
