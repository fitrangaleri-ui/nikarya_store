import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Download,
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
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
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

    // Security: ensure this order belongs to the current user
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
    const hasProductDiscount = discountPrice !== null && discountPrice < regularPrice;
    const effectivePrice = discountPrice ?? regularPrice;
    const orderQty = order.quantity || 1;
    const subtotal = effectivePrice * orderQty;
    const promoDiscount = Number(order.discount_amount || 0);
    const finalTotal = Number(order.total_price);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Back link */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Detail Pesanan
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5 font-mono">
                        #{order.midtrans_order_id || order.id.substring(0, 16)}
                    </p>
                </div>
                <Badge className={`${cfg.color} text-sm px-3 py-1`}>
                    {cfg.label}
                </Badge>
            </div>

            {/* Product Card */}
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex-shrink-0">
                        {product?.thumbnail_url ? (
                            <Image
                                src={product.thumbnail_url}
                                alt={product.title || ""}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <ShoppingBag className="h-10 w-10 text-slate-300" />
                            </div>
                        )}
                    </div>
                    <CardContent className="p-6 flex-1 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                {product?.title || "Produk Tanpa Nama"}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {product?.slug ? (
                                    <Link
                                        href={`/products/${product.slug}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Lihat halaman produk →
                                    </Link>
                                ) : null}
                            </p>
                        </div>

                        {/* Status-specific content */}
                        {isPaid && (
                            <div className="pt-2 space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Kuota Download</span>
                                    <span
                                        className={
                                            order.download_count >= 25
                                                ? "text-red-500 font-medium"
                                                : "text-slate-700 font-medium"
                                        }
                                    >
                                        {order.download_count}/25
                                    </span>
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

                        {isPending && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">
                                        Menunggu Pembayaran
                                    </p>
                                    <p className="text-xs text-amber-600 mt-0.5">
                                        Selesaikan pembayaran untuk mengakses file produk.
                                    </p>
                                    {order.midtrans_order_id && (
                                        <Link
                                            href={`/payment-instruction?orderId=${order.midtrans_order_id}`}
                                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                        >
                                            Lihat instruksi pembayaran →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {!isPaid && !isPending && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-700">
                                        {order.payment_status === "EXPIRED"
                                            ? "Pesanan Kadaluarsa"
                                            : "Pembayaran Gagal"}
                                    </p>
                                    <p className="text-xs text-red-500 mt-0.5">
                                        Silakan buat pesanan baru untuk membeli produk ini.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>

            {/* Price Breakdown */}
            <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-500" />
                        Rincian Harga
                    </h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Harga Reguler</span>
                            <span
                                className={
                                    hasProductDiscount ? "line-through text-slate-400" : ""
                                }
                            >
                                {formatCurrency(regularPrice)}
                            </span>
                        </div>

                        {hasProductDiscount && (
                            <div className="flex justify-between text-slate-600">
                                <span className="flex items-center gap-1">
                                    <Tag className="h-3.5 w-3.5 text-emerald-500" />
                                    Harga Diskon
                                </span>
                                <span className="text-emerald-600 font-medium">
                                    {formatCurrency(discountPrice!)}
                                </span>
                            </div>
                        )}

                        {orderQty > 1 && (
                            <div className="flex justify-between text-slate-600">
                                <span>Jumlah</span>
                                <span>×{orderQty}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>

                        {promoDiscount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                                <span className="flex items-center gap-1">
                                    <Tag className="h-3.5 w-3.5" />
                                    Promo {order.promo_code ? `(${order.promo_code})` : ""}
                                </span>
                                <span>−{formatCurrency(promoDiscount)}</span>
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-2 flex justify-between font-semibold text-slate-900">
                            <span>Total Pembayaran</span>
                            <span className="text-lg">
                                {formatCurrency(finalTotal)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Info */}
            <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-500" />
                        Informasi Pembayaran
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="text-slate-500 flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5" /> Order ID
                            </p>
                            <p className="text-slate-900 font-mono text-xs">
                                {order.midtrans_order_id || order.id}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-slate-500 flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" /> Tanggal Pesan
                            </p>
                            <p className="text-slate-900">
                                {formatDateTime(order.created_at)}
                            </p>
                        </div>

                        {order.payment_method && (
                            <div className="space-y-1">
                                <p className="text-slate-500 flex items-center gap-1.5">
                                    <CreditCard className="h-3.5 w-3.5" /> Metode Pembayaran
                                </p>
                                <p className="text-slate-900 capitalize">
                                    {order.payment_method}
                                </p>
                            </div>
                        )}

                        {order.payment_gateway && (
                            <div className="space-y-1">
                                <p className="text-slate-500 flex items-center gap-1.5">
                                    <FileDown className="h-3.5 w-3.5" /> Gateway
                                </p>
                                <p className="text-slate-900 capitalize">
                                    {order.payment_gateway}
                                </p>
                            </div>
                        )}

                        {order.payment_confirmed_at && (
                            <div className="space-y-1">
                                <p className="text-slate-500 flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" /> Tanggal Pembayaran
                                </p>
                                <p className="text-slate-900">
                                    {formatDateTime(order.payment_confirmed_at)}
                                </p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className="text-slate-500 flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5" /> Status
                            </p>
                            <Badge className={cfg.color}>{cfg.label}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
