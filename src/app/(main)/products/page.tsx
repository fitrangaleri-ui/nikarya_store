import { Suspense } from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ShoppingBag, Home, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { CategorySidebar } from "./category-sidebar";
import { ProductsToolbar } from "./products-toolbar";
import { MobileSortDropdown } from "./mobile-sort-dropdown";
import { Pagination } from "./pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
    price_min?: string;
    price_max?: string;
  }>;
}) {
  const { category, search, sort, page, price_min, price_max } =
    await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const supabase = createAdminClient();

  const [
    { data: categories },
    { data: minPriceArr },
    { data: maxPriceArr },
    { data: allProductsForCount },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, thumbnail_url")
      .order("name"),
    supabase
      .from("products")
      .select("price")
      .eq("is_active", true)
      .order("price", { ascending: true })
      .limit(1),
    supabase
      .from("products")
      .select("price")
      .eq("is_active", true)
      .order("price", { ascending: false })
      .limit(1),
    supabase.from("products").select("category_id").eq("is_active", true),
  ]);

  const globalMin = Math.floor((minPriceArr?.[0]?.price || 0) / 1000) * 1000;
  const globalMax =
    Math.ceil((maxPriceArr?.[0]?.price || 1000000) / 1000) * 1000;

  const categoryCounts: Record<string, number> = {};
  allProductsForCount?.forEach((p) => {
    if (p.category_id) {
      categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
    }
  });
  categories
    ?.filter((c) => c.parent_id)
    .forEach((child) => {
      if (child.parent_id && categoryCounts[child.id]) {
        categoryCounts[child.parent_id] =
          (categoryCounts[child.parent_id] || 0) + categoryCounts[child.id];
      }
    });

  const priceMinParam = price_min ? Number(price_min) : null;
  const priceMaxParam = price_max ? Number(price_max) : null;
  const currentPriceMin = priceMinParam ?? globalMin;
  const currentPriceMax = priceMaxParam ?? globalMax;

  const activeCategory = category
    ? (categories?.find((c) => c.slug === category) ?? null)
    : null;

  let query = supabase
    .from("products")
    .select(
      "id, title, slug, price, discount_price, thumbnail_url, sku, tags, demo_link, category_id, categories(name, slug)",
      { count: "exact" },
    )
    .eq("is_active", true);

  if (category) {
    const cat = categories?.find((c) => c.slug === category);
    if (cat) {
      const allCatIds = [cat.id];
      categories
        ?.filter((c) => c.parent_id === cat.id)
        .forEach((c) => allCatIds.push(c.id));
      query = query.in("category_id", allCatIds);
    }
  }

  if (search && search.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  if (priceMinParam !== null) query = query.gte("price", priceMinParam);
  if (priceMaxParam !== null) query = query.lte("price", priceMaxParam);

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (currentPage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  query = query.range(from, to);

  const { data: products, count } = await query;
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 md:pb-20 overflow-x-hidden">
      {/* Mengembalikan padding atas global agar tidak mepet */}
      <div className="flex flex-col gap-6 md:gap-8 pt-6 md:pt-10">
        {/* ── BREADCRUMB ── */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <nav className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground bg-card/40 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2.5 w-fit shadow-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            {activeCategory ? (
              <>
                <Link
                  href="/products"
                  className="hover:text-primary transition-colors"
                >
                  Produk
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="text-foreground font-semibold line-clamp-1 max-w-[150px] md:max-w-[200px]">
                  {activeCategory.name}
                </span>
              </>
            ) : (
              <span className="text-foreground font-semibold">Produk</span>
            )}
          </nav>
        </div>

        {/* ── HEADER ── */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 md:h-7 bg-primary rounded-full block" />
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {activeCategory ? activeCategory.name : "Semua Produk"}
            </h1>
          </div>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            {activeCategory
              ? `Menampilkan koleksi terbaik untuk kategori ${activeCategory.name}.`
              : "Temukan desain undangan website terbaik untuk momen spesial Anda."}
          </p>
        </div>

        {/* ── LAYOUT: Sidebar + Products ── */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <Suspense
              fallback={
                <div className="hidden lg:block w-64 h-64 animate-pulse bg-muted rounded-2xl border border-border/50" />
              }
            >
              <CategorySidebar
                categories={categories || []}
                totalCount={totalCount}
                globalMin={globalMin}
                globalMax={globalMax}
                currentPriceMin={currentPriceMin}
                currentPriceMax={currentPriceMax}
                categoryCounts={categoryCounts}
              />
            </Suspense>

            <div className="flex-1 min-w-0">
              {/* Desktop: toolbar */}
              <div className="hidden md:block">
                <Suspense fallback={null}>
                  <ProductsToolbar totalCount={totalCount} />
                </Suspense>
              </div>

              {/* Mobile: sort dropdown */}
              <Suspense fallback={null}>
                <MobileSortDropdown />
              </Suspense>

              {products && products.length > 0 ? (
                /* Grid Produk */
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-4 md:mt-0">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                /* Empty State (Liquid Glass) */
                <div className="py-20 mt-4 text-center border border-dashed border-border/50 rounded-3xl bg-card/30 backdrop-blur-sm">
                  <div className="w-16 h-16 mx-auto bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-primary/60" />
                  </div>
                  <p className="font-bold text-foreground text-lg tracking-tight">
                    {search
                      ? `Tidak ditemukan produk untuk "${search}"`
                      : "Belum ada produk tersedia."}
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {search
                      ? "Coba kata kunci lain atau reset filter pencarian."
                      : "Produk baru akan segera hadir untuk Anda."}
                  </p>
                </div>
              )}

              <Suspense fallback={null}>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
