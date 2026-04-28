import { Typography } from "@/components/ui/typography";

export default function LoadingOrderDetail() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="rounded-2xl bg-primary/90 px-6 py-8 md:px-8 md:py-10">
        <div className="h-4 w-28 rounded-full bg-white/20 animate-pulse mb-3" />
        <div className="h-7 w-48 rounded-full bg-white/20 animate-pulse mb-2" />
        <div className="h-4 w-40 rounded-full bg-white/10 animate-pulse" />
      </div>

      {/* Product card skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-primary/90 px-6 py-4">
          <div className="h-5 w-24 rounded bg-white/20 animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 aspect-square bg-muted/30 animate-pulse" />
          <div className="p-6 flex-1 space-y-4">
            <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-2xl bg-muted/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Price breakdown skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-primary/90 px-6 py-4">
          <div className="h-5 w-32 rounded bg-white/20 animate-pulse" />
        </div>
        <div className="px-6 py-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <Typography variant="caption" align="center" color="muted" className="block">
        Memuat detail pesanan…
      </Typography>
    </div>
  );
}
