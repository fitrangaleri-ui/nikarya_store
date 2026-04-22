"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { CheckCircleIcon, RectangleStackIcon, ShoppingCartIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CART_STORAGE_KEY = "customgaleri-cart";

interface PriceCardProps {
  product?: {
    id: string;
    title: string;
    slug: string;
    price: number;
    discount_price?: number;
    thumbnail_url: string | null;
  };
  features?: string[];
  themeCount?: number;
}

export function PriceCard({
  product,
  themeCount = 5,
  features = [
    "Desain clean, elegan, dan responsif",
    "Layout container",
    "Struktur rapih dan mudah diatur",
    `${themeCount} Premium Theme`,
    "Gratis Aset Script Motion Control",
    "Gratis Asset Script Animasi (HTML & CSS)",
    "Gratis Asset Image (WEBP & SVG)"
  ]
}: PriceCardProps) {
  const { clearCart, addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const price = product?.price || 0;
  const discountPrice = product?.discount_price;
  const displayPrice = discountPrice || price;

  const handleBuy = () => {
    if (!product) return;

    const cartItem = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      thumbnail_url: product.thumbnail_url,
      quantity: 1,
    };

    setLoading(true);

    try {
      clearCart();
      addToCart({
        id: cartItem.id,
        title: cartItem.title,
        slug: cartItem.slug,
        price: cartItem.price,
        thumbnail_url: cartItem.thumbnail_url,
      });

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([cartItem]));
      window.location.assign("/checkout");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-card border border-border/50 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* ── Header Banner ── */}
      <div className="relative bg-gradient-to-br from-primary to-secondary-foreground pt-9 pb-8 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 px-6 flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
          <div>
            {/* Title Badge - Premium Collection Seal */}
            {/* Title Badge - Premium Collection Seal */}
            <Badge variant="glass" className="mb-6 md:mb-8 pl-1.5 pr-5 py-1.5 rounded-full group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <RectangleStackIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="flex flex-col ml-2 items-start">
                <Typography variant="body-sm" className="font-semibold text-white leading-tight">
                  ALL THEME SERIES
                </Typography>
              </div>
            </Badge>

            {/* Pricing Section */}
            <div className="space-y-1">
              {discountPrice && price > 0 && price > discountPrice && (
                <div className="flex items-center gap-3">
                  <Typography
                    variant="h6"
                    className="line-through text-white/40 font-mono font-medium"
                  >
                    Rp{Number(price).toLocaleString("id-ID")}
                  </Typography>
                  <Badge variant="sale" className="font-normal font-monouppercase">
                    Hemat {Math.round(((price - discountPrice) / price) * 100)}%
                  </Badge>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <Typography variant="h3" className="font-bold font-mono text-white/80">Rp</Typography>
                <Typography variant="h1" className="text-white font-mono">
                  {Number(displayPrice).toLocaleString("id-ID")}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body Content ── */}
      <div className="p-8 md:p-10 space-y-10">
        {/* Content Section */}
        <div className="space-y-10">
          {/* Pitch / Intro */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Typography variant="h5" className="font-bold leading-tight mb-6">
                Investasi Terbaik untuk Efisiensi Bisnis Undangan Digital Anda.
              </Typography>
              <Typography variant="body-sm" color="muted" className=" text-[12px] md:text-base leading-relaxed">
                <span className="font-bold text-foreground">NIKARYA THEME</span> dirancang khusus untuk mempermudah alur kerja Anda.
                Setiap template dalam format <span className="font-bold text-foreground">JSON</span> siap impor, memungkinkan Anda melayani klien lebih cepat dengan hasil yang tetap mewah dan profesional.
              </Typography>
            </div>
          </div>

          {/* What You Get (Features List) */}
          <div className="px-4 md:px-8 py-4 md:py-8 bg-primary/5 rounded-2xl p-8 border border-primary/10">
            <Typography variant="body-sm" className="text-sm md:text-base font-semibold text-primary uppercase mb-4 block">
              Apa yang akan Anda dapatkan?
            </Typography>
            <Typography variant="body-sm" color="muted" className=" text-[12px] md:text-base leading-relaxed mb-6">
              Akses langsung ke koleksi <span className="font-bold">JSON</span> premium, update berkala, dan dukungan teknis untuk membantu keberhasilan instalasi Anda.
            </Typography>

            <div className="space-y-2.5">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <Typography variant="body-xs" className=" text-[12px] md:text-base font-semibold text-foreground/80">
                    {feature}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-5 pt-6 border-t border-border/50">
          <Button
            variant="brand"
            size="lg"
            onClick={handleBuy}
            disabled={loading || !product}
            className="w-full md:flex-1 h-12"
          >
            <Typography variant="body-base" as="span" className="text-primary-foreground flex items-center">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
              )}
              {loading ? "Memproses..." : "Pesan Sekarang"}
            </Typography>
          </Button>

          <Button
            size="lg"
            asChild
            className="w-full md:flex-1 h-12 bg-[#0088CC] hover:bg-[#0088CC]/90 text-white border-none hover:scale-105 active:scale-95 group transition-all duration-300"
          >
            <Link href="https://t.me/+3eECVmQKaqBmNTI1" target="_blank" rel="noopener noreferrer">
              <Typography variant="body-base" as="span" className="text-primary-foreground flex items-center">
                <PaperAirplaneIcon className="h-5 w-5 -rotate-45 mr-3 text-white group-hover:scale-110 transition-transform" />
                Join Group Telegram
              </Typography>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
