"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { HomeIcon, FunnelIcon, UserCircleIcon, ShoppingCartIcon, SwatchIcon } from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/badge";
import { openWhatsAppPreview } from "@/components/whatsapp-button";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/context/cart-context";
import { useFilterDrawer } from "@/context/filter-drawer-context";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const baseItemClass =
  "inline-flex flex-col items-center justify-center px-1 transition-all group active:scale-95 duration-200";
const labelClassName = "text-[9px] tracking-tight";

export function BottomNav() {
  const pathname = usePathname();
  const { openCart, cartCount } = useCart();
  const { user } = useAuth();
  const { open: openFilter } = useFilterDrawer();

  const isProductsPage = pathname.startsWith("/products");
  const akunHref = user ? "/dashboard" : "/login";

  const handleCartClick = useCallback(() => {
    openCart();
  }, [openCart]);

  const handleChatClick = useCallback(() => {
    openWhatsAppPreview();
  }, []);

  const cartNavItem = (
    <button
      type="button"
      onClick={handleCartClick}
      className={cn(
        baseItemClass,
        "relative z-10 text-muted-foreground hover:text-accent pointer-events-auto touch-manipulation",
      )}
      aria-label="Buka keranjang"
    >
      <span className="relative">
        <ShoppingCartIcon className="w-5 h-5 mb-1.5 transition-transform" />
        {cartCount > 0 && (
          <Badge className="absolute -top-1.5 -right-2.5 h-4 min-w-[16px] px-1 bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-background shadow-sm animate-in zoom-in">
            {cartCount > 99 ? "99+" : cartCount}
          </Badge>
        )}
      </span>
      <span className={labelClassName}>Keranjang</span>
    </button>
  );

  const chatNavItem = (
    <button
      type="button"
      onClick={handleChatClick}
      className={cn(
        baseItemClass,
        "relative z-10 text-muted-foreground hover:text-accent pointer-events-auto touch-manipulation",
      )}
      aria-label="Buka chat WhatsApp"
    >
      <WhatsAppIcon className="w-5 h-5 mb-1.5 text-emerald-500/90 transition-transform" />
      <span className={labelClassName}>Chat</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 z-30 isolate w-full overflow-x-clip border-t border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] md:hidden safe-area-pb pointer-events-auto">
      {isProductsPage ? (
        <div className="grid h-[68px] grid-cols-5 mx-auto px-2">
          <Link
            href="/"
            className={cn(baseItemClass, "text-muted-foreground hover:text-accent")}
            aria-label="Buka halaman Home"
          >
            <HomeIcon className="w-5 h-5 mb-1.5 transition-transform" />
            <span className={labelClassName}>Home</span>
          </Link>

          <button
            type="button"
            onClick={openFilter}
            className={cn(baseItemClass, "text-muted-foreground hover:text-accent")}
            aria-label="Buka filter"
          >
            <FunnelIcon className="w-5 h-5 mb-1.5 transition-transform" />
            <span className={labelClassName}>Filter</span>
          </button>

          <Link
            href={akunHref}
            className={cn(
              baseItemClass,
              pathname === akunHref
                ? "text-accent font-bold"
                : "text-muted-foreground hover:text-accent",
            )}
            aria-label="Buka halaman akun"
          >
            <UserCircleIcon
              className={cn(
                "w-5 h-5 mb-1.5 transition-transform",
                pathname === akunHref && "scale-110",
              )}
            />
            <span className={labelClassName}>Akun</span>
          </Link>

          {cartNavItem}
          {chatNavItem}
        </div>
      ) : (
        <div className="grid h-[68px] grid-cols-4 mx-auto px-2">
          <Link
            href="/products"
            className={cn(
              baseItemClass,
              pathname === "/products"
                ? "text-accent font-bold"
                : "text-muted-foreground hover:text-accent",
            )}
          >
            <SwatchIcon
              className={cn(
                "w-5 h-5 mb-1.5 transition-transform",
                pathname === "/products" && "scale-110",
              )}
            />
            <span className={labelClassName}>Tema</span>
          </Link>

          <Link
            href={akunHref}
            className={cn(
              baseItemClass,
              pathname === akunHref
                ? "text-accent font-bold"
                : "text-muted-foreground hover:text-accent",
            )}
            aria-label="Buka halaman akun"
          >
            <UserCircleIcon
              className={cn(
                "w-5 h-5 mb-1.5 transition-transform",
                pathname === akunHref && "scale-110",
              )}
            />
            <span className={labelClassName}>Akun</span>
          </Link>

          {cartNavItem}
          {chatNavItem}
        </div>
      )}
    </div>
  );
}
