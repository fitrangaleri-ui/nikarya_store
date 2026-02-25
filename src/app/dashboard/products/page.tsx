import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ShoppingBag } from "lucide-react";
import { DownloadButton } from "../download-button";
import { getDashboardData, formatDate } from "../lib";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS = 25;

export default async function ProductsPage() {
    const { uniquePaidProducts } = await getDashboardData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Download className="h-6 w-6 text-primary" />
                    Produk Saya
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Produk digital yang sudah Anda beli dan tersedia untuk diunduh.
                </p>
            </div>

            {uniquePaidProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {uniquePaidProducts.map((order) => {
                        const product = order.products as {
                            title: string;
                            thumbnail_url: string | null;
                            slug: string;
                        } | null;

                        return (
                            <Card
                                key={order.id}
                                className="p-0 overflow-hidden dashboard-card border-0 hover:shadow-lg transition-shadow"
                            >
                                <div className="relative w-full aspect-square bg-slate-100 border-b rounded-t-xl overflow-hidden">
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
                                    <Badge className="absolute top-3 left-3 bg-emerald-500 text-white border-0 hover:bg-emerald-500 shadow-sm">
                                        Lunas
                                    </Badge>
                                </div>

                                <CardContent className="p-5 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-foreground line-clamp-1">
                                            {product?.title || "Produk Tanpa Nama"}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Dibeli {formatDate(order.created_at)}
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-muted-foreground">
                                                Kuota Download
                                            </span>
                                            <span
                                                className={
                                                    order.download_count >= MAX_DOWNLOADS
                                                        ? "text-red-500 font-medium"
                                                        : "text-foreground font-medium"
                                                }
                                            >
                                                {order.download_count}/{MAX_DOWNLOADS}
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
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                        Belum ada produk
                    </h3>
                    <p className="mt-1 text-muted-foreground max-w-sm mx-auto">
                        Anda belum memiliki produk yang sudah dibayar lunas.
                    </p>
                    <Link href="/products">
                        <button className="mt-4 text-sm font-medium text-primary hover:text-primary/80 hover:underline">
                            Jelajahi Katalog Produk →
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}