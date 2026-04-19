// ============================================================
// FILE: src/components/product-card.tsx
// PERUBAHAN: Support multiple demo links via DemoLinksModal
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PhotoIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { EyeIcon } from "@heroicons/react/24/solid";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { resolveImageSrc } from "@/lib/resolve-image";
import { DemoLinksModal } from "@/components/demo-links-modal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselDots } from "@/components/ui/carousel";

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

  // Build demo links array from new table or fallback to old column
  const demoLinks: { label: string; url: string }[] =
    product.product_demo_links && product.product_demo_links.length > 0
      ? product.product_demo_links.map((d: any) => ({
        label: d.label || "Demo",
        url: d.url,
      }))
      : product.demo_link
        ? [{ label: "Demo", url: product.demo_link }]
        : [];

  const hasDemoLinks = demoLinks.length > 0;

  // Build gallery images array — smart merge of thumbnail + gallery
  // Thumbnail always first, gallery images after (deduplicated)
  const buildImageList = (): string[] => {
    const thumbnailSrc = resolveImageSrc(product.thumbnail_url);
    const galleryRaw =
      product.product_images && Array.isArray(product.product_images) && product.product_images.length > 0
        ? [...product.product_images]
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any) => resolveImageSrc(img.image_url))
          .filter(Boolean) as string[]
        : [];

    const demoImages = product.product_demo_links && Array.isArray(product.product_demo_links)
      ? product.product_demo_links.map((d: any) => resolveImageSrc(d.image_url)).filter(Boolean) as string[]
      : [];
    
    galleryRaw.push(...demoImages);

    if (galleryRaw.length === 0) {
      // No gallery — just use thumbnail if available
      return thumbnailSrc ? [thumbnailSrc] : [];
    }

    // Deduplicate: if thumbnail is already in gallery, don't add it twice
    if (thumbnailSrc && !galleryRaw.includes(thumbnailSrc)) {
      return [thumbnailSrc, ...galleryRaw];
    }

    // Thumbnail is already in gallery or doesn't exist
    return thumbnailSrc ? [thumbnailSrc, ...galleryRaw.filter(url => url !== thumbnailSrc)] : galleryRaw;
  };

  const galleryImages = buildImageList();

  return (
    <div className="group flex flex-col glass rounded-2xl overflow-hidden transition-all duration-500 h-full relative hover:shadow-elevation-lg hover:translate-y-[-4px] hover:border-primary/40">
      {/* 1. IMAGE */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden border-b border-border/40 group/carousel isolate w-full">
        {galleryImages.length > 1 ? (
          <Carousel opts={{ loop: true }} className="w-full h-full static">
            <CarouselContent className="-ml-0 h-full">
              {galleryImages.map((src, i) => (
                <CarouselItem key={i} className="pl-0 relative h-full aspect-square">
                  <Link href={`/products/${product.slug}`} className="block w-full h-full relative group/img">
                    <Image
                      src={src}
                      alt={`${product.title || "Product image"} - Slide ${i + 1}`}
                      fill
                      sizes="100vw"
                      quality={100}
                      className="object-cover group-hover/img:scale-110 group-hover/img:rotate-1 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover/img:bg-background/10 transition-colors duration-300" />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className="absolute left-2 top-1/2 -translate-y-1/2 size-7 md:size-8 opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 bg-background/80 hover:bg-background/90 z-20"
            />
            <CarouselNext
              className="absolute right-2 top-1/2 -translate-y-1/2 size-7 md:size-8 opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 bg-background/80 hover:bg-background/90 z-20"
            />
            <div className="absolute bottom-3 left-0 right-0 z-20 pointer-events-none">
              <CarouselDots className="pointer-events-auto" />
            </div>
          </Carousel>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="block w-full h-full relative group/img"
          >
            {galleryImages[0] ? (
              <Image
                src={galleryImages[0]}
                alt={product.title || "Product image"}
                fill
                sizes="100vw"
                quality={100}
                className="object-cover group-hover/img:scale-110 group-hover/img:rotate-1 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/30">
                <PhotoIcon className="size-10 opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-background/0 group-hover/img:bg-background/10 transition-colors duration-300" />
          </Link>
        )}

        {/* Badge: Tag */}
        {firstTag && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-border/50 font-medium lowercase tracking-tight">
              {firstTag}
            </Badge>
          </div>
        )}

        {/* Badge: Discount */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="destructive">
              -{discountPercentage}%
            </Badge>
          </div>
        )}
      </div>

      {/* 2. INFO PRODUK */}
      <div className="p-3 md:p-4 flex flex-col flex-1 gap-2">
        {/* Title & SKU */}
        <Link href={`/products/${product.slug}`} className="flex-1 block">
          <Typography
            variant="h6"
            as="h3"
            className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2"
          >
            {product.sku && (
              <Badge variant="default" className="h-8 text-primary-foreground border-none mr-2 align-middle px-4 py-0">
                {product.sku}
              </Badge>
            )}
            {product.title}
          </Typography>
        </Link>

        {/* Price */}
        <div className="mt-1 flex flex-col">
          {discountPrice && price > discountPrice && (
            <Typography
              variant="body-sm"
              color="muted"
              className="line-through font-mono opacity-80"
            >
              Rp {Number(price).toLocaleString("id-ID")}
            </Typography>
          )}
          <Typography
            variant="h4"
            className="font-bold font-mono tracking-tight"
          >
            Rp {Number(displayPrice).toLocaleString("id-ID")}
          </Typography>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 mt-auto pt-3">
          {/* Tombol Preview */}
          {hasDemoLinks ? (
            <DemoLinksModal demoLinks={demoLinks}>
              <Button variant="outline" size="lg" className="w-full">
                <EyeIcon className="size-4" />
                Preview
              </Button>
            </DemoLinksModal>
          ) : (
            <Button variant="outline" size="lg" disabled className="w-full">
              <EyeIcon className="size-4" />
              Preview
            </Button>
          )}

          {/* Tombol Order */}
          <Link href={`/products/${product.slug}`} className="w-full">
            <Button variant="brand" size="lg" className="w-full">
              Order Sekarang
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

