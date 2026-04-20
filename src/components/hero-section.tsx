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
      <section className="relative overflow-hidden mt-16 rounded-xl border border-border bg-gradient-to-br from-primary to-secondary-foreground text-primary-foreground shadow-xl animate-in fade-in duration-700">
        {/* Decorative Circles */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none z-0" />
        <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none z-0" />

        <div className="flex flex-col-reverse md:flex-row md:items-stretch relative z-10">
          {/* ── Left Column: Content ── */}
          <div className="w-full md:w-3/5 flex flex-col justify-center gap-6 md:gap-8 text-left px-6 py-12 md:px-12 md:py-20 animate-in slide-in-from-left duration-700 delay-100">
            <div>
              <Badge variant="glass" className="bg-white/10 hover:bg-white/20 transition-colors">
                {badgeLabel}
              </Badge>
            </div>

            <div className="space-y-4">
              <Typography variant="h1" className="text-white drop-shadow-sm">
                {title}
              </Typography>
            </div>

            <Typography variant="body-base" className="max-w-xl text-white/80 leading-relaxed">
              {description}
            </Typography>

            {/* ── CTA Button ── */}
            <div className="flex items-center">
              <Link href={buttonHref} passHref>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {buttonLabel}
                </Button>
              </Link>
            </div>
          </div>
          {/* ── End Column Content ── */}

          {/* ── Right Column: Image ── */}
          <div className="w-full mt-12 md:mt-0 md:w-2/5 relative min-h-[300px] md:min-h-[500px] flex items-end justify-end animate-in fade-in slide-in-from-right duration-1000 delay-200">
            <Image
              src={imageSrc}
              alt={title}
              fill
              priority
              className="object-cover md:object-contain object-center md:object-right-bottom transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
          {/* ── End Right Column ── */}
        </div>
      </section>
    </div>
  );
}

