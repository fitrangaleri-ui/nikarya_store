// ============================================================
// FILE: src/app/dashboard/products/page.tsx
// FIX: Hapus karakter */} yang invalid pada komentar empty state
// ============================================================

import Image from "next/image";
import Link from "next/link";
import {
  InboxStackIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  SparklesIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { DownloadButton } from "../download-button";
import { getDashboardData, formatDate } from "../lib";
import { Typography } from "@/components/ui/typography";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS = 25;

export default async function ProductsPage() {
  const { uniquePaidProducts } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════ */}
      {/* HEADER BANNER                                        */}
      {/* ════════════════════════════════════════════════════ */}

      {/* ── Banner: Header ── */}
      <div className="relative rounded-xl overflow-hidden bg-primary px-6 py-8 md:px-10 border border-white/5">
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

        {/* Konten banner */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-white mb-4 backdrop-blur-md border border-white/10">
              <InboxStackIcon className="w-3.5 h-3.5" />
              <Typography variant="caption" className="font-semibold text-primary-foreground">
                Produk Saya
              </Typography>
            </div>

            <Typography variant="h2" as="h1" className="text-white tracking-tight">
              Produk Digital Saya
            </Typography>
            <Typography variant="body-sm" className="text-white/70 mt-2 font-medium max-w-md">
              Koleksi produk digital yang telah Anda beli. Akses unduhan tersedia sesuai kuota.
            </Typography>
          </div>

          <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
            <div className="flex w-14 h-14 rounded-xl bg-white/15 items-center justify-center border border-white/20 backdrop-blur-md">
              <SparklesIcon className="w-7 h-7 text-primary-foreground" />
            </div>
            {uniquePaidProducts.length > 0 && (
              <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                <Typography variant="caption" className="text-white font-bold whitespace-nowrap">
                  {uniquePaidProducts.length} Produk Koleksi
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* PRODUCT GRID / EMPTY STATE                          */}
      {/* ════════════════════════════════════════════════════ */}
      {uniquePaidProducts.length > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {uniquePaidProducts.map((order) => {
              const product = order.products as {
                title: string;
                thumbnail_url: string | null;
                slug: string;
              } | null;

              const downloadCount = order.download_count || 0;
              const remaining = MAX_DOWNLOADS - downloadCount;
              const progress = (downloadCount / MAX_DOWNLOADS) * 100;

              const progressColor =
                remaining <= 0
                  ? "bg-destructive"
                  : remaining <= 5
                    ? "bg-warning"
                    : "bg-primary";

              const remainingLabel =
                remaining <= 0 ? "Habis" : `${remaining} tersisa`;

              const remainingColor =
                remaining <= 0
                  ? "text-destructive"
                  : remaining <= 5
                    ? "text-warning"
                    : "text-primary";

              return (
                <div
                  key={order.id}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[4/3] bg-muted/30 overflow-hidden">
                    {product?.thumbnail_url ? (
                      <Image
                        src={product.thumbnail_url}
                        alt={product.title || ""}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBagIcon className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary backdrop-blur-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <Typography variant="caption" className="font-bold">Lunas</Typography>
                    </div>
                    <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white/90">
                      <CalendarDaysIcon className="w-3.5 h-3.5" />
                      <Typography variant="caption" className="font-medium text-white">{formatDate(order.created_at)}</Typography>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <Typography variant="body-base" className="font-bold line-clamp-1 group-hover:text-primary transition-colors">
                        {product?.title || "Produk Tanpa Nama"}
                      </Typography>
                      {product?.slug && (
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex items-center gap-1.5 mt-1 hover:text-primary transition-colors group/link"
                        >
                          <Typography variant="caption" color="muted" className="group-hover/link:text-primary transition-colors font-medium">
                            Halaman Produk
                          </Typography>
                          <DocumentMagnifyingGlassIcon className="w-3.5 h-3.5 text-muted-foreground group-hover/link:text-primary transition-colors" />
                        </Link>
                      )}
                    </div>

                    {/* Kuota download */}
                    <div className="rounded-xl bg-muted/30 border border-border px-4 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Typography variant="body-xs" color="muted" className="font-semibold uppercase tracking-widest">
                          Kuota Download
                        </Typography>
                        <Typography variant="body-sm" className="font-bold">
                          <span className={remainingColor}>
                            {downloadCount}
                          </span>{" "}
                          / {MAX_DOWNLOADS}
                        </Typography>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Typography variant="caption" className={`font-bold ${remainingColor}`}>
                          {remainingLabel}
                        </Typography>
                      </div>
                    </div>

                    <DownloadButton
                      orderId={order.id}
                      downloadCount={downloadCount}
                      productTitle={product?.title || "Produk Tanpa Nama"}
                      orderDate={order.created_at}
                      orderDisplayId={order.midtrans_order_id || order.id}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="relative rounded-xl border border-dashed border-border bg-card/40 py-24 text-center">
          {/* ── Empty state ── */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center border border-border">
              <ShoppingBagIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <Typography variant="h4" className="font-bold">
                Belum ada produk
              </Typography>
              <Typography variant="body-sm" color="muted" className="max-w-xs mx-auto font-medium">
                Koleksi produk digital Anda akan muncul di sini setelah transaksi berhasil dilakukan.
              </Typography>
            </div>
            <Link href="/products">
              <button className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover transition-all duration-200 active:scale-95">
                Jelajahi Katalog
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
