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

  // Menggunakan palet semantik aplikasi
  const statusColors: Record<string, string> = {
    PENDING:
      "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 rounded-none shadow-none font-bold",
    PAID: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-none shadow-none font-bold",
    FAILED:
      "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-none shadow-none font-bold",
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1.5">
          Ringkasan performa toko Anda hari ini.
        </p>
      </div>

      {/* Stats Cards (Mobile First: 2 Kolom di HP, 4 Kolom di Desktop) */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Pendapatan */}
        <Card className="border-border shadow-none bg-background rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
              Pendapatan
            </CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-none bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(totalRevenue)}
            </div>
            <p className="text-[10px] sm:text-xs text-primary font-bold mt-1.5 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Dari pesanan lunas
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Pesanan */}
        <Card className="border-border shadow-none bg-background rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
              Pesanan
            </CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-none bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {ordersCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1.5">
              Transaksi tercatat
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Produk */}
        <Card className="border-border shadow-none bg-background rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
              Produk
            </CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-none bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {productsCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1.5">
              Item aktif di toko
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Total Pelanggan */}
        <Card className="border-border shadow-none bg-background rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">
              Pelanggan
            </CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-none bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {customersCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1.5">
              Pengguna terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Recent Products */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border-border shadow-none bg-background rounded-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              Pesanan Terbaru
            </CardTitle>
            <Link
              href="/admin/orders"
              className="text-xs sm:text-sm text-primary hover:text-primary/80 font-bold transition-colors"
            >
              Lihat Semua →
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="overflow-x-auto w-full px-4 sm:px-0 pb-4">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs font-bold text-muted-foreground">
                        Pelanggan
                      </TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">
                        Produk
                      </TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">
                        Total
                      </TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="hover:bg-muted/30 border-border transition-colors"
                      >
                        <TableCell className="text-sm font-medium text-foreground">
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
                        <TableCell className="text-sm font-bold text-foreground">
                          {(order.products as { title: string } | null)
                            ?.title || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-foreground whitespace-nowrap">
                          Rp {Number(order.total_price).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              statusColors[order.payment_status] ||
                              "rounded-none shadow-none"
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
              <div className="py-10 text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium text-sm">
                  Belum ada pesanan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card className="border-border shadow-none bg-background rounded-none">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              Produk Terbaru
            </CardTitle>
            <Link
              href="/admin/products"
              className="text-xs sm:text-sm text-primary hover:text-primary/80 font-bold transition-colors"
            >
              Lihat Semua →
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            {recentProducts && recentProducts.length > 0 ? (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 border border-border bg-background hover:bg-muted/30 rounded-none transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-none bg-muted/20 border border-border flex-shrink-0">
                        {resolveImageSrc(product.thumbnail_url) ? (
                          <Image
                            src={resolveImageSrc(product.thumbnail_url)!}
                            alt={product.title}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 sm:hidden block">
                        <p className="text-sm font-bold text-foreground truncate">
                          {product.title}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
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
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">
                        {(
                          product.categories as unknown as {
                            name: string;
                          } | null
                        )?.name || "Tanpa kategori"}
                      </p>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-between sm:block flex-shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-border sm:text-right">
                      <p className="text-sm font-extrabold text-foreground">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </p>
                      <Badge
                        className={
                          product.is_active
                            ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-none shadow-none font-bold sm:mt-1.5"
                            : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 rounded-none shadow-none font-bold sm:mt-1.5"
                        }
                      >
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium text-sm">
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
