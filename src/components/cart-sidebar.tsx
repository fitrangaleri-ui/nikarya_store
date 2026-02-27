// ============================================================
// FILE: src/components/cart-sidebar.tsx
// PERUBAHAN: Hapus className override pada tombol checkout &
//            tombol "Mulai Belanja" — cukup pakai variant & size
// ============================================================
"use client";

import { X, ShoppingBag, ArrowRight, Loader2, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 flex flex-col bg-background/95 backdrop-blur-2xl border-l border-border/50 transition-transform duration-300 ease-out shadow-2xl
                    w-[90%] sm:w-[400px] ${
                      isCartOpen ? "translate-x-0" : "translate-x-full"
                    }`}
        role="dialog"
        aria-label="Keranjang Belanja"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[60px] rounded-full pointer-events-none -z-10" />

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/30 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Keranjang Saya
            </h2>
            {cartItems.length > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
            aria-label="Tutup keranjang"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-5 shadow-sm">
                <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-bold text-foreground tracking-tight">
                Keranjang masih kosong
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                Mari tambahkan produk luar biasa ke keranjang Anda.
              </p>

              {/* ── Tombol Mulai Belanja — hapus className override ── */}
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
            <ul className="divide-y divide-border/40 p-3">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 p-3 bg-card/20 hover:bg-card/40 rounded-2xl transition-colors group relative"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-2 -left-2 z-20 w-6 h-6 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Hapus item"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="w-full h-full rounded-xl overflow-hidden bg-muted/30 border border-border/50 shadow-sm relative">
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="text-xs md:text-sm font-bold text-foreground leading-snug line-clamp-2 pr-1">
                        {item.title}
                      </p>
                      <p className="text-xs font-semibold text-primary mt-1">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="inline-flex items-center bg-background border border-border/60 rounded-full h-7 mt-2 w-fit shadow-sm">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-full transition-colors"
                        aria-label="Kurangi"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-[11px] font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-full transition-colors"
                        aria-label="Tambah"
                      >
                        <Plus className="h-3 w-3" />
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
          <div className="border-t border-border/40 p-5 bg-card/60 backdrop-blur-md relative z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex items-end justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">
                Total Pembayaran
              </span>
              <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>

            {/* ── Tombol Checkout — hapus semua className override ── */}
            <Button
              onClick={handleCheckoutAll}
              disabled={loading}
              variant="brand"
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Pembayaran
                  <span className="brand-pill__icon">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </>
              )}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
