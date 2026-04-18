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
  LayoutDashboard,
  Sparkles,
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
    <div className="p-4 sm:p-6 md:p-8">
      <div className="space-y-6 md:space-y-8 pb-10">
        {/* Header — Primary banner with ambient glow */}
        <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-8 md:px-10 shadow-lg shadow-primary/20">
          {/* Ambient glow background */}
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
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-[-0.005em] mb-3">
                <LayoutDashboard className="w-3 h-3" />
                Admin Dashboard
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                Dashboard
              </h1>
              <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
                Ringkasan performa toko Anda hari ini.
              </p>
            </div>

            <div className="hidden md:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Stats Cards (Mobile First: 2 Kolom di HP, 4 Kolom di Desktop) */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Pendapatan */}
          <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/8 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[-0.005em] text-muted-foreground">
                Pendapatan
              </p>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(totalRevenue)}
            </p>
            <p className="text-[11px] text-primary font-bold mt-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Dari pesanan lunas
            </p>
          </div>

          {/* Card 2: Total Pesanan */}
          <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/8 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[-0.005em] text-muted-foreground">
                Pesanan
              </p>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {ordersCount || 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Transaksi tercatat</p>
          </div>

          {/* Card 3: Total Produk */}
          <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-emerald-500/8 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[-0.005em] text-muted-foreground">
                Produk
              </p>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {productsCount || 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Item aktif di toko</p>
          </div>

          {/* Card 4: Total Pelanggan */}
          <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-200">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-violet-500/8 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[-0.005em] text-muted-foreground">
                Pelanggan
              </p>
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {customersCount || 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Pengguna terdaftar</p>
          </div>
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
    </div>
  );
}
