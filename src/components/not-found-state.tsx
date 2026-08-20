import Link from "next/link";
import {
  HomeIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

interface NotFoundStateProps {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showProductsButton?: boolean;
}

export function NotFoundState({
  title = "Halaman Tidak Ditemukan",
  description = "Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tautan yang dimasukkan salah.",
  showHomeButton = true,
  showProductsButton = true,
}: NotFoundStateProps) {
  return (
    <div className="relative flex min-h-[70vh] w-full items-center justify-center bg-background px-4 py-8 sm:py-12 md:py-16 overflow-hidden">
      {/* Glow Blur Accent Background */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px] sm:h-96 sm:w-96" />

      <div className="relative z-10 w-full max-w-md sm:max-w-lg">
        {/* Main Glass Card Container */}
        <div className="flex flex-col items-center rounded-3xl border border-border/60 bg-card/60 p-6 text-center shadow-xl backdrop-blur-xl sm:p-8 md:p-10">

          {/* Top Icon Badge */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm sm:h-16 sm:w-16">
            <ExclamationTriangleIcon className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>

          {/* 404 Number */}
          <h1 className="mb-2 bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl md:text-8xl">
            404
          </h1>

          {/* Title & Description */}
          <Typography
            variant="h4"
            as="h2"
            align="center"
            className="mb-2 text-center text-lg font-bold text-foreground sm:text-xl md:text-2xl"
          >
            {title}
          </Typography>
          <Typography
            variant="body-sm"
            color="muted"
            align="center"
            className="mb-6 text-center max-w-xs text-xs leading-relaxed sm:max-w-sm sm:text-sm"
          >
            {description}
          </Typography>

          {/* Action Buttons */}
          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
            {showHomeButton && (
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="brand" className="h-11 w-full px-5 text-sm sm:w-auto">
                  <HomeIcon className="h-4 w-4" />
                  Kembali ke Beranda
                </Button>
              </Link>
            )}
            {showProductsButton && (
              <Link href="/products" className="w-full sm:w-auto">
                <Button variant="outline" className="h-11 w-full px-5 text-sm sm:w-auto">
                  <ShoppingBagIcon className="h-4 w-4" />
                  Katalog Produk
                </Button>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="my-6 h-px w-full bg-border/40" />

          {/* Quick Helpful Links */}
          <div className="flex w-full flex-col gap-2 text-left">
            <Typography
              variant="caption"
              color="muted"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80"
            >
              Navigasi Cepat
            </Typography>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                href="/products"
                className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                <span>Semua Produk</span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/promo"
                className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                <span>Promo & Diskon</span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
