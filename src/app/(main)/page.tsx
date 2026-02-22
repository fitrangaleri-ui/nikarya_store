import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { CategoryCarousel } from "@/components/category-carousel";
import { CategorySection } from "@/components/category-section";
import {
  BadgeCheck,
  Zap,
  FilePen,
  Headset,
  Star,
  Sparkles,
  Heart,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

const benefits = [
  { icon: BadgeCheck, title: "Desain Premium", desc: "Kualitas terbaik." },
  { icon: Zap, title: "Akses Instan", desc: "Langsung pakai." },
  { icon: FilePen, title: "Mudah Diedit", desc: "Tanpa coding." },
  { icon: Headset, title: "Support Cepat", desc: "Bantuan siap." },
];

export default async function HomePage() {
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
        `
        id,
        name,
        slug,
        products (
          id, title, slug, price, discount_price, thumbnail_url, sku, tags, demo_link,
          categories(name)
        )
      `,
      )
      .not("products", "is", null)
      .limit(4),

    supabase
      .from("products")
      .select(
        "id, title, slug, price, discount_price, thumbnail_url, sku, tags, demo_link, categories(name)",
      )
      .eq("is_active", true)
      .contains("tags", ["new"])
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const carouselCategories =
    allCategoriesRaw?.map((cat) => ({
      ...cat,
      productCount: cat.products?.[0]?.count || 0,
    })) || [];

  const categoriesWithProducts =
    featuredCategoriesRaw
      ?.map((cat) => ({
        ...cat,
        products: cat.products as any[],
      }))
      .filter((cat) => cat.products.length > 0) || [];

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 md:pb-20 overflow-x-hidden">
      <div className="flex flex-col gap-12 md:gap-20">
        {/* ---------------------------------------------------------- */}
        {/* HERO (mobile-first & Liquid Glass Theme)                     */}
        {/* ---------------------------------------------------------- */}
        <section className="relative w-full pt-6 md:pt-16 px-4 md:px-0">
          {/* Background Aksen Blur (Blob) */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10 animate-blob" />

          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
              {/* Text Content (Diurutkan ke atas untuk mobile, kiri di desktop) */}
              <div className="w-full md:flex-1 md:order-1 relative z-10">
                <div className="space-y-6 md:space-y-8 text-center md:text-left">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 border border-border/50 bg-card/60 backdrop-blur-md rounded-full px-4 py-1.5 shadow-sm">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">
                      New Collection 2026
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
                    Undangan Digital <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                      Premium & Elegan
                    </span>
                  </h1>

                  <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-md mx-auto md:mx-0">
                    Buat momen spesialmu abadi dengan desain modern. Siap pakai
                    dalam hitungan menit, tanpa ribet.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center md:justify-start pt-2">
                    <Link href="/products" className="w-full sm:w-auto">
                      <Button
                        variant="brand"
                        size="lg"
                        className="w-full sm:w-auto rounded-full h-14 px-8 shadow-lg shadow-primary/20"
                      >
                        Lihat Koleksi
                      </Button>
                    </Link>

                    <Link href="#why-us" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto rounded-full h-14 px-8 border-border/50 bg-card/50 backdrop-blur-md hover:bg-card/80 shadow-sm"
                      >
                        Pelajari Dulu
                      </Button>
                    </Link>
                  </div>

                  {/* Social Proof */}
                  <div className="pt-4 flex items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-sm">
                      <div className="flex -space-x-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-foreground font-bold ml-1">
                        4.9/5
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">
                        10k+
                      </span>
                      Terjual
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Image / Mockup (Liquid Glass Theme) */}
              <div className="w-full md:flex-1 md:order-2">
                <div className="relative aspect-[4/5] sm:aspect-[16/15] md:aspect-square w-full overflow-hidden rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/10">
                  <div className="absolute inset-0 bg-muted/20 flex items-center justify-center p-4 sm:p-8">
                    {/* Inner Mockup Card */}
                    <div className="relative w-full max-w-sm aspect-[3/4] bg-background/90 backdrop-blur-2xl border border-border/60 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-inner">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                        <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-primary fill-primary/20" />
                      </div>
                      <h3 className="font-serif text-3xl sm:text-4xl text-foreground mb-3 tracking-wide">
                        Sarah & Dimas
                      </h3>
                      <p className="text-xs text-primary font-bold uppercase tracking-[0.3em] mb-6">
                        The Wedding Of
                      </p>
                      <div className="w-full max-w-[150px] h-px bg-border/80">
                        <div className="h-[2px] bg-primary w-1/3 mx-auto -translate-y-[0.5px] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Tag Bawah */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-background/80 backdrop-blur-xl border-t border-border/50 flex justify-between items-center rounded-b-3xl">
                    <div>
                      <p className="font-bold text-foreground text-sm sm:text-base">
                        Floral Elegant
                      </p>
                      <p className="text-[10px] sm:text-xs text-primary font-medium uppercase tracking-wider mt-0.5">
                        Best Seller Design
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform cursor-pointer">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* BENEFITS                                                   */}
        {/* ---------------------------------------------------------- */}
        <section
          id="why-us"
          className="mx-auto max-w-6xl px-4 md:px-0 scroll-mt-24"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 md:p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-foreground text-sm md:text-base mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORY CAROUSEL                                          */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-transparent">
          <div className="mx-auto max-w-6xl px-4 md:px-0">
            <div className="mb-6 md:mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-primary rounded-full block" />
              <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Kategori Populer
              </h3>
            </div>
            {/* Menggunakan CategoryCarousel yang sudah dimodifikasi */}
            <CategoryCarousel categories={carouselCategories} />
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* LATEST PRODUCTS                                            */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-transparent">
          <div className="mx-auto max-w-6xl px-4 md:px-0">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <span className="w-1.5 h-6 bg-primary rounded-full block" />
              <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Baru Rilis
              </h3>
            </div>

            {newArrivals && newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm">
                <p className="text-muted-foreground text-sm">
                  Belum ada produk baru saat ini.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* PRODUCTS BY CATEGORY LOOP                                  */}
        {/* ---------------------------------------------------------- */}
        <div className="flex flex-col gap-8 md:gap-12">
          {categoriesWithProducts.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              products={category.products as any[]}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
