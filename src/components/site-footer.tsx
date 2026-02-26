// ============================================================
// FILE: src/components/site-footer.tsx
// Komponen footer global — ditampilkan di semua halaman
// via src/app/layout.tsx
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { ArrowRight, Instagram, Youtube } from "lucide-react";

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

// ── Icon TikTok (tidak tersedia di lucide-react) ──────────────
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  );
}

// ── Data Sosial Media ─────────────────────────────────────────
// Ganti href sesuai akun resmi brand
const socials = [
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "TikTok", href: "https://tiktok.com", icon: TikTokIcon },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
];

// ── Komponen Utama ────────────────────────────────────────────
export async function SiteFooter() {
  const { categories, products } = await getFooterData();

  return (
    <footer className="w-full bg-muted/40 pb-[68px] md:pb-0">
      {/* ── Divider: pemisah visual antara section FAQ dan footer ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-6xl px-4 md:px-0 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-10 md:gap-12">
          {/* ════════════════════════════════════════════════ */}
          {/* KOLOM 1 — Kategori                              */}
          {/* Menampilkan daftar kategori produk              */}
          {/* ════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[-0.002em] text-foreground/50">
              Kategori
            </h4>

            <ul className="flex flex-col gap-2.5">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group/link"
                    >
                      {/* Arrow muncul saat hover */}
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground/40">
                  Belum ada kategori.
                </li>
              )}
            </ul>
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* KOLOM 2 — Rekomendasi Produk                    */}
          {/* Menampilkan 3 produk terbaru dengan thumbnail   */}
          {/* ════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[-0.002em] text-foreground/50">
              Rekomendasi
            </h4>

            <div className="flex flex-col gap-3">
              {products.length > 0 ? (
                products.map((product) => {
                  // Tampilkan harga diskon jika ada, fallback ke harga normal
                  const displayPrice = product.discount_price ?? product.price;

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group/prod flex items-center gap-3 py-1"
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
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-sm font-medium text-foreground group-hover/prod:text-primary transition-colors duration-200 leading-snug line-clamp-1">
                          {product.title}
                        </span>
                        <span className="text-xs text-primary font-semibold">
                          {formatPrice(displayPrice)}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground/40">
                  Belum ada produk.
                </p>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* KOLOM 3 — Ikuti Kami                            */}
          {/* Icon sosial media + tagline singkat             */}
          {/* ════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[-0.002em] text-foreground/50">
              Ikuti kami
            </h4>

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

            {/* Tagline */}
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              Ikuti kami untuk inspirasi undangan dan penawaran terbaru.
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* COPYRIGHT BAR                                       */}
      {/* Latar belakang primary — pembatas bawah footer      */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="border-t border-border/40 bg-primary">
        <div className="mx-auto max-w-6xl px-4 md:px-0 py-3.5 flex items-center justify-center">
          <p className="text-xs text-background text-center">
            © Copyright {new Date().getFullYear()} | Nikarya Digital
          </p>
        </div>
      </div>
    </footer>
  );
}
