export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-20 px-6 md:px-8 2xl:px-12 pt-4 md:pt-12 space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumb skeleton */}
      <div className="h-9 w-48 rounded-full bg-card border border-border/50 animate-pulse" />

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded bg-muted/60 animate-pulse" />
      </div>

      {/* Main layout grid */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pt-4">
        {/* Sidebar skeleton (desktop only) */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="h-72 rounded-xl bg-card border border-border/50 p-5 space-y-4">
            <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-muted/60 animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Products grid skeleton */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Toolbar skeleton */}
          <div className="h-10 w-full rounded-lg bg-card border border-border/50 animate-pulse" />

          {/* Grid of Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden space-y-4 pb-4"
              >
                {/* Image placeholder */}
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                {/* Info placeholders */}
                <div className="px-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-muted/60 animate-pulse" />
                </div>
                <div className="px-4 pt-2 flex items-center justify-between">
                  <div className="h-5 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
