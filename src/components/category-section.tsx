"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface CategorySectionProps {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  products: any[];
}

export function CategorySection({ category, products }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedProducts = isExpanded ? products : products.slice(0, 4);

  return (
    // FIX: Menggunakan bg-transparent agar menyatu dengan layout global
    <section className="scroll-mt-24 py-6 md:py-10" id={`cat-${category.slug}`}>
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4 border-b border-border/40 pb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
              {category.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-lg">
              Pilihan terbaik dari koleksi {category.name}
            </p>
          </div>

          {/* Tombol Desktop (Klik untuk Expand) */}
          {products.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden md:inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
            >
              {isExpanded ? "Tutup Tampilan" : "Lihat Lainnya"}
              {isExpanded ? (
                <ChevronUp className="ml-1.5 w-4 h-4" />
              ) : (
                <ChevronDown className="ml-1.5 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          )}
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-in fade-in zoom-in-95 duration-500">
          {/* Note: ProductCard sudah kita styling sebelumnya, jadi otomatis ikut tema */}
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* --- MOBILE BUTTON (Klik untuk Expand) --- */}
        {products.length > 4 && (
          <div className="mt-8 md:hidden text-center">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full sm:w-auto px-8 border-border/50 bg-background/50 backdrop-blur-sm text-foreground rounded-full h-10 shadow-sm hover:bg-muted inline-flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
            >
              {isExpanded ? (
                <>
                  Tutup Tampilan <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Lihat Semua {category.name}{" "}
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
