"use client";

import { useSearchParams } from "next/navigation";

export function ProductsToolbar({ totalCount }: { totalCount: number }) {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  return (
    // Hanya tampil di desktop — mobile count sudah ada di trigger bar CategorySidebar
    <div className="hidden lg:flex items-center mb-5 pb-4 border-b border-border">
      <p className="text-sm text-muted-foreground">
        {currentSearch ? (
          <>
            Hasil untuk &ldquo;
            <span className="font-semibold text-foreground">
              {currentSearch}
            </span>
            &rdquo;:{" "}
            <span className="font-bold text-foreground">{totalCount}</span>{" "}
            produk
          </>
        ) : (
          <>
            <span className="font-bold text-foreground">{totalCount}</span>{" "}
            produk tersedia
          </>
        )}
      </p>
    </div>
  );
}
