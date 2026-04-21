// ============================================================
// FILE: src/app/dashboard/download-button.tsx
// PERUBAHAN: Ganti <button> native → <PrimaryButton> komponen
//            Logika & konfigurasi tidak diubah
// ============================================================
"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { DownloadModal } from "./download-modal";
import { Button } from "@/components/ui/button";

const MAX_DOWNLOADS = 25;

export function DownloadButton({
  orderId,
  downloadCount,
  productTitle,
  orderDate,
  orderDisplayId,
}: {
  orderId: string;
  downloadCount: number;
  productTitle: string;
  orderDate: string;
  orderDisplayId: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const isMaxed = downloadCount >= MAX_DOWNLOADS;

  // ── Tombol disabled (limit tercapai) ─────────────────────
  if (isMaxed) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="rounded-full bg-muted border-border/40 hover:bg-muted text-muted-foreground opacity-80"
      >
        <ExclamationTriangleIcon className="h-4 w-4" />
        Limit Tercapai
      </Button>
    );
  }

  // ── Tombol aksi (buka modal) ──────────────────────────────
  return (
    <>
      <Button variant="brand" size="sm" className="rounded-full w-full" onClick={() => setModalOpen(true)}>
        <ArrowDownTrayIcon className="h-4 w-4" />
        Akses File
      </Button>

      {/* Modal — logika tidak diubah */}
      <DownloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        orderId={orderId}
        downloadCount={downloadCount}
        productTitle={productTitle}
        orderDate={orderDate}
        orderDisplayId={orderDisplayId}
      />
    </>
  );
}
