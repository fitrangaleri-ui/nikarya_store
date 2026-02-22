"use client";

import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Bagian Kiri: Logo & Menu */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
              customgaleri
            </span>
            <span className="text-[10px] font-semibold text-primary tracking-widest uppercase mt-1">
              INVITATION
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="/products"
              className="hover:text-primary transition-colors"
            >
              Produk
            </Link>
            <Link
              href="/promo"
              className="hover:text-primary transition-colors"
            >
              Promo
            </Link>
          </nav>
        </div>

        {/* Bagian Kanan: Search, Icons, & Mobile Menu */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-full max-w-[400px] hidden md:block group">
            <Input
              type="search"
              placeholder="Cari Undangan"
              className="w-full pl-4 pr-10 rounded-full border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary transition-all"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground hover:text-primary hover:bg-primary/10 hidden md:inline-flex rounded-full transition-colors"
              onClick={openCart}
              aria-label="Buka keranjang"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>

            <div className="hidden md:block">
              {isLoading ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground rounded-full"
                  disabled
                >
                  <User className="h-5 w-5 animate-pulse" />
                </Button>
              ) : user ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 text-foreground hover:text-primary hover:bg-primary/10 px-2 rounded-full transition-colors"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
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
                    <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-border/50 bg-background/80 backdrop-blur-md py-1.5 shadow-lg shadow-black/5 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-3 py-2 border-b border-border/50">
                        <p className="text-sm font-medium text-foreground truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
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
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            {/* MOCKUP HAMBURGER MENU (Hanya tampil di Mobile) */}
            <Link href="/menu" className="md:hidden ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
