// ============================================================
// FILE: src/app/(main)/page.tsx
// PERUBAHAN:
//   - Hapus const features[] — dipindah ke feature-card.tsx
//   - Hapus import lucide icons untuk features
//   - Ganti <FeatureCard> loop → <FeaturesGrid />
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
import { getHomepageCategories, getHomepageFeaturedCategories, getHomepageNewArrivals } from "./lib";
import { CategoryCarousel } from "@/components/category-carousel";
import { CategorySection } from "@/components/category-section";
import { BottomNav } from "@/components/bottom-nav";
import { Typography } from "@/components/ui/typography";

export const revalidate = 60;

type HomePageProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount_price: number | null;
  thumbnail_url: string | null;
  sku: string | null;
  tags: string[] | null;
  demo_link: string | null;
  categories: { name: string }[] | null;
  product_demo_links: {
    id: string;
    label: string;
    url: string;
    image_url: string | null;
    sort_order: number;
  }[];
  product_images: {
    image_url: string;
    sort_order: number;
  }[];
};

export default async function HomePage() {
  const [
    allCategoriesRaw,
    featuredCategoriesRaw,
    newArrivalsRaw,
  ] = await Promise.all([
    getHomepageCategories(),
    getHomepageFeaturedCategories(),
    getHomepageNewArrivals(),
  ]);
  const carouselCategories =
    allCategoriesRaw?.map((cat) => ({
      ...cat,
      productCount: (cat.products as unknown as { count: number }[])?.[0]?.count || 0,
    })) || [];

  const categoriesWithProducts =
    featuredCategoriesRaw
      ?.map((cat) => ({
        ...cat,
        products: (cat.products ?? []) as HomePageProduct[],
      }))
      .filter((cat) => cat.products.length > 0) || [];

  const newArrivals =
    newArrivalsRaw?.filter((product: HomePageProduct) =>
      Array.isArray(product.tags) &&
      product.tags.some((tag) => tag.trim().toLowerCase() === "new"),
    ).slice(0, 8) || [];

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
              products={category.products}
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
