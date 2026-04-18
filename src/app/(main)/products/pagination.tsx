"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";

function buildPageHref(params: URLSearchParams, page: number): string {
  const newParams = new URLSearchParams(params.toString());
  if (page <= 1) {
    newParams.delete("page");
  } else {
    newParams.set("page", String(page));
  }
  const qs = newParams.toString();
  return `/products${qs ? `?${qs}` : ""}`;
}

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      className="mt-12 mb-6 flex items-center justify-center gap-2"
      aria-label="Navigasi Halaman"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildPageHref(searchParams, currentPage - 1)}
          className="flex items-center justify-center h-10 w-10 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all active:scale-95"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center h-10 w-10 rounded-full border border-border/30 bg-muted/20 text-muted-foreground/30 cursor-not-allowed">
          <ChevronLeftIcon className="h-4 w-4" />
        </span>
      )}

      {/* Pages Container (Liquid Pill) */}
      <div className="flex items-center gap-1 bg-card/40 backdrop-blur-md border border-border/50 rounded-full px-2 py-1">
        {pages.map((p, i) =>
          p === "..." ? (
            <Typography
              key={`dots-${i}`}
              variant="body-sm"
              as="span"
              color="muted"
              className="flex items-center justify-center h-8 w-8 select-none opacity-50"
            >
              …
            </Typography>
          ) : (
            <Link
              key={p}
              href={buildPageHref(searchParams, p as number)}
              className={`
                flex items-center justify-center h-8 min-w-[32px] px-1 rounded-full text-sm font-bold transition-all
                ${
                  p === currentPage
                    ? "bg-primary text-primary-foreground pointer-events-none"
                    : "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-95"
                }
              `}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageHref(searchParams, currentPage + 1)}
          className="flex items-center justify-center h-10 w-10 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all active:scale-95"
          aria-label="Halaman selanjutnya"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center h-10 w-10 rounded-full border border-border/30 bg-muted/20 text-muted-foreground/30 cursor-not-allowed">
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
