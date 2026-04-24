import { Suspense } from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ShoppingBagIcon,
  HomeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { ProductCard } from "@/components/product-card";
import { CategorySidebar } from "./category-sidebar";
import { ProductsToolbar } from "./products-toolbar";
import { MobileSortDropdown } from "./mobile-sort-dropdown";
import { Pagination } from "./pagination";
import { Typography } from "@/components/ui/typography";


export const dynamic = "force-dynamic";

const PER_PAGE = 12;

function buildEffectivePriceFilter(
  priceMin: number | null,
  priceMax: number | null,
) {
  const discountedPriceFilters = ["discount_price.not.is.null"];
  const regularPriceFilters = ["discount_price.is.null"];

  if (priceMin !== null) {
    discountedPriceFilters.push(`discount_price.gte.${priceMin}`);
    regularPriceFilters.push(`price.gte.${priceMin}`);
  }

  if (priceMax !== null) {
    discountedPriceFilters.push(`discount_price.lte.${priceMax}`);
    regularPriceFilters.push(`price.lte.${priceMax}`);
  }

  return [
    `and(${discountedPriceFilters.join(",")})`,
    `and(${regularPriceFilters.join(",")})`,
  ].join(",");
}

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
      .order("price", { ascending: false })
      .limit(1),
    supabase.from("products").select("category_id").eq("is_active", true),
  ]);

  const globalMin = 0;
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
      "id, title, slug, price, discount_price, thumbnail_url, sku, tags, demo_link, category_id, categories(name, slug), product_demo_links(id, label, url, image_url, sort_order), product_images(image_url, sort_order)",
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

  if (priceMinParam !== null || priceMaxParam !== null) {
    query = query.or(buildEffectivePriceFilter(priceMinParam, priceMaxParam));
  }

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
    <main className="min-h-screen mb-20 bg-background text-foreground pb-24 md:pb-20 overflow-x-hidden">
      {/* Mengembalikan padding atas global agar tidak mepet */}
      <div className="flex flex-col gap-4 md:gap-6 pt-4 md:pt-12">
        {/* ... breadcrumb ... */}
        {/* ... header ... */}
        {/* ... sidebar ... */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <nav className="flex items-center gap-1.5 text-muted-foreground bg-card/40 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2.5 w-fit">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <HomeIcon className="h-4 w-4" />
              <Typography variant="caption" as="span" className="font-medium">Beranda</Typography>
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
            {activeCategory ? (
              <>
                <Link
                  href="/products"
                  className="hover:text-primary transition-colors"
                >
                  <Typography variant="caption" as="span" className="font-medium">Produk</Typography>
                </Link>
                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
                <Typography variant="caption" as="span" className="text-foreground font-semibold line-clamp-1 max-w-[150px] md:max-w-[200px]">
                  {activeCategory.name}
                </Typography>
              </>
            ) : (
              <Typography variant="caption" as="span" className="text-foreground font-semibold">Produk</Typography>
            )}
          </nav>
        </div>

        {/* ── HEADER ── */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Typography variant="h3" as="h1">
              {activeCategory ? activeCategory.name : "Semua Produk"}
            </Typography>
          </div>
          <Typography variant="body-sm" color="muted" className="mt-2">
            {activeCategory
              ? `Menampilkan koleksi terbaik untuk kategori ${activeCategory.name}.`
              : "Temukan desain undangan website terbaik untuk momen spesial Anda."}
          </Typography>
        </div>

        {/* ── LAYOUT: Sidebar + Products ── */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <Suspense
              fallback={
                <div className="hidden lg:block w-64 h-64 animate-pulse bg-muted rounded-xl border border-border/50" />
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-0">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                /* Empty State (Liquid Glass) */
                <div className="py-20 mt-4 text-center border border-dashed border-border/50 rounded-xl bg-card/30 backdrop-blur-sm">
                  <div className="w-16 h-16 mx-auto bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBagIcon className="h-8 w-8 text-primary/60" />
                  </div>
                  <Typography variant="h6" as="p" className="text-center font-bold">
                    {search
                      ? `Tidak ditemukan produk untuk "${search}"`
                      : "Belum ada produk tersedia."}
                  </Typography>
                  <Typography variant="body-sm" color="muted" className="text-center mt-1.5">
                    {search
                      ? "Coba kata kunci lain atau reset filter pencarian."
                      : "Produk baru akan segera hadir untuk Anda."}
                  </Typography>
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


