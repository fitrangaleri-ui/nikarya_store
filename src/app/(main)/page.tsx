// ============================================================
// FILE: src/app/(main)/page.tsx
// CATATAN: Hanya Hero Section yang diubah.
//          Semua logika fetching, data, dan konfigurasi tetap.
// ============================================================

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
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ─── Constants ────────────────────────────────────────────────
const benefits = [
  { icon: BadgeCheck, title: "Desain Premium", desc: "Kualitas terbaik." },
  { icon: Zap, title: "Akses Instan", desc: "Langsung pakai." },
  { icon: FilePen, title: "Mudah Diedit", desc: "Tanpa coding." },
  { icon: Headset, title: "Support Cepat", desc: "Bantuan siap." },
];

// Placeholder grid — ganti src dengan thumbnail produk asli jika tersedia
const heroGridItems = [
  { id: 1, alt: "Tema Jawa" },
  { id: 2, alt: "Tema Batik" },
  { id: 3, alt: "Tema Candi" },
  { id: 4, alt: "Tema Floral" },
  { id: 5, alt: "Tema Modern" },
  { id: 6, alt: "Tema Vintage" },
  { id: 7, alt: "Tema Passport" },
  { id: 8, alt: "Tema Bali" },
  { id: 9, alt: "Tema Pink" },
];

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
           categories(name)
         )`,
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
        {/* ============================================================ */}
        {/* HERO SECTION                                                  */}
        {/* Layout  : 60:40 — teks kiri (60%), video kanan (40%)         */}
        {/* Font    : font-sans (Inter) dari layout.tsx — konsisten      */}
        {/* ============================================================ */}
        <section className="relative w-full overflow-hidden">
          {/* ── Blob 1: kiri tengah ── */}
          <div
            aria-hidden
            className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 blur-[140px] rounded-full pointer-events-none -z-10 animate-blob"
          />
          {/* ── Blob 2: kanan atas ── */}
          <div
            aria-hidden
            className="absolute -top-20 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10 animate-blob animation-delay-2000"
          />
          {/* ── Blob 3: kiri bawah ── */}
          <div
            aria-hidden
            className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none -z-10 animate-blob animation-delay-4000"
          />

          {/* ── Grid pattern background subtle ── */}
          <div
            aria-hidden
            className="absolute inset-0 bg-grid-pattern -z-10 opacity-40"
          />

          {/* ── Wrapper utama ── */}
          <div className="flex flex-col md:flex-row md:items-center gap-0 min-h-[calc(100vh-4rem)]">
            {/* ════════════════════════════════════════ */}
            {/* KOLOM KIRI — 60% lebar                  */}
            {/* ════════════════════════════════════════ */}
            <div
              className="
      w-full md:w-[60%]
      px-4 md:pl-[max(2rem,calc((100vw-72rem)/2))] md:pr-12
      flex flex-col justify-center
      gap-6 md:gap-7
      text-left relative z-10
      pt-12 pb-8 md:pt-0 md:pb-0
    "
            >
              {/* ── Trust Badge Pill ── */}
              <div className="inline-flex items-center gap-2 w-fit rounded-full px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[-0.005em]">
                  Platform E-Invitation Indonesia
                </span>
              </div>

              {/* ── Headline ── */}
              <div className="space-y-2">
                <h1
                  className="
          font-sans
          text-4xl sm:text-6xl md:text-[3rem] lg:text-[3.5rem]
          font-bold text-foreground
          leading-[1.1] tracking-tight
        "
                >
                  Praktis, Elegan
                </h1>
                <h1
                  className="
          font-sans
          text-4xl sm:text-6xl md:text-[3rem] lg:text-[3.5rem]
          font-bold leading-[1.1] tracking-tight
          text-transparent bg-clip-text
          bg-gradient-to-r from-primary via-primary to-primary/50
        "
                >
                  & Penuh Kesan
                </h1>
              </div>

              {/* ── Subheading ── */}
              {/* PERUBAHAN: teks deskripsi diganti sesuai permintaan */}
              <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-[400px]">
                <strong className="text-foreground font-semibold">
                  Nikarya Digital
                </strong>{" "}
                adalah solusi terbaik buat Anda yang ingin membuat undangan
                digital. Kami menyediakan layanan jasa pembuatan undangan
                digital untuk acara{" "}
                <span className="text-foreground font-medium">pernikahan</span>,{" "}
                <span className="text-foreground font-medium">ulang tahun</span>
                , dan{" "}
                <span className="text-foreground font-medium">
                  acara khusus
                </span>{" "}
                lainnya.
              </p>

              {/* ── CTA ── */}
              <div className="flex items-center">
                <Link href="/products">
                  {/*
      PERUBAHAN:
      - Hapus size="pill" (h-14 terlalu tinggi)
      - Hapus w-48 (terlalu lebar, tidak natural)
      - Pakai w-fit agar lebar mengikuti konten
      - Tambah min-w agar tidak terlalu sempit
    */}
                  <Button
                    variant="brand-pill"
                    size="lg"
                    className="w-fit min-w-40 group"
                  >
                    Lihat Tema
                    <span className="brand-pill__icon">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </div>

              {/* ── Stats Row ── */}
              <div className="flex items-center gap-0 pt-2">
                {/* Stat 1: Rating */}
                <div className="flex flex-col gap-1 pr-6 border-r border-border/50">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-foreground">
                      4.9
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /5 rating
                    </span>
                  </div>
                </div>
                {/* Stat 2: Pelanggan */}
                <div className="flex flex-col gap-1 px-6 border-r border-border/50">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black text-foreground">
                      500K
                    </span>
                    <span className="text-xs text-primary font-bold">+</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Mempelai puas
                  </span>
                </div>
                {/* Stat 3: Tema */}
                <div className="flex flex-col gap-1 pl-6">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black text-foreground">
                      200
                    </span>
                    <span className="text-xs text-primary font-bold">+</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Pilihan tema
                  </span>
                </div>
              </div>
            </div>
            {/* ════════════════════════════════════════ */}
            {/* END KOLOM KIRI                           */}
            {/* ════════════════════════════════════════ */}

            {/* ════════════════════════════════════════ */}
            {/* KOLOM KANAN — 40% lebar                 */}
            {/* ════════════════════════════════════════ */}
            <div className="w-full md:w-[40%] flex items-stretch justify-end relative">
              {/* ── Dekorasi: lingkaran orbit ── */}
              <div
                aria-hidden
                className="hidden md:block absolute -left-8 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-primary/10 pointer-events-none"
              />
              <div
                aria-hidden
                className="hidden md:block absolute -left-16 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-primary/5 pointer-events-none"
              />

              {/* ── Container Video 3:4 ── */}
              <div
                className="
        relative w-full
        aspect-[3/4]
        md:h-[calc(100vh-4rem)]
        md:max-h-[720px]
        overflow-hidden
        md:rounded-l-[2rem]
        bg-muted/20
      "
              >
                {/* VIDEO */}
                <video
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                >
                  <source src="/hero-video.webm" type="video/webm" />
                  <source src="/hero.mp4" type="video/mp4" />
                  Browser kamu tidak mendukung pemutaran video.
                </video>

                {/* ── Floating badge: Live Demo ── */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border/60 rounded-full px-3 py-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-foreground">
                    Live Demo
                  </span>
                </div>

                {/* ── Floating card: info tema ── */}
                <div className="absolute bottom-6 left-4 right-4 glass rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">
                      Floral Elegant Series
                    </span>
                    <span className="text-[10px] text-primary font-medium uppercase tracking-wider">
                      Best Seller · 2.3K Terjual
                    </span>
                  </div>
                  <Link href="/products">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:scale-110 transition-transform cursor-pointer shadow-md shadow-primary/30">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            {/* ════════════════════════════════════════ */}
            {/* END KOLOM KANAN                          */}
            {/* ════════════════════════════════════════ */}
          </div>
        </section>
        {/* ============================================================ */}
        {/* END HERO SECTION                                             */}
        {/* ============================================================ */}

        {/* ============================================================ */}
        {/* BENEFITS SECTION                                              */}
        {/* ============================================================ */}
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
        {/* ============================================================ */}
        {/* END BENEFITS SECTION                                          */}
        {/* ============================================================ */}

        {/* ============================================================ */}
        {/* CATEGORY CAROUSEL SECTION                                     */}
        {/* ============================================================ */}
        <section className="bg-transparent">
          <div className="mx-auto max-w-6xl px-4 md:px-0">
            <div className="mb-6 md:mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-primary rounded-full block" />
              <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Kategori Populer
              </h3>
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
        {/* ============================================================ */}
        {/* END NEW ARRIVALS SECTION                                      */}
        {/* ============================================================ */}

        {/* ============================================================ */}
        {/* PRODUCTS BY CATEGORY SECTION                                  */}
        {/* Loop tiap kategori yang memiliki produk                       */}
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

      {/* BottomNav — navigasi mobile (TIDAK DIUBAH) */}
      <BottomNav />
    </main>
  );
}
