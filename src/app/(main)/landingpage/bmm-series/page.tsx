import { Suspense } from "react";
import { HeroSection } from "@/components/hero-section";
import { FaqSection } from "@/components/faq-section";
import { getLandingPageProduct, getRecommendedProducts } from "../../lib";
import { DemoPreviewProvider } from "@/components/demo-preview-provider";
import { TemplatesAndPricingSkeleton } from "../skeleton-fallback";
import { BMMSeriesClient } from "./bmm-series-client";

export const revalidate = 120;

export const metadata = {
  title: "BMM Series | Nikarya Store",
  description: "Landing page for BMM Series",
};

const bmmFaqs = [
  {
    q: "Apa itu Tema Batik Megamendung Series?",
    a: "Tema Batik Megamendung Series adalah template undangan digital bertema Batik Megamendung yang disediakan dalam format JSON dan dirancang untuk digunakan di Elementor. Template ini bisa langsung diimpor melalui Dashboard Wordpress dan digunakan tanpa perlu coding.",
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

async function BMMSeriesData() {
  const [bmmProduct, recommendedProducts] = await Promise.all([
    getLandingPageProduct("bmm-series"),
    getRecommendedProducts(),
  ]);

  return <BMMSeriesClient bmmProduct={bmmProduct} recommendedProducts={recommendedProducts} />;
}

export default function BMMSeriesPage() {
  return (
    <DemoPreviewProvider>
      <main className="flex flex-col min-h-screen pb-20">
        <HeroSection
          title="Template Batik Megamendung Series"
          description={
            <>
              <b>TEMA BATIK MEGAMENDUNG</b> dari <b>NIKARYA DIGITAL</b> hadir dengan desain khas nusantara yang elegan, responsif, interaktif dan siap pakai dalam format <b>JSON</b> tema ini dirancang khusus untuk penyedia layanan jasa pembuatan undangan digital profesional.
            </>
          }
          imageSrc="/landing-assets/bmm-series.png"
          buttonLabel="Lihat Koleksi"
          buttonHref="#templates"
          badgeLabel="Koleksi Batik Megamendung"
          descriptionClassName="text-sm"
        />

        <Suspense fallback={<TemplatesAndPricingSkeleton />}>
          <BMMSeriesData />
        </Suspense>

        <FaqSection customFaqs={bmmFaqs} />
      </main>
    </DemoPreviewProvider>
  );
}
