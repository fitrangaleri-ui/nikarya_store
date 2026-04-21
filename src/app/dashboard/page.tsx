// ============================================================
// FILE: src/app/dashboard/page.tsx
// PERUBAHAN: Redesign visual dashboard — logika & data tidak berubah
// ============================================================

import Link from "next/link";
import { Suspense } from "react";
import {
  Squares2X2Icon,
  ShoppingBagIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  InboxStackIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { getDashboardData, formatCurrency } from "./lib";
import { VerifiedToast } from "./verified-toast";
import { Typography } from "@/components/ui/typography";
import { HeaderBanner } from "./header-banner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // ── Data fetching — tidak diubah ──────────────────────────
  const { profile, allOrders, paidOrders, totalSpent, uniquePaidProducts } =
    await getDashboardData();

  const displayName = profile?.full_name || profile?.email || "User";

  return (
    <div className="space-y-8">
      {/* Verified toast notification */}
      <Suspense fallback={null}>
        <VerifiedToast />
      </Suspense>
      {/* ── Banner: Profil User ── */}
      <HeaderBanner
        title={`Halo, ${displayName}! 👋`}
        description="Selamat datang kembali. Berikut ringkasan aktivitas dan akses cepat ke produk Anda."
        badgeLabel="Dashboard Saya"
        badgeIcon={<Squares2X2Icon className="w-3.5 h-3.5 text-white" />}
        actionIcon={<SparklesIcon className="w-7 h-7 text-white" />}
      />

      {/* ── Stats Section ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat: Total Pesanan */}
        <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase ">
              Total Pesanan
            </Typography>
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
              <ShoppingBagIcon className="h-4 w-4 text-primary group-hover:text-white" />
            </div>
          </div>
          <Typography variant="h3" as="p" className="tracking-tight">
            {allOrders.length}
          </Typography>
          <Typography variant="caption" color="muted" className="mt-1">
            Semua status
          </Typography>
        </div>

        {/* Stat: Pesanan Lunas */}
        <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase ">
              Pesanan Lunas
            </Typography>
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
              <ArrowDownTrayIcon className="h-4 w-4 text-primary group-hover:text-white" />
            </div>
          </div>
          <Typography variant="h3" as="p" className="tracking-tight">
            {paidOrders.length}
          </Typography>
          <Typography variant="caption" color="primary" className="mt-1 font-bold">
            Sudah dibayar
          </Typography>
        </div>

        {/* Stat: Total Belanja */}
        <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase ">
              Total Belanja
            </Typography>
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
              <BanknotesIcon className="h-4 w-4 text-primary group-hover:text-white" />
            </div>
          </div>
          <Typography variant="h4" as="p" className="tracking-tight">
            {formatCurrency(totalSpent)}
          </Typography>
          <Typography variant="caption" color="muted" className="mt-1">
            Akumulasi pembelian
          </Typography>
        </div>

        {/* Stat: Produk Tersedia */}
        <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase ">
              Produk Siap
            </Typography>
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
              <InboxStackIcon className="h-4 w-4 text-primary group-hover:text-white" />
            </div>
          </div>
          <Typography variant="h3" as="p" className="tracking-tight">
            {uniquePaidProducts.length}
          </Typography>
          <Typography variant="caption" color="muted" className="mt-1">
            Akses tersedia
          </Typography>
        </div>
      </div>

      {/* ── Main Actions Section ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1.5 h-5 rounded-full bg-primary block" />
          <Typography variant="h6" className="uppercase  font-bold">
            Menu Utama
          </Typography>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Action: Produk Saya */}
          <Link href="/dashboard/products" className="group">
            <div className="relative flex items-center justify-between gap-4 rounded-xl bg-card border border-border px-5 py-6 overflow-hidden hover:border-primary/30 transition-all duration-200 group-hover:translate-y-[-2px]">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-200">
                  <InboxStackIcon className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <Typography variant="body-sm" className="font-bold group-hover:text-primary transition-colors">
                    Produk Saya
                  </Typography>
                  <Typography variant="caption" color="muted" className="mt-0.5 font-medium">
                    {uniquePaidProducts.length} produk tersedia
                  </Typography>
                </div>
              </div>

              <div className="relative z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary transition-all duration-200">
                <ArrowRightIcon className="h-4 w-4 text-muted-foreground group-hover:text-white" />
              </div>
            </div>
          </Link>

          {/* Action: Riwayat Pesanan */}
          <Link href="/dashboard/orders" className="group">
            <div className="relative flex items-center justify-between gap-4 rounded-xl bg-card border border-border px-5 py-6 overflow-hidden hover:border-primary/30 transition-all duration-200 group-hover:translate-y-[-2px]">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-200">
                  <ShoppingBagIcon className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <Typography variant="body-sm" className="font-bold group-hover:text-primary transition-colors">
                    Riwayat Pesanan
                  </Typography>
                  <Typography variant="caption" color="muted" className="mt-0.5 font-medium">
                    {allOrders.length} transaksi tercatat
                  </Typography>
                </div>
              </div>

              <div className="relative z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary transition-all duration-200">
                <ArrowRightIcon className="h-4 w-4 text-muted-foreground group-hover:text-white" />
              </div>
            </div>
          </Link>

          {/* Action: Katalog Produk */}
          <Link href="/products" className="group">
            <div className="relative flex items-center justify-between gap-4 rounded-xl bg-card border border-border px-5 py-6 overflow-hidden hover:border-primary/30 transition-all duration-200 group-hover:translate-y-[-2px]">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-200">
                  <Squares2X2Icon className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <Typography variant="body-sm" className="font-bold group-hover:text-primary transition-colors">
                    Katalog Produk
                  </Typography>
                  <Typography variant="caption" color="muted" className="mt-0.5 font-medium">
                    Jelajahi koleksi kami
                  </Typography>
                </div>
              </div>

              <div className="relative z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary transition-all duration-200">
                <ArrowRightIcon className="h-4 w-4 text-muted-foreground group-hover:text-white" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
