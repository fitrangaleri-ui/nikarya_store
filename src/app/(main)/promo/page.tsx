import { createClient } from "@/lib/supabase/server";
import PromoClient from "@/app/(main)/promo/promo-client";

export const metadata = {
  title: "Promo & Diskon | Custom Galeri Store",
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
    <main className="w-full max-w-7xl mx-auto px-4 pt-24 md:pt-32 pb-24 overflow-x-hidden">
      <PromoClient initialPromos={promos || []} />
    </main>
  );
}
