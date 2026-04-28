import { Typography } from "@/components/ui/typography";

export default function LoadingDownload() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Back link skeleton */}
      <div className="h-4 w-40 rounded bg-muted animate-pulse" />

      {/* Hero skeleton */}
      <div className="w-full aspect-[2/1] rounded-3xl bg-muted/30 animate-pulse border border-border/40" />

      {/* Content card skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 pt-6 pb-5 border-b border-border/40 space-y-3">
          <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-3 w-36 rounded bg-muted animate-pulse" />
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
          </div>
          <div className="h-24 rounded-2xl bg-muted/20 animate-pulse" />
          <div className="h-10 rounded-full bg-muted animate-pulse" />
        </div>
      </div>

      <Typography variant="caption" align="center" color="muted" className="block">
        Memuat halaman download…
      </Typography>
    </div>
  );
}
