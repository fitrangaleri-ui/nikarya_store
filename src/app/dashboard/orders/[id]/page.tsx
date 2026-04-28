import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ClockIcon,
  XCircleIcon,
  ShoppingBagIcon,
  CubeIcon,
  CreditCardIcon,
  CalendarIcon,
  TagIcon,
  HashtagIcon,
  DocumentArrowDownIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { DownloadButton } from "../../download-button";
import { Typography } from "@/components/ui/typography";
import { HeaderBanner } from "../../header-banner";
import { DashboardStatusBadge, getDashboardStatusMeta } from "../../status-badge";
import { formatCurrency, formatDateTime } from "../../lib";
import { MAX_DOWNLOADS, DOWNLOAD_WARNING_THRESHOLD } from "@/lib/constants";

export const dynamic = "force-dynamic";



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
      "*, products(id, title, slug, thumbnail_url, price, discount_price)",
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
  } | null;

  const cfg = getDashboardStatusMeta(order.payment_status);
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
    <div className="space-y-6">
      {/* ── Banner: Header ── */}
      <HeaderBanner
        title="Detail Pesanan"
        description={`#${order.midtrans_order_id || order.id.substring(0, 16)}`}
        badgeLabel="Riwayat Pesanan"
        badgeIcon={<ArrowLeftIcon className="w-3.5 h-3.5 text-white" />}
        badgeHref="/dashboard/orders"
        actionIcon={<ClipboardDocumentListIcon className="w-8 h-8 text-white" />}
        extraBadge={
          order.payment_status === "PAID" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <Typography variant="caption" className="font-bold text-white">
                {cfg.label}
              </Typography>
            </>
          ) : (
            cfg.label
          )
        }
      />

      <div className="space-y-6">
        {/* ── Product Card ── */}
        <div className="dashboard-card overflow-hidden !bg-card border-border">
          {/* Section header consistent with admin style */}
          <div className="bg-primary px-6 py-4 md:px-7 md:py-4 border-b border-primary-bg/20 flex items-center gap-2.5">
            <ShoppingBagIcon className="h-5 w-5 text-white" />
            <Typography variant="h6" as="h2" className="text-white font-bold">
              Produk
            </Typography>
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
                  <ShoppingBagIcon className="h-10 w-10 text-muted-foreground/20" />
                </div>
              )}
              {/* Status badge overlay */}
              <div className="absolute top-3 left-3">
                <DashboardStatusBadge
                  status={order.payment_status}
                  surface="overlay"
                  size="sm"
                />
              </div>
            </div>

            <div className="p-6 flex-1 space-y-4">
              <div>
                <Typography variant="h5" as="h2" className="leading-snug">
                  {product?.title || "Produk Tanpa Nama"}
                </Typography>
                {product?.slug && (
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-muted-foreground hover:text-primary transition-all font-medium"
                  >
                    Lihat halaman produk
                    <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Paid: download quota + button */}
              {isPaid && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-muted/30 border border-border/40 px-5 py-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Typography variant="body-xs" className="font-bold text-muted-foreground uppercase tracking-wider">
                        Kuota Download
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className={`font-black ${order.download_count >= MAX_DOWNLOADS
                          ? "text-destructive"
                          : "text-foreground"
                          }`}
                      >
                        {order.download_count}/{MAX_DOWNLOADS}
                      </Typography>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-in-out ${order.download_count >= MAX_DOWNLOADS
                          ? "bg-destructive"
                          : (MAX_DOWNLOADS - order.download_count) <= DOWNLOAD_WARNING_THRESHOLD
                            ? "bg-warning"
                            : "bg-primary shadow-[0_0_8px_rgba(1,105,111,0.4)]"
                          }`}
                        style={{
                          width: `${Math.min((order.download_count / MAX_DOWNLOADS) * 100, 100)}%`,
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
                <div className="rounded-2xl bg-warning/5 border border-warning/20 px-5 py-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                    <ClockIcon className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <Typography variant="body-sm" className="font-bold text-warning">
                      Menunggu Pembayaran
                    </Typography>
                    <Typography variant="body-xs" className="text-muted-foreground mt-0.5">
                      Selesaikan pembayaran untuk mengakses file produk.
                    </Typography>
                    {order.midtrans_order_id && (
                      <Link
                        href={`/payment-instruction?orderId=${order.midtrans_order_id}`}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary-hover font-bold mt-2 transition-all"
                      >
                        Lihat instruksi pembayaran
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Failed / Expired */}
              {!isPaid && !isPending && (
                <div className="rounded-2xl bg-destructive/5 border border-destructive/20 px-5 py-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <XCircleIcon className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <Typography variant="body-sm" className="font-bold text-destructive">
                      {order.payment_status === "EXPIRED"
                        ? "Pesanan Kadaluarsa"
                        : "Pembayaran Gagal"}
                    </Typography>
                    <Typography variant="body-xs" className="text-muted-foreground mt-0.5">
                      Silakan buat pesanan baru untuk membeli produk ini.
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Price Breakdown ── */}
        <div className="dashboard-card overflow-hidden !bg-card border-border">
          <div className="bg-primary px-6 py-4 md:px-7 md:py-4 border-b border-primary-bg/20 flex items-center gap-2.5">
            <CubeIcon className="h-5 w-5 text-white" />
            <Typography variant="h6" as="h2" className="text-white font-bold">
              Rincian Harga
            </Typography>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <Typography variant="body-sm" color="muted">Harga Reguler</Typography>
              <Typography
                variant="body-sm"
                className={
                  hasProductDiscount
                    ? "line-through text-muted-foreground/50"
                    : "font-bold"
                }
              >
                {formatCurrency(regularPrice)}
              </Typography>
            </div>

            {hasProductDiscount && (
              <div className="flex justify-between items-center">
                <Typography variant="body-sm" color="muted" className="flex items-center gap-1.5">
                  <TagIcon className="h-3.5 w-3.5 text-success" />
                  Harga Diskon
                </Typography>
                <Typography variant="body-sm" className="text-success font-bold">
                  {formatCurrency(discountPrice!)}
                </Typography>
              </div>
            )}

            {orderQty > 1 && (
              <div className="flex justify-between items-center">
                <Typography variant="body-sm" color="muted">Jumlah</Typography>
                <Typography variant="body-sm" className="font-bold uppercase tracking-tight">
                  ×{orderQty}
                </Typography>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Typography variant="body-sm" color="muted">Subtotal</Typography>
              <Typography variant="body-sm" className="font-bold">
                {formatCurrency(subtotal)}
              </Typography>
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between items-center bg-primary/5 rounded-xl px-3 py-2 -mx-1 border border-primary/10">
                <Typography variant="body-sm" className="flex items-center gap-1.5 text-primary font-bold">
                  <TagIcon className="h-3.5 w-3.5" />
                  Promo {order.promo_code ? `(${order.promo_code})` : ""}
                </Typography>
                <Typography variant="body-sm" className="font-black text-primary">
                  −{formatCurrency(promoDiscount)}
                </Typography>
              </div>
            )}

            <div className="pt-5 border-t border-dashed border-border flex justify-between items-end">
              <Typography variant="body-base" className="font-black uppercase tracking-tight">
                Total Pembayaran
              </Typography>
              <Typography variant="h3" className="text-primary tracking-tighter">
                {formatCurrency(finalTotal)}
              </Typography>
            </div>
          </div>
        </div>

        {/* ── Payment Info ── */}
        <div className="dashboard-card overflow-hidden !bg-card border-border">
          <div className="bg-primary px-6 py-4 md:px-7 md:py-4 border-b border-primary-bg/20 flex items-center gap-2.5">
            <CreditCardIcon className="h-5 w-5 text-white" />
            <Typography variant="h6" as="h2" className="text-white font-bold">
              Informasi Pembayaran
            </Typography>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
            {/* Order ID */}
            <div className="px-6 py-5 space-y-1.5">
              <Typography variant="caption" color="muted" className="font-bold uppercase  flex items-center gap-2">
                <HashtagIcon className="h-3.5 w-3.5 text-primary/60" /> Order ID
              </Typography>
              <Typography variant="body-sm" className="font-mono break-all font-medium">
                {order.midtrans_order_id || order.id}
              </Typography>
            </div>

            {/* Tanggal Pesan */}
            <div className="px-6 py-5 space-y-1.5">
              <Typography variant="caption" color="muted" className="font-bold uppercase  flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 text-primary/60" /> Tanggal Pesan
              </Typography>
              <Typography variant="body-sm" className="font-bold">
                {formatDateTime(order.created_at)}
              </Typography>
            </div>

            {/* Metode Pembayaran */}
            {order.payment_method && (
              <div className="px-6 py-5 space-y-1.5 border-t border-border/40">
                <Typography variant="caption" color="muted" className="font-bold uppercase  flex items-center gap-2">
                  <CreditCardIcon className="h-3.5 w-3.5 text-primary/60" /> Metode Pembayaran
                </Typography>
                <Typography variant="body-sm" className="font-bold capitalize">
                  {order.payment_method}
                </Typography>
              </div>
            )}

            {/* Gateway */}
            {order.payment_gateway && (
              <div className="px-6 py-5 space-y-1.5 border-t border-border/40">
                <Typography variant="caption" color="muted" className="font-bold uppercase  flex items-center gap-2">
                  <DocumentArrowDownIcon className="h-3.5 w-3.5 text-primary/60" /> Gateway
                </Typography>
                <Typography variant="body-sm" className="font-bold capitalize">
                  {order.payment_gateway}
                </Typography>
              </div>
            )}

            {/* Tanggal Pembayaran */}
            {order.payment_confirmed_at && (
              <div className="px-6 py-5 space-y-1.5 border-t border-border/40">
                <Typography variant="caption" color="muted" className="font-bold uppercase  flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary/60" /> Tanggal Pembayaran
                </Typography>
                <Typography variant="body-sm" className="font-bold">
                  {formatDateTime(order.payment_confirmed_at)}
                </Typography>
              </div>
            )}

            {/* Status */}
            <div className="px-6 py-5 space-y-2 border-t border-border/40">
              <Typography variant="caption" color="muted" className="font-bold uppercase  flex items-center gap-2">
                <ExclamationCircleIcon className="h-3.5 w-3.5 text-primary/60" /> Status
              </Typography>
              <DashboardStatusBadge
                status={order.payment_status}
                size="md"
                showPulseForPaid
                className="w-fit px-4 py-1.5"
                labelClassName="font-black uppercase tracking-wider font-sans"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
