import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Download,
  ShoppingBag,
  Clock,
  AlertCircle,
  Receipt,
  Wallet,
  Eye,
  FileDown,
  XCircle,
} from "lucide-react";
import { DownloadButton } from "./download-button";

export const dynamic = "force-dynamic";

// ── Status config ──
const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PAID: {
    label: "Lunas",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    icon: <Download className="h-3 w-3" />,
  },
  PENDING: {
    label: "Menunggu Bayar",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    icon: <Clock className="h-3 w-3" />,
  },
  PENDING_MANUAL: {
    label: "Menunggu Konfirmasi",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    icon: <Clock className="h-3 w-3" />,
  },
  EXPIRED: {
    label: "Kadaluarsa",
    color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-50",
    icon: <XCircle className="h-3 w-3" />,
  },
  FAILED: {
    label: "Gagal",
    color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-50",
    icon: <XCircle className="h-3 w-3" />,
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Guard: redirect admin users to admin panel
  const admin = createAdminClient();

  const { data: roleCheck } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (roleCheck?.role?.toUpperCase() === "ADMIN") {
    redirect("/admin");
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: orders } = await admin
    .from("orders")
    .select(
      "*, products(title, thumbnail_url, slug, price, discount_price, drive_file_url)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allOrders = orders || [];
  const paidOrders = allOrders.filter((o) => o.payment_status === "PAID");
  const totalSpent = paidOrders.reduce(
    (sum, o) => sum + Number(o.total_price),
    0,
  );

  // Deduplicate paid products (one card per unique product)
  const paidProductMap = new Map<
    string,
    (typeof allOrders)[0]
  >();
  for (const order of paidOrders) {
    const pid = order.product_id;
    if (!paidProductMap.has(pid)) {
      paidProductMap.set(pid, order);
    }
  }
  const uniquePaidProducts = Array.from(paidProductMap.values());

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto max-w-7xl px-4 py-8 space-y-10">
        {/* ── HEADER ── */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Saya</h1>
          <p className="mt-1 text-slate-500">
            Halo,{" "}
            <span className="font-semibold text-slate-700">
              {profile?.full_name || profile?.email || "User"}
            </span>
            ! Selamat datang kembali.
          </p>
        </div>

        {/* ── OVERVIEW STATS ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Pesanan
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {allOrders.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Pesanan Lunas
              </CardTitle>
              <Download className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {paidOrders.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Belanja
              </CardTitle>
              <Wallet className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(totalSpent)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Produk Tersedia
              </CardTitle>
              <FileDown className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {uniquePaidProducts.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── MY PRODUCTS ── */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
            <Download className="h-5 w-5 text-slate-500" />
            Produk Saya
          </h2>

          {uniquePaidProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {uniquePaidProducts.map((order) => {
                const product = order.products as {
                  title: string;
                  thumbnail_url: string | null;
                  slug: string;
                } | null;
                return (
                  <Card
                    key={order.id}
                    className="overflow-hidden border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video bg-slate-100 border-b">
                      {product?.thumbnail_url ? (
                        <Image
                          src={product.thumbnail_url}
                          alt={product.title || ""}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-10 w-10 text-slate-300" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-emerald-500 text-white border-0 hover:bg-emerald-500 shadow-sm">
                        Lunas
                      </Badge>
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {product?.title || "Produk Tanpa Nama"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Dibeli{" "}
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-500">Kuota Download</span>
                          <span
                            className={
                              order.download_count >= 5
                                ? "text-red-500 font-medium"
                                : "text-slate-700 font-medium"
                            }
                          >
                            {order.download_count}/5
                          </span>
                        </div>
                        <DownloadButton
                          orderId={order.id}
                          downloadCount={order.download_count}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                Belum ada produk
              </h3>
              <p className="mt-1 text-slate-500 max-w-sm mx-auto">
                Anda belum memiliki produk yang sudah dibayar lunas.
              </p>
              <Link href="/products">
                <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                  Jelajahi Katalog Produk →
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* ── ORDER HISTORY ── */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-slate-500" />
            Riwayat Pesanan
          </h2>

          {allOrders.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Order ID
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Produk
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Tanggal
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Total
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Status
                      </th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allOrders.map((order) => {
                      const product = order.products as {
                        title: string;
                      } | null;
                      const cfg = statusConfig[order.payment_status] ||
                        statusConfig.FAILED;
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-slate-600">
                            #{order.midtrans_order_id?.substring(0, 16) || order.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium max-w-[200px] truncate">
                            {product?.title || "Produk"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">
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
                              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
              <div className="md:hidden divide-y divide-slate-100">
                {allOrders.map((order) => {
                  const product = order.products as {
                    title: string;
                  } | null;
                  const cfg = statusConfig[order.payment_status] ||
                    statusConfig.FAILED;
                  return (
                    <div
                      key={order.id}
                      className="p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 truncate">
                            {product?.title || "Produk"}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <Badge className={cfg.color}>
                          {cfg.icon}
                          <span className="ml-1">{cfg.label}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(Number(order.total_price))}
                        </p>
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
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
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">Belum ada riwayat pesanan.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
