// ============================================================
// FILE: src/app/dashboard/download-button.tsx
// PERUBAHAN: Ganti <button> native → <PrimaryButton> komponen
//            Logika & konfigurasi tidak diubah
// ============================================================
"use client";

import { Download, AlertOctagon } from "lucide-react";
import { useState } from "react";
import { DownloadModal } from "./download-modal";
import { PrimaryButton } from "@/components/ui/primary-button";

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
      <PrimaryButton variant="disabled-outline" size="md">
        <AlertOctagon className="h-4 w-4" />
        Limit Tercapai
      </PrimaryButton>
    );
  }

  // ── Tombol aksi (buka modal) ──────────────────────────────
  return (
    <>
      <PrimaryButton size="md" onClick={() => setModalOpen(true)}>
        <Download className="h-4 w-4" />
        Akses File
      </PrimaryButton>

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
