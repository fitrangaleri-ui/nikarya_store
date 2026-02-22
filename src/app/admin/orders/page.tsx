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
import { ShoppingCart } from "lucide-react";
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
      <div className="rounded-none border border-destructive/20 bg-destructive/10 p-4 sm:p-6 text-sm font-semibold text-destructive">
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
      "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 rounded-none shadow-none font-bold",
    PAID: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-none shadow-none font-bold",
    FAILED:
      "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-none shadow-none font-bold",
  };

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Manajemen Pesanan
        </h1>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          {filteredOrders?.length || 0} pesanan ditemukan
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <form className="flex-1 w-full">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Cari email, nama, produk, atau Order ID..."
            className="w-full h-11 rounded-none border border-border bg-background px-4 py-2 text-sm text-foreground font-medium placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>

        <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
          <div className="w-full xs:w-48 sm:w-52">
            <FilterSelect
              name="status"
              defaultValue={status || ""}
              options={[
                { value: "", label: "Semua Status" },
                { value: "PENDING", label: "Pending" },
                { value: "PAID", label: "Dibayar" },
                { value: "FAILED", label: "Gagal" },
              ]}
            />
          </div>
          {(search || status) && (
            <Link href="/admin/orders" className="w-full xs:w-auto block">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 rounded-none border-border text-muted-foreground font-bold hover:text-foreground hover:bg-muted/50 shadow-none transition-colors"
              >
                Reset
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-none border border-border bg-background shadow-none relative w-full overflow-hidden">
        {/* DI SINI PERBAIKANNYA: Pastikan w-full dan overflow-auto benar-benar bekerja untuk tabel */}
        <div className="w-full overflow-auto max-h-[600px]">
          <Table className="w-full min-w-[1000px] relative">
            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
              <TableRow className="bg-muted/20 hover:bg-muted/20 border-border">
                <TableHead className="text-xs font-bold text-muted-foreground w-32 whitespace-nowrap">
                  Order ID
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground min-w-[200px] whitespace-nowrap">
                  Pelanggan
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground min-w-[200px] whitespace-nowrap">
                  Produk
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground min-w-[130px] whitespace-nowrap">
                  Total
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground min-w-[120px] whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground min-w-[150px] whitespace-nowrap">
                  Ubah Status
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground text-center w-24 whitespace-nowrap">
                  Download
                </TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground w-32 pr-6 whitespace-nowrap">
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
                      className="hover:bg-muted/30 border-border transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                        {order.midtrans_order_id || order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-bold text-foreground line-clamp-1">
                            {profile?.full_name || "—"}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate max-w-[200px]">
                            {profile?.email || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                          {product?.title || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm font-extrabold text-foreground whitespace-nowrap">
                        Rp {Number(order.total_price).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[order.payment_status] ||
                            "rounded-none shadow-none font-bold whitespace-nowrap"
                          }
                        >
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <OrderStatusSelect
                          orderId={order.id}
                          currentStatus={order.payment_status}
                        />
                      </TableCell>
                      <TableCell className="text-center text-sm font-bold text-foreground">
                        {order.download_count}
                        <span className="text-muted-foreground">/5</span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-muted-foreground pr-6 whitespace-nowrap">
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
                    className="text-center py-16 hover:bg-transparent"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
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
  );
}
