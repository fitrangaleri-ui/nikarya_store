// ============================================================
// FILE: src/components/cart-sidebar.tsx
// PERUBAHAN: Gunakan komponen Sheet, Typography, dan Heroicons
// agar konsisten dengan design system & menu-sidebar.tsx
// ============================================================
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";

import { Loader2 } from "lucide-react";
import {
  ShoppingBagIcon as ShoppingBagSolidIcon,
} from "@heroicons/react/24/solid";
import {
  XMarkIcon,
  ShoppingBagIcon as ShoppingBagOutlineIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CartSidebar() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  const router = useRouter();
  const [loading] = useState(false);

  const handleCheckoutAll = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(val) => !val && closeCart()}>
      <SheetContent
        side="right"
        hideClose
        className="flex flex-col h-full p-0 border-l border-border/40 bg-background/92 backdrop-blur-2xl w-[90%] sm:w-[400px] shadow-none overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[60px] rounded-full pointer-events-none -z-10" />
        <div className="pointer-events-none absolute left-0 bottom-32 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity duration-500" />

        {/* ── HEADER ── */}
        <SheetHeader className="relative z-10 h-16 border-b border-border/40 bg-gradient-to-b from-primary/[0.08] via-card/70 to-transparent px-5 flex flex-row items-center text-left sm:text-left space-y-0">
          <SheetTitle asChild>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShoppingBagSolidIcon className="w-4 h-4 text-primary" />
              </div>
              <Typography variant="h6" as="h2" className="font-semibold uppercase">
                Keranjang Saya
              </Typography>
              {cartItems.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ml-1">
                  {cartItems.length}
                </span>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/[0.08] border border-border/50 flex items-center justify-center mb-5">
                <ShoppingBagOutlineIcon className="h-8 w-8 text-primary/60" />
              </div>
              <Typography variant="h6" as="p" className="font-bold tracking-tight">
                Keranjang masih kosong
              </Typography>
              <Typography variant="body-sm" color="muted" className="text-center mt-2 max-w-[200px]">
                Mari tambahkan produk luar biasa ke keranjang Anda.
              </Typography>

              <Button
                onClick={closeCart}
                variant="outline"
                size="default"
                className="mt-6"
              >
                Mulai Belanja
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/40 p-3 pt-1">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 p-3 bg-card/20 hover:bg-card/40 rounded-2xl transition-colors group relative border border-transparent hover:border-border/50 mt-2 first:mt-0"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-2 -left-2 z-20 w-6 h-6 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Hapus item"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <div className="w-full h-full rounded-xl overflow-hidden bg-muted/30 border border-border/50 relative">
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBagOutlineIcon className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <Typography variant="body-sm" className="font-bold leading-snug line-clamp-2 pr-1">
                        {item.title}
                      </Typography>
                      <Typography variant="caption" className="font-mono font-semibold text-primary mt-1 block">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </Typography>
                    </div>

                    {/* Quantity Controls */}
                    <div className="inline-flex items-center bg-background border border-border/60 rounded-full h-7 mt-2 w-fit">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-full transition-colors"
                        aria-label="Kurangi"
                      >
                        <MinusIcon className="h-3 w-3" />
                      </button>
                      <Typography variant="caption" as="span" className="w-6 text-center font-mono font-bold">
                        {item.quantity}
                      </Typography>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-full transition-colors"
                        aria-label="Tambah"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── FOOTER ── */}
        {cartItems.length > 0 && (
          <div className="border-t border-border/40 p-5 bg-card/60 backdrop-blur-md relative z-10">
            <div className="flex items-end justify-between mb-4">
              <Typography variant="body-sm" color="muted" className="font-semibold">
                Total Pembayaran
              </Typography>
              <Typography variant="h6" className="font-mono font-bold text-primary tracking-tight">
                Rp {subtotal.toLocaleString("id-ID")}
              </Typography>
            </div>

            <Button
              onClick={handleCheckoutAll}
              disabled={loading}
              variant="brand"
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                <>
                  <span className="flex-1 text-center font-semibold text-[15px]">Lanjut Pembayaran</span>
                  <div className="brand-pill__icon !ml-0">
                    <ArrowRightIcon className="h-4 w-4" />
                  </div>
                </>
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

