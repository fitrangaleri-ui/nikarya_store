"use client";

import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

export default function ErrorPromo({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <Card className="w-full max-w-xl rounded-3xl border-border/50 bg-card/70 py-0 text-center shadow-sm">
        <CardContent className="flex flex-col items-center justify-center px-6 py-16">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <ExclamationTriangleIcon className="size-10 text-destructive/80" />
          </div>
          <Typography variant="h3" className="mb-3">
            Gagal Memuat Promo
          </Typography>
          <Typography
            variant="body-sm"
            color="muted"
            align="center"
            className="mb-8 max-w-sm"
          >
            Maaf, terjadi kesalahan saat mencoba memuat data promo. Silakan coba
            lagi beberapa saat.
          </Typography>
          <Button onClick={() => reset()} variant="brand" size="lg" className="px-8">
            <ArrowPathIcon className="size-4" />
            Muat Ulang
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
