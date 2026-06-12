import { Typography } from "@/components/ui/typography";

export default function AdminLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden pb-10 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="bg-card border-b border-border/40 px-4 py-5 sm:px-6 md:px-8 space-y-2">
        <div className="h-7 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded bg-muted/60 animate-pulse" />
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card border border-border px-5 py-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-8 w-8 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-7 w-28 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-muted/60 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Two Columns Grid Skeleton */}
        <div className="grid gap-5 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Card 1 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-primary/5 border-b border-border/40 h-16 w-full flex items-center justify-between px-6" />
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-primary/5 border-b border-border/40 h-16 w-full flex items-center justify-between px-6" />
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded bg-muted animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-1/3 rounded bg-muted/60 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
