"use client";

import { Button } from "@/components/ui/button";
import { Download, AlertOctagon } from "lucide-react";
import { useState } from "react";
import { DownloadModal } from "./download-modal";

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

  if (isMaxed) {
    return (
      <Button
        disabled
        variant="outline"
        size="sm"
        className="w-full bg-muted/50 text-muted-foreground border-border cursor-not-allowed"
      >
        <AlertOctagon className="mr-2 h-4 w-4" />
        Limit Tercapai
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        size="sm"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
      >
        <Download className="mr-2 h-4 w-4" />
        Akses File
      </Button>

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
