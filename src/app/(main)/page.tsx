// ============================================================
// FILE: src/app/(main)/page.tsx
// PERUBAHAN:
//   - Hapus const features[] — dipindah ke feature-card.tsx
//   - Hapus import lucide icons untuk features
//   - Ganti <FeatureCard> loop → <FeaturesGrid />
//   - Semua fetching, data transform, section lain TIDAK DIUBAH
// ============================================================

import { HeroSection } from "@/components/hero-section";
import { FaqSection } from "@/components/faq-section";
import { WarnSection } from "@/components/warn";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductCard } from "@/components/product-card";
import { CategoryCarousel } from "@/components/category-carousel";
import { CategorySection } from "@/components/category-section";
import { BottomNav } from "@/components/bottom-nav";
import { Typography } from "@/components/ui/typography";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // ─── Data Fetching (TIDAK DIUBAH) ─────────────────────────
  const supabase = createAdminClient();

  const [
    { data: allCategoriesRaw },
    { data: featuredCategoriesRaw },
    { data: newArrivals },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, thumbnail_url, products(count)")
      .order("name")
      .limit(8),

    supabase
      .from("categories")
      .select(
        `id, name, slug,
         products (
           id, title, slug, price, discount_price, thumbnail_url, sku, tags, demo_link,
           categories(name),
           product_demo_links(id, label, url, image_url, sort_order),
           product_images(image_url, sort_order)
         )`,
      )
      .not("products", "is", null)
      .limit(4),

    supabase
      .from("products")
      .select(
        "id, title, slug, price, discount_price, thumbnail_url, sku, tags, demo_link, categories(name), product_demo_links(id, label, url, image_url, sort_order), product_images(image_url, sort_order)",
      )
      .eq("is_active", true)
      .contains("tags", ["new"])
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  // ─── Data Transform (TIDAK DIUBAH) ────────────────────────
  const carouselCategories =
    allCategoriesRaw?.map((cat) => ({
      ...cat,
      productCount: cat.products?.[0]?.count || 0,
    })) || [];

  const categoriesWithProducts =
    featuredCategoriesRaw
      ?.map((cat) => ({ ...cat, products: cat.products as any[] }))
      .filter((cat) => cat.products.length > 0) || [];

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 md:pb-20 overflow-x-hidden">
      <div className="flex flex-col gap-12 md:gap-20">
        <HeroSection />
        {/* ============================================================ */}
        {/* END HERO SECTION                                             */}
        {/* ============================================================ */}


        {/* ============================================================ */}
        {/* CATEGORY CAROUSEL SECTION                                     */}
        {/* ============================================================ */}
        <section className="bg-transparent">
          <div className="mx-auto max-w-6xl px-4 md:px-0">
            <div className="mb-6 md:mb-8 flex items-center gap-3">
              <Typography variant="h3">
                Kategori Populer
              </Typography>
            </div>
            <CategoryCarousel categories={carouselCategories} />
          </div>
        </section>
        {/* ============================================================ */}
        {/* END CATEGORY CAROUSEL SECTION                                 */}
        {/* ============================================================ */}

        {/* ============================================================ */}
        {/* NEW ARRIVALS SECTION                                          */}
        {/* ============================================================ */}
        <CategorySection
          category={{ id: "new-arrivals", name: "Baru Rilis", slug: "baru-rilis" }}
          products={newArrivals || []}
        />
        {/* ============================================================ */}
        {/* END NEW ARRIVALS SECTION                                      */}
        {/* ============================================================ */}

        {/* ============================================================ */}
        {/* PRODUCTS BY CATEGORY SECTION                                  */}
        {/* ============================================================ */}
        <div className="flex flex-col gap-8 md:gap-12">
          {categoriesWithProducts.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              products={category.products as any[]}
            />
          ))}
        </div>
        {/* ============================================================ */}
        {/* END PRODUCTS BY CATEGORY SECTION                              */}
        {/* ============================================================ */}
      </div>

      {/* ============================================================ */}
      {/* FAQ SECTION                                                    */}
      {/* ============================================================ */}
      <WarnSection />
      <FaqSection />
      {/* ============================================================ */}
      {/* END FAQ SECTION                                               */}
      {/* ============================================================ */}

      {/* BottomNav — navigasi mobile (TIDAK DIUBAH) */}
      <BottomNav />
    </main>
  );
}
