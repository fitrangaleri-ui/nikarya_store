"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FolderOpenIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { FolderOpenIcon as FolderOpenSolidIcon } from "@heroicons/react/24/solid";
import { useFilterDrawer } from "@/context/filter-drawer-context";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  thumbnail_url: string | null;
};

type CategoryNode = Category & { children: CategoryNode[] };
type PriceState = {
  syncedPriceMin: number;
  syncedPriceMax: number;
  localPriceMin: number;
  localPriceMax: number;
};

function buildTree(categories: Category[]): CategoryNode[] {
  const parents = categories.filter((c) => !c.parent_id);
  const childMap = new Map<string, Category[]>();
  categories
    .filter((c) => c.parent_id)
    .forEach((c) => {
      const list = childMap.get(c.parent_id!) || [];
      list.push(c);
      childMap.set(c.parent_id!, list);
    });
  return parents.map((p) => ({
    ...p,
    children: (childMap.get(p.id) || []).map((c) => ({ ...c, children: [] })),
  }));
}

function buildCategoryHref(
  currentParams: URLSearchParams,
  categorySlug: string | null,
): string {
  const params = new URLSearchParams(currentParams.toString());
  if (categorySlug) {
    params.set("category", categorySlug);
  } else {
    params.delete("category");
  }
  params.delete("page");
  const qs = params.toString();
  return `/products${qs ? `?${qs}` : ""}`;
}

function buildToggleCategoryHref(
  currentParams: URLSearchParams,
  categorySlug: string,
): string {
  const activeSlug = currentParams.get("category");

  return buildCategoryHref(
    currentParams,
    activeSlug === categorySlug ? null : categorySlug,
  );
}

function CountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={`flex-shrink-0 inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono tabular-nums leading-none transition-all shadow-none
        ${active
          ? "bg-primary text-primary-foreground"
          : "bg-background/80 border border-border/60 text-muted-foreground"
        }`}
    >
      {count}
    </span>
  );
}

function PriceRangeSlider({
  globalMin,
  globalMax,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: {
  globalMin: number;
  globalMax: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const [activeSide, setActiveSide] = useState<"min" | "max">("min");
  const range = globalMax - globalMin || 1;
  const step = 1000;
  const minPct = ((valueMin - globalMin) / range) * 100;
  const maxPct = ((valueMax - globalMin) / range) * 100;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    // Jika kursor di kiri 50%, prioritaskan input minimal
    setActiveSide(pct < 0.5 ? "min" : "max");
  };

  return (
    <div className="relative mx-3" onMouseMove={handleMouseMove}>
      <div className="relative h-2 my-6">
        {/* Background Track */}
        <div className="absolute inset-0 rounded-full bg-secondary/50 border border-border/20" />
        {/* Active Track */}
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        {/* Thumb Min */}
        <div
          className="absolute top-1/2 w-5 h-5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-card border-2 border-primary pointer-events-none transition-transform hover:scale-110"
          style={{ left: `${minPct}%`, zIndex: activeSide === "min" ? 5 : 3 }}
        />
        {/* Thumb Max */}
        <div
          className="absolute top-1/2 w-5 h-5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-card border-2 border-primary pointer-events-none transition-transform hover:scale-110"
          style={{ left: `${maxPct}%`, zIndex: activeSide === "max" ? 5 : 3 }}
        />
        <input
          type="range"
          min={globalMin}
          max={globalMax}
          step={step}
          value={valueMin}
          onChange={(e) => {
            const val = Math.min(+e.target.value, valueMax - step);
            onChangeMin(val);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: activeSide === "min" ? 5 : 3 }}
        />
        <input
          type="range"
          min={globalMin}
          max={globalMax}
          step={step}
          value={valueMax}
          onChange={(e) => {
            const val = Math.max(+e.target.value, valueMin + step);
            onChangeMax(val);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: activeSide === "max" ? 5 : 3 }}
        />
      </div>
    </div>
  );
}

export function CategorySidebar({
  categories,
  totalCount,
  globalMin,
  globalMax,
  currentPriceMin,
  currentPriceMax,
  categoryCounts,
}: {
  categories: Category[];
  totalCount: number;
  globalMin: number;
  globalMax: number;
  currentPriceMin: number;
  currentPriceMax: number;
  categoryCounts: Record<string, number>;
}) {
  const { isOpen: mobileOpen, open, close } = useFilterDrawer();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeSlug = searchParams.get("category");
  const currentSearch = searchParams.get("search") || "";
  const activePriceFilter =
    searchParams.has("price_min") || searchParams.has("price_max");

  const [priceState, setPriceState] = useState<PriceState>({
    syncedPriceMin: currentPriceMin,
    syncedPriceMax: currentPriceMax,
    localPriceMin: currentPriceMin,
    localPriceMax: currentPriceMax,
  });

  if (
    priceState.syncedPriceMin !== currentPriceMin ||
    priceState.syncedPriceMax !== currentPriceMax
  ) {
    setPriceState({
      syncedPriceMin: currentPriceMin,
      syncedPriceMax: currentPriceMax,
      localPriceMin: currentPriceMin,
      localPriceMax: currentPriceMax,
    });
  }

  const { localPriceMin, localPriceMax } = priceState;
  const setLocalPriceMin = (value: number) => {
    setPriceState((current) => ({ ...current, localPriceMin: value }));
  };
  const setLocalPriceMax = (value: number) => {
    setPriceState((current) => ({ ...current, localPriceMax: value }));
  };

  // ── Swipe to close logic ──
  const touchStart = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const touchCurrent = e.touches[0].clientX;
    const deltaX = touchStart.current - touchCurrent;

    // Jika geser ke kiri (kembali ke sisi asal) lebih dari 70px, maka tutup
    if (deltaX > 70) {
      close();
      touchStart.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStart.current = null;
  };

  const tree = buildTree(categories);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const search =
      (new FormData(e.currentTarget).get("search") as string)?.trim() || "";
    updateParam("search", search);
    close();
  }

  function applyPriceFilter() {
    const params = new URLSearchParams(searchParams.toString());
    if (localPriceMin > globalMin) {
      params.set("price_min", String(localPriceMin));
    } else {
      params.delete("price_min");
    }
    if (localPriceMax < globalMax) {
      params.set("price_max", String(localPriceMax));
    } else {
      params.delete("price_max");
    }
    params.delete("page");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    close();
  }

  function resetPriceFilter() {
    setLocalPriceMin(globalMin);
    setLocalPriceMax(globalMax);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("price_min");
    params.delete("price_max");
    params.delete("page");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      open();
    } else {
      close();
    }
  }

  const panelContent = (
    <div className="flex flex-col gap-6 p-5">
      {/* CARI PRODUK */}
      <div>
        <Typography variant="caption" className="font-bold uppercase tracking-tight mb-3" color="muted">
          Cari Produk
        </Typography>
        <form onSubmit={handleSearch} className="relative group">
          <Input
            name="search"
            type="search"
            defaultValue={currentSearch}
            placeholder="Ketik nama produk..."
            className="h-11 w-full rounded-2xl border-border/50 bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:ring-1 focus:ring-primary hover:bg-muted/40 transition-all shadow-none outline-none"
          />
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-hover:text-primary/70 transition-colors" />
        </form>
      </div>

      <div className="h-px w-full bg-border/40" />

      {/* HARGA */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Typography variant="caption" className="font-bold uppercase tracking-tight" color="muted">
            Rentang Harga
          </Typography>
          {activePriceFilter && (
            <button
              onClick={resetPriceFilter}
              aria-label="Reset filter harga"
              title="Reset harga"
              className="w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95 shadow-none"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <PriceRangeSlider
          globalMin={globalMin}
          globalMax={globalMax}
          valueMin={localPriceMin}
          valueMax={localPriceMax}
          onChangeMin={setLocalPriceMin}
          onChangeMax={setLocalPriceMax}
        />

        <div className="flex items-center justify-between gap-2 mt-3 mb-4">
          <div className="relative flex-1 min-w-0 group">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Rp</span>
            <Input
              type="number"
              value={localPriceMin}
              onChange={(e) => setLocalPriceMin(Number(e.target.value))}
              className="h-9 w-full pl-7 pr-1 rounded-xl border-border/50 bg-muted/20 text-[10px] md:text-[11px] font-mono font-bold focus:bg-background focus:ring-1 focus:ring-primary shadow-none border-none"
            />
          </div>
          <span className="text-muted-foreground/40 shrink-0 text-xs">—</span>
          <div className="relative flex-1 min-w-0 group">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Rp</span>
            <Input
              type="number"
              value={localPriceMax}
              onChange={(e) => setLocalPriceMax(Number(e.target.value))}
              className="h-9 w-full pl-7 pr-1 rounded-xl border-border/50 bg-muted/20 text-[10px] md:text-[11px] font-mono font-bold focus:bg-background focus:ring-1 focus:ring-primary shadow-none border-none"
            />
          </div>
        </div>

        <Button
          onClick={applyPriceFilter}
          variant="brand"
          size="sm"
          className="w-full rounded-full h-10 shadow-none"
        >
          Terapkan Harga
        </Button>
      </div>

      <div className="h-px w-full bg-border/40" />

      {/* KATEGORI */}
      <div>
        <Typography variant="caption" className="font-bold uppercase tracking-tight mb-3" color="muted">
          Kategori Desain
        </Typography>

        <div className="mb-2.5">
          <Link
            href={buildCategoryHref(searchParams, null)}
            onClick={close}
            className={`flex flex-row items-center justify-between gap-2 w-full rounded-2xl border px-3 py-2 transition-all shadow-none
              ${!activeSlug
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/40 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
              }`}
          >
            <span className="flex items-center gap-2 min-w-0 truncate">
              {!activeSlug ? <FolderOpenSolidIcon className="h-4 w-4 flex-shrink-0" /> : <FolderOpenIcon className="h-4 w-4 flex-shrink-0" />}
              <Typography variant="body-sm" as="span" className="font-semibold truncate">
                Semua Produk
              </Typography>
            </span>
            <CountBadge count={totalCount} active={!activeSlug} />
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {tree.map((node) => (
            <Link
              key={node.id}
              href={buildToggleCategoryHref(searchParams, node.slug)}
              onClick={close}
              className={`flex flex-row items-center justify-between gap-1.5 rounded-2xl border px-3 py-2 transition-all shadow-none
                ${activeSlug === node.slug
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/40 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                }`}
            >
              <Typography variant="caption" as="span" className="font-semibold truncate leading-tight min-w-0">
                {node.name}
              </Typography>
              {categoryCounts[node.id] !== undefined && (
                <CountBadge
                  count={categoryCounts[node.id]}
                  active={activeSlug === node.slug}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Sub-Kategori */}
        {tree.some((n) => n.children.length > 0) && (
          <div className="mt-5 space-y-3">
            {tree
              .filter((n) => n.children.length > 0)
              .map((node) => (
                <div key={`children-${node.id}`}>
                  <Typography variant="caption" as="p" className="font-bold uppercase tracking-tight mb-2 pl-1 flex items-center gap-1.5" color="muted">
                    <span className="w-1 h-3 bg-primary/60 rounded-full inline-block"></span>
                    {node.name}
                  </Typography>
                  <div className="flex flex-col gap-2">
                    {node.children.map((child) => (
                      <Link
                        key={child.id}
                        href={buildToggleCategoryHref(searchParams, child.slug)}
                        onClick={close}
                        className={`flex flex-row items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5 transition-all shadow-none
                          ${activeSlug === child.slug
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border/40 bg-background/30 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                          }`}
                      >
                        <Typography variant="caption" as="span" className="font-medium truncate leading-tight min-w-0">
                          {child.name}
                        </Typography>
                        {categoryCounts[child.id] !== undefined && (
                          <CountBadge
                            count={categoryCounts[child.id]}
                            active={activeSlug === child.slug}
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="left"
          hideClose
          onOpenAutoFocus={(e) => e.preventDefault()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="lg:hidden flex flex-col h-full p-0 border-r border-border/40 bg-background/95 backdrop-blur-2xl w-[85%] max-w-[340px] overflow-hidden shadow-none"
        >
          {/* Aksen Blur Mobile Drawer */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

          <SheetHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-border/40 bg-card/30 backdrop-blur-md relative z-10 flex-shrink-0 space-y-0 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-primary" />
              </div>
              <SheetTitle asChild>
                <Typography variant="h6" as="h2" className="font-semibold uppercase">
                  Filter & Cari
                </Typography>
              </SheetTitle>
            </div>

          </SheetHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            {panelContent}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── DESKTOP: sticky sidebar ── */}
      <aside className="hidden lg:block w-64 flex-shrink-0 relative">
        {/* Aksen Pendaran Halus di Belakang Sidebar */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

        <div className="sticky top-24 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 bg-muted/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <AdjustmentsHorizontalIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <Typography variant="body-sm" as="h2" className="font-bold uppercase tracking-tight">
              Saring Produk
            </Typography>
          </div>
          <div className="max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pb-4">
            {panelContent}
          </div>
        </div>
      </aside>
    </>
  );
}

