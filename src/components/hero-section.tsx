"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

interface HeroSectionProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  badgeLabel?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export function HeroSection({
  title = "Selamat Datang di Nikarya Themes",
  description = "Nikarya Digital adalah solusi terbaik buat Anda yang ingin membuat undangan digital. Kami menyediakan layanan jasa pembuatan undangan digital untuk acara dan acara khusus lainnya.",
  imageSrc = "/landingpage/wks-series.png",
  badgeLabel = "Platform E-Invitation Indonesia",
  buttonLabel = "Lihat Tema",
  buttonHref = "/products",
}: HeroSectionProps) {
  return (
    <div className="w-full px-4 md:px-6 pt-6 md:pt-8 mx-auto max-w-7xl">
      <section className="relative overflow-hidden mt-16 rounded-xl border border-border bg-gradient-to-br from-[#01696f] to-[#0c4e54] text-white shadow-xl">
        {/* Decorative Circles */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none z-0" />
        <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none z-0" />

        <div className="flex flex-col-reverse md:flex-row md:items-stretch relative z-10">
          {/* ── Left Column: Content ── */}
          <div className="w-full md:w-3/5 flex flex-col justify-center gap-6 md:gap-8 text-left px-6 py-12 md:px-12 md:py-20">
            <div>
              <Badge variant="glass">
                {badgeLabel}
              </Badge>
            </div>

            <div className="space-y-4">
              <Typography variant="h1" className="text-primary-foreground">
                {title}
              </Typography>
            </div>

            <Typography variant="body-lg" className="max-w-xl text-white/80">
              {description}
            </Typography>

            {/* ── CTA Button ── */}
            <div className="flex items-center">
              <Link href={buttonHref} passHref>
                <Button variant="secondary" size="lg">
                  {buttonLabel}
                </Button>
              </Link>
            </div>
          </div>
          {/* ── End Column Content ── */}

          {/* ── Right Column: Image ── */}
          <div className="w-full mt-12 md:w-2/5 relative min-h-[300px] md:min-h-full flex items-end justify-end">
            <Image
              src={imageSrc}
              alt={title}
              fill
              priority
              className="object-cover md:object-contain object-center md:object-right-bottom"
            />
          </div>

          {/* ── End Right Column ── */}
        </div>
      </section>
    </div>
  );
}
