"use client";

import { useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";

export function ProductsToolbar({ totalCount }: { totalCount: number }) {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  return (
    // Hanya tampil di desktop (md ke atas), diselaraskan ke bentuk kapsul elegan
    <div className="hidden md:flex items-center mb-6">
      <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-card/60 backdrop-blur-sm border border-border/50 rounded-full">
        {/* Ikon Aksen */}
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10">
          <MagnifyingGlassIcon className="w-3.5 h-3.5 text-primary" />
        </div>

        <Typography variant="body-sm" color="muted" as="p" className="font-medium">
          {currentSearch ? (
            <>
              Hasil pencarian &ldquo;
              <Typography variant="body-sm" as="span" className="font-bold">{currentSearch}</Typography>
              &rdquo; <span className="text-muted-foreground/50 mx-1">•</span>
              Ditemukan{" "}
              <Typography variant="body-sm" as="span" color="primary" className="font-bold">{totalCount}</Typography>{" "}
              produk
            </>
          ) : (
            <>
              Menampilkan{" "}
              <Typography variant="body-sm" as="span" color="primary" className="font-bold">{totalCount}</Typography>{" "}
              produk unggulan
            </>
          )}
        </Typography>
      </div>
    </div>
  );
}
