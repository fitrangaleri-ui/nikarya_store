// ============================================================
// FILE: src/components/menu-sidebar.tsx
// Sidebar Menu mobile — basis komponen sama dengan CartSidebar
// Berisi: Searchbar, navigasi, dan info user
// ============================================================
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, LogOut, Palette, Search, Tag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { useState, useRef, useEffect, useCallback } from "react";

// ── Hook toggle shared state ──────────────────────────────────
let sidebarIsOpen = false;
const listeners = new Set<(isOpen: boolean) => void>();

/** Hook untuk mengakses status sidebar yang dishared antar komponen */
export function useMenuSidebar() {
  const [isOpen, setIsOpen] = useState(sidebarIsOpen);

  useEffect(() => {
    const handleChange = (val: boolean) => setIsOpen(val);
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const open = useCallback(() => {
    sidebarIsOpen = true;
    listeners.forEach((l) => l(true));
  }, []);

  const close = useCallback(() => {
    sidebarIsOpen = false;
    listeners.forEach((l) => l(false));
  }, []);

  const toggle = useCallback(() => {
    if (sidebarIsOpen) close();
    else open();
  }, [open, close]);

  return { isOpen, open, close, toggle };
}

/** Fungsi untuk membuka menu sidebar dari luar komponen */
export function openMenuSidebar() {
  sidebarIsOpen = true;
  listeners.forEach((l) => l(true));
}

export function MenuSidebar() {
  const { isOpen, close } = useMenuSidebar();
  const { user, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchString = formData.get("search")?.toString().trim();

    close();
    if (searchString) {
      router.push(`/products?search=${encodeURIComponent(searchString)}`);
    } else {
      router.push(`/products`);
    }
  };

  // Auto-focus search saat sidebar dibuka
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Delay sedikit agar animasi slide selesai
      const timer = setTimeout(() => searchInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Tutup sidebar ketika navigasi berubah
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Lock body scroll saat sidebar terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    close();
    await signOut();
  };

  // ── Nav items ──
  const navItems = [
    { href: "/products", label: "Produk" },
    { href: "/promo", label: "Promo" },
  ];

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`fixed inset-0 z-40 bg-background/20 backdrop-blur-md transition-all duration-300 ${isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Sidebar — slide dari kiri ── */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden border-r border-border/40 bg-background/92 backdrop-blur-2xl shadow-2xl transition-all duration-300 ease-out
                    w-[78%] max-w-[320px] ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
        role="dialog"
        aria-label="Menu Navigasi"
      >
        {/* Decorative blur */}
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

        {/* ── HEADER ── */}
        <div className="relative z-10 h-16 border-b border-border/40 bg-gradient-to-b from-primary/[0.08] via-card/70 to-transparent px-5 flex items-center">
          <h2 className="text-xl font-bold text-foreground uppercase">
            Menu
          </h2>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {/* ── Searchbar ── */}
          <div className="px-5 pb-4 pt-5">
            <form className="relative group" onSubmit={handleSearch}>
              <Input
                name="search"
                ref={searchInputRef}
                type="search"
                placeholder="Cari Undangan..."
                className="h-11 w-full rounded-full border-border/50 bg-muted/40 pl-4 pr-11
                           focus:bg-background focus:ring-1 focus:ring-primary
                           hover:bg-muted/60 transition-all text-sm"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Cari"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          <nav className="px-0 py-1">
            <ul className="space-y-0 pt-2 border-t border-border/40">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className="border-b border-border/40">
                    <Link
                      href={item.href}
                      onClick={close}
                      className={`group flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all duration-200 ${isActive
                        ? "bg-primary/[0.03] text-primary"
                        : "text-foreground hover:bg-muted/30 hover:text-primary"
                        }`}
                    >
                      <span className="flex-1">{item.label}</span>
                      <ArrowRight className={`h-4 w-4 transition-all duration-200 ${isActive
                        ? "translate-x-0 opacity-100"
                        : "opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100"
                        }`} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Divider ── */}
          <div className="mx-5 my-4 border-t border-border/40" />

          {/* ── User Section ── */}
          <div className="px-3 pb-6">

            {isLoading ? (
              <div className="rounded-3xl border border-border/50 bg-card/60 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-muted/50 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded-md bg-muted/50 animate-pulse" />
                    <div className="h-3 w-32 rounded-md bg-muted/40 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : user ? (
              <div className="rounded-3xl border border-border/50 bg-card/60 p-2 shadow-sm shadow-primary/5">
                {/* Info user */}
                <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0 ring-1 ring-primary/10">
                    <span className="text-xs font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Dashboard link */}
                <Link
                  href="/dashboard"
                  onClick={close}
                  className="flex items-center gap-3 border-b border-border/40 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 hover:text-primary"
                >
                  <span className="flex-1">Dashboard</span>
                  <ArrowRight className="h-4 w-4 opacity-60" />
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <span className="flex-1 text-left">Keluar</span>
                </button>
              </div>
            ) : (
              /* Belum login */
              <div className="rounded-3xl border border-border/50 bg-card/60 p-4 shadow-sm shadow-primary/5">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-foreground">
                    Login untuk lanjut
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Masuk ke dashboard dan kelola pesananmu lebih cepat.
                  </p>
                </div>
                <Button
                  variant="brand-pill"
                  size="pill"
                  asChild
                  className="w-full"
                >
                  <Link href="/login" onClick={close}>
                    <span className="tracking-tight transition-transform duration-200 ease-out group-active:translate-x-[2px] group-active:translate-y-[1px]">
                      Login
                    </span>
                    <span className="brand-pill__icon bg-background w-8 h-8 flex items-center justify-center rounded-full overflow-hidden transition-colors duration-300 ease-out group-hover:bg-primary-foreground">
                      <ArrowRight
                        className="text-foreground w-4 h-4 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:translate-x-[2px] group-hover:text-primary group-active:translate-x-[4px]"
                        strokeWidth={3}
                      />
                    </span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
