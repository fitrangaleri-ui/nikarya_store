"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { CheckCircleIcon, RectangleStackIcon, ShoppingCartIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const router = useRouter();
  const { clearCart, addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const price = product?.price || 0;
  const discountPrice = product?.discount_price;
  const displayPrice = discountPrice || price;

  const handleBuy = () => {
    if (!product) return;

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
    <div className="w-full max-w-4xl mx-auto bg-card border border-border/50 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* ── Header Banner ── */}
      <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-8 pt-9 pb-8 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
          <div>
            {/* Title Badge - Premium Collection Seal */}
            <Badge variant="glass" className="mb-6 md:mb-8 pl-1.5 pr-5 py-1.5 rounded-full border-white/20 backdrop-blur-md group hover:bg-white/5 transition-all duration-300">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <RectangleStackIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="flex flex-col ml-3 items-start">
                <Typography variant="caption" className="uppercase text-white/50 leading-tight mb-0.5">
                  Exclusive Collection
                </Typography>
                <Typography variant="body-base" className="font-semibold text-white leading-tight tracking-tight">
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
                    className="line-through text-white/40 font-medium"
                  >
                    Rp{Number(price).toLocaleString("id-ID")}
                  </Typography>
                  <Badge className="bg-sale border-none font-normal uppercase">
                    Hemat {Math.round(((price - discountPrice) / price) * 100)}%
                  </Badge>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <Typography variant="h3" className="font-bold text-white/80">Rp</Typography>
                <Typography variant="h1" className="text-white">
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
              <Typography variant="h4" className="font-bold leading-tight mb-6">
                Investasi Terbaik untuk Efisiensi Bisnis Undangan Digital Anda.
              </Typography>
              <Typography variant="body-base" color="muted" className="leading-relaxed">
                <span className="font-bold text-foreground">NIKARYA THEME</span> dirancang khusus untuk mempermudah alur kerja Anda.
                Setiap template dalam format <span className="font-bold text-foreground">JSON</span> siap impor, memungkinkan Anda melayani klien lebih cepat dengan hasil yang tetap mewah dan profesional.
              </Typography>
            </div>
          </div>

          {/* What You Get (Features List) */}
          <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
            <Typography variant="body-base" className="font-semibold text-primary uppercase mb-4 block">
              Apa yang akan Anda dapatkan?
            </Typography>
            <Typography variant="body-sm" color="muted" className="leading-relaxed mb-6">
              Akses langsung ke koleksi <span className="font-bold">JSON</span> premium, update berkala, dan dukungan teknis untuk membantu keberhasilan instalasi Anda.
            </Typography>

            <div className="space-y-4">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-all">
                    <CheckCircleIcon className="h-4 w-4 text-primary group-hover:text-white" />
                  </div>
                  <Typography variant="body-sm" className="font-semibold text-foreground/80 transition-colors group-hover:text-primary">
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
            className="w-full md:flex-1 h-14"
          >
            <Typography variant="body-base" className="text-primary-foreground flex items-center">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin mr-2" />
              ) : (
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
              )}
              {loading ? "Memproses..." : "Pesan Sekarang"}
            </Typography>
          </Button>

          <Button
            size="lg"
            asChild
            className="w-full md:flex-1 h-14 bg-[#0088CC] hover:bg-[#0088CC]/90 text-white border-none shadow-[#0088CC]/20 group transition-all duration-300"
          >
            <Link href="https://t.me/+3eECVmQKaqBmNTI1" target="_blank" rel="noopener noreferrer">
              <Typography variant="body-base" className="text-primary-foreground flex items-center">
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
