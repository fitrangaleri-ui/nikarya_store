import { createAdminClient } from "@/lib/supabase/admin";
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
  CubeIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  PhotoIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { resolveImageSrc } from "@/lib/resolve-image";
import Link from "next/link";
import { Typography } from "@/components/ui/typography";
import { StickyHeader } from "./sticky-header";

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

  // Using semantic design tokens instead of hardcoded amber colors
  const statusColors: Record<string, string> = {
    PENDING:
      "bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 rounded-full shadow-none font-bold px-3 py-1",
    PAID: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full shadow-none font-bold px-3 py-1",
    FAILED:
      "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-full shadow-none font-bold px-3 py-1",
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-10">
      {/* ── Sticky Header ── */}
      <StickyHeader
        title="Dashboard"
        description="Ringkasan performa toko Anda hari ini."
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
        {/* ── Stats Cards ── */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Pendapatan */}
          <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase ">
                Pendapatan
              </Typography>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BanknotesIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Typography variant="h4" as="p" className="tracking-tight">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(totalRevenue)}
            </Typography>
            <Typography variant="caption" color="primary" className="font-bold mt-1 flex items-center gap-1.5">
              <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
              Dari pesanan lunas
            </Typography>
          </div>

          {/* Card 2: Total Pesanan */}
          <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase ">
                Pesanan
              </Typography>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBagIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Typography variant="h3" as="p" className="tracking-tight">
              {ordersCount || 0}
            </Typography>
            <Typography variant="caption" color="muted" className="mt-1">
              Transaksi tercatat
            </Typography>
          </div>

          {/* Card 3: Total Produk */}
          <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase ">
                Produk
              </Typography>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CubeIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Typography variant="h3" as="p" className="tracking-tight">
              {productsCount || 0}
            </Typography>
            <Typography variant="caption" color="muted" className="mt-1">
              Item aktif di toko
            </Typography>
          </div>

          {/* Card 4: Total Pelanggan */}
          <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase ">
                Pelanggan
              </Typography>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <UsersIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Typography variant="h3" as="p" className="tracking-tight">
              {customersCount || 0}
            </Typography>
            <Typography variant="caption" color="muted" className="mt-1">
              Pengguna terdaftar
            </Typography>
          </div>
        </div>

        {/* ── Recent Orders & Recent Products ── */}
        <div className="grid gap-5 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 flex items-center justify-between">
              <Typography variant="h6" as="h2" className="text-white font-bold">
                Pesanan Terbaru
              </Typography>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1.5 text-xs bg-white/10 border border-white/20 text-white hover:bg-white hover:text-primary px-3 py-1.5 rounded-full font-bold transition-all"
              >
                Semua <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="px-0 sm:px-2 pt-4 pb-2">
              {recentOrders && recentOrders.length > 0 ? (
                <div className="overflow-x-auto w-full px-4 sm:px-4">
                  <Table className="min-w-[500px]">
                    <TableHeader className="bg-background/95 border-b border-border/40">
                      <TableRow className="hover:bg-transparent border-transparent">
                        <TableHead className="text-[11px] font-bold text-muted-foreground uppercase ">
                          Pelanggan
                        </TableHead>
                        <TableHead className="text-[11px] font-bold text-muted-foreground uppercase ">
                          Produk
                        </TableHead>
                        <TableHead className="text-[11px] font-bold text-muted-foreground uppercase ">
                          Total
                        </TableHead>
                        <TableHead className="text-[11px] font-bold text-muted-foreground uppercase  text-right pr-4">
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
                          <TableCell className="py-4">
                            <Typography variant="body-sm" className="font-semibold">
                              {(
                                order.profiles as {
                                  email: string;
                                  full_name: string | null;
                                } | null
                              )?.full_name ||
                                (order.profiles as { email: string } | null)
                                  ?.email ||
                                "—"}
                            </Typography>
                          </TableCell>
                          <TableCell className="py-4">
                            <Typography variant="body-sm" className="font-bold">
                              {(order.products as { title: string } | null)
                                ?.title || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell className="py-4 whitespace-nowrap">
                            <Typography variant="body-sm" color="primary" className="font-black">
                              Rp {Number(order.total_price).toLocaleString("id-ID")}
                            </Typography>
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
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBagIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <Typography variant="body-sm" color="muted" className="text-center font-semibold">
                    Belum ada pesanan.
                  </Typography>
                </div>
              )}
            </div>
          </div>

          {/* Recent Products */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 flex items-center justify-between">
              <Typography variant="h6" as="h2" className="text-white font-bold">
                Produk Terbaru
              </Typography>
              <Link
                href="/admin/products"
                className="flex items-center gap-1.5 text-xs bg-white/10 border border-white/20 text-white hover:bg-white hover:text-primary px-3 py-1.5 rounded-full font-bold transition-all"
              >
                Semua <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 md:p-7">
              {recentProducts && recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border border-border/50 bg-background/50 hover:bg-background rounded-sm transition-all"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-sm bg-muted/30 border border-border/50 flex-shrink-0">
                          {resolveImageSrc(product.thumbnail_url) ? (
                            <Image
                              src={resolveImageSrc(product.thumbnail_url)!}
                              alt={product.title}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <PhotoIcon className="h-6 w-6 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 sm:hidden block">
                          <Typography variant="body-sm" className="font-bold truncate">
                            {product.title}
                          </Typography>
                          <Typography variant="caption" color="muted" className="font-bold uppercase  mt-1">
                            {(
                              product.categories as unknown as {
                                name: string;
                              } | null
                            )?.name || "Tanpa kategori"}
                          </Typography>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 hidden sm:block">
                        <Typography variant="body-sm" className="font-bold truncate">
                          {product.title}
                        </Typography>
                        <Typography variant="caption" color="muted" className="font-bold uppercase  mt-1">
                          {(
                            product.categories as unknown as {
                              name: string;
                            } | null
                          )?.name || "Tanpa kategori"}
                        </Typography>
                      </div>

                      <div className="w-full sm:w-auto flex items-center justify-between sm:flex-col sm:items-end flex-shrink-0 mt-1 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                        <Typography variant="body-sm" className="font-black">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </Typography>
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
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <CubeIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <Typography variant="body-sm" color="muted" className="text-center font-semibold">
                    Belum ada produk.
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
