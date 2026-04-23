"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArchiveBoxIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  HandThumbUpIcon,
  HomeIcon,
  LockClosedIcon,
  PhotoIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { BuyButton } from "./buy-button";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/cart-context";
import { resolveImageSrc } from "@/lib/resolve-image";
import { cn } from "@/lib/utils";
import { DemoLinksModal } from "@/components/demo-links-modal";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Typography } from "@/components/ui/typography";

interface ProductData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  sku: string | null;
  demo_link: string | null;
  demo_links: { label: string; url: string; image_url?: string }[];
  tags: string[] | null;
  thumbnail_url: string | null;
  product_images?: { image_url: string; sort_order: number }[];
  category_id: string | null;
  categories: { name: string } | null;
}

type ProductMediaImage = {
  image_url?: string | null;
  sort_order: number;
};

type RelatedProduct = {
  id: string;
};

interface ProductDetailClientProps {
  product: ProductData;
  isLoggedIn: boolean;
  relatedProducts: RelatedProduct[];
}

export function ProductDetailClient({
  product,
  isLoggedIn,
  relatedProducts,
}: ProductDetailClientProps) {
  const { addToCart, openCart } = useCart();
  const [isDescOpen, setIsDescOpen] = useState(true);
  void isLoggedIn;

  const finalPrice = product.discount_price || product.price;
  const isDiscounted = !!product.discount_price;
  const discountPercentage = isDiscounted
    ? Math.round(
        ((product.price - Number(product.discount_price)) / product.price) * 100,
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
    <main className="min-h-screen overflow-x-hidden bg-background pb-24 md:pb-20">
      <div className="flex flex-col gap-8 pt-24 md:gap-10 md:pt-32">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <nav className="flex w-fit items-center gap-1.5 rounded-full border border-border/50 bg-card/40 px-4 py-2.5 shadow-sm backdrop-blur-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full px-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HomeIcon className="h-4 w-4" />
              <Typography as="span" variant="caption" color="muted" className="font-semibold md:text-sm">
                Beranda
              </Typography>
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
            <Link
              href="/products"
              className="rounded-full px-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Typography as="span" variant="caption" color="muted" className="font-semibold md:text-sm">
                Produk
              </Typography>
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
            <Typography
              as="span"
              variant="caption"
              className="line-clamp-1 max-w-[150px] font-semibold md:max-w-[300px] md:text-sm"
            >
              {product.title}
            </Typography>
          </nav>
        </div>

        <section className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="group/carousel relative aspect-square overflow-hidden rounded-3xl border border-border/40 bg-card shadow-elevation-md">
              {(() => {
                const thumbnailSrc = resolveImageSrc(product.thumbnail_url);
                const galleryRaw =
                  product.product_images &&
                  Array.isArray(product.product_images) &&
                  product.product_images.length > 0
                    ? [...product.product_images]
                        .sort(
                          (a: ProductMediaImage, b: ProductMediaImage) =>
                            a.sort_order - b.sort_order,
                        )
                        .map((img: ProductMediaImage) => resolveImageSrc(img.image_url))
                        .filter(Boolean) as string[]
                    : [];

                const demoImages =
                  product.demo_links && Array.isArray(product.demo_links)
                    ? product.demo_links
                        .map((d: { image_url?: string }) => resolveImageSrc(d.image_url))
                        .filter(Boolean) as string[]
                    : [];

                galleryRaw.push(...demoImages);

                let galleryImages: string[];
                if (galleryRaw.length === 0) {
                  galleryImages = thumbnailSrc ? [thumbnailSrc] : [];
                } else if (thumbnailSrc && !galleryRaw.includes(thumbnailSrc)) {
                  galleryImages = [thumbnailSrc, ...galleryRaw];
                } else {
                  galleryImages = thumbnailSrc
                    ? [thumbnailSrc, ...galleryRaw.filter((url) => url !== thumbnailSrc)]
                    : galleryRaw;
                }

                if (galleryImages.length > 1) {
                  return (
                    <Carousel opts={{ loop: true }} className="static h-full w-full">
                      <CarouselContent className="-ml-0 h-full">
                        {galleryImages.map((src, i) => (
                          <CarouselItem key={i} className="relative h-full aspect-square pl-0">
                            <Image
                              src={src}
                              alt={`${product.title} - Slide ${i + 1}`}
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              className="object-cover transition-transform duration-700 hover:scale-105"
                              priority={i === 0}
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute top-1/2 left-4 size-10 -translate-y-1/2 bg-background/80 transition-opacity disabled:opacity-0 group-hover/carousel:opacity-100 hover:bg-background/90" />
                      <CarouselNext className="absolute top-1/2 right-4 size-10 -translate-y-1/2 bg-background/80 transition-opacity disabled:opacity-0 group-hover/carousel:opacity-100 hover:bg-background/90" />
                      <div className="pointer-events-none absolute right-0 bottom-4 left-0 z-20">
                        <CarouselDots className="pointer-events-auto" />
                      </div>
                    </Carousel>
                  );
                }

                return galleryImages[0] ? (
                  <Image
                    src={galleryImages[0]}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PhotoIcon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                );
              })()}

              <div className="pointer-events-none absolute inset-0 bg-background/0 transition-colors duration-300 group-hover/carousel:bg-background/5" />

              {(() => {
                const dLinks: { label: string; url: string; image_url?: string }[] =
                  product.demo_links && product.demo_links.length > 0
                    ? product.demo_links
                    : product.demo_link
                      ? [{ label: "Demo", url: product.demo_link }]
                      : [];

                if (dLinks.length === 0) return null;

                return (
                  <DemoLinksModal demoLinks={dLinks}>
                    <span className="absolute right-3 bottom-3 z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground">
                      <EyeIcon className="h-3.5 w-3.5 shrink-0" />
                      <Typography as="span" variant="caption" className="font-semibold">
                        Lihat Demo
                      </Typography>
                    </span>
                  </DemoLinksModal>
                );
              })()}
            </div>

            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <Typography variant="h2" as="h1">
                  {product.title}
                </Typography>

                <div className="flex flex-wrap items-center gap-2">
                  {product.sku && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-md">
                      <ArchiveBoxIcon className="h-3 w-3" />
                      <Typography as="span" variant="caption" color="primary" className="font-bold uppercase tracking-wider">
                        {product.sku}
                      </Typography>
                    </span>
                  )}

                  {product.categories?.name && (
                    <span className="inline-flex items-center rounded-full border border-border/50 bg-card/60 px-3 py-1.5 shadow-sm backdrop-blur-md">
                      <Typography as="span" variant="caption" className="font-medium uppercase tracking-wide">
                        {product.categories.name}
                      </Typography>
                    </span>
                  )}

                  {product.tags?.map((tag) => {
                    const isNew = tag.toLowerCase() === "new";
                    return (
                      <span
                        key={tag}
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1.5 transition-all backdrop-blur-md",
                          isNew 
                            ? "bg-primary/80 text-white border-none" 
                            : "bg-black/40 text-white border-none"
                        )}
                      >
                        <TagIcon className={cn("mr-1.5 h-3 w-3", isNew ? "text-white" : "text-white/70")} />
                        <Typography as="span" variant="caption" className={cn("font-bold uppercase tracking-wide text-white")}>
                          {tag}
                        </Typography>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 px-5 py-4 shadow-sm backdrop-blur-md">
                {isDiscounted ? (
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <Typography variant="body-base" color="muted" as="span" className="mb-1 line-through font-medium">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </Typography>
                      <Typography variant="h3" color="primary" as="span">
                        Rp {Number(finalPrice).toLocaleString("id-ID")}
                      </Typography>
                    </div>

                    <span className="rounded-full bg-destructive/80 px-3 py-1.5 text-white backdrop-blur-md">
                      <Typography as="span" variant="caption" className="font-bold">
                        Hemat {discountPercentage}%
                      </Typography>
                    </span>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <Typography variant="h3" color="primary" as="span" className="font-black">
                      Rp {Number(finalPrice).toLocaleString("id-ID")}
                    </Typography>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm">
                {[
                  "File digital - download langsung setelah bayar",
                  "Maks 5x download per pembelian",
                  "Pembayaran aman via payment gateway",
                  "Support tersedia jika ada kendala",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3">
                    <CheckBadgeIcon className="h-5 w-5 flex-shrink-0 text-primary" />
                    <Typography variant="body-sm" color="muted" className="font-medium md:text-base">
                      {text}
                    </Typography>
                  </div>
                ))}
              </div>

              <div className="hidden flex-col gap-3.5 lg:flex">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  variant="outline"
                  className="h-14 w-full rounded-full border-primary/40 bg-primary/5 text-primary shadow-sm transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <ShoppingCartIcon className="mr-2 h-5 w-5" />
                  <Typography as="span" variant="body-sm" className="font-semibold">
                    Tambah ke Keranjang
                  </Typography>
                </Button>

                <div className="h-14">
                  <BuyButton
                    product={{
                      id: product.id,
                      title: product.title,
                      slug: product.slug,
                      price: Number(finalPrice),
                      thumbnail_url: product.thumbnail_url,
                    }}
                    showIcon={true}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3 lg:hidden">
                <button
                  onClick={handleAddToCart}
                  aria-label="Tambah ke Keranjang"
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10 text-primary transition-all hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                </button>

                <div className="h-14 flex-1">
                  <BuyButton
                    product={{
                      id: product.id,
                      title: product.title,
                      slug: product.slug,
                      price: Number(finalPrice),
                      thumbnail_url: product.thumbnail_url,
                    }}
                    showIcon={false}
                  />
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border/40 pt-6">
                {[
                  { icon: ShieldCheckIcon, label: "Secure", sublabel: "Checkout" },
                  {
                    icon: HandThumbUpIcon,
                    label: "Satisfaction",
                    sublabel: "Guarantee",
                  },
                  { icon: LockClosedIcon, label: "Privacy", sublabel: "Protected" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group flex flex-col items-center gap-2 p-2 text-center"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card/60 backdrop-blur-sm transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
                      <item.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <div>
                      <Typography variant="caption" as="p" className="font-bold uppercase leading-tight tracking-wider">
                        {item.label}
                      </Typography>
                      <Typography variant="caption" as="p" color="muted" className="mt-0.5 leading-tight">
                        {item.sublabel}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {product.description && (
          <section className="container mx-auto mt-4 max-w-6xl px-4 md:px-6">
            <div className="overflow-hidden rounded-3xl border border-border/50 bg-card/40 shadow-sm backdrop-blur-md">
              <button
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="flex w-full items-center justify-between p-6 transition-colors hover:bg-card/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-8"
                aria-expanded={isDescOpen}
              >
                <Typography variant="h5" as="h2">
                  Deskripsi Produk
                </Typography>
                <ChevronDownIcon
                  className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ${
                    isDescOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isDescOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0 md:p-8 md:pt-0">
                    <div className="mb-6 h-px w-full bg-border/50" />
                    <Typography
                      variant="body-base"
                      color="muted"
                      as="p"
                      className="whitespace-pre-wrap leading-relaxed"
                    >
                      {product.description}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="container mx-auto mt-6 max-w-6xl px-4 md:px-6">
            <div className="mb-6 flex items-center justify-between md:mb-8">
              <Typography variant="h4" as="h2">
                Produk Terkait
              </Typography>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
