// ============================================================
// FILE: src/components/navbar.tsx
// ============================================================
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  X,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/context/cart-context";
import { useState, useRef, useEffect } from "react";

// ── Custom Burger Menu Icon ───────────────────────────────────
// SVG inline, viewBox di-crop agar 3 garis memenuhi ruang icon
function MenuBurgerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="64 128 384 256"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M64,384h384v-42.666H64V384z M64,277.334h384v-42.667H64V277.334z M64,128v42.666h384V128H64z" />
    </svg>
  );
}

export function Navbar() {
  // ── State & context ───────────────────────────────────────
  const { user, isLoading, signOut } = useAuth();
  const { openCart, cartCount } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // ── Refs ──────────────────────────────────────────────────
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus input search mobile saat dibuka
  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showMobileSearch]);

  // ── Handlers ─────────────────────────────────────────────
  const handleSignOut = async () => {
    setShowDropdown(false);
    await signOut();
  };

  // Nama tampilan avatar / dropdown
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md shadow-sm">
      {/* ── Baris utama navbar — py-2 (8px atas bawah) ── */}
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* ════════════════════════════════════════════════ */}
        {/* KIRI — Logo + Navigasi Desktop                  */}
        {/* ════════════════════════════════════════════════ */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-nikarya.png"
              alt="Logo Brand"
              width={56}
              height={56}
              priority
              className="h-11 w-11 md:h-12 md:w-12 object-contain shrink-0
                         transition-all duration-200
                         group-hover:scale-110 group-hover:opacity-80"
            />
          </Link>

          {/* Navigasi Produk & Promo — hanya desktop */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/products"
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              Produk
            </Link>
            <Link
              href="/promo"
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              Promo
            </Link>
          </nav>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* KANAN — Search, Cart, User, Hamburger           */}
        {/* ════════════════════════════════════════════════ */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          {/* Search bar — hanya desktop (Tinggi: h-9) */}
          <div className="relative w-full max-w-[320px] hidden md:block group mr-2">
            <Input
              type="search"
              placeholder="Cari Undangan..."
              className="w-full pl-4 pr-10 h-9 rounded-full border-border/50 bg-muted/40
                         focus:bg-background focus:ring-1 focus:ring-primary
                         hover:border-primary/40 hover:bg-muted/60
                         transition-all text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>

          {/* Tombol toggle search — hanya mobile (42px) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-[42px] w-[42px] text-primary hover:text-primary
                       hover:bg-primary/15 rounded-full
                       transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Cari"
          >
            {showMobileSearch ? (
              <X className="h-[22px] w-[22px]" />
            ) : (
              <Search className="h-[22px] w-[22px]" />
            )}
          </Button>

          {/* Tombol cart — hanya desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-primary hover:text-primary
                       hover:bg-primary/15 hidden md:inline-flex rounded-full
                       transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={openCart}
            aria-label="Buka keranjang"
          >
            <ShoppingCart className="h-5 w-5" />
            {/* Badge jumlah item keranjang */}
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-background">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Button>

          {/* ════════════════════════════════════════════════ */}
          {/* USER SECTION — hanya desktop                    */}
          {/* Tiga kondisi: loading | sudah login | belum login */}
          {/* ════════════════════════════════════════════════ */}
          <div className="hidden md:block ml-1">
            {isLoading ? (
              /* Loading: icon user dengan animasi pulse */
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground rounded-full"
                disabled
              >
                <User className="h-5 w-5 animate-pulse" />
              </Button>
            ) : user ? (
              /* Sudah login: avatar + dropdown (Tinggi: h-9) */
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-foreground hover:text-primary hover:bg-primary/10 px-2 h-9 rounded-full transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {/* Avatar inisial */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary shrink-0">
                    <span className="text-xs font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Nama user */}
                  <span className="hidden lg:inline text-sm font-medium max-w-[100px] truncate">
                    {displayName}
                  </span>
                  {/* Chevron rotasi saat dropdown terbuka */}
                  <ChevronDown
                    className={`h-3.5 w-3.5 opacity-50 transition-transform duration-200 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {/* Panel dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-border/50 bg-background/95 backdrop-blur-md py-1.5 shadow-lg shadow-black/5 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {/* Info singkat user */}
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="text-sm font-medium text-foreground truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {/* Link dashboard */}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {/* Tombol logout */}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ══ Belum login: tombol Masuk pill (Tinggi: h-9) ══ */
              <Link href="/login">
                <button
                  className="
                    flex items-center gap-2
                    pl-4 pr-1 h-9
                    rounded-full
                    bg-primary
                    hover:bg-primary/90
                    transition-all duration-200
                    hover:scale-[1.03] active:scale-[0.98]
                    shadow-sm shadow-primary/30
                    group
                  "
                >
                  {/* Teks Login */}
                  <span className="text-sm font-medium text-primary-foreground tracking-wide">
                    Login
                  </span>
                  {/* Icon panah dalam bubble putih (diperkecil agar proporsional dengan h-9) */}
                  <span
                    className="
                      flex items-center justify-center
                      w-7 h-7 rounded-full
                      bg-primary-foreground
                      text-primary
                      transition-colors duration-200
                      shrink-0
                    "
                  >
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </span>
                </button>
              </Link>
            )}
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* HAMBURGER — hanya mobile (42px)                 */}
          {/* ════════════════════════════════════════════════ */}
          <Link href="/menu" className="md:hidden ml-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-[42px] w-[42px] text-primary hover:text-primary
                         hover:bg-primary/15 rounded-full
                         transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Menu"
            >
              <MenuBurgerIcon className="h-[22px] w-[22px]" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Search bar mobile expandable ── */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="relative group">
            <Input
              ref={mobileSearchRef}
              type="search"
              placeholder="Cari Undangan..."
              className="w-full pl-4 pr-10 h-10 rounded-full border-border/50 bg-muted/40
                         focus:bg-background focus:ring-1 focus:ring-primary
                         transition-all text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
        </div>
      )}
    </header>
  );
}
