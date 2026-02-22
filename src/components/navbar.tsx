"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/context/cart-context";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { user, isLoading, signOut } = useAuth();
  const { openCart, cartCount } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSignOut = async () => {
    setShowDropdown(false);
    await signOut();
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Bagian Kiri: Logo & Menu */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              customgaleri
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase mt-1">
              INVITATION
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/products"
              className="hover:text-blue-600 transition-colors"
            >
              Produk
            </Link>
            <Link
              href="/promo"
              className="hover:text-blue-600 transition-colors"
            >
              Promo
            </Link>
          </nav>
        </div>

        {/* Bagian Kanan: Search & Icons */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-full max-w-[400px] hidden md:block">
            <Input
              type="search"
              placeholder="Cari Undangan"
              className="w-full pl-4 pr-10 rounded-full border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-1">
            {/* ✅ Cart: hidden di mobile, tampil di desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-700 hover:text-blue-600 hidden md:inline-flex"
              onClick={openCart}
              aria-label="Buka keranjang"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>

            {/* ✅ User/Akun: hidden di mobile, tampil di desktop */}
            <div className="hidden md:block">
              {isLoading ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400"
                  disabled
                >
                  <User className="h-5 w-5 animate-pulse" />
                </Button>
              ) : user ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 px-2"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <span className="text-xs font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg z-50">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-700 hover:text-blue-600"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
