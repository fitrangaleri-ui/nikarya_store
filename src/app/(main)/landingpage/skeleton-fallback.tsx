import { Skeleton } from "@/components/ui/skeleton";

export function TemplatesAndPricingSkeleton() {
  return (
    <>
      <section className="py-20 md:py-24 bg-transparent border-t border-border/50">
        <div className="container mx-auto px-8 md:px-6">
          <div className="max-w-xl mx-auto text-center mb-12 md:mb-16 space-y-4 flex flex-col items-center">
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-1/2 rounded-xl" />
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-[450px] rounded-3xl p-4 border border-border/50 bg-card/50 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
                <Skeleton className="w-full h-full rounded-2xl" />
                <div className="flex justify-between items-center px-2">
                  <Skeleton className="w-1/2 h-6 rounded-lg" />
                  <Skeleton className="w-1/4 h-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-br from-primary to-secondary-foreground py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 space-y-10">
          <div className="max-w-xl mx-auto text-center space-y-4 flex flex-col items-center">
            <Skeleton className="h-10 w-2/3 bg-white/20 rounded-xl" />
          </div>
          <Skeleton className="w-full max-w-4xl mx-auto h-[550px] rounded-[2rem] bg-white/10 animate-in fade-in zoom-in-95 duration-500" />
        </div>
      </section>
    </>
  );
}
