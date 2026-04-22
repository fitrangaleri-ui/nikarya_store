"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PhotoIcon 
} from "@heroicons/react/24/solid";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  productCount: number;
}

interface CategoryCarouselProps {
  categories: Category[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/carousel w-full">
      {/* Tombol Navigasi Kiri */}
      <button
        onClick={scrollLeft}
        className="absolute left-2 md:-left-5 top-1/2 -translate-y-1/2 z-30 size-9 md:size-12 rounded-full glass flex items-center justify-center text-foreground shadow-xl hover:text-primary hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0"
        aria-label="Previous category"
      >
        <ChevronLeftIcon className="size-5 md:size-6" />
      </button>

      {/* Carousel Layout */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-4 md:gap-6 pt-4 pb-8 px-2 md:px-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex-none w-[220px] sm:w-[260px] md:w-[320px] snap-center group/card relative"
            >
              <div className="aspect-[5/4] rounded-xl overflow-hidden bg-card border border-border/50 relative transition-all duration-500 group-hover/card:border-primary/40 group-hover/card:shadow-2xl group-hover/card:shadow-primary/10 group-hover/card:-translate-y-1">
                {cat.thumbnail_url ? (
                  <Image
                    src={cat.thumbnail_url}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 220px, (max-width: 1024px) 260px, 320px"
                    className="object-cover transition-transform duration-1000 ease-out group-hover/card:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted/20 text-muted-foreground/20">
                    <PhotoIcon className="size-12 md:size-16" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-4 right-4 z-10">
                  <Badge 
                    variant="default" 
                    className="h-7 px-3 gap-1.5 rounded-full border-primary/20 shadow-sm"
                  >
                    <span className="size-1.5 rounded-full bg-white animate-pulse" />
                    {cat.productCount} Tema
                  </Badge>
                </div>

                <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full">
                  <div className="flex flex-col gap-1">
                    <Typography 
                      as="h4" 
                      variant="body-base" 
                      className="text-white font-bold leading-tight drop-shadow-md group-hover/card:text-primary-foreground transition-colors"
                    >
                      {cat.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      className="text-white/60 font-medium"
                    >
                      Koleksi Pilihan
                    </Typography>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="w-full py-16 text-center border border-dashed border-border/50 rounded-xl glass">
            <Typography variant="body-sm" color="muted">
              Belum ada kategori tersedia.
            </Typography>
          </div>
        )}
      </div>

      <button
        onClick={scrollRight}
        className="absolute right-2 md:-right-5 top-1/2 -translate-y-1/2 z-30 size-9 md:size-12 rounded-full glass flex items-center justify-center text-foreground shadow-xl hover:text-primary hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0"
        aria-label="Next category"
      >
        <ChevronRightIcon className="size-5 md:size-6" />
      </button>
    </div>
  );
}
