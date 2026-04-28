"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  CubeIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  TicketIcon,
  ArrowTopRightOnSquareIcon,
  ArrowLeftStartOnRectangleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Typography } from "@/components/ui/typography";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function AnimatedNavIcon({
  isOpen,
  className,
}: {
  isOpen: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <div className="relative h-4 w-5">
        <span
          className={`absolute left-0 top-0 h-[2.5px] w-5 origin-center rounded-full bg-current transition-all duration-300 ease-out ${isOpen ? "translate-y-[6px] rotate-45" : "translate-y-0"
            }`}
        />
        <span
          className={`absolute left-0 top-[6px] h-[2.5px] w-5 origin-center rounded-full bg-current transition-all duration-300 ease-out ${isOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
            }`}
        />
        <span
          className={`absolute left-0 top-3 h-[2.5px] w-5 origin-center rounded-full bg-current transition-all duration-300 ease-out ${isOpen ? "-translate-y-[6px] -rotate-45" : "translate-y-0"
            }`}
        />
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  // Otomatis menutup sidebar jika rute/halaman berubah (khusus mobile)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Helper untuk mengecek apakah menu sedang aktif
  const isDashboard = pathname === "/admin";
  const isProducts = pathname.startsWith("/admin/products");
  const isOrders = pathname.startsWith("/admin/orders");
  const isPromos = pathname.startsWith("/admin/promos");
  const isMedia = pathname.startsWith("/admin/media");
  const isPayment = pathname.startsWith("/admin/payment-gateway");
  const isAccount = pathname.startsWith("/admin/account");

  const getLinkClass = (active: boolean) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${active
      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    }`;

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--glass-border)] px-4">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingBagIcon className="h-4 w-4 text-primary" />
          </div>
          <Typography variant="h6" as="span" className="font-black tracking-tight text-foreground">
            Admin
          </Typography>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
        <div>
          <Typography variant="caption" as="p" className="px-3 font-bold text-muted-foreground/70 uppercase mb-2 mt-2">
            Menu Utama
          </Typography>
          <div className="flex flex-col divide-y divide-border/10">
            <Link href="/admin" className={getLinkClass(isDashboard)}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isDashboard ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/10"}`}>
                <Squares2X2Icon className={`h-[18px] w-[18px] transition-colors ${isDashboard ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <Typography variant="body-sm" as="span" className="truncate font-medium flex-1">Dashboard</Typography>
            </Link>

            <Link href="/admin/products" className={getLinkClass(isProducts)}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isProducts ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/10"}`}>
                <CubeIcon className={`h-[18px] w-[18px] transition-colors ${isProducts ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <Typography variant="body-sm" as="span" className="truncate font-medium flex-1">Produk</Typography>
            </Link>

            <Link href="/admin/orders" className={getLinkClass(isOrders)}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isOrders ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/10"}`}>
                <ShoppingCartIcon className={`h-[18px] w-[18px] transition-colors ${isOrders ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <Typography variant="body-sm" as="span" className="truncate font-medium flex-1">Pesanan</Typography>
            </Link>

            <Link href="/admin/promos" className={getLinkClass(isPromos)}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isPromos ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/10"}`}>
                <TicketIcon className={`h-[18px] w-[18px] transition-colors ${isPromos ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <Typography variant="body-sm" as="span" className="truncate font-medium flex-1">Promo</Typography>
            </Link>

            <Link href="/admin/media" className={getLinkClass(isMedia)}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isMedia ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/10"}`}>
                <PhotoIcon className={`h-[18px] w-[18px] transition-colors ${isMedia ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <Typography variant="body-sm" as="span" className="truncate font-medium flex-1">Media</Typography>
            </Link>
          </div>
        </div>

        <div>
          <Typography variant="caption" as="p" className="px-3 font-bold text-muted-foreground/70 uppercase mb-2 mt-2">
            Pengaturan
          </Typography>
          <div className="flex flex-col divide-y divide-border/10">
            <Link href="/admin/payment-gateway" className={getLinkClass(isPayment)}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isPayment ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/10"}`}>
                <CreditCardIcon className={`h-[18px] w-[18px] transition-colors ${isPayment ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <Typography variant="body-sm" as="span" className="truncate font-medium flex-1">Metode Bayar</Typography>
            </Link>

            <Link href="/admin/account" className={getLinkClass(isAccount)}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 ${isAccount ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/10"}`}>
                <UserCircleIcon className={`h-[18px] w-[18px] transition-colors ${isAccount ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <Typography variant="body-sm" as="span" className="truncate font-medium flex-1">Akun</Typography>
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex flex-col divide-y divide-border/10">
            <a href="/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 bg-muted/50 group-hover:bg-primary/10">
                <ArrowTopRightOnSquareIcon className="h-[18px] w-[18px] transition-colors text-muted-foreground group-hover:text-primary" />
              </div>
              <Typography variant="body-sm" as="span" className="truncate font-medium flex-1">Lihat Toko</Typography>
            </a>

            <div className="py-1">
              <button
                onClick={() => signOut()}
                className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-destructive/80 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-destructive/20"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200 bg-destructive/5 group-hover:bg-destructive/15">
                  <ArrowLeftStartOnRectangleIcon className="h-[18px] w-[18px] transition-colors text-destructive" />
                </div>
                <Typography variant="body-sm" as="span" className="truncate font-bold flex-1 text-left">Keluar Sekarang</Typography>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );

  return (
    // PENGUNCIAN 1: Tambahkan overflow-x-hidden di root div untuk cegah horizontal scroll body
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 overflow-x-hidden relative">
      {/* ── TOP BAR (Hanya tampil di Mobile) ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-30 flex items-center justify-between px-4 shadow-sm w-full">
        <Link
          href="/admin"
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBagIcon className="h-4 w-4 text-primary" />
          </div>
          <Typography variant="h6" as="span" className="font-black tracking-tight text-foreground">
            Admin Panel
          </Typography>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 text-primary/80 hover:text-primary hover:bg-transparent transition-all active:scale-90"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
        >
          <AnimatedNavIcon isOpen={isMobileMenuOpen} className="h-5 w-5" />
        </Button>
      </header>

      {/* ── SIDEBAR MOBILE (Menggunakan Sheet) ── */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          hideClose
          className="flex flex-col h-full p-0 border-r border-border/40 bg-background w-[78%] max-w-[320px] overflow-hidden shadow-none md:hidden"
        >
          <VisuallyHidden>
            <SheetHeader>
              <SheetTitle>Admin Menu</SheetTitle>
            </SheetHeader>
          </VisuallyHidden>

          {/* Decorative Glow */}
          <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[50px] pointer-events-none -z-10" />

          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* ── SIDEBAR DESKTOP (Pesistent) ── */}
      <aside className="hidden md:flex flex-col dashboard-sidebar fixed inset-y-0 left-0 z-40 w-64 border-r border-border/50 bg-background/50 backdrop-blur-xl">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[50px] pointer-events-none -z-10" />
        {sidebarContent}
      </aside>

      {/* ── KONTEN UTAMA ── */}
      {/* PENGUNCIAN 2: w-full min-w-0 agar elemen ini tidak melar lebih dari layar, overflow-x-hidden untuk aman */}
      <main className="flex-1 flex flex-col min-h-screen pt-16 md:pt-0 w-full min-w-0 md:pl-64 transition-all duration-300 relative overflow-x-hidden">
        {/* PENGUNCIAN 3: w-full dan min-w-0 di dalam wrapper anak */}
        <div className="w-full flex-1 z-10 min-w-0 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
