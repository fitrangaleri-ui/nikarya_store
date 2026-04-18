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
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { OrderStatusSelect } from "./order-status-select";
import { FilterSelect } from "../filter-select";
import { Typography } from "@/components/ui/typography";
import { StickyHeader } from "../sticky-header";

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
      <div className="w-full rounded-xl border border-destructive/20 bg-destructive/10 p-4 sm:p-6 text-sm font-semibold text-destructive animate-in fade-in zoom-in-95">
        <Typography variant="body-sm" color="destructive" className="font-semibold">
          Error: {error.message}
        </Typography>
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
      "bg-warning/10 text-warning border border-warning/20 rounded-full shadow-none font-bold px-3 py-1",
    PENDING_MANUAL:
      "bg-warning/10 text-warning border border-warning/20 rounded-full shadow-none font-bold px-3 py-1",
    PAID: "bg-primary/10 text-primary border border-primary/20 rounded-full shadow-none font-bold px-3 py-1",
    FAILED:
      "bg-destructive/10 text-destructive border border-destructive/20 rounded-full shadow-none font-bold px-3 py-1",
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-10">
      {/* ── Sticky Header — consistent with product-form ── */}
      <StickyHeader
        title="Pesanan"
        description={`${filteredOrders?.length || 0} pesanan ditemukan`}
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
        {/* ── Search & Filter Bar ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20">
            <Typography variant="h6" as="h2" className="text-white font-bold">
              Filter Pesanan
            </Typography>
          </div>

          <div className="p-5 md:p-7">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full min-w-0">
              <form className="flex-1 w-full relative min-w-0">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search || ""}
                  placeholder="Cari email, nama, produk..."
                  className="w-full h-11 rounded-sm border border-border/70 bg-background/50 pl-10 pr-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all"
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
                    className="rounded-sm w-full"
                  />
                </div>
                {(search || status) && (
                  <Link
                    href="/admin/orders"
                    className="w-full sm:w-auto block min-w-0"
                  >
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-11 rounded-sm border-border/50 bg-background/50 text-muted-foreground font-bold hover:text-foreground hover:bg-muted/80 transition-all active:scale-95"
                    >
                      Reset
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Orders Table ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1000px] w-full">
              <Table className="w-full relative">
                <TableHeader className="bg-primary border-b border-primary-bg/20">
                  <TableRow className="hover:bg-transparent border-transparent">
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase tracking-widest w-32 whitespace-nowrap py-4 pl-5">
                      Order ID
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase tracking-widest min-w-[200px] whitespace-nowrap py-4">
                      Pelanggan
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase tracking-widest min-w-[200px] whitespace-nowrap py-4">
                      Produk
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase tracking-widest min-w-[130px] whitespace-nowrap py-4">
                      Total
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase tracking-widest min-w-[120px] whitespace-nowrap py-4">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase tracking-widest min-w-[150px] whitespace-nowrap py-4">
                      Ubah Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase tracking-widest text-center w-24 whitespace-nowrap py-4">
                      Akses
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white/80 uppercase tracking-widest text-right w-32 pr-5 whitespace-nowrap py-4">
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
                          <TableCell className="font-mono text-xs font-semibold text-muted-foreground/70 group-hover:text-foreground transition-colors py-4 pl-5">
                            {order.midtrans_order_id || order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="py-4">
                            <div>
                              <Typography variant="body-sm" className="font-bold line-clamp-1">
                                {profile?.full_name || order.guest_name || "—"}
                              </Typography>
                              <Typography variant="caption" color="muted" className="font-semibold mt-0.5 truncate max-w-[200px]">
                                {profile?.email || order.guest_email || "—"}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Typography variant="body-sm" className="font-bold line-clamp-2 leading-snug">
                              {product?.title || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell className="whitespace-nowrap py-4">
                            <Typography variant="body-sm" color="primary" className="font-black">
                              Rp {Number(order.total_price).toLocaleString("id-ID")}
                            </Typography>
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
                            <div className="inline-flex items-center justify-center bg-muted/40 border border-border/50 rounded-sm px-2 py-1">
                              <Typography variant="caption" as="span" className="font-bold">
                                {order.download_count}
                              </Typography>
                              <Typography variant="caption" as="span" color="muted" className="font-bold ml-0.5">
                                /5
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-5 whitespace-nowrap py-4">
                            <Typography variant="caption" color="muted" className="font-semibold">
                              {new Date(order.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </Typography>
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
                            <ShoppingBagIcon className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                          <div>
                            <Typography variant="body-sm" className=" text-center font-bold">
                              Belum ada pesanan
                            </Typography>
                            <Typography variant="caption" color="muted" className="font-medium mt-1">
                              Pesanan akan muncul di sini setelah ada transaksi.
                            </Typography>
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
    </div>
  );
}
