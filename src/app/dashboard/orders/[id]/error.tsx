"use client";

import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function ErrorOrderDetail({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <ExclamationTriangleIcon className="size-10 text-destructive/80" />
        </div>
        <div className="space-y-2">
          <Typography variant="h4" className="font-bold">
            Gagal Memuat Detail Pesanan
          </Typography>
          <Typography variant="body-sm" color="muted" align="center" className="max-w-sm mx-auto">
            Maaf, terjadi kesalahan saat memuat detail pesanan. Silakan coba lagi.
          </Typography>
        </div>
        <Button onClick={() => reset()} variant="brand" size="lg" className="px-8">
          <ArrowPathIcon className="size-4" />
          Muat Ulang
        </Button>
      </div>
    </div>
  );
}
