import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

export default function LoadingPromo() {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <Card className="w-full max-w-xl rounded-3xl border-border/50 bg-card/70 py-0 text-center shadow-sm">
        <CardContent className="flex flex-col items-center justify-center px-6 py-16">
          <ArrowPathIcon className="mb-4 size-12 animate-spin text-primary" />
          <Typography variant="h4" className="mb-2">
            Memuat Promo...
          </Typography>
          <Typography variant="body-sm" color="muted">
            Harap tunggu sebentar, kami sedang menyiapkan penawaran terbaik
            untuk Anda.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
