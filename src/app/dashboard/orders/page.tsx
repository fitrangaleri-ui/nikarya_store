import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardDocumentListIcon,
  EyeIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  getDashboardData,
  formatCurrency,
  formatDate,
} from "../lib";
import { Typography } from "@/components/ui/typography";
import { HeaderBanner } from "../header-banner";
import { DashboardStatusBadge } from "../status-badge";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { allOrders } = await getDashboardData();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ════════════════════════════════════════════════════ */}
      {/* HEADER BANNER                                        */}
      {/* ════════════════════════════════════════════════════ */}
      {/* ── Banner: Header ── */}
      <HeaderBanner
        title="Riwayat Pesanan"
        description="Kelola dan pantau semua transaksi digital Anda di satu tempat yang aman."
        badgeLabel="Dashboard Pelanggan"
        badgeIcon={<ClipboardDocumentListIcon className="w-3.5 h-3.5 text-white" />}
        actionIcon={<ClipboardDocumentListIcon className="w-8 h-8 text-white" />}
        extraBadge={allOrders.length > 0 ? `${allOrders.length} Pesanan Terdaftar` : undefined}
      />

      {/* ════════════════════════════════════════════════════ */}
      {/* ORDER LIST / EMPTY STATE                            */}
      {/* ════════════════════════════════════════════════════ */}
      {allOrders.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[180px] px-6">
                    <Typography variant="caption" className="font-bold uppercase tracking-widest text-muted-foreground">Order ID</Typography>
                  </TableHead>
                  <TableHead className="px-6">
                    <Typography variant="caption" className="font-bold uppercase tracking-widest text-muted-foreground">Produk</Typography>
                  </TableHead>
                  <TableHead className="px-6">
                    <Typography variant="caption" className="font-bold uppercase tracking-widest text-muted-foreground">Tanggal</Typography>
                  </TableHead>
                  <TableHead className="px-6">
                    <Typography variant="caption" className="font-bold uppercase tracking-widest text-muted-foreground">Total</Typography>
                  </TableHead>
                  <TableHead className="px-6 text-center">
                    <Typography variant="caption" className="font-bold uppercase tracking-widest text-muted-foreground">Status</Typography>
                  </TableHead>
                  <TableHead className="px-6 text-right">
                    <Typography variant="caption" className="font-bold uppercase tracking-widest text-muted-foreground">Aksi</Typography>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrders.map((order) => {
                  const product = order.products as { title: string } | null;

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors border-border/40">
                      <TableCell className="px-6 py-5 font-mono text-xs text-muted-foreground font-medium">
                        #{(order.midtrans_order_id || order.id).substring(0, 12)}
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <Typography variant="body-sm" className="font-bold truncate max-w-[220px]">
                          {product?.title || "Produk Digital"}
                        </Typography>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-muted-foreground whitespace-nowrap">
                        <Typography variant="body-sm">
                          {formatDate(order.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <Typography variant="body-sm" className="font-black text-primary">
                          {formatCurrency(Number(order.total_price))}
                        </Typography>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <DashboardStatusBadge
                          status={order.payment_status}
                          size="sm"
                          className="justify-center"
                        />
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 text-xs bg-primary/5 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-full font-bold transition-all duration-200 border border-primary/20"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          Lihat Detail
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border/50">
            {allOrders.map((order) => {
              const product = order.products as { title: string } | null;

              return (
                <div key={order.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Typography variant="body-sm" className="font-bold truncate">
                        {product?.title || "Produk Digital"}
                      </Typography>
                      <Typography variant="caption" color="muted" className="mt-0.5">
                        {formatDate(order.created_at)}
                      </Typography>
                    </div>
                    <DashboardStatusBadge
                      status={order.payment_status}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div>
                      <Typography variant="caption" color="muted" className="font-bold uppercase tracking-wider mb-0.5">Total</Typography>
                      <Typography variant="body-sm" className="font-black text-primary">
                        {formatCurrency(Number(order.total_price))}
                      </Typography>
                    </div>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-xs bg-primary/5 text-primary px-4 py-2 rounded-full font-bold border border-primary/20"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Empty state ── */
        <div className="relative rounded-xl border border-dashed border-border bg-card/50 overflow-hidden py-24 text-center">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none blur-[100px] bg-primary/5"
          />
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm mx-auto px-6">
            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center border border-border shadow-inner">
              <ExclamationCircleIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <Typography variant="h4" as="h3" className="font-bold">
                Belum Ada Pesanan
              </Typography>
              <Typography variant="body-sm" color="muted">
                Sepertinya Anda belum melakukan transaksi apa pun. Temukan produk impian Anda di katalog kami.
              </Typography>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            >
                Jelajahi Produk
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
