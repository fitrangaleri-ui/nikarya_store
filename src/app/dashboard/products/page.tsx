// ============================================================
// FILE: src/app/dashboard/products/page.tsx
// PERUBAHAN: Kuota download kini dikelola oleh client component
//            ProductDownloadSection agar bisa update real-time
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
import { ProductDownloadSection } from "./product-download-section";
import { getDashboardData, formatDate } from "../lib";
import { Typography } from "@/components/ui/typography";
import { HeaderBanner } from "../header-banner";
import { DashboardStatusBadge } from "../status-badge";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { uniquePaidProducts } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════ */}
      {/* HEADER BANNER                                        */}
      {/* ════════════════════════════════════════════════════ */}

      {/* ── Banner: Header ── */}
      <HeaderBanner
        title="Produk Digital Saya"
        description="Koleksi produk digital yang telah Anda beli. Akses unduhan tersedia sesuai kuota."
        badgeLabel="Produk Saya"
        badgeIcon={<InboxStackIcon className="w-3.5 h-3.5 text-white" />}
        actionIcon={<SparklesIcon className="w-7 h-7 text-white" />}
        extraBadge={uniquePaidProducts.length > 0 ? `${uniquePaidProducts.length} Produk Koleksi` : undefined}
      />

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
                    <div className="absolute top-3 left-3">
                      <DashboardStatusBadge
                        status="PAID"
                        surface="overlay"
                        size="sm"
                      />
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

                    {/* Kuota download + Tombol — dikelola oleh client component */}
                    <ProductDownloadSection
                      orderId={order.id}
                      initialDownloadCount={downloadCount}
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
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover transition-all duration-200 active:scale-95"
            >
              Jelajahi Katalog
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
