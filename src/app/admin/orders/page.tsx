import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart, Search } from "lucide-react";
import Link from "next/link";
import { OrderStatusSelect } from "./order-status-select";
import { FilterSelect } from "../filter-select";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("orders")
    .select("*, profiles(email, full_name), products(title, price)")
    .order("created_at", { ascending: false });

  // Apply filters
  if (status) {
    query = query.eq("payment_status", status);
  }

  const { data: orders, error } = await query;

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-destructive/20 bg-destructive/10 p-4 sm:p-6 text-sm font-semibold text-destructive animate-in fade-in zoom-in-95">
        Error: {error.message}
      </div>
    );
  }

  // Client-side search filter (search by email, name, or product title)
  const filteredOrders = search
    ? orders?.filter((order) => {
      const profile = order.profiles as {
        email: string;
        full_name: string | null;
      } | null;
      const product = order.products as { title: string } | null;
      const searchLower = search.toLowerCase();
      return (
        profile?.email?.toLowerCase().includes(searchLower) ||
        profile?.full_name?.toLowerCase().includes(searchLower) ||
        product?.title?.toLowerCase().includes(searchLower) ||
        order.midtrans_order_id?.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      );
    })
    : orders;

  const statusColors: Record<string, string> = {
    PENDING:
      "bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full shadow-none font-bold px-3 py-1",
    PENDING_MANUAL:
      "bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full shadow-none font-bold px-3 py-1",
    PAID: "bg-primary/10 text-primary border border-primary/20 rounded-full shadow-none font-bold px-3 py-1",
    FAILED:
      "bg-destructive/10 text-destructive border border-destructive/20 rounded-full shadow-none font-bold px-3 py-1",
  };

  return (
    // overflow-x-hidden di root memastikan halaman web tidak bisa digeser ke kanan-kiri
    <div className="space-y-6 md:space-y-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header — Primary banner */}
      <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-8 md:px-10 shadow-lg shadow-primary/20">
        <div aria-hidden className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none blur-[80px]" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none blur-[60px]" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)" }} />
        <div aria-hidden className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-[-0.005em] mb-3">
              <ShoppingCart className="w-3 h-3" />
              Manajemen Pesanan
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Pesanan
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
              <strong className="text-primary-foreground">
                {filteredOrders?.length || 0}
              </strong>{" "}
              pesanan ditemukan
            </p>
          </div>

          <div className="hidden md:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
            <ShoppingCart className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar - Strict w-full */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-3 sm:p-4 rounded-3xl shadow-sm w-full min-w-0">
        <form className="flex-1 w-full relative min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Cari email, nama, produk..."
            className="w-full h-11 rounded-2xl border border-border/50 bg-background/50 pl-10 pr-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all shadow-sm"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>

        <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto flex-shrink-0 min-w-0">
          <div className="w-full sm:w-52 min-w-0">
            <FilterSelect
              name="status"
              defaultValue={status || ""}
              options={[
                { value: "", label: "Semua Status" },
                { value: "PENDING", label: "Pending" },
                { value: "PENDING_MANUAL", label: "Pending Manual" },
                { value: "PAID", label: "Dibayar" },
                { value: "FAILED", label: "Gagal" },
              ]}
              className="rounded-2xl w-full"
            />
          </div>
          {(search || status) && (
            <Link
              href="/admin/orders"
              className="w-full sm:w-auto block min-w-0"
            >
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 rounded-2xl border-border/50 bg-background/50 text-muted-foreground font-bold hover:text-foreground hover:bg-muted/80 shadow-sm transition-all active:scale-95"
              >
                Reset
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Orders Table - Memiliki overflow-x-auto sendiri */}
      <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm w-full overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] w-full">
            <Table className="w-full relative">
              <TableHeader className="bg-background/95 backdrop-blur-sm border-b border-border/40">
                <TableRow className="hover:bg-transparent border-transparent">
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-32 whitespace-nowrap py-4 pl-4">
                    Order ID
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[200px] whitespace-nowrap py-4">
                    Pelanggan
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[200px] whitespace-nowrap py-4">
                    Produk
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[130px] whitespace-nowrap py-4">
                    Total
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[120px] whitespace-nowrap py-4">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[150px] whitespace-nowrap py-4">
                    Ubah Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center w-24 whitespace-nowrap py-4">
                    Akses
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right w-32 pr-6 whitespace-nowrap py-4">
                    Tanggal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const profile = order.profiles as {
                      email: string;
                      full_name: string | null;
                    } | null;
                    const product = order.products as {
                      title: string;
                      price: number;
                    } | null;
                    return (
                      <TableRow
                        key={order.id}
                        className="hover:bg-muted/30 border-border/40 transition-colors group"
                      >
                        <TableCell className="font-mono text-xs font-semibold text-muted-foreground/70 group-hover:text-foreground transition-colors py-4 pl-4">
                          {order.midtrans_order_id || order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <p className="text-sm font-bold text-foreground line-clamp-1">
                              {profile?.full_name || order.guest_name || "—"}
                            </p>
                            <p className="text-[11px] font-semibold text-muted-foreground mt-0.5 truncate max-w-[200px]">
                              {profile?.email || order.guest_email || "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                            {product?.title || "—"}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm font-black text-primary whitespace-nowrap py-4">
                          Rp {Number(order.total_price).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={
                              statusColors[order.payment_status] ||
                              "rounded-full shadow-none font-bold whitespace-nowrap px-3 py-1"
                            }
                          >
                            {order.payment_status === "PENDING_MANUAL" ? "PENDING" : order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <OrderStatusSelect
                            orderId={order.id}
                            currentStatus={order.payment_status}
                          />
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <div className="inline-flex items-center justify-center bg-muted/40 border border-border/50 rounded-lg px-2 py-1">
                            <span className="text-xs font-bold text-foreground">
                              {order.download_count}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground ml-0.5">
                              /5
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold text-muted-foreground pr-6 whitespace-nowrap py-4">
                          {new Date(order.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-20 hover:bg-transparent"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Belum ada pesanan
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mt-1">
                            Pesanan akan muncul di sini setelah ada transaksi.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
