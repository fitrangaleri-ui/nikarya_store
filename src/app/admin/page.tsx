import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  ImageIcon,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { resolveImageSrc } from "@/lib/resolve-image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = createAdminClient();

  // Fetch all data in parallel
  const [
    { count: productsCount },
    { count: ordersCount },
    { count: customersCount },
    { data: paidOrders },
    { data: recentOrders },
    { data: recentProducts },
  ] = await Promise.all([
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "USER"),
    admin.from("orders").select("total_price").eq("payment_status", "PAID"),
    admin
      .from("orders")
      .select("*, profiles(email, full_name), products(title)")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue =
    paidOrders?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0;

  // Menggunakan palet semantik aplikasi (Bentuk Kapsul Liquid)
  const statusColors: Record<string, string> = {
    PENDING:
      "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 rounded-full shadow-none font-bold px-3 py-1",
    PAID: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full shadow-none font-bold px-3 py-1",
    FAILED:
      "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-full shadow-none font-bold px-3 py-1",
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="w-1.5 h-8 bg-primary rounded-full block" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            Dashboard
          </h1>
        </div>
        <p className="text-sm font-medium text-muted-foreground ml-4.5">
          Ringkasan performa toko Anda hari ini.
        </p>
      </div>

      {/* Stats Cards (Mobile First: 2 Kolom di HP, 4 Kolom di Desktop) */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Pendapatan */}
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Pendapatan
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(totalRevenue)}
            </div>
            <p className="text-[10px] sm:text-xs text-primary font-bold mt-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Dari pesanan lunas
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Pesanan */}
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Pesanan
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              {ordersCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-2">
              Transaksi tercatat
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Produk */}
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Produk
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              {productsCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-2">
              Item aktif di toko
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Total Pelanggan */}
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Pelanggan
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              {customersCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-2">
              Pengguna terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Recent Products */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6 border-b border-border/40">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              Pesanan Terbaru
            </CardTitle>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 text-xs sm:text-sm bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full font-bold transition-colors"
            >
              Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-2 pt-4 pb-2">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="overflow-x-auto w-full px-4 sm:px-4">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Pelanggan
                      </TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Produk
                      </TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Total
                      </TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-right pr-4">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="hover:bg-muted/30 border-border/40 transition-colors"
                      >
                        <TableCell className="text-sm font-semibold text-foreground py-4">
                          {(
                            order.profiles as {
                              email: string;
                              full_name: string | null;
                            } | null
                          )?.full_name ||
                            (order.profiles as { email: string } | null)
                              ?.email ||
                            "—"}
                        </TableCell>
                        <TableCell className="text-sm font-bold text-foreground py-4">
                          {(order.products as { title: string } | null)
                            ?.title || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-black text-primary py-4 whitespace-nowrap">
                          Rp {Number(order.total_price).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right pr-4 py-4">
                          <Badge
                            className={
                              statusColors[order.payment_status] ||
                              "rounded-full shadow-none px-3 py-1"
                            }
                          >
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-semibold text-sm">
                  Belum ada pesanan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6 border-b border-border/40">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Produk Terbaru
            </CardTitle>
            <Link
              href="/admin/products"
              className="flex items-center gap-1.5 text-xs sm:text-sm bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full font-bold transition-colors"
            >
              Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            {recentProducts && recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border border-border/50 bg-background/50 hover:bg-background rounded-2xl transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-muted/30 border border-border/50 flex-shrink-0">
                        {resolveImageSrc(product.thumbnail_url) ? (
                          <Image
                            src={resolveImageSrc(product.thumbnail_url)!}
                            alt={product.title}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 sm:hidden block">
                        <p className="text-sm font-bold text-foreground truncate">
                          {product.title}
                        </p>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          {(
                            product.categories as unknown as {
                              name: string;
                            } | null
                          )?.name || "Tanpa kategori"}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 hidden sm:block">
                      <p className="text-sm font-bold text-foreground truncate">
                        {product.title}
                      </p>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {(
                          product.categories as unknown as {
                            name: string;
                          } | null
                        )?.name || "Tanpa kategori"}
                      </p>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-between sm:flex-col sm:items-end flex-shrink-0 mt-1 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                      <p className="text-sm font-black text-foreground">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </p>
                      <Badge
                        className={
                          product.is_active
                            ? "bg-primary/10 text-primary border border-primary/20 rounded-full shadow-none font-bold px-3 sm:mt-2"
                            : "bg-muted text-muted-foreground border border-border/50 rounded-full shadow-none font-bold px-3 sm:mt-2"
                        }
                      >
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-semibold text-sm">
                  Belum ada produk.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
