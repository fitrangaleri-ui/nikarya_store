import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Receipt, Eye, AlertCircle } from "lucide-react";
import { getDashboardData, formatCurrency, formatDate, statusConfig } from "../lib";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const { allOrders } = await getDashboardData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Receipt className="h-6 w-6 text-primary" />
                    Riwayat Pesanan
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Semua riwayat transaksi dan pesanan Anda.
                </p>
            </div>

            {allOrders.length > 0 ? (
                <div className="dashboard-card overflow-hidden">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/40">
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                        Order ID
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                        Produk
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                        Tanggal
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                        Total
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                        Status
                                    </th>
                                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {allOrders.map((order) => {
                                    const product = order.products as {
                                        title: string;
                                    } | null;
                                    const cfg =
                                        statusConfig[order.payment_status] || statusConfig.FAILED;
                                    return (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                                                #
                                                {order.midtrans_order_id?.substring(0, 16) ||
                                                    order.id.substring(0, 8)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground font-medium max-w-[200px] truncate">
                                                {product?.title || "Produk"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-foreground">
                                                {formatCurrency(Number(order.total_price))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={cfg.color}>
                                                    {cfg.icon}
                                                    <span className="ml-1">{cfg.label}</span>
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-border/30">
                        {allOrders.map((order) => {
                            const product = order.products as {
                                title: string;
                            } | null;
                            const cfg =
                                statusConfig[order.payment_status] || statusConfig.FAILED;
                            return (
                                <div key={order.id} className="p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-foreground truncate">
                                                {product?.title || "Produk"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <Badge className={cfg.color}>
                                            {cfg.icon}
                                            <span className="ml-1">{cfg.label}</span>
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-foreground">
                                            {formatCurrency(Number(order.total_price))}
                                        </p>
                                        <Link
                                            href={`/dashboard/orders/${order.id}`}
                                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Detail
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Belum ada riwayat pesanan.</p>
                </div>
            )}
        </div>
    );
}
