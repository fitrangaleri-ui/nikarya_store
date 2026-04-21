"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { ReactNode } from "react";

interface StickyHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
}

export function StickyHeader({
  title,
  description,
  backHref,
  backLabel = "Kembali",
  children,
}: StickyHeaderProps) {
  return (
    <div className="sticky md:top-0 z-30 border-b border-white/10 bg-gradient-to-br from-primary to-secondary-foreground px-6 py-6 md:px-10 md:py-8 transition-all">
      {/* Decorative Circles Wrapper to handle clipping while allowing children to overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-white/5" />
      </div>

      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="flex flex-col items-start">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white/90 uppercase tracking-widest hover:bg-white hover:text-primary transition-all mb-6 backdrop-blur-md"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              {backLabel}
            </Link>
          )}
          <Typography variant="h2" as="h1" className="text-white tracking-tight">
            {title}
          </Typography>
          {description && (
            <Typography variant="body-sm" className="text-white/70 mt-2 font-medium">
              {description}
            </Typography>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 mt-2 md:mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
