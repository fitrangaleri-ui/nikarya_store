import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Eye, AlertCircle, ArrowRight } from "lucide-react";
import {
  getDashboardData,
  formatCurrency,
  formatDate,
  statusConfig,
} from "../lib";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { allOrders } = await getDashboardData();

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
              <ClipboardList className="w-3 h-3" />
              Riwayat Pesanan
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Riwayat Pesanan
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
              Semua riwayat transaksi dan pesanan Anda.
            </p>
          </div>

          {/* Icon dekorasi + badge jumlah */}
          <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <ClipboardList className="w-6 h-6 text-primary-foreground" />
            </div>
            {allOrders.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-white/15 border border-white/20 text-primary-foreground text-[11px] font-bold">
                {allOrders.length} pesanan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* ORDER LIST / EMPTY STATE                            */}
      {/* ════════════════════════════════════════════════════ */}
      {allOrders.length > 0 ? (
        <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
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
        // ── Empty state ──
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
              <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Belum ada pesanan
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Kamu belum memiliki riwayat pesanan.
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
