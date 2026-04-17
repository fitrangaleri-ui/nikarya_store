"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export function HeroSection() {
  return (
    <div className="w-full px-4 md:px-6 pt-6 md:pt-8 mx-auto max-w-7xl">
      <section className="relative overflow-hidden mt-16 rounded-xl border border-border bg-gradient-to-br from-[#01696f] to-[#0c4e54] px-6 py-12 text-white shadow-xl md:px-12 md:py-20">
        {/* Decorative Circles from Reference */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex flex-col-reverse md:flex-row md:items-center gap-12 md:gap-8 relative z-10">
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
          </div>
          {/* ── End Column Content ── */}

          {/* ── Right Column: Video Demo ── */}
          <div className="w-full md:w-2/5 flex items-center justify-center">
            <div className="relative w-full">
              <Image
                src="/main-hero.png"
                alt="Main Hero Display"
                width={844}
                height={615}
                priority
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          {/* ── End Right Column ── */}
        </div>
      </section>
    </div>
  );
}

