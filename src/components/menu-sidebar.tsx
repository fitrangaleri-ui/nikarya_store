// ============================================================
// FILE: src/components/menu-sidebar.tsx
// Sidebar Menu mobile — basis komponen sama dengan CartSidebar
// Berisi: Searchbar, navigasi, dan info user
// ============================================================
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowLeftStartOnRectangleIcon,
  UserIcon as UserSolidIcon
} from "@heroicons/react/24/solid";
import {
  ArrowRightIcon as ArrowRightOutlineIcon,
  MagnifyingGlassIcon as SearchOutlineIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { useState, useRef, useEffect, useCallback } from "react";
import { Typography } from "@/components/ui/typography";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

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
      const timer = setTimeout(() => searchInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Tutup sidebar ketika navigasi berubah
  useEffect(() => {
    close();
  }, [pathname, close]);

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
    <Sheet open={isOpen} onOpenChange={(val) => !val && close()}>
      <SheetContent
        side="left"
        hideClose
        className="flex flex-col h-full p-0 border-r border-border/40 bg-background/92 backdrop-blur-2xl w-[78%] max-w-[320px] overflow-hidden shadow-none"
      >
        {/* Decorative blur */}
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity duration-500" />

        {/* ── HEADER ── */}
        <SheetHeader className="relative z-10 h-16 border-b border-border/40 bg-gradient-to-b from-primary/[0.08] via-card/70 to-transparent px-5 flex flex-row items-center justify-between text-left sm:text-left space-y-0">
          <SheetTitle asChild>
            <Typography variant="h6" as="h2" className="font-semibold uppercase">
              Menu
            </Typography>
          </SheetTitle>
        </SheetHeader>

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
                <SearchOutlineIcon className="h-4 w-4" />
              </button>
            </form>
            <Separator className="mt-6 bg-border/40" />
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
                      className={`group flex items-center gap-3 px-5 py-4 transition-all duration-200 ${isActive
                        ? "bg-primary/[0.03] text-primary"
                        : "text-foreground hover:bg-muted/30 hover:text-primary"
                        }`}
                    >
                      <Typography variant="body-sm" as="span" className="flex-1 font-semibold">
                        {item.label}
                      </Typography>
                      <ArrowRightOutlineIcon className={`h-4 w-4 transition-all duration-200 ${isActive
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
          <div className="px-5 my-4">
            <Separator className="bg-border/40" />
          </div>

          {/* ── User Section ── */}
          <div className="px-5 pb-8">
            {isLoading ? (
              <div className="rounded-2xl border border-border/50 bg-card/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-muted/50 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded-md bg-muted/50 animate-pulse" />
                    <div className="h-3 w-32 rounded-md bg-muted/40 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : user ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary-foreground p-1">
                {/* Decorative Circles (Hero Style) */}
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/5 pointer-events-none" />

                {/* Info user */}
                <div className="relative z-10 flex items-center gap-3 rounded-xl px-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white shrink-0 ring-1 ring-white/20 backdrop-blur-md">
                    <Typography variant="h6" as="span" className="font-bold !text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </Typography>
                  </div>
                  <div className="min-w-0">
                    <Typography variant="body-sm" className="font-bold truncate !text-white">
                      {displayName}
                    </Typography>
                    <Typography variant="caption" className="truncate !text-white/60">
                      {user.email}
                    </Typography>
                  </div>
                </div>

                {/* Dashboard link */}
                <Link
                  href="/dashboard"
                  onClick={close}
                  className="relative z-10 flex items-center gap-3 border-t border-white/10 px-5 py-4 !text-white/90 transition-all hover:bg-white/10 group"
                >
                  <Typography variant="body-sm" as="span" className="flex-1 font-semibold !text-white">
                    Dashboard
                  </Typography>
                  <ArrowRightOutlineIcon className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-white" />
                </Link>

                <button
                  onClick={handleSignOut}
                  className="relative z-10 flex w-full items-center gap-3 px-5 py-4 !text-white/80 transition-all hover:bg-white/10 rounded-b-xl group"
                >
                  <Typography variant="body-sm" as="span" className="flex-1 text-left font-semibold !text-white">
                    Keluar
                  </Typography>
                  <ArrowLeftStartOnRectangleIcon className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity text-white" />
                </button>
              </div>
            ) : (
              /* Belum login */
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary-foreground p-6">
                {/* Decorative Circles (Hero Style) */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-white/5 pointer-events-none" />

                <div className="relative z-10 mb-5">
                  <Typography variant="body-sm" className="font-extrabold mb-1 !text-white">
                    Login untuk lanjut
                  </Typography>
                  <Typography variant="caption" className="!text-white/70">
                    Masuk ke dashboard dan kelola pesananmu lebih cepat.
                  </Typography>
                </div>
                <Button variant="secondary" size="lg" asChild className="relative z-10 w-fit">
                  <Link href="/login" onClick={close}>
                    <UserSolidIcon className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
