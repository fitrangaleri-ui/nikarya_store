"use client";

import { useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";

export function ProductsToolbar({ totalCount }: { totalCount: number }) {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  return (
    // Hanya tampil di desktop (md ke atas), diselaraskan ke bentuk kapsul elegan
    <div className="hidden md:flex items-center mb-6">
      <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-card/60 backdrop-blur-sm border border-border/50 rounded-full shadow-sm">
        {/* Ikon Aksen */}
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10">
          <PackageSearch className="w-3.5 h-3.5 text-primary" />
        </div>

        <p className="text-sm text-muted-foreground font-medium">
          {currentSearch ? (
            <>
              Hasil pencarian &ldquo;
              <span className="font-bold text-foreground">{currentSearch}</span>
              &rdquo; <span className="text-muted-foreground/50 mx-1">•</span>
              Ditemukan{" "}
              <span className="font-bold text-primary">{totalCount}</span>{" "}
              produk
            </>
          ) : (
            <>
              Menampilkan{" "}
              <span className="font-bold text-primary">{totalCount}</span>{" "}
              produk unggulan
            </>
          )}
        </p>
      </div>
    </div>
  );
}
