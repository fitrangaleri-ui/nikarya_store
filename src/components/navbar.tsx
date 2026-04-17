"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { useMenuSidebar } from "@/components/menu-sidebar";
import { useCart } from "@/context/cart-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useRef, useState, type ReactNode } from "react";

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

function DesktopNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-full px-3 py-1.5 transition-colors hover:bg-primary/10"
    >
      <Typography
        variant="body-sm"
        as="span"
        className="font-semibold text-muted-foreground group-hover:text-primary transition-colors"
      >
        {children}
      </Typography>
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const { openCart, cartCount } = useCart();
  const { isOpen, toggle } = useMenuSidebar();

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDropdown(false);
        dropdownButtonRef.current?.focus();
      }
    }

    if (!showDropdown) {
      return;
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [showDropdown]);

  const handleSignOut = async () => {
    setSignOutError(null);

    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Gagal keluar. Coba lagi.",
      );
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery("");
    }
  };

  const fullName = user?.user_metadata?.full_name?.trim();
  const emailName = user?.email?.split("@")[0]?.trim();
  const displayName = fullName || emailName || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const dropdownId = "navbar-user-dropdown";

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-border/40 bg-background/70 shadow-sm backdrop-blur-lg transition-all duration-300 flex items-center justify-center">
      <div className="container mx-auto flex h-16 w-full items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex shrink-0 items-center">
          <Link href="/" className="group flex items-center">
            <Image
              src="/logo-nikarya.png"
              alt="Logo Brand"
              width={56}
              height={56}
              priority
              quality={100}
              unoptimized
              className="h-11 w-11 md:h-12 md:w-12 shrink-0 object-contain transition-all duration-200 group-hover:scale-110 group-hover:opacity-80"
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 md:gap-2">
          <nav className="mr-2 hidden items-center gap-1 text-sm font-medium md:flex">
            <DesktopNavLink href="/products">Produk</DesktopNavLink>
            <DesktopNavLink href="/promo">Promo</DesktopNavLink>
          </nav>

          <form
            onSubmit={handleSearch}
            className="group relative mr-2 hidden w-full max-w-[280px] md:block lg:max-w-[320px]"
          >
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Undangan..."
              className="h-9 w-full rounded-full border-border/50 bg-muted/40 pl-4 pr-10 text-sm transition-all hover:border-primary/40 hover:bg-muted/60 focus:bg-background focus:ring-1 focus:ring-primary"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon-xs"
              aria-label="Cari"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground group-focus-within:text-primary hover:bg-transparent hover:text-primary"
            >
              <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary hover:text-primary" />
            </Button>
          </form>

          <Button
            variant="ghost"
            size="icon"
            className="relative hidden h-10 w-10 rounded-full text-primary transition-all duration-200 hover:scale-110 hover:bg-primary/15 hover:text-primary active:scale-95 md:inline-flex"
            onClick={openCart}
            aria-label="Buka keranjang"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 text-[9px] font-bold text-primary-foreground ring-2 ring-background">
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </Button>

          <div className="ml-1 hidden md:block">
            {isLoading ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground"
                disabled
              >
                <UserIcon className="h-5 w-5 animate-pulse" />
              </Button>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  ref={dropdownButtonRef}
                  variant="ghost"
                  size="sm"
                  className="flex h-9 items-center gap-1.5 rounded-full px-2 text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={() => {
                    setSignOutError(null);
                    setShowDropdown((current) => !current);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={showDropdown}
                  aria-controls={dropdownId}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Typography
                      variant="caption"
                      as="span"
                      className="font-bold text-primary"
                      aria-hidden="true"
                    >
                      {userInitial}
                    </Typography>
                  </div>
                  <Typography
                    variant="body-sm"
                    as="span"
                    className="hidden max-w-[100px] truncate font-semibold text-foreground lg:inline-flex"
                  >
                    {displayName}
                  </Typography>
                  <ChevronDownIcon
                    className={`h-4 w-4 opacity-50 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                  />
                </Button>

                {showDropdown && (
                  <div
                    id={dropdownId}
                    role="menu"
                    aria-label="Menu akun"
                    className="absolute right-0 top-full z-50 mt-1.5 w-52 animate-in rounded-xl border border-border/50 bg-background/95 py-1.5 shadow-lg shadow-black/5 backdrop-blur-md fade-in zoom-in-95 duration-200"
                  >
                    <div className="border-b border-border/50 px-3.5 py-2.5">
                      <Typography variant="body-sm" className="truncate font-bold text-foreground">
                        {displayName}
                      </Typography>
                      <Typography variant="caption" className="truncate text-muted-foreground/70">
                        {user.email}
                      </Typography>
                    </div>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      onClick={() => {
                        setSignOutError(null);
                        setShowDropdown(false);
                      }}
                    >
                      <UserIcon className="h-4 w-4" />
                      <Typography variant="body-sm">Dashboard</Typography>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      role="menuitem"
                      className="flex h-auto w-full justify-start gap-2 rounded-none px-3.5 py-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <Typography variant="body-sm">Keluar</Typography>
                    </Button>
                    {signOutError && (
                      <Typography variant="caption" className="px-3.5 pt-1 text-destructive" role="alert">
                        {signOutError}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Button variant="brand-pill" size="default" asChild>
                <Link
                  href="/login"
                  className="group flex items-center justify-between gap-3 pr-1"
                >
                  <Typography
                    variant="body-sm"
                    className="font-bold tracking-tight transition-transform duration-200 ease-out group-active:translate-x-[2px] group-active:translate-y-[1px]"
                  >
                    Login
                  </Typography>

                  <span className="brand-pill__icon flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-background transition-colors duration-300 ease-out group-hover:bg-primary-foreground">
                    <ArrowRightIcon
                      className="h-4 w-4 text-foreground transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[2px] group-hover:scale-110 group-hover:text-primary group-active:translate-x-[4px]"
                      strokeWidth={2}
                    />
                  </span>
                </Link>
              </Button>
            )}
          </div>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="ml-1 flex h-10 w-10 items-center justify-center text-primary/80 transition-all duration-200 hover:bg-transparent hover:text-primary active:scale-90 md:hidden"
            onClick={toggle}
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          >
            <AnimatedNavIcon isOpen={isOpen} className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
