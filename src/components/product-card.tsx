// ============================================================
// FILE: src/components/product-card.tsx
// PERUBAHAN: Hapus semua className override pada Button
//            → cukup pakai variant & size yang sudah ada
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, Eye, ShoppingCart } from "lucide-react";
import { resolveImageSrc } from "@/lib/resolve-image";

export function ProductCard({ product }: { product: any }) {
  const price = Number(product.price) || 0;
  const discountPrice = product.discount_price
    ? Number(product.discount_price)
    : null;

  const discountPercentage =
    discountPrice && price
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;

  const firstTag =
    product.tags && Array.isArray(product.tags) && product.tags.length > 0
      ? product.tags[0]
      : null;

  const displayPrice = discountPrice || price;
  const imageSrc = resolveImageSrc(product.thumbnail_url);

  return (
    <div className="group flex flex-col bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 h-full relative hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
      {/* 1. IMAGE */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden border-b border-border/40">
        <Link
          href={`/products/${product.slug}`}
          className="block w-full h-full"
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.title || "Product image"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/30">
              <ImageIcon className="h-8 w-8 md:h-10 md:w-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors duration-300" />
        </Link>

        {/* Badge: Tag */}
        {firstTag && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center bg-background/80 backdrop-blur-md text-foreground text-[8px] md:text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-sm border border-border/50">
              {firstTag}
            </span>
          </div>
        )}

        {/* Badge: Discount */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground text-[9px] font-bold px-2 py-1 rounded-full tracking-wide shadow-sm">
              -{discountPercentage}%
            </span>
          </div>
        )}
      </div>

      {/* 2. INFO PRODUK */}
      <div className="p-3 md:p-4 flex flex-col flex-1 gap-2">
        {/* Title & SKU */}
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="text-xs md:text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {product.sku && (
              <span className="inline-block align-middle bg-primary/10 text-primary text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-widest mr-1.5 -mt-0.5">
                {product.sku}
              </span>
            )}
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline mt-1">
          <span className="text-base md:text-lg font-extrabold text-foreground tracking-tight">
            Rp {Number(displayPrice).toLocaleString("id-ID")}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 mt-auto pt-3">
          {/* Tombol Preview */}
          {product.demo_link ? (
            <a
              href={product.demo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full">
                <Eye />
                Preview
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" disabled className="w-full">
              <Eye />
              Preview
            </Button>
          )}

          {/* Tombol Order */}
          <Link href={`/products/${product.slug}`} className="w-full">
            <Button variant="brand" size="sm" className="w-full">
              <ShoppingCart />
              Order Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
