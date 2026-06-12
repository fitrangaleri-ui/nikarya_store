export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-20 px-6 md:px-8 2xl:px-12 pt-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Back button link skeleton */}
      <div className="h-6 w-36 rounded bg-muted animate-pulse" />

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Mockup */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] w-full rounded-2xl bg-card border border-border/50 overflow-hidden flex items-center justify-center">
            <div className="w-full h-full bg-muted animate-pulse" />
          </div>
          {/* Gallery thumbnails */}
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            {/* Tag/Category */}
            <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            {/* Title */}
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
            {/* SKU */}
            <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
          </div>

          <hr className="border-border/50" />

          {/* Pricing area card */}
          <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="h-7 w-40 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-full rounded-full bg-primary/20 animate-pulse" />
          </div>

          {/* Description tabs/accordion */}
          <div className="space-y-3">
            <div className="h-5 w-36 rounded bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted/60 animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/60 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted/60 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
