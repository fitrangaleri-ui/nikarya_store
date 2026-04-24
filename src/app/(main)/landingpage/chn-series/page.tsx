import { Suspense } from "react";
import { HeroSection } from "@/components/hero-section";
import { FaqSection } from "@/components/faq-section";
import { WarnSection } from "@/components/warn";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductCardDemo } from "../product-card-demo";
import { PriceCard } from "../price-card";
import { Typography } from "@/components/ui/typography";
import { DemoPreviewProvider } from "@/components/demo-preview-provider";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TemplatesAndPricingSkeleton } from "../skeleton-fallback";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CHN Series | Nikarya Store",
  description: "Landing page for CHN Series",
};

const chnFaqs = [
  {
    q: "Apa itu Tema Chinese Series?",
    a: "Tema Chinese Series adalah template undangan digital yang disediakan dalam format JSON dan dirancang untuk digunakan di Elementor. Template ini bisa langsung diimpor melalui Dashboard Wordpress dan digunakan tanpa perlu coding.",
  },
  {
    q: "Plugin apakah yang dibutuhkan untuk menggunakan template ini?",
    a: "Template ini memerlukan plugin Elementor Pro dan WeddingPress untuk berfungsi sepenuhnya. Mohon pastikan kedua plugin tersebut sudah terpasang dan aktif di website Anda.",
  },
  {
    q: "Apakah file ini bisa langsung digunakan di WordPress?",
    a: "Ya, file ini bisa langsung digunakan di WordPress yang sudah terpasang plugin Elementor Pro dan Weddingpress. Anda hanya perlu mengimpor file JSON ke dalam halaman Elementor.",
  },
  {
    q: "Format file apa saja yang akan saya dapatkan?",
    a: "Anda akan mendapatkan file utama dalam format JSON siap install yang bisa langsung diimpor ke Wordpress, serta file pendukung berupa gambar berformat WEBP, ikon SVG, dan juga beberapa script HTML serta animasi CSS yang digunakan untuk mempercantik tampilan tema.",
  },
  {
    q: "Berapa Harga Minimum Penjualan?",
    a: "Tidak ada batasan harga jual yang ditetapkan secara resmi. Namun, kami menyarankan harga minimum penjualan sebesar Rp100.000-Rp200.000 per tema kepada end-user, agar tetap menjaga nilai produk dan ekosistem penjual.",
  },
  {
    q: "Apa Lisensi yang Didapat?",
    a: "Setiap pembelian produk dari NIKARYA DIGITAL dilengkapi dengan lisensi personal dan komersial terbatas, yang mengizinkan Anda menggunakan tema ini untuk proyek klien, portofolio, atau penjualan jasa undangan digital. Namun, dilarang keras menjual ulang atau mendistribusikan file mentah JSON secara massal, baik gratis maupun berbayar, tanpa izin resmi.",
  },
  {
    q: "Apakah Ada Garansi Uang Kembali?",
    a: "Karena produk ini berupa file digital yang langsung bisa diakses, maka kami tidak menyediakan garansi uang kembali. Namun, kami berkomitmen memberikan bantuan teknis apabila Anda mengalami kendala teknis atau kesulitan dalam penggunaan file yang telah dibeli.",
  },
];

async function CHNSeriesData() {
  const supabase = createAdminClient();
  const { data: chnProduct } = await supabase
    .from("products")
    .select(
      "id, sku, slug, title, price, discount_price, thumbnail_url, product_demo_links(id, label, url, image_url, sort_order)"
    )
    .eq("is_active", true)
    .ilike("sku", "chn-series")
    .limit(1)
    .maybeSingle();

  const demoLinks = [...(chnProduct?.product_demo_links || [])].sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <>
      <section id="templates" className="py-20 md:py-24 bg-transparent border-t border-border/50">
        <div className="container mx-auto px-8 md:px-6">
          <ScrollReveal className="max-w-xl mx-auto text-center mb-12 md:mb-16">
            <Typography variant="h3" className="text-center">
              Preview Tema
            </Typography>
            <Typography variant="body-base" color="muted" className="text-center mt-2">
              Lihat {demoLinks.length > 0 ? demoLinks.length : 5} tema premium <b>CHINESE</b> Series
            </Typography>
          </ScrollReveal>

          {demoLinks && demoLinks.length > 0 ? (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {demoLinks.map((demo, index) => (
                <ScrollReveal
                  key={demo.id}
                  delay={(index % 3) * 100}
                  className="w-full h-full"
                >
                  <ProductCardDemo
                    demoLink={demo}
                    badgeLabel={index === demoLinks.length - 1 ? "Bonus Template" : "Design Premium"}
                    badgeVariant={index === demoLinks.length - 1 ? "destructive" : "glass"}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal className="py-20 text-center glass rounded-3xl border-dashed border-border/50">
              <Typography variant="body-base" color="muted">
                Belum ada koleksi tema saat ini. Silakan kembali lagi nanti.
              </Typography>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section id="pricing" className="relative bg-gradient-to-br from-primary to-secondary-foreground py-20 md:py-28 overflow-hidden">
        {/* Decorative Circles shared for both Price & Warn */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[10%] left-[10%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

        {/* Pricing wrapper */}
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <ScrollReveal className="max-w-xl mx-auto text-center mb-10 md:mb-14" direction="down">
            <Typography variant="h3" className="text-center text-primary-foreground">
              Dapatkan harga terbaik
            </Typography>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <PriceCard
              product={chnProduct || undefined}
              themeCount={demoLinks.length > 0 ? demoLinks.length : 5}
              features={[
                "Tema Chinese Series Eksklusif",
                "Desain Elegan, Oriental, dan Responsif",
                "Struktur JSON rapih dan mudah diedit",
                "4 Premium Theme",
                "Bonus 1 Template Tema Papua",
                "Gratis Aset Script Motion Control",
                "Gratis Asset Script Animasi (HTML & CSS)",

                "Gratis Asset Image (WEBP & SVG)"
              ]}
            />
          </ScrollReveal>
        </div>

        <div className="mt-10 md:mt-16">
          <ScrollReveal delay={400} distance={50}>
            <WarnSection transparent={true} />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

export default function CHNSeriesPage() {
  return (
    <DemoPreviewProvider>
      <main className="flex flex-col min-h-screen pb-20">
        <HeroSection
          title="Template Wedding Chinese Series"
          description={
            <>
              <b>TEMA CHINESE SERIES</b> dari <b>NIKARYA DIGITAL</b> hadir dengan desain elegan, responsif, interaktif dan siap pakai dalam format <b>JSON</b> tema ini dirancang khusus untuk penyedia layanan jasa pembuatan undangan digital profesional.
            </>
          }
          imageSrc="/landing-assets/chn-series.png"
          buttonLabel="Lihat Koleksi"
          buttonHref="#templates"
          badgeLabel="Koleksi CHN Series"
          descriptionClassName="text-sm"
        />

        <Suspense fallback={<TemplatesAndPricingSkeleton />}>
          <CHNSeriesData />
        </Suspense>

        <FaqSection customFaqs={chnFaqs} />
      </main>
    </DemoPreviewProvider>
  );
}
