import { createClient } from "@/lib/supabase/server";
import PromoClient from "@/app/(main)/promo/promo-client";
import { HeroSection } from "@/components/hero-section";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata = {
  title: "Promo & Diskon | Nikarya Store",
  description:
    "Lihat daftar kode promo, diskon, dan penawaran menarik kami. Dapatkan potongan harga maksimal di setiap pembelian Anda.",
};

export const revalidate = 60; // Cache for 60 seconds

export default async function PromoPage() {
  const supabase = await createClient();

  // Fetch only active promos from the database
  const { data: promos, error } = await supabase
    .from("promos")
    .select(
      "id, code, name, discount_type, discount_value, max_discount_cap, min_order_amount, start_date, end_date, scope_type, is_active"
    )
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching promos:", error);
  }

  return (
    <main className="flex flex-col min-h-screen pb-20">
      <HeroSection
        title="Dapatkan Penawaran Terbaik Untukmu"
        description="Salin kode promo di bawah ini dan gunakan saat checkout untuk menikmati potongan harga eksklusif di order kamu hari ini."
        imageSrc="/landing-assets/wks-series.png"
        badgeLabel="Promo & Diskon Eksklusif"
        buttonLabel="Lihat Koleksi"
        buttonHref="/products"
        fullWidth
      />

      <div className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <PromoClient initialPromos={promos || []} />
      </div>
    </main>
  );
}
