"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";

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

export function BuyButton({
  productId,
  isLoggedIn,
  productSlug,
  onAfterSuccess,
  showIcon = true,
}: {
  productId: string;
  isLoggedIn: boolean;
  productSlug: string;
  onAfterSuccess?: () => void;
  showIcon?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirectTo=/products/${productSlug}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal membuat order");
        return;
      }

      if (window.snap) {
        window.snap.pay(data.snap_token, {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onPending: () => {
            router.push("/dashboard");
          },
          onError: () => {
            alert("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            // User closed the popup without finishing
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
    <Button
      onClick={handleBuy}
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
          {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
          Beli Sekarang
        </>
      )}
    </Button>
  );
}
