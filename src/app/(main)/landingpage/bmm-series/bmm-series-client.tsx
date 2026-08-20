"use client";

import { useState } from "react";
import { PriceCard } from "../price-card";
import { ProductCardDemo } from "../product-card-demo";
import { Typography } from "@/components/ui/typography";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ModalPayment } from "../modal-payment";
import { WarnSection } from "@/components/warn";
import { ProductVideoCard } from "@/components/product-video-card";

interface BMMSeriesClientProps {
  bmmProduct: any;
  recommendedProducts?: any[];
}

export function BMMSeriesClient({ bmmProduct, recommendedProducts = [] }: BMMSeriesClientProps) {
  const [isQrisOpen, setIsQrisOpen] = useState(false);

  const demoLinks = [...(bmmProduct?.product_demo_links || [])].sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <>
      <section id="templates" className="py-20 md:py-24 bg-transparent border-t border-border/50">
        <div className="container mx-auto px-8 md:px-6">
          <ScrollReveal className="max-w-xl mx-auto text-center mb-12 md:mb-16">
            <Typography variant="h3" className="text-center">
              Preview Tema
            </Typography>
            <Typography variant="body-base" color="muted" className="text-center mt-2">
              Lihat koleksi premium <b>Batik Megamendung</b> Series
            </Typography>
          </ScrollReveal>

          {demoLinks && demoLinks.length > 0 ? (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {demoLinks.map((demo, index) => (
                <ScrollReveal
                  key={demo.id}
                  delay={(index % 3) * 100}
                  className="w-full h-full"
                >
                  <ProductCardDemo
                    demoLink={demo}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal className="py-20 text-center glass rounded-3xl border-dashed border-border/50">
              <Typography variant="body-base" color="muted">
                Belum ada koleksi tema saat ini. Silakan kembali lagi nanti.
              </Typography>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section id="pricing" className="relative bg-gradient-to-br from-primary to-secondary-foreground py-20 md:py-28 overflow-hidden">
        {/* Decorative Circles shared for both Price & Warn */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[10%] left-[10%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

        {/* Pricing wrapper */}
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <ScrollReveal className="max-w-xl mx-auto text-center mb-10 md:mb-14" direction="down">
            <Typography variant="h3" className="text-center text-primary-foreground">
              Dapatkan harga terbaik
            </Typography>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <PriceCard
              showCountdown={true}
              product={bmmProduct || undefined}
              themeCount={demoLinks.length > 0 ? demoLinks.length : 5}
              onBuyOverride={() => setIsQrisOpen(true)}
              features={[
                "Tema Batik Megamendung Eksklusif",
                "Desain Elegan, Unik, dan Responsif",
                "Struktur JSON rapih dan mudah diedit",
                `${demoLinks.length > 0 ? demoLinks.length : 5} Premium Theme`,
                "Gratis Aset Script Motion Control",
                "Gratis Asset Script Animasi (HTML & CSS)",
                "Gratis Asset Image (WEBP & SVG)"
              ]}
            />
          </ScrollReveal>
        </div>

        <div className="mt-10 md:mt-16">
          <ScrollReveal delay={400} distance={50}>
            <WarnSection transparent={true} />
          </ScrollReveal>
        </div>
      </section>

      {/* Section Produk Rekomendasi */}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <section className="py-20 md:py-24 bg-background border-t border-border/50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <ScrollReveal className="max-w-xl mx-auto text-center mb-10 md:mb-14">
              <Typography variant="h3" className="text-center">
                Rekomendasi Produk
              </Typography>
              <Typography variant="body-base" color="muted" className="text-sm text-center mt-2">
                Jelajahi koleksi tema dan produk pilihan lainnya dari Nikarya Store
              </Typography>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {recommendedProducts.slice(0, 4).map((rp: any, index: number) => (
                <ScrollReveal key={rp.id} delay={(index % 4) * 100}>
                  <ProductVideoCard product={rp} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <ModalPayment isOpen={isQrisOpen} onClose={() => setIsQrisOpen(false)} />
    </>
  );
}
