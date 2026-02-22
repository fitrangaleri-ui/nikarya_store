"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildPageHref(searchParams, currentPage - 1)}
          className="flex items-center justify-center h-9 w-9 rounded-none border border-border bg-background text-muted-foreground hover:bg-muted hover:border-primary/50 hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center h-9 w-9 rounded-none border border-border/50 bg-muted/30 text-muted-foreground/40 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Pages */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="flex items-center justify-center h-9 w-6 text-sm text-muted-foreground/60"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageHref(searchParams, p as number)}
            className={`
              flex items-center justify-center h-9 min-w-[36px] px-2 rounded-none text-sm font-medium transition-colors
              ${
                p === currentPage
                  ? "bg-primary text-primary-foreground border border-primary"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted hover:border-primary/50 hover:text-primary"
              }
            `}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageHref(searchParams, currentPage + 1)}
          className="flex items-center justify-center h-9 w-9 rounded-none border border-border bg-background text-muted-foreground hover:bg-muted hover:border-primary/50 hover:text-primary transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center h-9 w-9 rounded-none border border-border/50 bg-muted/30 text-muted-foreground/40 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
