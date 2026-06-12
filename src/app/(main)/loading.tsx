export default function MainLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      {/* Centered Premium Loading Spinner */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <div className="space-y-2 text-center mt-2">
          <div className="h-4 w-32 mx-auto rounded bg-muted animate-pulse" />
          <div className="h-3 w-48 mx-auto rounded bg-muted/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
