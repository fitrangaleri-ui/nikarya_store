"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserCircle,
  CreditCard,
  Store,
  Menu,
  X,
  Ticket,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Otomatis menutup sidebar jika rute/halaman berubah (khusus mobile)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Helper untuk mengecek apakah menu sedang aktif
  const isDashboard = pathname === "/admin";
  const isProducts = pathname.startsWith("/admin/products");
  const isOrders = pathname.startsWith("/admin/orders");
  const isPromos = pathname.startsWith("/admin/promos");
  const isPayment = pathname.startsWith("/admin/payment-gateway");
  const isAccount = pathname.startsWith("/admin/account");

  const getLinkClass = (active: boolean) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
      ? "bg-primary/15 text-primary shadow-sm"
      : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
    }`;

  return (
    // PENGUNCIAN 1: Tambahkan overflow-x-hidden di root div untuk cegah horizontal scroll body
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 overflow-x-hidden relative">
      {/* ── TOP BAR (Hanya tampil di Mobile) ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-30 flex items-center justify-between px-4 shadow-sm w-full">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 font-black text-lg text-foreground tracking-tight"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <span>Admin Panel</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </header>

      {/* ── OVERLAY GELAP (Saat sidebar terbuka di Mobile) ── */}
      <div
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ── SIDEBAR (Hidden di Mobile, Fixed di Desktop) ── */}
      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[50px] pointer-events-none -z-10" />

        {/* Header Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--glass-border)] px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-black text-xl text-foreground tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <span>Admin</span>
          </Link>
          {/* Tombol Tutup Sidebar untuk Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Tutup menu</span>
          </Button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1.5 mt-2">
            Menu Utama
          </p>

          <Link href="/admin" className={getLinkClass(isDashboard)}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isDashboard ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"}`}>
              <LayoutDashboard className={`h-[16px] w-[16px] transition-colors ${isDashboard ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
            </div>
            <span className="truncate">Dashboard</span>
          </Link>

          <Link href="/admin/products" className={getLinkClass(isProducts)}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isProducts ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"}`}>
              <Package className={`h-[16px] w-[16px] transition-colors ${isProducts ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
            </div>
            <span className="truncate">Produk</span>
          </Link>

          <Link href="/admin/orders" className={getLinkClass(isOrders)}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isOrders ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"}`}>
              <ShoppingCart className={`h-[16px] w-[16px] transition-colors ${isOrders ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
            </div>
            <span className="truncate">Pesanan</span>
          </Link>

          <Link href="/admin/promos" className={getLinkClass(isPromos)}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isPromos ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"}`}>
              <Ticket className={`h-[16px] w-[16px] transition-colors ${isPromos ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
            </div>
            <span className="truncate">Promo</span>
          </Link>

          <div className="h-px w-full bg-[var(--glass-border)] my-2" />

          <p className="px-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1.5 mt-2">
            Pengaturan
          </p>

          <Link href="/admin/payment-gateway" className={getLinkClass(isPayment)}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isPayment ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"}`}>
              <CreditCard className={`h-[16px] w-[16px] transition-colors ${isPayment ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
            </div>
            <span className="truncate">Metode Bayar</span>
          </Link>

          <Link href="/admin/account" className={getLinkClass(isAccount)}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isAccount ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"}`}>
              <UserCircle className={`h-[16px] w-[16px] transition-colors ${isAccount ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
            </div>
            <span className="truncate">Akun</span>
          </Link>

          <div className="h-px w-full bg-[var(--glass-border)] my-2" />

          <a href="/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-primary/8 hover:text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 bg-muted/50 group-hover:bg-primary/10">
              <ExternalLink className="h-[16px] w-[16px] transition-colors text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="truncate">Lihat Toko</span>
          </a>
        </nav>
      </aside>

      {/* ── KONTEN UTAMA ── */}
      {/* PENGUNCIAN 2: w-full min-w-0 agar elemen ini tidak melar lebih dari layar, overflow-x-hidden untuk aman */}
      <main className="flex-1 flex flex-col min-h-screen pt-16 md:pt-0 w-full min-w-0 md:pl-64 transition-all duration-300 relative overflow-x-hidden">
        {/* PENGUNCIAN 3: w-full dan min-w-0 di dalam wrapper anak */}
        <div className="p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto flex-1 z-10 min-w-0 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
