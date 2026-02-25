import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Download,
  Wallet,
  FileDown,
  ArrowRight,
} from "lucide-react";
import { getDashboardData, formatCurrency } from "./lib";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile, allOrders, paidOrders, totalSpent, uniquePaidProducts } =
    await getDashboardData();

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Saya</h1>
        <p className="mt-1 text-muted-foreground">
          Halo,{" "}
          <span className="font-semibold text-foreground">
            {profile?.full_name || profile?.email || "User"}
          </span>
          ! Selamat datang kembali.
        </p>
      </div>

      {/* ── OVERVIEW STATS ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pesanan
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {allOrders.length}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pesanan Lunas
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Download className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {paidOrders.length}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Belanja
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <Wallet className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpent)}
            </p>
          </CardContent>
        </Card>
        <Card className="dashboard-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produk Tersedia
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/10">
              <FileDown className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {uniquePaidProducts.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── QUICK LINKS ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/products" className="group">
          <Card className="dashboard-card border-0 hover:shadow-lg transition-all group-hover:scale-[1.01]">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Produk Saya</p>
                  <p className="text-xs text-muted-foreground">
                    {uniquePaidProducts.length} produk tersedia
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/orders" className="group">
          <Card className="dashboard-card border-0 hover:shadow-lg transition-all group-hover:scale-[1.01]">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Riwayat Pesanan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {allOrders.length} pesanan
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/products" className="group">
          <Card className="dashboard-card border-0 hover:shadow-lg transition-all group-hover:scale-[1.01]">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/10">
                  <FileDown className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Katalog Produk
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Jelajahi koleksi kami
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
