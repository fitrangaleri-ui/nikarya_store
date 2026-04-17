import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LoadingPromo() {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <Card className="w-full max-w-xl rounded-3xl border-border/50 bg-card/70 py-0 text-center shadow-sm">
        <CardContent className="flex flex-col items-center justify-center px-6 py-16">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Memuat Promo...
          </h2>
          <p className="text-sm text-muted-foreground">
            Harap tunggu sebentar, kami sedang menyiapkan penawaran terbaik untuk Anda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
