// ============================================================
// FILE: src/app/dashboard/products/page.tsx
// FIX: Hapus karakter */} yang invalid pada komentar empty state
// ============================================================

import Image from "next/image";
import Link from "next/link";
import {
  Download,
  ShoppingBag,
  CalendarDays,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DownloadButton } from "../download-button";
import { getDashboardData, formatDate } from "../lib";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS = 25;

export default async function ProductsPage() {
  const { uniquePaidProducts } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════ */}
      {/* HEADER BANNER                                        */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-8 md:px-10 shadow-lg shadow-primary/20">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none blur-[80px]"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none blur-[60px]"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />

        {/* Glass shimmer overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        />

        {/* Stroke border */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />

        {/* Konten */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-[-0.005em] mb-3">
              <Download className="w-3 h-3" />
              Produk Saya
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Produk Digital Saya
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
              Produk yang sudah dibeli dan tersedia untuk diunduh.
            </p>
          </div>

          {/* Icon dekorasi + badge jumlah */}
          <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            {uniquePaidProducts.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-white/15 border border-white/20 text-primary-foreground text-[11px] font-bold">
                {uniquePaidProducts.length} produk
              </span>
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
                  ? "bg-red-500"
                  : remaining <= 5
                    ? "bg-amber-500"
                    : "bg-primary";

              const remainingLabel =
                remaining <= 0 ? "Habis" : `${remaining} tersisa`;

              const remainingColor =
                remaining <= 0
                  ? "text-red-500"
                  : remaining <= 5
                    ? "text-amber-500"
                    : "text-emerald-600";

              return (
                <div
                  key={order.id}
                  className="group rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 transition-all duration-200"
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
                        <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      Lunas
                    </div>
                    <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white/90 text-[10px]">
                      <CalendarDays className="w-3 h-3" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {product?.title || "Produk Tanpa Nama"}
                      </h3>
                      {product?.slug && (
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex items-center gap-1 mt-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          Lihat halaman produk
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    {/* Kuota download */}
                    <div className="rounded-2xl bg-muted/30 border border-border/40 px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                          Kuota Download
                        </span>
                        <span className="font-bold text-muted-foreground">
                          <span className={`font-extrabold ${remainingColor}`}>
                            {downloadCount}
                          </span>{" "}
                          / {MAX_DOWNLOADS}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p
                        className={`text-[11px] font-semibold text-right ${remainingColor}`}
                      >
                        {remainingLabel}
                      </p>
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
        // ── Empty state ──────────────────────────────────────
        <div className="relative rounded-3xl border border-dashed border-border/60 bg-card/40 overflow-hidden py-20 text-center">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none blur-[80px]"
            style={{
              background: "color-mix(in oklch, var(--primary) 6%, transparent)",
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center border border-border/50">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Belum ada produk
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Kamu belum memiliki produk yang sudah dibayar lunas.
              </p>
            </div>
            <Link href="/products">
              <button className="inline-flex items-center gap-2 mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-sm shadow-primary/30">
                Jelajahi Katalog
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
