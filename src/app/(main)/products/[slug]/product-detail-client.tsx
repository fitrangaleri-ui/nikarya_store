"use client";

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
      <div className="flex flex-col gap-8 pt-6 md:pt-8">
        {/* ── BREADCRUMB ── */}
        <div className="container mx-auto max-w-6xl px-4 md:px-0">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <Link
              href="/products"
              className="hover:text-primary transition-colors"
            >
              Produk
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">
              {product.title}
            </span>
          </nav>
        </div>

        {/* ── TWO COLUMN GRID ── */}
        <section className="container mx-auto max-w-6xl px-4 md:px-0">
          <div className="grid gap-8 lg:gap-10 lg:grid-cols-2">
            {/* LEFT: IMAGE */}
            <div className="relative aspect-square overflow-hidden rounded-none bg-muted border border-border">
              {resolveImageSrc(product.thumbnail_url) ? (
                <Image
                  src={resolveImageSrc(product.thumbnail_url)!}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* RIGHT: DETAILS */}
            <div className="flex flex-col gap-5">
              {/* 1. JUDUL */}
              <div>
                <h1 className="text-2xl font-bold lg:text-3xl leading-tight text-foreground mb-3">
                  {product.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {product.sku && (
                    <span className="inline-flex items-center gap-1.5 rounded-none bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                      <Box className="h-3 w-3" />
                      {product.sku}
                    </span>
                  )}
                  {product.categories?.name && (
                    <span className="inline-flex items-center rounded-none bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
                      {product.categories.name}
                    </span>
                  )}
                  {product.tags &&
                    product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-none bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground border border-border"
                      >
                        <Tag className="mr-1 h-2.5 w-2.5" />
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
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-none border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary shadow-none font-bold transition-all"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Preview
                  </Button>
                </a>
              )}

              {/* 3. HARGA */}
              <div className="rounded-none bg-muted/30 border border-border px-4 py-3.5">
                {isDiscounted ? (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground line-through mb-0.5">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </span>
                      <span className="text-2xl font-extrabold text-primary">
                        Rp {Number(finalPrice).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-none self-start">
                      -{discountPercentage}%
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-extrabold text-primary">
                    Rp {Number(finalPrice).toLocaleString("id-ID")}
                  </span>
                )}
              </div>

              {/* 4. BENEFITS CHECKLIST */}
              <div className="space-y-2.5">
                {[
                  "File digital — download langsung setelah bayar",
                  "Maks 5x download per pembelian",
                  "Pembayaran aman via Midtrans",
                  "Support tersedia jika ada kendala",
                ].map((text) => (
                  <p
                    key={text}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                    {text}
                  </p>
                ))}
              </div>

              {/* 5. CTA BUTTONS */}
              {/* Desktop: stacked */}
              <div className="hidden lg:flex flex-col gap-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  variant="outline"
                  className="w-full rounded-none border-primary/50 text-primary hover:bg-primary/10 hover:border-primary shadow-none text-base font-bold transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Tambah ke Keranjang
                </Button>
                <BuyButton
                  productId={product.id}
                  isLoggedIn={isLoggedIn}
                  productSlug={product.slug}
                  showIcon={true}
                />
              </div>

              {/* Mobile: satu baris horizontal */}
              <div className="flex lg:hidden gap-3 items-center">
                <div className="flex-1">
                  <BuyButton
                    productId={product.id}
                    isLoggedIn={isLoggedIn}
                    productSlug={product.slug}
                    showIcon={false}
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  aria-label="Tambah ke Keranjang"
                  className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-none border-2 border-primary bg-background text-primary hover:bg-primary/10 hover:border-primary transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-primary text-primary-foreground rounded-full text-[8px] font-bold flex items-center justify-center leading-none">
                    +
                  </span>
                </button>
              </div>

              {/* 6. TRUST BADGES */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
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
                    className="flex flex-col items-center gap-1.5 text-center p-2"
                  >
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border/50">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground leading-tight">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DESKRIPSI ── */}
        {product.description && (
          <section className="container mx-auto max-w-6xl px-4 md:px-0">
            <div className="rounded-none border border-border bg-card p-5 md:p-6">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="w-1 h-5 bg-primary block" />
                Deskripsi Produk
              </h2>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm">
                {product.description}
              </p>
            </div>
          </section>
        )}

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="container mx-auto max-w-6xl px-4 md:px-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                <span className="w-1 h-6 bg-primary block" />
                Produk Terkait
              </h2>
            </div>
            {/* Menggunakan gap yang sama dengan halaman produk/home (gap-3 md:gap-6) */}
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
