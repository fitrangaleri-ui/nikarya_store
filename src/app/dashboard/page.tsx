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
} from "lucide-react";
import { DownloadButton } from "./download-button";

export const dynamic = "force-dynamic";

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
    .select("*, products(title, thumbnail_url, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const paidOrders = orders?.filter((o) => o.payment_status === "PAID") || [];
  const pendingOrders =
    orders?.filter((o) => o.payment_status === "PENDING") || [];

  const statusColors: Record<string, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    PAID: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    FAILED: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Global dipasang di sini */}
      <Navbar />

      <main className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Saya
            </h1>
            <p className="mt-1 text-slate-500">
              Halo,{" "}
              <span className="font-semibold text-slate-700">
                {profile?.full_name || profile?.email || "User"}
              </span>
              ! Selamat datang kembali.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Pembelian
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {orders?.length || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Siap Download
              </CardTitle>
              <Download className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {paidOrders.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Downloads Section */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
            <Download className="h-5 w-5 text-slate-500" />
            Produk Saya (Download)
          </h2>

          {paidOrders.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paidOrders.map((order) => {
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
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {product?.title || "Produk Tanpa Nama"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Order ID: #{order.id.substring(0, 8)}
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
        </div>

        {/* Pending Orders Section */}
        {pendingOrders.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h2 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Menunggu Pembayaran
            </h2>
            <div className="space-y-3">
              {pendingOrders.map((order) => {
                const product = order.products as {
                  title: string;
                  slug: string;
                } | null;
                return (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {product?.title || "Produk"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Dipesan pada{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <p className="font-semibold text-slate-900">
                        Rp {Number(order.total_price).toLocaleString("id-ID")}
                      </p>
                      <Badge className={statusColors[order.payment_status]}>
                        Menunggu Bayar
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
