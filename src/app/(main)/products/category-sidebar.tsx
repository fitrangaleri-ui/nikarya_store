"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FolderOpen, Search, X, ListFilter, RotateCcw } from "lucide-react";
import { useFilterDrawer } from "@/context/filter-drawer-context";
import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  thumbnail_url: string | null;
};

type CategoryNode = Category & { children: CategoryNode[] };

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

function CountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={`flex-shrink-0 inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded-full text-[9px] font-bold tabular-nums leading-none transition-all
        ${
          active
            ? "bg-primary text-primary-foreground shadow-sm"
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
  const range = globalMax - globalMin || 1;
  const step = 5000;
  const minPct = ((valueMin - globalMin) / range) * 100;
  const maxPct = ((valueMax - globalMin) / range) * 100;

  return (
    <div className="relative mx-1.5">
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
          className="absolute top-1/2 w-5 h-5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-card border-2 border-primary shadow-md pointer-events-none transition-transform hover:scale-110"
          style={{ left: `${minPct}%`, zIndex: 2 }}
        />
        {/* Thumb Max */}
        <div
          className="absolute top-1/2 w-5 h-5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-card border-2 border-primary shadow-md pointer-events-none transition-transform hover:scale-110"
          style={{ left: `${maxPct}%`, zIndex: 2 }}
        />
        <input
          type="range"
          min={globalMin}
          max={globalMax}
          step={step}
          value={valueMin}
          onChange={(e) =>
            onChangeMin(Math.min(+e.target.value, valueMax - step))
          }
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minPct >= maxPct - 5 ? 5 : 3 }}
        />
        <input
          type="range"
          min={globalMin}
          max={globalMax}
          step={step}
          value={valueMax}
          onChange={(e) =>
            onChangeMax(Math.max(+e.target.value, valueMin + step))
          }
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
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
  const { isOpen: mobileOpen, close } = useFilterDrawer();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeSlug = searchParams.get("category");
  const currentSearch = searchParams.get("search") || "";
  const activePriceFilter =
    searchParams.has("price_min") || searchParams.has("price_max");

  const [localPriceMin, setLocalPriceMin] = useState(currentPriceMin);
  const [localPriceMax, setLocalPriceMax] = useState(currentPriceMax);

  useEffect(() => {
    setLocalPriceMin(currentPriceMin);
    setLocalPriceMax(currentPriceMax);
  }, [currentPriceMin, currentPriceMax]);

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

  const panelContent = (
    <div className="flex flex-col gap-6 p-5">
      {/* CARI PRODUK */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Cari Produk
        </p>
        <form onSubmit={handleSearch} className="relative">
          <input
            name="search"
            type="text"
            defaultValue={currentSearch}
            placeholder="Ketik nama produk..."
            className="w-full rounded-2xl border border-border/50 bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
        </form>
      </div>

      <div className="h-px w-full bg-border/40" />

      {/* HARGA */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Rentang Harga
          </p>
          {activePriceFilter && (
            <button
              onClick={resetPriceFilter}
              aria-label="Reset filter harga"
              title="Reset harga"
              className="w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
            >
              <RotateCcw className="h-3 w-3" />
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

        <div className="flex items-center justify-between mt-3 mb-4">
          <div className="bg-muted/40 border border-border/50 rounded-xl px-2.5 py-1 text-xs font-semibold text-foreground">
            Rp {localPriceMin.toLocaleString("id-ID")}
          </div>
          <span className="text-muted-foreground/40">—</span>
          <div className="bg-muted/40 border border-border/50 rounded-xl px-2.5 py-1 text-xs font-semibold text-foreground">
            Rp {localPriceMax.toLocaleString("id-ID")}
          </div>
        </div>

        <Button
          onClick={applyPriceFilter}
          variant="brand"
          size="sm"
          className="w-full rounded-full h-10 shadow-sm"
        >
          Terapkan Harga
        </Button>
      </div>

      <div className="h-px w-full bg-border/40" />

      {/* KATEGORI */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Kategori Desain
        </p>

        <div className="mb-2.5">
          <Link
            href={buildCategoryHref(searchParams, null)}
            onClick={close}
            className={`flex flex-row items-center justify-between gap-2 w-full rounded-2xl border px-3 py-2 text-xs font-semibold transition-all shadow-sm
              ${
                !activeSlug
                  ? "border-primary/30 bg-primary/10 text-primary shadow-primary/5"
                  : "border-border/40 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
              }`}
          >
            <span className="flex items-center gap-2 min-w-0 truncate">
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
              Semua Produk
            </span>
            <CountBadge count={totalCount} active={!activeSlug} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {tree.map((node) => (
            <Link
              key={node.id}
              href={buildCategoryHref(searchParams, node.slug)}
              onClick={close}
              className={`flex flex-row items-center justify-between gap-1.5 rounded-2xl border px-3 py-2 text-[11px] font-semibold transition-all shadow-sm
                ${
                  activeSlug === node.slug
                    ? "border-primary/30 bg-primary/10 text-primary shadow-primary/5"
                    : "border-border/40 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                }`}
            >
              <span className="truncate leading-tight min-w-0">
                {node.name}
              </span>
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
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1 flex items-center gap-1.5">
                    <span className="w-1 h-3 bg-primary/60 rounded-full inline-block"></span>
                    {node.name}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {node.children.map((child) => (
                      <Link
                        key={child.id}
                        href={buildCategoryHref(searchParams, child.slug)}
                        onClick={close}
                        className={`flex flex-row items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-medium transition-all shadow-sm
                          ${
                            activeSlug === child.slug
                              ? "border-primary/30 bg-primary/10 text-primary shadow-primary/5"
                              : "border-border/40 bg-background/30 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                          }`}
                      >
                        <span className="truncate leading-tight min-w-0">
                          {child.name}
                        </span>
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
      {/* ── MOBILE: overlay ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── MOBILE: drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full z-50 flex flex-col bg-background/95 backdrop-blur-2xl border-r border-border/50 shadow-2xl transition-transform duration-300 ease-out
          w-[85%] max-w-[340px] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        role="dialog"
        aria-label="Filter Produk"
      >
        {/* Aksen Blur Mobile Drawer */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/30 backdrop-blur-md relative z-10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ListFilter className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
              Filter & Cari
            </h2>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
            aria-label="Tutup filter"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {panelContent}
        </div>
      </aside>

      {/* ── DESKTOP: sticky sidebar ── */}
      <aside className="hidden lg:block w-64 flex-shrink-0 relative">
        {/* Aksen Pendaran Halus di Belakang Sidebar */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

        <div className="sticky top-24 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-xl shadow-primary/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 bg-muted/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <ListFilter className="h-3.5 w-3.5 text-primary" />
            </div>
            <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
              Saring Produk
            </h2>
          </div>
          <div className="max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pb-4">
            {panelContent}
          </div>
        </div>
      </aside>
    </>
  );
}
