import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  XCircle,
  ShoppingBag,
  Package,
  CreditCard,
  CalendarDays,
  Tag,
  Hash,
  FileDown,
  AlertCircle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { DownloadButton } from "../../download-button";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PAID: {
    label: "Lunas",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  PENDING: {
    label: "Menunggu Pembayaran",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    bgColor: "bg-amber-50 border-amber-200",
  },
  PENDING_MANUAL: {
    label: "Menunggu Konfirmasi",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    bgColor: "bg-amber-50 border-amber-200",
  },
  EXPIRED: {
    label: "Kadaluarsa",
    color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-50",
    bgColor: "bg-red-50 border-red-200",
  },
  FAILED: {
    label: "Gagal",
    color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-50",
    bgColor: "bg-red-50 border-red-200",
  },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    .eq("id", id)
    .single();

  if (error || !order) notFound();

  if (order.user_id !== user.id) notFound();

  const product = order.products as {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    price: number;
    discount_price: number | null;
    drive_file_url: string | null;
  } | null;

  const cfg = statusConfig[order.payment_status] || statusConfig.FAILED;
  const isPaid = order.payment_status === "PAID";
  const isPending =
    order.payment_status === "PENDING" ||
    order.payment_status === "PENDING_MANUAL";
  const regularPrice = Number(product?.price || 0);
  const discountPrice = product?.discount_price
    ? Number(product.discount_price)
    : null;
  const hasProductDiscount =
    discountPrice !== null && discountPrice < regularPrice;
  const effectivePrice = discountPrice ?? regularPrice;
  const orderQty = order.quantity || 1;
  const subtotal = effectivePrice * orderQty;
  const promoDiscount = Number(order.discount_amount || 0);
  const finalTotal = Number(order.total_price);

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

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-[-0.005em] mb-3 hover:bg-white/25 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Riwayat Pesanan
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Detail Pesanan
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 font-mono">
              #{order.midtrans_order_id || order.id.substring(0, 16)}
            </p>
          </div>

          {/* Icon dekorasi + status badge */}
          <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <ClipboardList className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-white/15 border border-white/20 text-primary-foreground text-[11px] font-bold">
              {cfg.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Product Card ── */}
        <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
          {/* Section header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border/50 bg-muted/30">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Produk
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail 1:1 */}
            <div className="relative w-full sm:w-48 aspect-square bg-muted/30 flex-shrink-0 overflow-hidden">
              {product?.thumbnail_url ? (
                <Image
                  src={product.thumbnail_url}
                  alt={product.title || ""}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
                </div>
              )}
              {/* Status badge overlay */}
              <div className="absolute top-3 left-3">
                <Badge className={cfg.color}>{cfg.label}</Badge>
              </div>
            </div>

            <div className="p-6 flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-foreground leading-snug">
                  {product?.title || "Produk Tanpa Nama"}
                </h2>
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

              {/* Paid: download quota + button */}
              {isPaid && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-muted/30 border border-border/40 px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">
                        Kuota Download
                      </span>
                      <span
                        className={`font-bold ${
                          order.download_count >= 25
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {order.download_count}/25
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          order.download_count >= 25
                            ? "bg-red-500"
                            : order.download_count >= 20
                              ? "bg-amber-500"
                              : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min((order.download_count / 25) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <DownloadButton
                    orderId={order.id}
                    downloadCount={order.download_count}
                    productTitle={product?.title || "Produk Tanpa Nama"}
                    orderDate={order.created_at}
                    orderDisplayId={order.midtrans_order_id || order.id}
                  />
                </div>
              )}

              {/* Pending */}
              {isPending && (
                <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 px-4 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-700">
                      Menunggu Pembayaran
                    </p>
                    <p className="text-xs text-amber-600/80 mt-0.5">
                      Selesaikan pembayaran untuk mengakses file produk.
                    </p>
                    {order.midtrans_order_id && (
                      <Link
                        href={`/payment-instruction?orderId=${order.midtrans_order_id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold mt-1.5 transition-colors"
                      >
                        Lihat instruksi pembayaran
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Failed / Expired */}
              {!isPaid && !isPending && (
                <div className="rounded-2xl bg-red-500/5 border border-red-500/20 px-4 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-600">
                      {order.payment_status === "EXPIRED"
                        ? "Pesanan Kadaluarsa"
                        : "Pembayaran Gagal"}
                    </p>
                    <p className="text-xs text-red-500/80 mt-0.5">
                      Silakan buat pesanan baru untuk membeli produk ini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Price Breakdown ── */}
        <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border/50 bg-muted/30">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Rincian Harga
            </h3>
          </div>

          <div className="px-6 py-5 space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Harga Reguler</span>
              <span
                className={
                  hasProductDiscount
                    ? "line-through text-muted-foreground/50"
                    : "font-semibold text-foreground"
                }
              >
                {formatCurrency(regularPrice)}
              </span>
            </div>

            {hasProductDiscount && (
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-emerald-500" />
                  Harga Diskon
                </span>
                <span className="text-emerald-600 font-semibold">
                  {formatCurrency(discountPrice!)}
                </span>
              </div>
            )}

            {orderQty > 1 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Jumlah</span>
                <span className="font-semibold text-foreground">
                  ×{orderQty}
                </span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Promo {order.promo_code ? `(${order.promo_code})` : ""}
                </span>
                <span className="font-semibold">
                  −{formatCurrency(promoDiscount)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-dashed border-border/50 flex justify-between items-end">
              <span className="font-bold text-foreground">
                Total Pembayaran
              </span>
              <span className="text-xl font-extrabold text-primary tracking-tight">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Payment Info ── */}
        <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border/50 bg-muted/30">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Informasi Pembayaran
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
            {/* Order ID */}
            <div className="px-6 py-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> Order ID
              </p>
              <p className="text-sm font-mono text-foreground break-all">
                {order.midtrans_order_id || order.id}
              </p>
            </div>

            {/* Tanggal Pesan */}
            <div className="px-6 py-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" /> Tanggal Pesan
              </p>
              <p className="text-sm font-medium text-foreground">
                {formatDateTime(order.created_at)}
              </p>
            </div>

            {/* Metode Pembayaran */}
            {order.payment_method && (
              <div className="px-6 py-4 space-y-1 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" /> Metode Pembayaran
                </p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {order.payment_method}
                </p>
              </div>
            )}

            {/* Gateway */}
            {order.payment_gateway && (
              <div className="px-6 py-4 space-y-1 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <FileDown className="h-3 w-3" /> Gateway
                </p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {order.payment_gateway}
                </p>
              </div>
            )}

            {/* Tanggal Pembayaran */}
            {order.payment_confirmed_at && (
              <div className="px-6 py-4 space-y-1 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" /> Tanggal Pembayaran
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDateTime(order.payment_confirmed_at)}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="px-6 py-4 space-y-1 border-t border-border/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" /> Status
              </p>
              <Badge className={cfg.color}>{cfg.label}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
