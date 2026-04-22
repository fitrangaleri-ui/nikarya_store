"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import {
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/solid";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";

type CategorySectionProduct = {
  id: string;
};

interface CategorySectionProps {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  products: CategorySectionProduct[];
}

export function CategorySection({ category, products }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedProducts = isExpanded ? products : products.slice(0, 4);

  return (
    <section className="scroll-mt-24 py-8 md:py-16" id={`cat-${category.slug}`}>
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 border-b border-border/40 pb-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Typography variant="h3">
                {category.name}
              </Typography>
              {(category.slug === "baru-rilis" || category.name === "Baru Rilis") && (
                <Badge variant="destructive" className="animate-pulse">
                  New Release
                </Badge>
              )}
            </div>
            <Typography variant="body-sm" color="muted" className="max-w-lg">
              {category.slug === "baru-rilis" || category.name === "Baru Rilis"
                ? "Koleksi terbaru yang siap mempercantik undangan digital kamu."
                : `Pilihan terbaik dari koleksi ${category.name}`}
            </Typography>
          </div>

          {/* Tombol Desktop (Klik untuk Expand) */}
          {products.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover transition-all group active:scale-95"
            >
              <Typography variant="body-sm" className="font-bold text-primary">
                {isExpanded ? "Tutup Tampilan" : "Lihat Semua Koleksi"}
              </Typography>
              {isExpanded ? (
                <ChevronUpIcon className="size-4 text-primary" />
              ) : (
                <ChevronDownIcon className="size-4 text-primary group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          )}
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-700">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* --- MOBILE BUTTON (Klik untuk Expand) --- */}
        {products.length > 4 && (
          <div className="mt-10 md:hidden">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full h-12 rounded-xl border-border/50 bg-card glass flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
            >
              <Typography variant="body-sm" className="font-bold">
                {isExpanded ? "Tutup" : `Lihat Semua ${category.name}`}
              </Typography>
              {isExpanded ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
