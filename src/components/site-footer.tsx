// ============================================================
// FILE: src/components/site-footer.tsx
// Komponen footer global — ditampilkan di semua halaman
// via src/app/layout.tsx
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { Send } from "lucide-react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-23 -21 682 682.66669" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="m544.386719 93.007812c-59.875-59.945312-139.503907-92.9726558-224.335938-93.007812-174.804687 0-317.070312 142.261719-317.140625 317.113281-.023437 55.894531 14.578125 110.457031 42.332032 158.550781l-44.992188 164.335938 168.121094-44.101562c46.324218 25.269531 98.476562 38.585937 151.550781 38.601562h.132813c174.785156 0 317.066406-142.273438 317.132812-317.132812.035156-84.742188-32.921875-164.417969-92.800781-224.359376zm-224.335938 487.933594h-.109375c-47.296875-.019531-93.683594-12.730468-134.160156-36.742187l-9.621094-5.714844-99.765625 26.171875 26.628907-97.269531-6.269532-9.972657c-26.386718-41.96875-40.320312-90.476562-40.296875-140.28125.054688-145.332031 118.304688-263.570312 263.699219-263.570312 70.40625.023438 136.589844 27.476562 186.355469 77.300781s77.15625 116.050781 77.132812 186.484375c-.0625 145.34375-118.304687 263.59375-263.59375 263.59375zm144.585938-197.417968c-7.921875-3.96875-46.882813-23.132813-54.148438-25.78125-7.257812-2.644532-12.546875-3.960938-17.824219 3.96875-5.285156 7.929687-20.46875 25.78125-25.09375 31.066406-4.625 5.289062-9.242187 5.953125-17.167968 1.984375-7.925782-3.964844-33.457032-12.335938-63.726563-39.332031-23.554687-21.011719-39.457031-46.960938-44.082031-54.890626-4.617188-7.9375-.039062-11.8125 3.476562-16.171874 8.578126-10.652344 17.167969-21.820313 19.808594-27.105469 2.644532-5.289063 1.320313-9.917969-.664062-13.882813-1.976563-3.964844-17.824219-42.96875-24.425782-58.839844-6.4375-15.445312-12.964843-13.359374-17.832031-13.601562-4.617187-.230469-9.902343-.277344-15.1875-.277344-5.28125 0-13.867187 1.980469-21.132812 9.917969-7.261719 7.933594-27.730469 27.101563-27.730469 66.105469s28.394531 76.683594 32.355469 81.972656c3.960937 5.289062 55.878906 85.328125 135.367187 119.648438 18.90625 8.171874 33.664063 13.042968 45.175782 16.695312 18.984374 6.03125 36.253906 5.179688 49.910156 3.140625 15.226562-2.277344 46.878906-19.171875 53.488281-37.679687 6.601563-18.511719 6.601563-34.375 4.617187-37.683594-1.976562-3.304688-7.261718-5.285156-15.183593-9.253906zm0 0"
      />
    </svg>
  );
}

// ── Data Fetching ─────────────────────────────────────────────
// Fetch kategori (maks 6) dan produk terbaru (maks 3)
// untuk ditampilkan di kolom Kategori dan Rekomendasi
async function getFooterData() {
  const supabase = createAdminClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name").limit(6),

    supabase
      .from("products")
      .select("id, title, slug, price, discount_price, thumbnail_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return {
    categories: categories ?? [],
    products: products ?? [],
  };
}

// ── Helper: Format Harga Rupiah ───────────────────────────────
function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}


// ── Data Sosial Media ─────────────────────────────────────────
// Ganti href sesuai akun resmi brand
const socials = [
  { label: "WhatsApp", href: "https://wa.me/6285155201380", icon: WhatsAppIcon },
  { label: "Telegram", href: "https://t.me/+3eECVmQKaqBmNTI1", icon: Send },
];

// ── Komponen Utama ────────────────────────────────────────────
export async function SiteFooter() {
  const { categories, products } = await getFooterData();

  return (
    <footer className="w-full bg-muted/40 pb-[68px] md:pb-0">
      {/* ── Divider: pemisah visual antara section FAQ dan footer ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-6xl px-4 md:px-0 pt-6 pb-10 md:pt-8 md:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-10 md:gap-12">
          {/* ════════════════════════════════════════════════ */}
          {/* KOLOM 1 — Kategori                              */}
          {/* Menampilkan daftar kategori produk              */}
          {/* ════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <Typography
              variant="body-sm"
              className="font-semibold uppercase  text-foreground/40"
            >
              Kategori
            </Typography>

            <ul className="flex flex-col divide-y divide-border/40">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200 group/link w-fit"
                    >
                      <Typography
                        variant="body-sm"
                        as="span"
                        className=" font-medium text-foreground/90 group-hover/link:text-primary transition-colors duration-200"
                      >
                        {cat.name}
                      </Typography>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 shrink-0 text-foreground/90 group-hover/link:text-primary group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-200" />
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Typography variant="caption" className="text-muted-foreground/40 italic">
                    Belum ada kategori.
                  </Typography>
                </li>
              )}
            </ul>
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* KOLOM 2 — Rekomendasi Produk                    */}
          {/* Menampilkan 3 produk terbaru dengan thumbnail   */}
          {/* ════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <Typography
              variant="body-sm"
              className="font-bold uppercase  text-foreground/40"
            >
              Rekomendasi
            </Typography>

            <div className="flex flex-col divide-y divide-border/40">
              {products.length > 0 ? (
                products.map((product) => {
                  // Tampilkan harga diskon jika ada, fallback ke harga normal
                  const displayPrice = product.discount_price ?? product.price;

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group/prod flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      {/* Thumbnail produk */}
                      <div className="shrink-0 w-14 h-14 rounded-[4px] overflow-hidden bg-background border border-border/40 group-hover/prod:border-primary/40 transition-colors duration-200">
                        {product.thumbnail_url ? (
                          <Image
                            src={product.thumbnail_url}
                            alt={product.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover group-hover/prod:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          /* Fallback jika tidak ada thumbnail */
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>

                      {/* Info produk: judul + harga */}
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="w-full">
                          <Typography
                            variant="body-sm"
                            as="span"
                            className="font-medium text-foreground/90 group-hover/prod:text-primary transition-colors duration-200 line-clamp-2 block leading-snug"
                          >
                            {product.title}
                          </Typography>
                        </div>
                        <Typography
                          variant="caption"
                          as="span"
                          className="text-primary font-bold font-mono mt-0.5"
                        >
                          {formatPrice(displayPrice)}
                        </Typography>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <Typography variant="caption" className="text-muted-foreground/40 italic">
                  Belum ada produk.
                </Typography>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* KOLOM 3 — Ikuti Kami                            */}
          {/* Icon sosial media + tagline singkat             */}
          {/* ════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <Typography
              variant="body-sm"
              className="font-bold uppercase  text-foreground/40"
            >
              Ikuti kami
            </Typography>

            {/* Icon sosmed — rounded-full, warna primary */}
            <div className="flex items-center gap-2.5">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="
                    w-9 h-9 rounded-full flex items-center justify-center
                    bg-primary/10 text-primary
                    border border-primary/20
                    hover:bg-primary hover:text-primary-foreground hover:border-primary
                    transition-all duration-200 hover:scale-110 hover:-translate-y-0.5
                  "
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* COPYRIGHT BAR                                       */}
      {/* Latar belakang primary — pembatas bawah footer      */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="border-t border-white/10 bg-primary">
        <div className="mx-auto max-w-6xl px-4 md:px-0 py-4 flex items-center justify-center">
          <Typography variant="caption" className="text-primary-foreground/90 text-center font-medium">
            © {new Date().getFullYear()} Nikarya Digital | All Rights Reserved
          </Typography>
        </div>
      </div>
    </footer>
  );
}
