"use client";

import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";

export function HeroSection() {
  return (
    <div className="w-full px-4 md:px-6 pt-6 md:pt-8 mx-auto max-w-7xl">
      <section className="relative overflow-hidden mt-16 rounded-xl border border-border bg-gradient-to-br from-[#01696f] to-[#0c4e54] px-6 py-12 text-white shadow-xl md:px-12 md:py-20">
        {/* Decorative Circles from Reference */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center gap-12 md:gap-8 relative z-10">
          {/* ── Left Column: Content ── */}
          <div className="w-full md:w-3/5 flex flex-col justify-center gap-6 md:gap-8 text-left">
            <div>
              <Badge variant="glass">
                Platform E-Invitation Indonesia
              </Badge>
            </div>

            <div className="space-y-4">
              <Typography variant="h1" className="text-4xl md:text-5xl lg:text-[56px] text-white">
                Selamat Datang di Nikarya Themes
              </Typography>
            </div>

            <Typography variant="body-lg" className="max-w-xl text-white/80">
              Nikarya Digital adalah solusi terbaik buat Anda yang ingin membuat undangan
              digital. Kami menyediakan layanan jasa pembuatan undangan
              digital untuk acara dan acara khusus lainnya.
            </Typography>

            {/* ── CTA Button ── */}
            <div className="flex items-center">
              <Link href="/products" passHref>
                <Button variant="secondary" size="lg">
                  Lihat Tema
                </Button>
              </Link>
            </div>

            <div className="flex items-center pt-4 gap-0">
              <div className="flex flex-col gap-1.5 pr-6 md:pr-8">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-rating text-rating"
                    />
                  ))}
                </div>
                <div className="flex items-baseline gap-1">
                  <Typography as="span" className="text-2xl font-black text-white">
                    4.9
                  </Typography>
                  <Typography variant="caption" className="uppercase tracking-wider font-semibold text-[11px] text-white/80">
                    Rating
                  </Typography>
                </div>
              </div>

              <Separator orientation="vertical" className="h-12 bg-white/20" />

              <div className="flex flex-col gap-1.5 px-6 md:px-8">
                <div className="flex items-baseline gap-0.5">
                  <Typography as="span" className="text-2xl font-black text-white">
                    17K
                  </Typography>
                  <Typography variant="body-sm" className="font-bold text-rating">+</Typography>
                </div>
                <Typography variant="caption" className="uppercase tracking-wider font-semibold whitespace-nowrap text-[11px] text-white/80">
                  Mempelai Puas
                </Typography>
              </div>

              <Separator orientation="vertical" className="h-12 bg-white/20" />

              <div className="flex flex-col gap-1.5 pl-6 md:pl-8">
                <div className="flex items-baseline gap-0.5">
                  <Typography as="span" className="text-2xl font-black text-white">
                    200
                  </Typography>
                  <Typography variant="body-sm" className="font-bold text-rating">+</Typography>
                </div>
                <Typography variant="caption" className="uppercase tracking-wider font-semibold whitespace-nowrap text-[11px] text-white/80">
                  Pilihan Tema
                </Typography>
              </div>
            </div>
          </div>
          {/* ── End Column Content ── */}

          {/* ── Right Column: Video Demo ── */}
          <div className="w-full md:w-2/5 flex items-center justify-center relative">
            <div className="relative w-full aspect-[3/4] max-w-sm overflow-hidden rounded-[2rem] bg-black/10 group/video shadow-2xl border border-white/10">
              <video
                className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-[1.02]"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              >
                <source src="/hero-video.webm" type="video/webm" />
                <source src="/hero.mp4" type="video/mp4" />
                Browser kamu tidak mendukung pemutaran video.
              </video>

              <Badge
                variant="outline"
                className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border-white/20 px-3 py-1.5 gap-2 text-white hover:bg-black/50 transition-all duration-300"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse outline outline-offset-2 outline-green-400/30" />
                <Typography as="span" variant="h6" className="text-[10px] tracking-widest pt-0.5 text-white">LIVE DEMO</Typography>
              </Badge>

              <div className="absolute bottom-6 left-4 right-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl hover:translate-y-[-4px] transition-transform duration-300">
                <div className="flex flex-col gap-0.5">
                  <Typography as="span" variant="body-sm" className="font-bold text-white">
                    Floral Elegant Series
                  </Typography>
                  <Typography as="span" variant="h6" className="text-[9px] uppercase tracking-[0.1em] text-rating">
                    Best Seller · 2.3K Terjual
                  </Typography>
                </div>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  className="size-8"
                  asChild
                >
                  <Link href="/products"><ArrowRight className="size-3.5" /></Link>
                </Button>
              </div>
            </div>
          </div>
          {/* ── End Right Column ── */}
        </div>
      </section>
    </div>
  );
}

