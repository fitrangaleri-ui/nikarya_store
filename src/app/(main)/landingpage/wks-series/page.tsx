
import { HeroSection } from "@/components/hero-section";
import { FaqSection } from "@/components/faq-section";
import { WarnSection } from "@/components/warn";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductCardDemo } from "../product-card-demo";
import { Typography } from "@/components/ui/typography";

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
      "id, sku, product_demo_links(id, label, url, image_url, sort_order)"
    )
    .eq("is_active", true)
    .ilike("sku", "wks-series")
    .limit(1)
    .maybeSingle();

  const demoLinks = [...(wksProduct?.product_demo_links || [])].sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <main className="flex flex-col min-h-screen pb-20">
      <HeroSection 
        title="Template Walimatul Khitan Series"
        description="TEMA WALIMATUL KHITAN dari NIKARYA DIGITAL hadir dengan desain elegan, responsif, interaktif dan siap pakai dalam format JSON tema ini dirancang khusus untuk penyedia layanan jasa pembuatan undangan digital profesional."
        imageSrc="/landingpage/wks-series.png"
        buttonLabel="Lihat Koleksi"
        buttonHref="#templates"
        badgeLabel="Koleksi Walimatul Khitan"
      />

        <section id="templates" className="py-16 md:py-24 bg-transparent border-t border-border/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-xl mx-auto text-center mb-12 md:mb-16">
              <Typography variant="h2" className="mb-4">
                Pilihan Tema Eksklusif
              </Typography>
              <Typography variant="body-base" color="muted">
                Jelajahi koleksi desain undangan digital terbaik kami yang siap mempercantik hari spesial Anda.
              </Typography>
            </div>

            {demoLinks && demoLinks.length > 0 ? (
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {demoLinks.map((demo) => (
                  <div key={demo.id} className="w-full">
                     <ProductCardDemo demoLink={demo} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center glass rounded-3xl border-dashed border-border/50">
                <Typography variant="body-base" color="muted">
                  Belum ada koleksi tema saat ini. Silakan kembali lagi nanti.
                </Typography>
              </div>
            )}
          </div>
        </section>

        <WarnSection />
        
      <FaqSection customFaqs={wksFaqs} />
    </main>
  );
}
