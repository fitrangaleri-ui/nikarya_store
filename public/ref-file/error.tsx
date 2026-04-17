"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive/80" />
          </div>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground">
            Gagal Memuat Promo
          </h2>
          <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
            Maaf, terjadi kesalahan saat mencoba memuat data promo. Silakan coba lagi beberapa saat.
          </p>
          <Button
            onClick={() => reset()}
            variant="brand"
            size="lg"
            className="px-8"
          >
            <RefreshCcw className="w-4 h-4" />
            Muat Ulang
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
