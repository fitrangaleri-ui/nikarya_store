"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  VideoCameraIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DemoLinksModal } from "@/components/demo-links-modal";

export function ProductVideoCard({ product }: { product: any }) {
  const price = Number(product.price) || 0;
  const discountPrice = product.discount_price
    ? Number(product.discount_price)
    : null;

  const discountPercentage =
    discountPrice && price
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;

  const displayTag =
    product.tags && Array.isArray(product.tags)
      ? product.tags.includes("new")
        ? "new"
        : product.tags[0]
      : null;

  const displayPrice = discountPrice || price;
  const videoUrl = product.video_url || "";

  // Build demo links array from new table or fallback to old column
  const demoLinks: { label: string; url: string; image_url?: string }[] =
    product.product_demo_links && product.product_demo_links.length > 0
      ? product.product_demo_links.map((d: any) => ({
        label: d.label || "Demo",
        url: d.url,
        image_url: d.image_url,
      }))
      : product.demo_link
        ? [{ label: "Demo", url: product.demo_link }]
        : [];

  const hasDemoLinks = demoLinks.length > 0;

  const isEmbedVideo =
    videoUrl.includes("youtube.com") ||
    videoUrl.includes("youtu.be") ||
    videoUrl.includes("vimeo.com");

  const getEmbedUrl = (url: string) => {
    let embedUrl = url;
    if (url.includes("watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    }
    const separator = embedUrl.includes("?") ? "&" : "?";
    return `${embedUrl}${separator}autoplay=1&mute=1&loop=1&controls=0`;
  };

  return (
    <div className="group flex flex-col glass shadow-none rounded-lg overflow-hidden transition-all duration-500 h-full relative hover:translate-y-[-4px] hover:border-primary/40 border border-border">
      {/* 1. VIDEO 9:16 CONTAINER (AUTOPLAY, MUTED, LOOP) */}
      <div className="relative aspect-[9/16] bg-black/90 overflow-hidden border-b border-border/40 group/video isolate w-full flex items-center justify-center">
        {videoUrl ? (
          isEmbedVideo ? (
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full object-cover pointer-events-none"
              allow="autoplay; encrypted-media"
              title={product.title}
            />
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="block w-full h-full relative"
            >
              <video
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/video:scale-105"
              />
              <div className="absolute inset-0 bg-background/0 group-hover/video:bg-background/10 transition-colors duration-300" />
            </Link>
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <VideoCameraIcon className="h-10 w-10 opacity-30" />
            <Typography variant="caption" color="muted">
              Tidak ada video
            </Typography>
          </div>
        )}

        {/* Badge: Tag */}
        {displayTag && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <Badge
              variant="outline"
              className={cn(
                "capitalize tracking-tight px-2.5 backdrop-blur-md border-none",
                displayTag === "new"
                  ? "bg-primary/80 text-white"
                  : "bg-black/50 text-white"
              )}
            >
              {displayTag}
            </Badge>
          </div>
        )}

        {/* Badge: Discount */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <Badge
              variant="outline"
              className="bg-red/500 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/90 p-0 text-[10px] font-normal text-white border-none"
            >
              -{discountPercentage}%
            </Badge>
          </div>
        )}
      </div>

      {/* 2. PRODUCT INFO */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 sm:gap-2.5 bg-card">
        {/* Title & SKU */}
        <Link href={`/products/${product.slug}`} className="flex-1 block">
          <Typography
            variant="h6"
            as="h3"
            className="text-xs sm:text-sm md:text-base font-bold leading-tight group-hover:text-primary transition-colors whitespace-normal break-words"
          >
            {product.sku && (
              <Badge
                variant="default"
                className="h-5 sm:h-6 text-white align-middle px-2 sm:px-2.5 font-bold uppercase mr-1 sm:mr-1.5 text-[9px] sm:text-[10px]"
              >
                {product.sku}
              </Badge>
            )}
            {product.title}
          </Typography>
        </Link>

        {/* Price */}
        <div className="flex flex-col">
          {discountPrice && price > discountPrice && (
            <Typography
              variant="body-sm"
              color="muted"
              className="line-through font-mono opacity-80 text-xs"
            >
              Rp {Number(price).toLocaleString("id-ID")}
            </Typography>
          )}
          <Typography
            variant="h5"
            className="font-bold font-mono tracking-tight text-primary"
          >
            Rp {Number(displayPrice).toLocaleString("id-ID")}
          </Typography>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          {hasDemoLinks ? (
            <DemoLinksModal demoLinks={demoLinks}>
              <Button variant="outline" size="sm" className="w-full rounded-full">
                <EyeIcon className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </DemoLinksModal>
          ) : (
            <Button variant="outline" size="sm" disabled className="w-full rounded-full">
              <EyeIcon className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}

          <Link href={`/products/${product.slug}`} className="w-full">
            <Button variant="brand" size="sm" className="w-full rounded-full font-bold">
              Order Sekarang
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
