"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImageIcon } from "lucide-react";

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
    <div className="relative group/carousel">
      {/* Tombol Navigasi Kiri */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-7 h-7 md:w-8 md:h-8 bg-background border border-border flex items-center justify-center text-muted-foreground shadow-md hover:text-primary hover:border-primary/30 hover:scale-110 transition-all cursor-pointer"
        aria-label="Previous category"
      >
        <ArrowLeft className="w-3 h-3 md:w-3.5 md:h-3.5" />
      </button>

      {/* Carousel Layout */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-2.5 md:gap-4 pb-3 md:pb-4 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex-none w-[calc(50%-5px)] md:w-[260px] snap-center group/card relative"
            >
              {/* Mobile: aspect-[4/3] | md: aspect-[4/3] konsisten */}
              <div className="aspect-[4/3] overflow-hidden bg-muted border border-border relative transition-all duration-300 group-hover/card:border-primary/50 group-hover/card:shadow-md">
                {cat.thumbnail_url ? (
                  <Image
                    src={cat.thumbnail_url}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 260px"
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted/50 text-muted-foreground/50">
                    <ImageIcon className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                )}

                {/* Gradient Overlay — Menggunakan black/slate agar netral */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge count — primary fill */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[8px] md:text-[10px] font-bold px-2 md:px-2.5 py-0.5 md:py-1 uppercase tracking-widest shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse"></span>
                    {cat.productCount} Tema
                  </span>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 p-2.5 md:p-3.5 w-full">
                  <h4 className="font-bold text-white text-xs md:text-base leading-tight drop-shadow-md uppercase tracking-wide">
                    {cat.name}
                  </h4>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="w-full py-8 text-center border border-dashed border-border bg-muted/10">
            <p className="text-xs text-muted-foreground">Belum ada kategori.</p>
          </div>
        )}
      </div>

      {/* Tombol Navigasi Kanan */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-7 h-7 md:w-8 md:h-8 bg-background border border-border flex items-center justify-center text-muted-foreground shadow-md hover:text-primary hover:border-primary/30 hover:scale-110 transition-all cursor-pointer"
        aria-label="Next category"
      >
        <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
      </button>
    </div>
  );
}
