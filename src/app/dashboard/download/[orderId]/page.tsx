import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    ShoppingBag,
    Package,
    CalendarDays,
    Hash,
    ShieldCheck,
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

    // Security: ensure this order belongs to the current user
    if (order.user_id !== user.id) notFound();

    // Must be paid
    if (order.payment_status !== "PAID") {
        redirect("/dashboard");
    }

    const product = order.products as {
        id: string;
        title: string;
        slug: string;
        thumbnail_url: string | null;
        price: number;
        discount_price: number | null;
        drive_file_url: string | null;
    } | null;

    const remaining = MAX_DOWNLOADS - (order.download_count || 0);
    const progress =
        ((order.download_count || 0) / MAX_DOWNLOADS) * 100;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back link */}
            <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Produk Saya
            </Link>

            {/* Product Card */}
            <Card className="overflow-hidden dashboard-card border-0">
                {/* Thumbnail */}
                <div className="relative w-full aspect-[2/1] bg-slate-100">
                    {product?.thumbnail_url ? (
                        <Image
                            src={product.thumbnail_url}
                            alt={product.title || ""}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-slate-300" />
                        </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-emerald-500 text-white border-0 hover:bg-emerald-500 shadow-sm">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Lunas
                    </Badge>
                </div>

                <CardContent className="p-6 space-y-5">
                    {/* Product Info */}
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            {product?.title || "Produk Tanpa Nama"}
                        </h1>
                        {product?.slug && (
                            <Link
                                href={`/products/${product.slug}`}
                                className="text-sm text-primary hover:underline mt-1 inline-block"
                            >
                                Lihat halaman produk →
                            </Link>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-start gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                    Order ID
                                </p>
                                <p className="text-xs font-mono text-foreground mt-0.5">
                                    #{(order.midtrans_order_id || order.id).substring(0, 16)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                    Tanggal Beli
                                </p>
                                <p className="text-xs text-foreground mt-0.5">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Download Counter */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Kuota Download
                            </span>
                            <span
                                className={`font-bold ${remaining <= 0
                                        ? "text-red-500"
                                        : remaining <= 5
                                            ? "text-amber-500"
                                            : "text-foreground"
                                    }`}
                            >
                                {order.download_count || 0} / {MAX_DOWNLOADS}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden border border-border/30">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${remaining <= 0
                                        ? "bg-red-500"
                                        : remaining <= 5
                                            ? "bg-amber-500"
                                            : "bg-primary"
                                    }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            {remaining <= 0
                                ? "Kuota download habis."
                                : `Sisa ${remaining} download tersedia`}
                        </p>
                    </div>

                    {/* Download Button */}
                    <DownloadButton
                        orderId={order.id}
                        downloadCount={order.download_count || 0}
                        productTitle={product?.title || "Produk Tanpa Nama"}
                        orderDate={order.created_at}
                        orderDisplayId={order.midtrans_order_id || order.id}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
