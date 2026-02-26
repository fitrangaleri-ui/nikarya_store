// ============================================================
// FILE: src/app/dashboard/download/[orderId]/page.tsx
// PERUBAHAN: Redesign visual — logika & data tidak diubah
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  CalendarDays,
  Hash,
  ShieldCheck,
  Download,
  ExternalLink,
} from "lucide-react";
import { DownloadButton } from "../../download-button";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS = 25;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  // ── Data fetching & auth — tidak diubah ──────────────────
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .select(
      "*, products(id, title, slug, thumbnail_url, price, discount_price, drive_file_url)",
    )
    .eq("id", orderId)
    .single();

  if (error || !order) notFound();
  if (order.user_id !== user.id) notFound();
  if (order.payment_status !== "PAID") redirect("/dashboard");

  const product = order.products as {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    price: number;
    discount_price: number | null;
    drive_file_url: string | null;
  } | null;

  const downloadCount = order.download_count || 0;
  const remaining = MAX_DOWNLOADS - downloadCount;
  const progress = (downloadCount / MAX_DOWNLOADS) * 100;

  // Warna progress bar sesuai sisa kuota
  const progressColor =
    remaining <= 0
      ? "bg-red-500"
      : remaining <= 5
        ? "bg-amber-500"
        : "bg-primary";
  const remainingColor =
    remaining <= 0
      ? "text-red-500"
      : remaining <= 5
        ? "text-amber-500"
        : "text-emerald-600";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Back link ── */}
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
        Kembali ke Produk Saya
      </Link>

      {/* ════════════════════════════════════════════════════ */}
      {/* THUMBNAIL HERO                                       */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden bg-muted/30 border border-border/40 shadow-xl shadow-primary/5">
        {product?.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.title || ""}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/20" />
          </div>
        )}

        {/* Gradient overlay bawah untuk legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Badge Lunas */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-emerald-500 text-white text-[11px] font-bold shadow-lg">
          <ShieldCheck className="h-3.5 w-3.5" />
          Pembayaran Lunas
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* PRODUCT INFO                                         */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
        {/* Header info produk */}
        <div className="px-6 pt-6 pb-5 border-b border-border/40">
          <h1 className="text-xl font-extrabold text-foreground leading-snug tracking-tight">
            {product?.title || "Produk Tanpa Nama"}
          </h1>
          {product?.slug && (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Lihat halaman produk
            </Link>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Order Details ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Order ID */}
            <div className="flex items-start gap-3 rounded-2xl bg-muted/40 border border-border/40 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50 mt-0.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Order ID
                </p>
                <p className="text-xs font-mono text-foreground mt-1 truncate">
                  #{(order.midtrans_order_id || order.id).substring(0, 16)}
                </p>
              </div>
            </div>

            {/* Tanggal Beli */}
            <div className="flex items-start gap-3 rounded-2xl bg-muted/40 border border-border/40 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50 mt-0.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Tanggal Beli
                </p>
                <p className="text-xs text-foreground mt-1">
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Download Quota ── */}
          <div className="rounded-2xl border border-border/40 bg-muted/20 px-5 py-4 space-y-3">
            {/* Label + angka */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Package className="h-4 w-4 text-primary" />
                Kuota Download
              </span>
              <span className="text-sm font-bold text-muted-foreground">
                <span className={`font-extrabold ${remainingColor}`}>
                  {downloadCount}
                </span>{" "}
                / {MAX_DOWNLOADS}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* Keterangan sisa */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {remaining <= 0
                  ? "Kuota download habis"
                  : `Tersisa ${remaining} download`}
              </span>
              {/* Indikator warna */}
              <span className={`font-semibold ${remainingColor}`}>
                {remaining <= 0
                  ? "Habis"
                  : remaining <= 5
                    ? "Hampir habis"
                    : "Tersedia"}
              </span>
            </div>
          </div>

          {/* ── Download Button ── */}
          <div className="pt-1">
            <DownloadButton
              orderId={order.id}
              downloadCount={downloadCount}
              productTitle={product?.title || "Produk Tanpa Nama"}
              orderDate={order.created_at}
              orderDisplayId={order.midtrans_order_id || order.id}
            />
          </div>

          {/* ── Catatan kecil ── */}
          <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed">
            File akan otomatis terunduh. Hubungi support jika mengalami kendala.
          </p>
        </div>
      </div>
    </div>
  );
}
