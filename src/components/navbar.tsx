"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/context/cart-context";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  // State & context: autentikasi user
  const { user, isLoading, signOut } = useAuth();
  // State & context: keranjang belanja
  const { openCart, cartCount } = useCart();
  // State dropdown user (avatar)
  const [showDropdown, setShowDropdown] = useState(false);
  // State untuk toggle search bar di mobile
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Ref untuk mendeteksi klik di luar dropdown user
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Ref untuk auto-focus input search di mobile
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Listener untuk menutup dropdown saat klik di luar area dropdown
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

  // Auto-focus input search ketika search mobile dibuka
  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showMobileSearch]);

  // Handler untuk sign out user
  const handleSignOut = async () => {
    setShowDropdown(false);
    await signOut();
  };

  // Nama yang ditampilkan pada avatar / dropdown
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md shadow-sm">
      {/* ── Baris utama navbar (logo, nav, search, icon) ───────────────── */}
      {/*    Tinggi: mobile h-[84px] (56×1.5), desktop h-24 (64×1.5)       */}
      <div className="container mx-auto px-4 h-[84px] md:h-24 flex items-center justify-between gap-3">
        {/* ── Kiri: Logo + navigasi desktop ───────────────────────────── */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Link ke halaman utama — hover: scale naik + opacity turun */}
          <Link href="/" className="flex items-center group">
            <div className="flex items-center">
              {/* Logo brand — diperbesar + animasi hover scale & opacity */}
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
            </div>
          </Link>

          {/* Navigasi utama (Produk, Promo) — hanya tampil di desktop */}
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

        {/* ── Kanan: Search, cart, user, hamburger ───────────────────── */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          {/* Search bar full-width — hanya tampil di desktop */}
          <div className="relative w-full max-w-[320px] hidden md:block group mr-2">
            <Input
              type="search"
              placeholder="Cari Undangan..."
              className="w-full pl-4 pr-10 h-9 rounded-full border-border/50 bg-muted/40
                         focus:bg-background focus:ring-1 focus:ring-primary
                         hover:border-primary/40 hover:bg-muted/60
                         transition-all text-sm"
            />
            {/* Icon search desktop — berubah warna saat input fokus */}
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>

          {/* Tombol toggle search — hanya tampil di mobile               */}
          {/* Hover: warna primary + scale + background teal tipis        */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 text-primary hover:text-primary
                       hover:bg-primary/15 rounded-full
                       transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Cari"
          >
            {showMobileSearch ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          {/* Tombol cart — hidden di mobile, visible di desktop          */}
          {/* Hover: warna primary + scale + background teal tipis        */}
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
            {/* Badge jumlah item di keranjang */}
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-background">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Button>

          {/* Bagian user (avatar / tombol masuk) — hanya di desktop ─── */}
          <div className="hidden md:block ml-1">
            {isLoading ? (
              // State loading: tampilkan ikon user dengan animasi pulse
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground rounded-full"
                disabled
              >
                <User className="h-5 w-5 animate-pulse" />
              </Button>
            ) : user ? (
              // Saat user sudah login: tampilkan avatar + dropdown
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-foreground hover:text-primary hover:bg-primary/10 px-2 h-9 rounded-full transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {/* Avatar dengan inisial user */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary shrink-0">
                    <span className="text-xs font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Nama user (disembunyikan di layar kecil desktop) */}
                  <span className="hidden lg:inline text-sm font-medium max-w-[100px] truncate">
                    {displayName}
                  </span>
                  {/* Icon chevron dengan animasi rotate saat dropdown terbuka */}
                  <ChevronDown
                    className={`h-3.5 w-3.5 opacity-50 transition-transform duration-200 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {/* Panel dropdown user */}
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
                    {/* Link ke dashboard */}
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
              // Jika belum login: tampilkan tombol Masuk
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors px-3"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Masuk</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Hamburger / menu icon — hanya tampil di mobile              */}
          {/* Hover: warna primary + scale + background teal tipis        */}
          <Link href="/menu" className="md:hidden ml-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-primary hover:text-primary
                         hover:bg-primary/15 rounded-full
                         transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Search bar untuk mobile (expandable di bawah navbar) ─────── */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
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
