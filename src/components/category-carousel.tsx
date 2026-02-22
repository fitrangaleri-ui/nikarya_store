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
        className="absolute left-1 md:-left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground shadow-lg hover:text-primary hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100"
        aria-label="Previous category"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* Carousel Layout */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-3 md:gap-4 pb-4 px-1 md:px-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex-none w-[calc(60%-10px)] sm:w-[calc(40%-10px)] md:w-[280px] snap-center group/card relative"
            >
              {/* Radius membulat dan efek border disesuaikan tema */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-card/60 backdrop-blur-sm border border-border/50 relative transition-all duration-300 group-hover/card:border-primary/50 group-hover/card:shadow-xl group-hover/card:shadow-primary/10">
                {cat.thumbnail_url ? (
                  <Image
                    src={cat.thumbnail_url}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 60vw, (max-width: 1024px) 40vw, 280px"
                    className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted/30 text-muted-foreground/30">
                    <ImageIcon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                )}

                {/* Gradient Overlay — lebih halus */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0 opacity-80 group-hover/card:opacity-100 transition-opacity duration-300" />

                {/* Badge count — dipindahkan ke kanan atas & pakai style pill */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-primary/90 backdrop-blur-md text-primary-foreground text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    {cat.productCount} Tema
                  </span>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 p-3 md:p-4 w-full">
                  <h4 className="font-bold text-white text-sm md:text-lg leading-tight drop-shadow-md tracking-tight group-hover/card:text-primary-100 transition-colors">
                    {cat.name}
                  </h4>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="w-full py-12 text-center border border-dashed border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">Belum ada kategori.</p>
          </div>
        )}
      </div>

      {/* Tombol Navigasi Kanan */}
      <button
        onClick={scrollRight}
        className="absolute right-1 md:-right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground shadow-lg hover:text-primary hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100"
        aria-label="Next category"
      >
        <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
}
