import { Typography } from "@/components/ui/typography";

export default function LoadingOrders() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="rounded-2xl bg-primary/90 px-6 py-8 md:px-8 md:py-10">
        <div className="h-4 w-32 rounded-full bg-white/20 animate-pulse mb-3" />
        <div className="h-7 w-56 rounded-full bg-white/20 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded-full bg-white/10 animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <Typography variant="caption" align="center" color="muted" className="block">
        Memuat riwayat pesanan…
      </Typography>
    </div>
  );
}
