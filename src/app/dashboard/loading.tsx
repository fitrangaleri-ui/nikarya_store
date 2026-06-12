import { Typography } from "@/components/ui/typography";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Banner: Header Skeleton ── */}
      <div className="rounded-3xl bg-primary/95 border border-primary/20 px-6 py-8 md:px-8 md:py-10 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-hover to-primary pointer-events-none opacity-40 animate-pulse" />
        <div className="relative z-10 space-y-3">
          <div className="h-4 w-28 rounded-full bg-white/20 animate-pulse" />
          <div className="h-8 w-64 rounded-full bg-white/20 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* ── Stats Grid Skeleton ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-card border border-border px-5 py-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-8 w-8 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-7 w-16 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* ── Menu/Content Section Skeleton ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-primary block" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-xl bg-card border border-border px-5 py-6"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <Typography variant="caption" align="center" color="muted" className="block mt-8">
        Memuat dashboard…
      </Typography>
    </div>
  );
}
