
import { HeroSection } from "@/components/hero-section";
import { FaqSection } from "@/components/faq-section";
import { WarnSection } from "@/components/warn";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductCardDemo } from "../product-card-demo";
import { PriceCard } from "../price-card";
import { Typography } from "@/components/ui/typography";
import { DemoPreviewProvider } from "@/components/demo-preview-provider";
import { ScrollReveal } from "@/components/scroll-reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "WKS Series | Nikarya Store",
  description: "Landing page for WKS Series",
};

const wksFaqs = [
  {
    q: "Berapa lama pembuatan template",
    a: "Untuk estimasi proses pengerjaan maksimal 2 hari setelah semua data kami terima, tidak menutup kemungkinan bisa lebih cepat.",
  },
  {
    q: "Apakah bisa hapus ucapan yang ditulis oleh tamu undangan?",
    a: "Bisa, nanti kakak bisa informasikan detail ucapan mana yang mau dihapus.",
  },
  {
    q: "Apakah bisa revisi?",
    a: "Bisa, kami menyediakan revisi untuk memastikan undangan sesuai dengan keinginan kakak.",
  },
  {
    q: "Apakah bisa undangan tidak menggunakan foto?",
    a: "Bisa, undangan tetap bisa dibuat tanpa foto sesuai permintaan kakak.",
  },
  {
    q: "Berapa lama proses revisi selesai?",
    a: "Proses revisi biasanya selesai dalam 1×24 jam setelah permintaan revisi diterima.",
  },
  {
    q: "Apa itu fitur RSVP?",
    a: "RSVP adalah fitur konfirmasi kehadiran tamu secara digital langsung dari undangan, sehingga kakak bisa memantau siapa saja yang hadir.",
  },
];

export default async function WKSSeriesPage() {
  const supabase = createAdminClient();
  const { data: wksProduct } = await supabase
    .from("products")
    .select(
      "id, sku, slug, title, price, discount_price, thumbnail_url, product_demo_links(id, label, url, image_url, sort_order)"
    )
    .eq("is_active", true)
    .ilike("sku", "wks-series")
    .limit(1)
    .maybeSingle();

  const demoLinks = [...(wksProduct?.product_demo_links || [])].sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <DemoPreviewProvider>
      <main className="flex flex-col min-h-screen pb-20">
        <HeroSection
          title="Template Walimatul Khitan Series"
          description={
            <>
              <b>TEMA WALIMATUL KHITAN</b> dari <b>NIKARYA DIGITAL</b> hadir dengan desain elegan, responsif, interaktif dan siap pakai dalam format <b>JSON</b> tema ini dirancang khusus untuk penyedia layanan jasa pembuatan undangan digital profesional.
            </>
          }
          imageSrc="/landingpage/wks-series.png"
          buttonLabel="Lihat Koleksi"
          buttonHref="#templates"
          badgeLabel="Koleksi Walimatul Khitan"
          descriptionClassName="text-sm"
        />

        <section id="templates" className="py-20 md:py-24 bg-transparent border-t border-border/50">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal className="max-w-xl mx-auto text-center mb-12 md:mb-16">
              <Typography variant="h3" className="mb-2 text-center">
                Pilihan Tema Eksklusif
              </Typography>
              <Typography variant="body-sm" color="muted" className="text-center">
                Jelajahi koleksi desain undangan digital terbaik kami yang siap mempercantik hari spesial Anda.
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
                    <ProductCardDemo demoLink={demo} />
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

        <section id="pricing" className="relative bg-gradient-to-br from-primary to-secondary-foreground shadow-2xl py-20 md:py-28 overflow-hidden">
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
                product={wksProduct || undefined}
                themeCount={demoLinks.length > 0 ? demoLinks.length : 5}
              />
            </ScrollReveal>
          </div>

          <div className="mt-10 md:mt-16">
            <ScrollReveal delay={400} distance={50}>
              <WarnSection transparent={true} />
            </ScrollReveal>
          </div>
        </section>

        <FaqSection customFaqs={wksFaqs} />
      </main>
    </DemoPreviewProvider>
  );
}
