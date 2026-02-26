// ============================================================
// FILE: src/app/(main)/products/[slug]/buy-button.tsx
// PERUBAHAN: Ganti <Button> shadcn → <PrimaryButton>
//            Logika & konfigurasi tidak diubah
// ============================================================
"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { PrimaryButton } from "@/components/ui/primary-button";

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

  // ── Handler — tidak diubah ───────────────────────────────
  const handleBuy = () => {
    setLoading(true);
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
    <PrimaryButton
      size="lg"
      loading={loading}
      onClick={handleBuy}
      disabled={loading}
      className="h-full"
    >
      {!loading && showIcon && <ShoppingCart className="h-5 w-5" />}
      Beli Sekarang
    </PrimaryButton>
  );
}
