"use client";

import Image from "next/image";
import { X, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: unknown) => void;
          onPending: (result: unknown) => void;
          onError: (result: unknown) => void;
          onClose: () => void;
        },
      ) => void;
    };
  }
}

export function CartSidebar() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    subtotal,
  } = useCart();

  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckoutAll = async () => {
    // Guest users go to checkout page to fill customer info
    if (!user) {
      closeCart();
      router.push("/checkout");
      return;
    }

    // Logged-in users: direct Midtrans payment
    setLoading(true);

    try {
      const res = await fetch("/api/checkout-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal membuat order");
        return;
      }

      if (window.snap) {
        window.snap.pay(data.snap_token, {
          onSuccess: () => {
            clearCart();
            closeCart();
            router.push("/dashboard");
          },
          onPending: () => {
            clearCart();
            closeCart();
            router.push("/dashboard");
          },
          onError: () => {
            alert("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            // User menutup popup tanpa bayar
          },
        });
      }
    } catch {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
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
        className={`fixed top-0 right-0 h-full z-50 flex flex-col bg-background border-l border-border transition-transform duration-300 ease-in-out
                    w-[85%] md:w-[380px] ${
                      isCartOpen ? "translate-x-0" : "translate-x-full"
                    }`}
        role="dialog"
        aria-label="Keranjang Belanja"
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
              Keranjang Belanja
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label="Tutup keranjang"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Keranjang kosong
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tambahkan produk untuk mulai belanja
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-3 p-3 group">
                  {/* Thumbnail + tombol X merah di pojok kiri atas */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-1.5 -left-1.5 z-10 w-4 h-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm opacity-0 group-hover:opacity-100 md:opacity-100"
                      aria-label="Hapus item"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>

                    <div className="w-full h-full rounded-none overflow-hidden bg-muted border border-border">
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-[11px] font-semibold text-foreground leading-snug line-clamp-2 mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground mb-2">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </p>

                    {/* Quantity Controls */}
                    <div className="inline-flex items-center border border-border rounded-none overflow-hidden w-fit">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition-colors text-xs font-bold"
                        aria-label="Kurangi"
                      >
                        −
                      </button>
                      <span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-foreground border-x border-border bg-background">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition-colors text-xs font-bold"
                        aria-label="Tambah"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── FOOTER: Subtotal + 1 tombol saja ── */}
        {cartItems.length > 0 && (
          <div className="border-t border-border p-4 space-y-3 bg-background">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Subtotal ({cartItems.length} produk)
              </span>
              <span className="text-base font-extrabold text-primary">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>

            <Button
              onClick={handleCheckoutAll}
              disabled={loading}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Pembayaran
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
