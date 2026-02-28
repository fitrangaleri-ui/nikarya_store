// ============================================================
// FILE: src/app/dashboard/page.tsx
// PERUBAHAN: Redesign visual dashboard — logika & data tidak berubah
// ============================================================

import Link from "next/link";
import { Suspense } from "react";
import {
  LayoutDashboard,
  Package,
  Download,
  Wallet,
  FileDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getDashboardData, formatCurrency } from "./lib";
import { VerifiedToast } from "./verified-toast";

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
      {/* ════════════════════════════════════════════════════ */}
      {/* HEADER — Welcome banner dengan ambient glow         */}
      {/* ════════════════════════════════════════════════════ */}
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
        {/* Stroke border */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />

        {/* Konten header */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            {/* Badge label */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-widest mb-3">
              <LayoutDashboard className="w-3 h-3" />
              Dashboard Saya
            </span>

            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Halo, {displayName}! 👋
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
              Selamat datang kembali. Berikut ringkasan aktivitas akunmu.
            </p>
          </div>

          {/* Icon dekorasi kanan */}
          <div className="hidden md:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* OVERVIEW STATS — 4 kartu angka ringkasan           */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat: Total Pesanan */}
        <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/8 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Total Pesanan
            </p>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground tracking-tight">
            {allOrders.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">semua status</p>
        </div>

        {/* Stat: Pesanan Lunas */}
        <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-emerald-500/8 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pesanan Lunas
            </p>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Download className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground tracking-tight">
            {paidOrders.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            sudah dibayar
          </p>
        </div>

        {/* Stat: Total Belanja */}
        <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-200">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-violet-500/8 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Total Belanja
            </p>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground tracking-tight">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            akumulasi pembelian
          </p>
        </div>

        {/* Stat: Produk Tersedia */}
        <div className="relative rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/8 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Produk Tersedia
            </p>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileDown className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground tracking-tight">
            {uniquePaidProducts.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">siap diunduh</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* QUICK LINKS — 3 kartu navigasi cepat               */}
      {/* ════════════════════════════════════════════════════ */}
      <div>
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-5 rounded-full bg-primary block" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Menu Utama
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Link: Produk Saya */}
          <Link href="/dashboard/products" className="group">
            <div className="relative flex items-center justify-between gap-4 rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group-hover:scale-[1.01]">
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors duration-200 pointer-events-none rounded-2xl" />

              <div className="flex items-center gap-4 relative z-10">
                {/* Icon */}
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                {/* Info */}
                <div>
                  <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                    Produk Saya
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {uniquePaidProducts.length} produk tersedia
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
            </div>
          </Link>

          {/* Link: Riwayat Pesanan */}
          <Link href="/dashboard/orders" className="group">
            <div className="relative flex items-center justify-between gap-4 rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200 group-hover:scale-[1.01]">
              <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.02] transition-colors duration-200 pointer-events-none rounded-2xl" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/15 transition-colors">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm group-hover:text-amber-600 transition-colors">
                    Riwayat Pesanan
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {allOrders.length} pesanan
                  </p>
                </div>
              </div>

              <div className="relative z-10 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-all duration-200">
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>

          {/* Link: Katalog Produk */}
          <Link href="/products" className="group">
            <div className="relative flex items-center justify-between gap-4 rounded-2xl bg-card border border-border/50 px-5 py-5 shadow-sm overflow-hidden hover:border-violet-500/40 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-200 group-hover:scale-[1.01]">
              <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/[0.02] transition-colors duration-200 pointer-events-none rounded-2xl" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/15 transition-colors">
                  <FileDown className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm group-hover:text-violet-600 transition-colors">
                    Katalog Produk
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Jelajahi koleksi kami
                  </p>
                </div>
              </div>

              <div className="relative z-10 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-violet-500 transition-all duration-200">
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
