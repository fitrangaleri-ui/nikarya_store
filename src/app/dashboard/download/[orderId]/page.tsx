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
  ArrowLeftIcon,
  ShoppingBagIcon,
  CubeIcon,
  CalendarDaysIcon,
  HashtagIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { DownloadButton } from "../../download-button";
import { DashboardStatusBadge } from "../../status-badge";
import { MAX_DOWNLOADS, DOWNLOAD_WARNING_THRESHOLD } from "@/lib/constants";
import { formatDate } from "../../lib";

export const dynamic = "force-dynamic";



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
      "*, products(id, title, slug, thumbnail_url, price, discount_price)",
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
  } | null;

  const downloadCount = order.download_count || 0;
  const remaining = MAX_DOWNLOADS - downloadCount;
  const progress = (remaining / MAX_DOWNLOADS) * 100;

  // Warna progress bar sesuai sisa kuota (menggunakan semantic tokens)
  const progressColor =
    remaining <= 0
      ? "bg-destructive"
      : remaining <= 5
        ? "bg-warning"
        : "bg-primary";

  const statusColor: "destructive" | "warning" | "success" =
    remaining <= 0
      ? "destructive"
      : remaining <= 5
        ? "warning"
        : "success";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Back link ── */}
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1.5 group outline-none"
      >
        <ArrowLeftIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-0.5 transition-all duration-200" />
        <Typography variant="body-sm" color="muted" className="group-hover:text-primary transition-colors">
          Kembali ke Produk Saya
        </Typography>
      </Link>

      {/* ════════════════════════════════════════════════════ */}
      {/* THUMBNAIL HERO                                       */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden bg-muted/30 border border-border/40">
        {product?.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.title || ""}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBagIcon className="h-14 w-14 text-muted-foreground/20" />
          </div>
        )}

        {/* Gradient overlay bawah untuk legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Badge Lunas */}
        <div className="absolute top-4 left-4">
          <DashboardStatusBadge
            status="PAID"
            surface="overlay"
            labelOverride="Pembayaran Lunas"
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* PRODUCT INFO                                         */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="dashboard-card overflow-hidden">
        {/* Header info produk */}
        <div className="px-6 pt-6 pb-5 border-b border-border/40">
          <Typography variant="h5" as="h1" className="leading-snug">
            {product?.title || "Produk Tanpa Nama"}
          </Typography>
          {product?.slug && (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 mt-2 group"
            >
              <ArrowTopRightOnSquareIcon className="h-3 w-3 text-primary group-hover:text-primary/80 transition-colors" />
              <Typography variant="body-xs" color="primary" className="font-medium group-hover:text-primary/80 transition-colors">
                Lihat halaman produk
              </Typography>
            </Link>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Order Details ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Order ID */}
            <div className="flex items-start gap-3 rounded-2xl bg-muted/40 border border-border/40 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50 mt-0.5">
                <HashtagIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <Typography variant="caption" color="muted" className="font-bold uppercase text-[10px]">
                  Order ID
                </Typography>
                <Typography variant="body-xs" className="font-mono mt-1 truncate">
                  #{(order.midtrans_order_id || order.id).substring(0, 16)}
                </Typography>
              </div>
            </div>

            {/* Tanggal Beli */}
            <div className="flex items-start gap-3 rounded-2xl bg-muted/40 border border-border/40 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50 mt-0.5">
                <CalendarDaysIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <Typography variant="caption" color="muted" className="font-bold uppercase  text-[10px]">
                  Tanggal Beli
                </Typography>
                <Typography variant="body-xs" className="mt-1">
                  {formatDate(order.created_at)}
                </Typography>
              </div>
            </div>
          </div>

          {/* ── Download Quota ── */}
          <div className="rounded-2xl border border-border/40 bg-muted/20 px-5 py-4 space-y-3">
            {/* Label + angka */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CubeIcon className="h-4 w-4 text-primary" />
                <Typography variant="body-sm" className="font-semibold">
                  Kuota Download
                </Typography>
              </span>
              <Typography variant="body-sm" color="muted" className="font-bold">
                <Typography as="span" variant="body-sm" color={statusColor} className="font-extrabold">
                  {remaining}
                </Typography>{" "}
                / {MAX_DOWNLOADS}
              </Typography>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* Keterangan sisa */}
            <div className="flex items-center justify-between">
              <Typography variant="caption" color="muted">
                {remaining <= 0
                  ? "Kuota download habis"
                  : `Tersisa ${remaining} download`}
              </Typography>
              {/* Indikator warna */}
              <Typography variant="caption" color={statusColor} className="font-semibold">
                {remaining <= 0
                  ? "Habis"
                  : remaining <= 5
                    ? "Hampir habis"
                    : "Tersedia"}
              </Typography>
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
          <Typography variant="caption" align="center" color="muted" className="opacity-60 leading-relaxed block">
            File akan otomatis terunduh. Hubungi support jika mengalami kendala.
          </Typography>
        </div>
      </div>
    </div>
  );
}
