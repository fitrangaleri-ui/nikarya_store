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
      <div className="flex flex-col gap-10 md:gap-14">
        {/* ---------------------------------------------------------- */}
        {/* HERO (mobile-first)                                        */}
        {/* ---------------------------------------------------------- */}
        <section className="relative w-full bg-background pt-8 md:pt-12">
          <div className="mx-auto max-w-6xl px-4 md:px-0">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-12">
              {/* Hero Image (mobile dulu) */}
              <div className="w-full md:flex-1 md:order-2">
                <div className="relative aspect-[4/5] sm:aspect-[16/15] md:aspect-square w-full overflow-hidden border border-border bg-card">
                  <div className="absolute inset-0 bg-muted/40 flex items-center justify-center">
                    <div className="relative w-[85%] h-[85%] bg-card border border-border/50 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-pink-50 flex items-center justify-center mb-5 sm:mb-6">
                        <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-pink-500 fill-pink-500" />
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
                        Sarah & Dimas
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mb-5 sm:mb-6">
                        The Wedding Of
                      </p>
                      <div className="w-full max-w-[120px] h-0.5 bg-border/60">
                        <div className="h-full bg-primary w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-4 bg-background/90 backdrop-blur-md border-t border-border flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        Floral Elegant
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Best Seller
                      </p>
                    </div>
                    <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="w-full md:flex-1 md:order-1">
                <div className="space-y-5 md:space-y-6 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 border border-border bg-background/90 backdrop-blur-sm px-3 py-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      New Collection 2026
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground leading-[1.05] tracking-tight">
                    Undangan Digital <br className="hidden md:block" />
                    <span className="text-primary">Premium & Elegan</span>
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground max-w-[40ch] mx-auto md:mx-0">
                    Buat momen spesialmu abadi dengan desain modern. Siap pakai
                    dalam hitungan menit, tanpa ribet.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-center md:justify-start pt-1">
                    <Link href="/products" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto rounded-none h-12 px-8 text-xs sm:text-sm font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-none"
                      >
                        Lihat Koleksi
                      </Button>
                    </Link>

                    <Link href="#why-us" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto rounded-none h-12 px-8 text-xs sm:text-sm font-bold uppercase tracking-widest border-border bg-background text-foreground hover:bg-muted shadow-none"
                      >
                        Pelajari Dulu
                      </Button>
                    </Link>
                  </div>

                  {/* Social Proof */}
                  <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5">
                      <div className="flex -space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-foreground font-bold">4.9/5</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
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
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* BENEFITS                                                   */}
        {/* ---------------------------------------------------------- */}
        <section id="why-us" className="mx-auto max-w-6xl px-4 md:px-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="bg-card border border-border p-4 md:p-5 transition-colors hover:border-primary/25"
              >
                <div className="w-10 h-10 bg-primary/10 border border-primary/15 flex items-center justify-center text-primary mb-3">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-foreground text-sm mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORY CAROUSEL                                          */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-4 md:px-0">
            {/* "Lihat Semua" dihapus */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Kategori Populer
              </h3>
            </div>

            <CategoryCarousel categories={carouselCategories} />
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* LATEST PRODUCTS                                            */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-4 md:px-0">
            <div className="flex items-center gap-3 mb-5 md:mb-8">
              <span className="w-1 h-6 bg-primary block" />
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
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
              <div className="py-12 text-center border border-dashed border-border bg-muted/40">
                <p className="text-muted-foreground text-sm">
                  Belum ada produk baru.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/* PRODUCTS BY CATEGORY LOOP                                  */}
        {/* ---------------------------------------------------------- */}
        {categoriesWithProducts.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            products={category.products as any[]}
          />
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
