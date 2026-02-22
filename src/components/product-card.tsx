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
    <div className="group flex flex-col bg-white border border-slate-200 overflow-hidden transition-all duration-300 h-full relative hover:shadow-md hover:border-slate-300">
      {/* 1. IMAGE */}
      {/* Mobile: aspect-square | md: aspect-[3/4] lebih portrait */}
      <div className="relative aspect-square md:aspect-[3/4] bg-slate-50 overflow-hidden border-b border-slate-100">
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
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <ImageIcon className="h-8 w-8 md:h-10 md:w-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </Link>

        {/* Badge: Tag — editorial style */}
        {firstTag && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="inline-flex items-center bg-white/90 backdrop-blur-sm text-slate-900 text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 uppercase tracking-widest">
              {firstTag}
            </span>
          </div>
        )}

        {/* Badge: Discount */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-rose-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 tracking-wide">
              -{discountPercentage}%
            </span>
          </div>
        )}
      </div>

      {/* 2. INFO PRODUK */}
      {/* Mobile: padding lebih kecil | md: lebih lega */}
      <div className="p-2 md:p-3 flex flex-col flex-1 gap-1.5 md:gap-2">
        {/* SKU */}
        {product.sku && (
          <span className="inline-block bg-slate-900 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 tracking-widest w-fit">
            {product.sku}
          </span>
        )}

        {/* Title */}
        {/* Mobile: text-[11px] | md: text-[13px] */}
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="text-[11px] md:text-[13px] font-bold text-slate-800 leading-snug hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        {/* Mobile: text-xs | md: text-sm */}
        <div className="flex items-baseline gap-1.5 md:gap-2">
          <span className="text-xs md:text-sm font-bold text-slate-900">
            Rp {Number(displayPrice).toLocaleString("id-ID")}
          </span>
          {discountPrice && (
            <span className="text-[9px] md:text-xs text-slate-400 line-through font-normal">
              Rp {Number(price).toLocaleString("id-ID")}
            </span>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-1 md:gap-1.5 mt-auto pt-1">
          {/* Tombol Preview */}
          {/* Mobile: h-8 touch-friendly | md: h-8 */}
          {product.demo_link ? (
            <a
              href={product.demo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-none text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary hover:border-slate-400 transition-colors h-8"
              >
                <Eye className="mr-1 md:mr-1.5 h-2.5 w-2.5 md:h-3 md:w-3" />
                Preview
              </Button>
            </a>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="w-full rounded-none text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-300 h-8"
            >
              <Eye className="mr-1 md:mr-1.5 h-2.5 w-2.5 md:h-3 md:w-3" />
              Preview
            </Button>
          )}

          {/* Tombol Order */}
          {/* Mobile: h-9 minimum touch target | md: h-9 */}
          <Link href={`/products/${product.slug}`} className="w-full">
            <Button
              size="sm"
              className="w-full rounded-none bg-primary hover:bg-primary/85 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest h-9 transition-colors active:scale-[0.99]"
            >
              <ShoppingCart className="mr-1 md:mr-1.5 h-3 w-3 md:h-3.5 md:w-3.5" />
              Order Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
