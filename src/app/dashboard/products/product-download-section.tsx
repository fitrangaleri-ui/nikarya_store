// ============================================================
// FILE: src/app/dashboard/products/product-download-section.tsx
// Client component yang mengelola state kuota download secara
// real-time, sehingga progress bar langsung berkurang saat
// user berhasil mengakses file digital melalui modal.
// ============================================================
"use client";

import { useState } from "react";
import { DownloadButton } from "../download-button";
import { Typography } from "@/components/ui/typography";
import { MAX_DOWNLOADS } from "@/lib/constants";

interface ProductDownloadSectionProps {
  orderId: string;
  initialDownloadCount: number;
  productTitle: string;
  orderDate: string;
  orderDisplayId: string;
}

export function ProductDownloadSection({
  orderId,
  initialDownloadCount,
  productTitle,
  orderDate,
  orderDisplayId,
}: ProductDownloadSectionProps) {
  const [downloadCount, setDownloadCount] = useState(initialDownloadCount);

  const remaining = MAX_DOWNLOADS - downloadCount;
  const progress = (remaining / MAX_DOWNLOADS) * 100;

  const progressColor =
    remaining <= 0
      ? "bg-destructive"
      : remaining <= 5
        ? "bg-warning"
        : "bg-primary";

  const remainingLabel =
    remaining <= 0 ? "Habis" : `${remaining} tersisa`;

  const remainingColor =
    remaining <= 0
      ? "text-destructive"
      : remaining <= 5
        ? "text-warning"
        : "text-primary";

  return (
    <>
      {/* Kuota download */}
      <div className="rounded-xl bg-muted/30 border border-border/60 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="body-xs" color="muted" className="font-extrabold uppercase">
            Kuota Download
          </Typography>
          <div className="flex items-center">
            <Typography variant="body-sm" color="muted" className="font-bold">
              <span className={`font-black ${remainingColor}`}>
                {remaining}
              </span>{" "}
              / {MAX_DOWNLOADS}
            </Typography>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <Typography variant="caption" color="muted" className="font-medium italic">
            {remaining <= 0
              ? "Limit tercapai"
              : `Tersisa ${remaining} kali unduh`}
          </Typography>
          <div className="px-2 py-0.5 rounded-full border bg-background/50 border-border/50">
            <Typography variant="caption" className={`font-extrabold uppercase text-[9px] ${remainingColor}`}>
              {remainingLabel}
            </Typography>
          </div>
        </div>
      </div>

      <DownloadButton
        orderId={orderId}
        downloadCount={downloadCount}
        productTitle={productTitle}
        orderDate={orderDate}
        orderDisplayId={orderDisplayId}
        onCountUpdate={setDownloadCount}
      />
    </>
  );
}
