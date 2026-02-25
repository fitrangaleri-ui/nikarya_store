"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";

export function BuyButton({
  product,
  showIcon = true,
}: {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    thumbnail_url: string | null;
  };
  showIcon?: boolean;
}) {
  const router = useRouter();
  const { clearCart, addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleBuy = () => {
    setLoading(true);

    // Use the same cart pipeline: clear cart → add this product → go to checkout
    clearCart();
    addToCart({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      thumbnail_url: product.thumbnail_url,
    });
    router.push("/checkout");
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      size="lg"
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-full hover:shadow-[0_6px_20px_rgba(13,148,136,0.23)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none h-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
          Memproses...
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="mr-2.5 h-5 w-5" />}
          Beli Sekarang
        </>
      )}
    </Button>
  );
}
