"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FolderOpen, Search, X, ListFilter, RotateCcw } from "lucide-react";
import { useFilterDrawer } from "@/context/filter-drawer-context";

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
      className={`flex-shrink-0 inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[9px] font-bold tabular-nums leading-none transition-colors
        ${active ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-muted-foreground"}`}
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
    <div className="relative mx-1">
      <div className="relative h-1.5 my-5">
        <div className="absolute inset-0 rounded-full bg-secondary" />
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <div
          className="absolute top-1/2 w-4 h-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-background border-2 border-primary shadow-sm pointer-events-none"
          style={{ left: `${minPct}%`, zIndex: 2 }}
        />
        <div
          className="absolute top-1/2 w-4 h-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-background border-2 border-primary shadow-sm pointer-events-none"
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
    <div className="flex flex-col gap-5 p-4">
      {/* CARI PRODUK */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
          Cari Produk
        </p>
        <form onSubmit={handleSearch} className="relative">
          <input
            name="search"
            type="text"
            defaultValue={currentSearch}
            placeholder="Ketik nama produk..."
            className="w-full rounded-none border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </form>
      </div>

      <div className="h-px bg-border" />

      {/* HARGA */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Harga
          </p>
          {activePriceFilter && (
            <button
              onClick={resetPriceFilter}
              aria-label="Reset filter harga"
              title="Reset harga"
              className="w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
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

        <p className="text-xs text-muted-foreground text-center mt-2 mb-3">
          Rp {localPriceMin.toLocaleString("id-ID")}{" "}
          <span className="text-muted-foreground/40">—</span> Rp{" "}
          {localPriceMax.toLocaleString("id-ID")}
        </p>

        <button
          onClick={applyPriceFilter}
          className="w-full rounded-none bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground text-xs font-bold py-2 transition-all"
        >
          Saring
        </button>
      </div>

      <div className="h-px bg-border" />

      {/* KATEGORI */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Kategori
        </p>

        <div className="mb-2">
          <Link
            href={buildCategoryHref(searchParams, null)}
            onClick={close}
            className={`flex flex-row items-center justify-between gap-1.5 w-full rounded-none border px-2.5 py-1.5 text-xs font-medium transition-all
              ${
                !activeSlug
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-muted"
              }`}
          >
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <FolderOpen className="h-3 w-3 flex-shrink-0" />
              Semua
            </span>
            <CountBadge count={totalCount} active={!activeSlug} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {tree.map((node) => (
            <Link
              key={node.id}
              href={buildCategoryHref(searchParams, node.slug)}
              onClick={close}
              className={`flex flex-row items-center justify-between gap-1.5 rounded-none border px-2 py-1.5 text-[11px] font-medium transition-all
                ${
                  activeSlug === node.slug
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-muted"
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

        {tree.some((n) => n.children.length > 0) && (
          <div className="mt-3 space-y-2">
            {tree
              .filter((n) => n.children.length > 0)
              .map((node) => (
                <div key={`children-${node.id}`}>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 pl-1">
                    {node.name}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {node.children.map((child) => (
                      <Link
                        key={child.id}
                        href={buildCategoryHref(searchParams, child.slug)}
                        onClick={close}
                        className={`flex flex-row items-center justify-between gap-1.5 rounded-none border px-2 py-1.5 text-[10px] font-medium transition-all
                          ${
                            activeSlug === child.slug
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-muted"
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
        className={`lg:hidden fixed top-0 left-0 h-full z-50 flex flex-col bg-background border-r border-border transition-transform duration-300 ease-in-out
          w-[90%] max-w-[340px] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        role="dialog"
        aria-label="Filter Produk"
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border flex-shrink-0 bg-muted/30">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
              Filter & Cari
            </h2>
          </div>
          <button
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label="Tutup filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{panelContent}</div>
      </aside>

      {/* ── DESKTOP: sticky sidebar ── */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-20 rounded-none border border-border bg-background overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
            <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
              Filter & Cari
            </h2>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">{panelContent}</div>
        </div>
      </aside>
    </>
  );
}
