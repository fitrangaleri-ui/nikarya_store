"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title?: string;
  description?: React.ReactNode;
  imageSrc?: string;
  badgeLabel?: string;
  buttonLabel?: string;
  buttonHref?: string;
  descriptionClassName?: string;
  fullWidth?: boolean;
}

export function HeroSection({
  title = "Elevate Your Digital Invitation Standard",
  description = "Template yang dirancang untuk menghadirkan kesan profesional sekaligus menyederhanakan cara kamu membuat undangan digital.",
  imageSrc = "/landingpage/wks-series.png",
  badgeLabel = "Platform E-Template Indonesia",
  buttonLabel = "Explore Now",
  buttonHref = "/products",
  descriptionClassName,
  fullWidth = false,
}: HeroSectionProps) {
  return (
    <div className={cn(
      "w-full pt-2 md:pt-4 mx-auto px-4 md:px-6 lg:px-8 transition-all duration-700",
      fullWidth ? "max-w-[100vw]" : "max-w-7xl"
    )}>
      <section className={cn(
        "relative overflow-hidden mt-4 md:mt-8 rounded-xl md:rounded-xl border border-border bg-gradient-to-br from-primary to-secondary-foreground text-primary-foreground shadow-xl animate-in fade-in duration-700"
      )}>
        {/* Decorative Circles */}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none z-0" />
        <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5 pointer-events-none z-0" />

        <div className="flex flex-col-reverse md:flex-row md:items-stretch relative z-10">
          {/* ── Left Column: Content ── */}
          <div className={cn(
            "w-full md:w-3/5 flex flex-col justify-center gap-6 md:gap-8 text-left py-12 md:py-20 animate-in slide-in-from-left duration-700 delay-100",
            fullWidth ? "px-6 md:px-16 lg:px-24" : "px-6 md:px-12"
          )}>
            <div>
              <Badge variant="glass" className="bg-white/10 hover:bg-white/20 transition-colors">
                {badgeLabel}
              </Badge>
            </div>

            <div className="space-y-4">
              <Typography variant="h1" className="text-white leading-snug drop-shadow-sm">
                {title}
              </Typography>
            </div>

            <Typography
              variant="body-base"
              className={cn("max-w-xl text-white/80 leading-relaxed", descriptionClassName)}
            >
              {description}
            </Typography>

            {/* ── CTA Button ── */}
            <div className="flex items-center">
              <Link href={buttonHref} passHref>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
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

