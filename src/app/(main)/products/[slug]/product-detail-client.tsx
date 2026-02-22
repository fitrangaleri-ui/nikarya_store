"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ShoppingCart,
  Eye,
  Tag,
  Box,
  BadgeCheck,
  Home,
  ChevronRight,
  ShieldCheck,
  ThumbsUp,
  Lock,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuyButton } from "./buy-button";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/cart-context";
import { resolveImageSrc } from "@/lib/resolve-image";

interface ProductData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  sku: string | null;
  demo_link: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  category_id: string | null;
  categories: { name: string } | null;
}

interface ProductDetailClientProps {
  product: ProductData;
  isLoggedIn: boolean;
  relatedProducts: any[];
}

export function ProductDetailClient({
  product,
  isLoggedIn,
  relatedProducts,
}: ProductDetailClientProps) {
  const { addToCart, openCart } = useCart();
  const [isDescOpen, setIsDescOpen] = useState(true); // State untuk Accordion Deskripsi

  const finalPrice = product.discount_price || product.price;
  const isDiscounted = !!product.discount_price;
  const discountPercentage = isDiscounted
    ? Math.round(
        ((product.price - Number(product.discount_price)) / product.price) *
          100,
      )
    : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: Number(finalPrice),
      thumbnail_url: product.thumbnail_url,
    });
    openCart();
  };

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-20 overflow-x-hidden">
      <div className="flex flex-col gap-8 pt-6 md:pt-10">
        {/* ── BREADCRUMB ── */}
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <nav className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground bg-card/40 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2.5 w-fit shadow-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <Link
              href="/products"
              className="hover:text-primary transition-colors"
            >
              Produk
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-foreground font-semibold line-clamp-1 max-w-[150px] md:max-w-[300px]">
              {product.title}
            </span>
          </nav>
        </div>

        {/* ── TWO COLUMN GRID ── */}
        <section className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-start">
            {/* LEFT: IMAGE (Liquid Glass Theme) */}
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted/20 border border-border/40 shadow-xl shadow-primary/5 group">
              {resolveImageSrc(product.thumbnail_url) ? (
                <Image
                  src={resolveImageSrc(product.thumbnail_url)!}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/5 transition-colors duration-300 pointer-events-none" />
            </div>

            {/* RIGHT: DETAILS */}
            <div className="flex flex-col gap-6">
              {/* 1. JUDUL & BADGE */}
              <div>
                <h1 className="text-3xl font-black lg:text-4xl leading-tight text-foreground mb-4 tracking-tight">
                  {product.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {product.sku && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary ring-1 ring-inset ring-primary/20 tracking-wider uppercase">
                      <Box className="h-3 w-3" />
                      {product.sku}
                    </span>
                  )}
                  {product.categories?.name && (
                    <span className="inline-flex items-center rounded-full bg-card/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-foreground border border-border/50 tracking-wide uppercase shadow-sm">
                      {product.categories.name}
                    </span>
                  )}
                  {product.tags &&
                    product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-card/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-muted-foreground border border-border/50 tracking-wide uppercase shadow-sm"
                      >
                        <Tag className="mr-1.5 h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* 2. TOMBOL PREVIEW */}
              {product.demo_link && (
                <a
                  href={product.demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-full border-border/60 text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/40 shadow-sm h-12 transition-all"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Preview
                  </Button>
                </a>
              )}

              {/* 3. HARGA (Liquid Glass Card) */}
              <div className="rounded-2xl bg-card/50 backdrop-blur-md border border-border/50 px-5 py-4 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />

                {isDiscounted ? (
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-sm md:text-base text-muted-foreground line-through mb-1 font-medium">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </span>
                      <span className="text-3xl font-black text-primary tracking-tight">
                        Rp {Number(finalPrice).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <span className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Hemat {discountPercentage}%
                    </span>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <span className="text-3xl font-black text-primary tracking-tight">
                      Rp {Number(finalPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>

              {/* 4. BENEFITS CHECKLIST */}
              <div className="space-y-3">
                {[
                  "File digital — download langsung setelah bayar",
                  "Maks 5x download per pembelian",
                  "Pembayaran aman via payment gateway",
                  "Support tersedia jika ada kendala",
                ].map((text) => (
                  <p
                    key={text}
                    className="flex items-center gap-3 text-sm md:text-base text-muted-foreground font-medium"
                  >
                    <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />
                    {text}
                  </p>
                ))}
              </div>

              {/* 5. CTA BUTTONS */}
              <div className="hidden lg:flex flex-col gap-3.5">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-primary/40 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground shadow-sm h-14 transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Tambah ke Keranjang
                </Button>

                <div className="h-14">
                  <BuyButton
                    productId={product.id}
                    isLoggedIn={isLoggedIn}
                    productSlug={product.slug}
                    showIcon={true}
                  />
                </div>
              </div>

              <div className="flex lg:hidden gap-3 items-center mt-2">
                <button
                  onClick={handleAddToCart}
                  aria-label="Tambah ke Keranjang"
                  className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-[0.96]"
                >
                  <ShoppingCart className="h-6 w-6" />
                </button>
                <div className="flex-1 h-14">
                  <BuyButton
                    productId={product.id}
                    isLoggedIn={isLoggedIn}
                    productSlug={product.slug}
                    showIcon={false}
                  />
                </div>
              </div>

              {/* 6. TRUST BADGES */}
              <div className="grid grid-cols-3 gap-2 pt-6 mt-2 border-t border-border/40">
                {[
                  { icon: ShieldCheck, label: "Secure", sublabel: "Checkout" },
                  {
                    icon: ThumbsUp,
                    label: "Satisfaction",
                    sublabel: "Guarantee",
                  },
                  { icon: Lock, label: "Privacy", sublabel: "Protected" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 text-center p-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-card/60 backdrop-blur-sm flex items-center justify-center border border-border/50 group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                      <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-foreground leading-tight tracking-wider uppercase">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DESKRIPSI (ACCORDION) ── */}
        {product.description && (
          <section className="container mx-auto max-w-6xl px-4 md:px-6 mt-4">
            <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md shadow-sm overflow-hidden">
              <button
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-card/50 transition-colors focus:outline-none"
                aria-expanded={isDescOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary rounded-full block" />
                  <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                    Deskripsi Produk
                  </h2>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
                    isDescOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isDescOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 md:p-8 pt-0 md:pt-0">
                    <div className="w-full h-px bg-border/50 mb-6" />
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm md:text-base">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="container mx-auto max-w-6xl px-4 md:px-6 mt-6">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3 tracking-tight">
                <span className="w-1.5 h-7 bg-primary rounded-full block" />
                Produk Terkait
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((rp: any) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
