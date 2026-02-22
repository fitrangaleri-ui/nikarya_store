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
    // FIX: Hapus border-t, bg-slate-50/30, dan py-12 → unified bg-white, tanpa border
    <section className="bg-white scroll-mt-20" id={`cat-${category.slug}`}>
      <div className="container mx-auto max-w-6xl px-2.5 md:px-0">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {category.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Pilihan terbaik dari koleksi {category.name}
            </p>
          </div>

          {/* Tombol Desktop (Klik untuk Expand) */}
          {products.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden md:inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors group"
            >
              {isExpanded ? "Tutup Tampilan" : "Lihat Lainnya"}
              {isExpanded ? (
                <ChevronUp className="ml-2 w-4 h-4" />
              ) : (
                <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          )}
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 animate-in fade-in zoom-in-95 duration-500">
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
              className="px-6 border-slate-200 bg-white text-slate-700 rounded-[4px] h-10 shadow-none hover:bg-slate-50 inline-flex items-center justify-center gap-2 mx-auto"
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
