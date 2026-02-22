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

  return (
    <div className="flex min-h-screen w-full bg-muted/10">
      {/* ── TOP BAR (Hanya tampil di Mobile) ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-30 flex items-center justify-between px-4">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 font-bold text-lg text-foreground tracking-tight"
        >
          <Store className="h-5 w-5 text-primary" />
          <span>Admin Panel</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </header>

      {/* ── OVERLAY GELAP (Saat sidebar terbuka di Mobile) ── */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR (Hidden di Mobile, Fixed di Desktop) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-background shadow-none flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-bold text-xl text-foreground tracking-tight hover:opacity-80 transition-opacity"
          >
            <Store className="h-6 w-6 text-primary" />
            <span>Admin Panel</span>
          </Link>
          {/* Tombol Tutup Sidebar untuk Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-none h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Tutup menu</span>
          </Button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 flex flex-col gap-1.5 p-5 overflow-y-auto">
          <p className="px-2 text-xs font-bold text-muted-foreground mb-1.5 tracking-tight">
            Menu Utama
          </p>

          <Link href="/admin">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 rounded-none text-muted-foreground font-semibold hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          <Link href="/admin/products">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 rounded-none text-muted-foreground font-semibold hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Package className="h-4 w-4" />
              Produk
            </Button>
          </Link>

          <Link href="/admin/orders">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 rounded-none text-muted-foreground font-semibold hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Pesanan
            </Button>
          </Link>

          <p className="px-2 text-xs font-bold text-muted-foreground mb-1.5 mt-5 tracking-tight">
            Pengaturan
          </p>

          <Link href="/admin/payment-gateway">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 rounded-none text-muted-foreground font-semibold hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Payment Gateway
            </Button>
          </Link>

          <Link href="/admin/account">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 rounded-none text-muted-foreground font-semibold hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <UserCircle className="h-4 w-4" />
              Akun
            </Button>
          </Link>
        </nav>
      </aside>

      {/* ── KONTEN UTAMA ── */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-64 pt-16 md:pt-0 transition-all duration-300">
        <div className="p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
